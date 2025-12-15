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

// --- Core 2FA Functions (From 2fa_handlers.js) ---

/**
 * Decodes a Base32 string (RFC 4648) to a raw binary ArrayBuffer key.
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
 * Generates TOTP code using HMAC-SHA1 and Dynamic Truncation.
 */
async function generateTOTP(secret) {
    const keyBuffer = base32Decode(secret);
    if (!keyBuffer) return null;
    
    const epochSeconds = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epochSeconds / 30);
    
    const msgBuffer = new ArrayBuffer(8);
    const dataView = new DataView(msgBuffer);
    
    dataView.setUint32(0, 0, false); 
    dataView.setUint32(4, timeStep, false); 

    // Note: crypto object is globally available in Cloudflare Workers
    const cryptoKey = await crypto.subtle.importKey(
        'raw', 
        keyBuffer, 
        { name: 'HMAC', hash: 'SHA-1' }, 
        false, 
        ['sign']
    );
    
    const hashBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
    const hashView = new Uint8Array(hashBuffer);

    const offset = hashView[hashView.length - 1] & 0x0F;

    const truncatedHashView = new DataView(hashBuffer, offset, 4);
    let binary = truncatedHashView.getUint32(0, false); 
    binary = binary & 0x7FFFFFFF;

    const code = binary % 1000000;
    return String(code).padStart(6, "0");
}

/**
 * Creates the user information string for the final message caption.
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

// --- Main Handler Logic ---

/**
 * Handles incoming text message as a potential Base32 secret for TOTP code generation.
 * (ယခင် handle2FASecret နှင့် handleTextMessage တို့ကို ပေါင်းစည်းထားသည်)
 */
async function processText(chatId, userId, message, raw_secret, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = LANGUAGE_PACK.default; // db.js မရှိ၍ hardcode

    // 1. Command စစ်ဆေးခြင်း (/start, /help, စသည်)
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
    
    // 2. Secret Validation and Cleanup
    const clean_secret = raw_secret?.trim().toUpperCase().replace(/\s/g, '').replace(/[^A-Z2-7]/g, '');

    if (!clean_secret || clean_secret.length < 16) {
        const error_message = get_text('2fa_invalid_secret', lang);
        await sendMessage(chatId, error_message, null, true, token, PARSE_MODE);
        return;
    }

    // 3. Loading Message
    const loading_message_text = get_text('loading_message', lang) || "*Generating TOTP code...*";
    const loading_message_response = await sendMessage(chatId, loading_message_text, null, true, token, PARSE_MODE);
    const loading_message_id = loading_message_response?.data?.result?.message_id;

    try {
        const totp_code = await generateTOTP(clean_secret);

        if (!totp_code) {
             throw new Error("Invalid Base32 Secret Key or internal error.");
        }

        const epochSeconds = Math.floor(Date.now() / 1000);
        const seconds_remaining = 30 - (epochSeconds % 30);
        
        const user_link = create_user_link(message);

        // 4. Successful Response
        const response_text = 
            `*🔐 TOTP Code Generated ✅*\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `*Code:* \`${totp_code}\`\n` +
            `*Expires in:* \`${seconds_remaining}\` seconds\n` +
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


/**
 * Telegram Update Object ကို ခွဲခြမ်းစိတ်ဖြာပြီး သက်ဆိုင်ရာ Handler များသို့ လမ်းညွှန်ပေးသည်
 * (ယခင် _middleware.js မှ logic ကို ယူဆောင်လာပြီး export လုပ်ထားသည်)
 */
export async function handleUpdate(update, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = LANGUAGE_PACK.default; // hardcode

    if (!token) {
        console.error("TELEGRAM_BOT_TOKEN_ENV is not set in environment.");
        return; // handleUpdate သည် Response ကို ပြန်စရာမလို၊ waitUntil တွင် အသုံးပြုရန်
    }

    if (update.message && update.message.text) {
        const message = update.message;
        const chatId = message.chat.id;
        const userId = message.from.id;
        const raw_secret = message.text;
        
        // Command သို့မဟုတ် Base32 Secret ကို စီမံဆောင်ရွက်သည်
        await processText(chatId, userId, message, raw_secret, env);

    } else if (update.message) {
        // စာသား မဟုတ်သော message (ဓာတ်ပုံ, ဗီဒီယို စသည်)
        const chatId = update.message.chat.id;
        const error_message = get_text('unsupported_update', lang);

        await sendMessage(chatId, error_message, null, true, token, PARSE_MODE);

    } else {
        // အခြား update အမျိုးအစားများ
        console.log("Ignoring non-message update.");
    }
}
