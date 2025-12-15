// functions/2fa_handlers.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import {
    TELEGRAM_BOT_TOKEN_ENV,
    MAX_SECRET_LENGTH,
    WELCOME_MESSAGE,
} from './config.js';

// --- Utility Functions (Simplified for standalone use) ---

const API_ENDPOINT = 'https://api.telegram.org/bot';
const PARSE_MODE = 'Markdown';
//const token = env[TELEGRAM_BOT_TOKEN_ENV];

/**
 * Sends a message via the Telegram Bot API.
 */
async function sendMessage(chat_id, text, reply_markup, disable_web_page_preview, token, parse_mode = PARSE_MODE) {
    const url = `${API_ENDPOINT}${token}/sendMessage`;
    const body = {
        chat_id: chat_id,
        text: text,
        parse_mode: parse_mode,
        disable_web_page_preview: disable_web_page_preview,
        reply_markup: reply_markup,
    };

    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).catch(e => console.error("Send Message Error:", e));
}

/**
 * Edits an existing message via the Telegram Bot API.
 */
async function editMessageText(chat_id, message_id, text, reply_markup, disable_web_page_preview, token, parse_mode = PARSE_MODE) {
    const url = `${API_ENDPOINT}${token}/editMessageText`;
    const body = {
        chat_id: chat_id,
        message_id: message_id,
        text: text,
        parse_mode: parse_mode,
        disable_web_page_preview: disable_web_page_preview,
        reply_markup: reply_markup,
    };

    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).catch(e => console.error("Edit Message Error:", e));
}

// --- TOTP Core Logic ---

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
    if (!keyBuffer || keyBuffer.byteLength === 0) return null;
    
    const epochSeconds = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epochSeconds / 30);
    
    const msgBuffer = new ArrayBuffer(8);
    const dataView = new DataView(msgBuffer);
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
        return `[${name}](tg://user?id=${from_user.id})`;
    } else {
        return "Unknown User";
    }
}

// --- Main Update Handler ---

/**
 * Handles all incoming Telegram updates.
 */
export async function handleUpdate(update, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];

    if (!update.message) {
        return;
    }

    const message = update.message;
    const chatId = message.chat.id;
    const raw_text = message.text;

    if (!raw_text) {
        return;
    }
    
    const raw_secret = raw_text.trim();

    // --- 1. Handle /start command ---
    if (raw_secret.toLowerCase() === '/start') {
        await sendMessage(chatId, WELCOME_MESSAGE, null, true, token, PARSE_MODE);
        return;
    }

    // --- 2. Clean and Validate Secret ---
    const clean_secret = raw_secret.toUpperCase().replace(/\s/g, '').replace(/[^A-Z2-7]/g, '');

    if (!clean_secret || clean_secret.length < 8 || clean_secret.length > MAX_SECRET_LENGTH) {
        // Ignore messages that don't look like a secret.
        // We only proceed if it might be a Base32 string.
        return;
    }
    
    // --- 3. Processing Flow ---
    
    const loading_message = await sendMessage(chatId, "*Generating TOTP code...*", null, true, token, PARSE_MODE);
    const loading_message_id = loading_message?.data?.result?.message_id;

    try {
        const totp_code = await generateTOTP(clean_secret);

        if (!totp_code) {
             throw new Error("Invalid Base32 Secret or TOTP generation failed.");
        }

        const epochSeconds = Math.floor(Date.now() / 1000);
        const seconds_passed = epochSeconds % 30;
        const seconds_remaining = 30 - seconds_passed;
        
        const user_link = create_user_link(message);

        // Success Response
        const response_text = 
            `**🔐 TOTP Code Generated ✅**\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `*Code:* \`${totp_code}\`\n` +
            `*Expires in:* \`${seconds_remaining}\` seconds\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `*Secret:* \`${clean_secret.substring(0, 8)}...${clean_secret.slice(-4)}\`\n\n` +
            `*Generated By:* ${user_link}`;

        await editMessageText(chatId, loading_message_id, response_text, null, true, token, PARSE_MODE);

    } catch (e) {
        console.error(`TOTP Handler Error: ${e.message}`);
        const error_message = `*❌ Error generating code. Please check your secret key.*`;
        await editMessageText(chatId, loading_message_id, error_message, null, true, token, PARSE_MODE);
    }
}
