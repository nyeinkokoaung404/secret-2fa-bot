// functions/2fa_handlers.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import {
    get_text,
    sendMessage,
    editMessageText,
} from '../utils.js';

import { 
    TELEGRAM_BOT_TOKEN_ENV,
    PARSE_MODE,
} from '../config.js';


/**
 * Decodes a Base32 string (RFC 4648) to a raw binary ArrayBuffer key.
 * @param {string} secret - Base32 secret string.
 * @returns {ArrayBuffer | null} Raw binary key or null if invalid.
 */
function base32Decode(secret) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    secret = secret.toUpperCase().replace(/\s/g, '').replace(/[^A-Z2-7]/g, '');

    if (!secret) return null;

    let bits = "";
    for (const c of secret) {
        const v = alphabet.indexOf(c);
        if (v === -1) continue; // ဤနေရာတွင် invalid character ကို ကျော်သွားသည်။
        bits += v.toString(2).padStart(5, "0");
    }

    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
        const byte = bits.substring(i, i + 8);
        if (byte.length === 8) {
            bytes.push(parseInt(byte, 2));
        }
    }

    return new Uint8Array(bytes).buffer;
}

/**
 * Generates TOTP code using HMAC-SHA1 and Dynamic Truncation.
 * @param {string} secret - Base32 secret string.
 * @returns {Promise<string | null>} 6-digit TOTP code or null on error.
 */
async function generateTOTP(secret) {
    const keyBuffer = base32Decode(secret);
    if (!keyBuffer) return null;
    
    // TOTP time step (30 seconds)
    const epochSeconds = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epochSeconds / 30);
    
    // 8-byte message buffer
    const msgBuffer = new ArrayBuffer(8);
    const dataView = new DataView(msgBuffer);
    
    // Time step ကို 8-byte big-endian အဖြစ် ထည့်သွင်းသည်။
    dataView.setUint32(0, 0, false); 
    dataView.setUint32(4, timeStep, false); 

    const cryptoKey = await crypto.subtle.importKey(
        'raw', 
        keyBuffer, 
        { name: 'HMAC', hash: 'SHA-1' }, 
        false, 
        ['sign']
    );
    
    const hashBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
    const hashView = new Uint8Array(hashBuffer);

    // Dynamic Truncation
    const offset = hashView[hashView.length - 1] & 0x0F;

    const truncatedHashView = new DataView(hashBuffer, offset, 4);
    let binary = truncatedHashView.getUint32(0, false); 
    binary = binary & 0x7FFFFFFF; // Clear the most significant bit

    const code = binary % 1000000;
    return String(code).padStart(6, "0");
}

/**
 * Creates the user information string for the final message caption.
 * @param {Object} message - The message object.
 * @returns {string} Markdown formatted user link.
 */
function create_user_link(message) {
    const from_user = message.from;
    
    if (from_user) {
        const name = `${from_user.first_name || ''} ${from_user.last_name || ''}`.trim() || from_user.username || `User ${from_user.id}`;
        // Markdown user link format: [name](tg://user?id=id)
        return `[${name}](tg://user?id=${from_user.id})`;
    } else {
        return "Unknown User";
    }
}

/**
 * Handles incoming text message as a potential Base32 secret for TOTP code generation.
 * @param {string} raw_secret - User ၏ မူလ ပေးပို့သော စာသား။
 */
export async function handle2FASecret(chatId, userId, message, raw_secret, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    // db.js ကို ဖယ်ရှားထားသဖြင့် lang ကို hardcode 'en' သို့မဟုတ် config မှ default သုံးနိုင်ပါသည်။
    const lang = 'en'; 

    const clean_secret = raw_secret?.trim().toUpperCase().replace(/\s/g, '').replace(/[^A-Z2-7]/g, '');

    // 1. Validation
    if (!clean_secret || clean_secret.length < 16) {
        const error_message = get_text('2fa_invalid_secret', lang);
        await sendMessage(chatId, error_message, null, true, token, PARSE_MODE);
        return;
    }

    // 2. Loading Message
    const loading_message_text = get_text('loading_message', lang) || "*Generating TOTP code...*";
    const loading_message = await sendMessage(chatId, loading_message_text, null, true, token, PARSE_MODE);
    const loading_message_id = loading_message?.data?.result?.message_id;

    try {
        const totp_code = await generateTOTP(clean_secret);

        if (!totp_code) {
             throw new Error("Invalid Base32 Secret Key.");
        }

        const epochSeconds = Math.floor(Date.now() / 1000);
        const seconds_passed = epochSeconds % 30;
        const seconds_remaining = 30 - seconds_passed;
        
        const user_link = create_user_link(message);

        // 4. Successful Response
        const response_text = 
            `*🔐 TOTP Code Generated ✅*\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `*Code:* \`${totp_code}\`\n` +
            `*Expires In:* \`${seconds_remaining}\` Seconds\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `*Secret:* \`${clean_secret.substring(0, 8)}...${clean_secret.slice(-4)}\`\n\n` +
            `*Generated By:* ${user_link}`;

        await editMessageText(chatId, loading_message_id, response_text, null, true, token, PARSE_MODE);

    } catch (e) {
        console.error(`TOTP Handler Error: ${e.message}`);
        const error_message = get_text('2fa_error', lang) || `*❌ Error generating code: ${e.message.substring(0, 50)}*`;
        await editMessageText(chatId, loading_message_id, error_message, null, true, token, PARSE_MODE);
    }
}
