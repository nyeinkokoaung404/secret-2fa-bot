// handlers.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import {
    get_text,
    sendMessage,
    editMessageText,
} from './utils.js';

import { 
    TELEGRAM_BOT_TOKEN_ENV,
    PARSE_MODE,
    LANGUAGE_PACK,
} from './config.js';

// --- Core 2FA Functions ---

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
        if (v === -1) continue;
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
 * Generates TOTP code using HMAC-SHA1 and Dynamic Truncation (RFC 6238).
 * * ⚠️ ဤနေရာ၌ try...catch ကို ထည့်သွင်းခြင်းဖြင့် crypto.subtle errors များကို ဖမ်းယူသည်။
 * * @param {string} secret - Base32 secret string.
 * @returns {Promise<string | null>} 6-digit TOTP code or null on error.
 */
async function generateTOTP(secret) {
    const keyBuffer = base32Decode(secret);
    if (!keyBuffer) return null;
    
    // TOTP time step (30 seconds)
    const epochSeconds = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epochSeconds / 30);
    
    // 8-byte message buffer (time counter)
    const msgBuffer = new ArrayBuffer(8);
    const dataView = new DataView(msgBuffer);
    
    // Time step ကို 8-byte big-endian အဖြစ် ထည့်သွင်းသည်။
    dataView.setUint32(0, 0, false); 
    dataView.setUint32(4, timeStep, false); 

    try {
        // HMAC-SHA1 Key Import
        const cryptoKey = await crypto.subtle.importKey(
            'raw', 
            keyBuffer, 
            { name: 'HMAC', hash: 'SHA-1' }, 
            false, 
            ['sign']
        );
        
        // HMAC-SHA1 Calculation
        const hashBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
        const hashView = new Uint8Array(hashBuffer);

        // Dynamic Truncation Offset
        const offset = hashView[hashView.length - 1] & 0x0F;

        // Truncation and Modulo 10^6
        const truncatedHashView = new DataView(hashBuffer, offset, 4);
        let binary = truncatedHashView.getUint32(0, false); 
        binary = binary & 0x7FFFFFFF; // Clear the most significant bit

        const code = binary % 1000000;
        return String(code).padStart(6, "0");
    } catch (e) {
        // Cryptographic errors (e.g., "Key is too short") ကို ဤနေရာမှ ဖမ်းယူသည်။
        console.error("Crypto Subtle Error:", e.message);
        // Error message ကို main handler သို့ ပို့နိုင်ရန် ဤနေရာတွင် throw ပြန်လုပ်မည်။
        throw new Error(`Crypto operation failed: ${e.message}`);
    }
}

/**
 * Creates the user information string for the final message caption.
 */
function create_user_link(message) {
    const from_user = message.from;
    
    if (from_user) {
        const name = `${from_user.first_name || ''} ${from_user.last_name || ''}`.trim() || from_user.username || `User ${from_user.id}`;
        return `[${name}](tg://user?id=${from_user.id})`;
    } else {
        return "Unknown User";
    }
}

// --- Main Handler Logic ---

/**
 * Telegram Update Object ကို ခွဲခြမ်းစိတ်ဖြာပြီး TOTP Code ကို ထုတ်လုပ်သည်။
 */
export async function handleUpdate(update, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = LANGUAGE_PACK.default; // hardcode

    if (!token) {
        console.error("TELEGRAM_BOT_TOKEN_ENV is not set in environment.");
        return; 
    }

    if (update.message && update.message.text) {
        const message = update.message;
        const chatId = message.chat.id;
        const userId = message.from.id;
        const raw_secret = message.text;

        // 1. Command သို့မဟုတ် Secret စစ်ဆေးခြင်း
        if (raw_secret.startsWith('/')) {
            const parts = raw_secret.split(/\s+/);
            const commandBase = parts[0].toLowerCase();
            
            if (commandBase === '/start' || commandBase === '/help') {
                const welcome_message = `👋 Welcome! Send me a Base32 secret key to generate a TOTP code.\n\n*Example:* \`JBSWY3DPEHPK3PXP\`\n\n*Supported Secret:* Base32 only (A-Z, 2-7).`;
                await sendMessage(chatId, welcome_message, null, true, token, PARSE_MODE);
            } else {
                const unknown_command_message = `Unknown command: ${commandBase}`;
                await sendMessage(chatId, unknown_command_message, null, true, token, PARSE_MODE);
            }
            return;
        }

        // Secret Logic (Command မဟုတ်ပါက Base32 secret အဖြစ် ယူဆသည်)
        const clean_secret = raw_secret?.trim().toUpperCase().replace(/\s/g, '').replace(/[^A-Z2-7]/g, '');

        if (!clean_secret || clean_secret.length < 16) {
            const error_message = get_text('2fa_invalid_secret', lang);
            await sendMessage(chatId, error_message, null, true, token, PARSE_MODE);
            return;
        }

        // 2. Loading Message ကို ချက်ချင်းပို့သည်
        const loading_message_text = get_text('loading_message', lang) || "*Generating TOTP code...*";
        const loading_message_response = await sendMessage(chatId, loading_message_text, null, true, token, PARSE_MODE);
        const loading_message_id = loading_message_response?.data?.result?.message_id;

        try {
            // 3. TOTP Generation
            const totp_code = await generateTOTP(clean_secret);

            if (!totp_code) {
                 // generateTOTP သည် Base32 Decode မအောင်မြင်ပါက null ပြန်လာနိုင်သည်။
                 throw new Error("Base32 decoding failed. Check secret format.");
            }

            // Time Remaining Calculation
            const epochSeconds = Math.floor(Date.now() / 1000);
            const seconds_remaining = 30 - (epochSeconds % 30);
            
            const user_link = create_user_link(message);

            // 4. Successful Response
            const response_text = 
                `**🔐 TOTP Code Generated ✅**\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `*Code:* \`${totp_code}\`\n` +
                `*Expires in:* \`${seconds_remaining}\` seconds\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `*Secret:* \`${clean_secret.substring(0, 8)}...${clean_secret.slice(-4)}\`\n\n` +
                `*Generated By:* ${user_link}`;

            // 5. Loading message ကို Result ဖြင့် ပြန်လည်ပြင်ဆင်သည်
            await editMessageText(chatId, loading_message_id, response_text, null, true, token, PARSE_MODE);

        } catch (e) {
            console.error(`TOTP Handler Fatal Error: ${e.message}`);
            
            // Error message ကို Loading message နေရာတွင် ပြန်လည်ပြင်ဆင်သည်။
            const display_error = `*❌ Error: ${e.message.substring(0, 100)}*`;
            const error_message = get_text('2fa_error', lang) || display_error;
            
            await editMessageText(chatId, loading_message_id, error_message, null, true, token, PARSE_MODE);
        }

    } else if (update.message) {
        // စာသား မဟုတ်သော message
        const chatId = update.message.chat.id;
        const error_message = get_text('unsupported_update', lang);
        await sendMessage(chatId, error_message, null, true, token, PARSE_MODE);
    }
}
