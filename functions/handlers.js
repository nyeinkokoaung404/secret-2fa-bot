///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import { sendMessage, editMessageText } from './utils.js';
import { TELEGRAM_BOT_TOKEN_ENV, PARSE_MODE } from './config.js';

// Base32 Decode Function
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

// Generate TOTP Code
async function generateTOTP(secret) {
    const keyBuffer = base32Decode(secret);
    if (!keyBuffer) return null;
    
    const epochSeconds = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epochSeconds / 30);
    
    const msgBuffer = new ArrayBuffer(8);
    const dataView = new DataView(msgBuffer);
    dataView.setUint32(4, timeStep, false);
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw', keyBuffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
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

// Create Refresh Button Only
function createRefreshKeyboard(secret) {
    return {
        inline_keyboard: [[{ text: "🔄 Refresh Code", callback_data: `refresh:${secret}` }]]
    };
}

// Main Handler
export async function handleUpdate(update, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    if (!token) return;
    
    // Handle Callback Query (Refresh Button)
    if (update.callback_query) {
        const chatId = update.callback_query.message.chat.id;
        const messageId = update.callback_query.message.message_id;
        const secret = update.callback_query.data.replace('refresh:', '');
        
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callback_query_id: update.callback_query.id,
                text: "🔄 Generating new code...",
                show_alert: false
            })
        });
        
        const code = await generateTOTP(secret);
        const response = `*Your OTP Code* 👉 \`${code}\``;
        const keyboard = createRefreshKeyboard(secret);
        
        await editMessageText(chatId, messageId, response, keyboard, token);
    }
    
    // Handle New Message
    if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text.trim();
        
        // /start command
        if (text === '/start') {
            await sendMessage(chatId, `👋 *Welcome to OTP Generator Bot!*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `*How to use:*\n` +
            `1. Send me a your secret key\n` +
            `2. I'll generate a 6-digit OTP code\n` +
            `3. Code refreshes every 30 seconds\n` +
            `4. Use the refresh button to get new code\n\n` +
            `*Supported Format:*\n` +
            `• Only uppercase letters A-Z and numbers 2-7\n` +
            `• Minimum 16 characters\n` +
            `• Length should be multiple of 8\n` +
            `*Example:* \`JBSWY3DPEHPK3PXP\`\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `Developed By @nkka404 🇲🇲`, null, true, token, PARSE_MODE);
            return;
        }
        
        // Generate OTP from secret
        const code = await generateTOTP(text);
        if (code) {
            const response = `*Your OTP Code* 👉 \`${code}\``;
            const keyboard = createRefreshKeyboard(text);
            await sendMessage(chatId, response, keyboard, true, token, PARSE_MODE);
        } else {
            await sendMessage(chatId, "❌ *Invalid secret code. Use A-Z and 2-7 only.*", null, true, token, PARSE_MODE);
        }
    }
}
