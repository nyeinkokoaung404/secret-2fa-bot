///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import {
    get_text,
    sendMessage
} from './utils.js';

import { 
    TELEGRAM_BOT_TOKEN_ENV,
    PARSE_MODE,
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
 * @param {string} secret - Base32 secret string.
 * @returns {Promise<string | null>} 6-digit TOTP code or null on error.
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
        binary = binary & 0x7FFFFFFF;

        const code = binary % 1000000;
        return String(code).padStart(6, "0");
    } catch (e) {
        console.error("Crypto Subtle Error:", e.message);
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

// --- Validation Functions ---

/**
 * Validates if a string is a valid Base32 secret.
 * @param {string} secret - The secret to validate.
 * @returns {{valid: boolean, cleaned: string, error: string|null}} Validation result.
 */
function validateSecret(secret) {
    const clean = secret.toUpperCase().replace(/\s/g, '');
    
    // Check for invalid characters
    const regex = /^[A-Z2-7]+$/;
    if (!regex.test(clean)) {
        return { 
            valid: false, 
            cleaned: clean,
            error: "Invalid characters. Only A-Z and 2-7 allowed." 
        };
    }
    
    // Check minimum length
    if (clean.length < 16) {
        return { 
            valid: false, 
            cleaned: clean,
            error: "Secret too short. Minimum 16 characters required." 
        };
    }
    
    // Check if length is multiple of 8 (proper Base32 padding)
    if (clean.length % 8 !== 0) {
        return { 
            valid: false, 
            cleaned: clean,
            error: "Invalid Base32 length. Should be multiple of 8." 
        };
    }
    
    return { valid: true, cleaned: clean, error: null };
}

/**
 * Masks a secret for display (shows only first and last few characters).
 * @param {string} secret - The secret to mask.
 * @param {number} visibleStart - Number of characters to show at start.
 * @param {number} visibleEnd - Number of characters to show at end.
 * @returns {string} Masked secret.
 */
function maskSecret(secret, visibleStart = 4, visibleEnd = 4) {
    if (secret.length <= visibleStart + visibleEnd) {
        return secret; // Don't mask short secrets
    }
    const start = secret.substring(0, visibleStart);
    const end = secret.substring(secret.length - visibleEnd);
    const masked = '*'.repeat(secret.length - visibleStart - visibleEnd);
    return `${start}${masked}${end}`;
}

/**
 * Provides user-friendly error messages.
 * @param {Error} error - The error object.
 * @returns {string} User-friendly error message.
 */
function getFriendlyErrorMessage(error) {
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes("base32") || errorMsg.includes("invalid") || errorMsg.includes("secret")) {
        return "Invalid secret format. Please check your Base32 secret key (only A-Z and 2-7 characters allowed).";
    }
    if (errorMsg.includes("crypto") || errorMsg.includes("operation")) {
        return "Security error occurred while generating code. Please try again.";
    }
    if (errorMsg.includes("short")) {
        return "Secret is too short. Minimum 16 characters required.";
    }
    if (errorMsg.includes("length")) {
        return "Invalid secret length. Base32 secrets should be multiples of 8 characters.";
    }
    
    return "An unexpected error occurred. Please try again with a valid Base32 secret.";
}

/**
 * Logs request information for debugging.
 * @param {object} message - Telegram message object.
 * @param {boolean} success - Whether the request was successful.
 * @param {Error|null} error - Error object if any.
 */
async function logRequest(message, success = true, error = null) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId: message.from?.id || 'unknown',
        chatId: message.chat.id,
        command: message.text?.substring(0, 50) || 'no text',
        success,
        error: error?.message || null
    };
    
    console.log(JSON.stringify(logEntry));
}

// --- Inline Keyboard for Refresh Button ---

/**
 * Creates inline keyboard markup with refresh button.
 * @param {string} secret - The secret (for callback data).
 * @returns {object} Inline keyboard markup.
 */
function createRefreshKeyboard(secret) {
    return {
        inline_keyboard: [
            [
                {
                    text: "🔄 Refresh Code",
                    callback_data: `refresh:${secret}`
                }
            ],
            [
                {
                    text: "📖 Show Full Secret",
                    callback_data: `show_secret:${secret}`
                }
            ]
        ]
    };
}

/**
 * Creates inline keyboard for showing full secret.
 * @param {string} secret - The full secret.
 * @returns {object} Inline keyboard markup.
 */
function createSecretKeyboard(secret) {
    return {
        inline_keyboard: [
            [
                {
                    text: "🔄 Refresh Code",
                    callback_data: `refresh:${secret}`
                }
            ],
            [
                {
                    text: "🔒 Hide Secret",
                    callback_data: `hide_secret:${secret}`
                }
            ]
        ]
    };
}

// --- Command Handlers ---

/**
 * Handles bot commands.
 * @param {string} command - The command string.
 * @param {number} chatId - Telegram chat ID.
 * @param {object} message - Telegram message object.
 * @param {string} token - Bot token.
 */
async function handleCommand(command, chatId, message, token) {
    const parts = command.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    
    if (cmd === '/start' || cmd === '/help') {
        await sendMessage(
            chatId,
            `👋 *Welcome to TOTP Generator Bot!*\n\n` +
            `*How to use:*\n` +
            `1. Send me a Base32 secret key\n` +
            `2. I'll generate a 6-digit TOTP code\n` +
            `3. Code refreshes every 30 seconds\n` +
            `4. Use the refresh button to get new code\n\n` +
            `*Supported Format:*\n` +
            `• Only uppercase letters A-Z and numbers 2-7\n` +
            `• Minimum 16 characters\n` +
            `• Length should be multiple of 8\n\n` +
            `*Example:* \`JBSWY3DPEHPK3PXP\`\n\n` +
            `*Available Commands:*\n` +
            `/help - Show this help message\n` +
            `/about - About this bot\n` +
            `/format - Base32 format information`,
            null, true, token, PARSE_MODE
        );
    } else if (cmd === '/about') {
        await sendMessage(
            chatId,
            `*🔐 TOTP Generator Bot*\n\n` +
            `*Version:* 2.0\n` +
            `*Algorithm:* TOTP (RFC 6238)\n` +
            `*Hash:* HMAC-SHA1\n` +
            `*Code Length:* 6 digits\n` +
            `*Time Step:* 30 seconds\n\n` +
            `*Security Features:*\n` +
            `• Web Crypto API for secure operations\n` +
            `• Client-side processing only\n` +
            `• No secret storage\n\n` +
            `*Developer:* @nkka404\n` +
            `*Channel:* @premium_channel_404\n\n` +
            `_Your secrets are never stored or logged._`,
            null, true, token, PARSE_MODE
        );
    } else if (cmd === '/format') {
        await sendMessage(
            chatId,
            `*📝 Base32 Format Information*\n\n` +
            `*Valid Characters:*\n` +
            `• Uppercase letters: A-Z\n` +
            `• Numbers: 2-7 only\n\n` +
            `*Invalid Characters:*\n` +
            `• Lowercase letters (convert to uppercase)\n` +
            `• Numbers 0, 1, 8, 9\n` +
            `• Special characters\n` +
            `• Spaces (automatically removed)\n\n` +
            `*Length Requirements:*\n` +
            `• Minimum: 16 characters\n` +
            `• Should be multiple of 8\n` +
            `• Examples: 16, 24, 32, 40 characters\n\n` +
            `*Common Examples:*\n` +
            `• \`JBSWY3DPEHPK3PXP\` (16 chars)\n` +
            `• \`JBSWY3DPEHPK3PXPJBSWY3D\` (24 chars)\n` +
            `• \`GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ\` (32 chars)`,
            null, true, token, PARSE_MODE
        );
    } 
    // Unknown commands will be treated as secrets (no error message)
}

/**
 * Handles secret processing and TOTP generation.
 * @param {string} rawSecret - Raw secret input.
 * @param {number} chatId - Telegram chat ID.
 * @param {object} message - Telegram message object.
 * @param {string} token - Bot token.
 * @param {boolean} isRefresh - Whether this is a refresh request.
 * @param {number} messageId - Message ID to edit (for refresh).
 * @returns {Promise<object|null>} Message info or null.
 */
async function handleSecret(rawSecret, chatId, message, token, isRefresh = false, messageId = null) {
    // Validate secret
    const validation = validateSecret(rawSecret);
    if (!validation.valid) {
        throw new Error(validation.error);
    }
    
    // Generate TOTP
    const totpCode = await generateTOTP(validation.cleaned);
    if (!totpCode) {
        throw new Error("Failed to generate TOTP code. Invalid secret format.");
    }
    
    // Calculate remaining time
    const epochSeconds = Math.floor(Date.now() / 1000);
    const secondsRemaining = 30 - (epochSeconds % 30);
    
    // Create response
    const userLink = create_user_link(message);
    const maskedSecret = maskSecret(validation.cleaned, 4, 4);
    
    const response = 
        `*✅ TOTP Code Generated Successfully*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `*🔢 Code:* \`${totpCode}\`\n` +
        `*⏱️ Expires in:* \`${secondsRemaining}\` seconds\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `*🔐 Secret:* \`${maskedSecret}\`\n` +
        `*👤 Generated for:* ${userLink}\n\n` +
        `_⚠️ Code refreshes automatically every 30 seconds_\n` +
        `_🔒 Your secret is never stored on our servers_`;
    
    // Create keyboard with refresh button
    const keyboard = createRefreshKeyboard(validation.cleaned);
    
    if (isRefresh && messageId) {
        // Edit existing message
        try {
            await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    message_id: messageId,
                    text: response,
                    parse_mode: PARSE_MODE,
                    reply_markup: keyboard
                })
            });
            return null;
        } catch (error) {
            console.error("Failed to edit message:", error);
            // If edit fails, send as new message
            return await sendMessage(chatId, response, keyboard, true, token, PARSE_MODE);
        }
    } else {
        // Send new message
        return await sendMessage(chatId, response, keyboard, true, token, PARSE_MODE);
    }
}

/**
 * Handles callback queries (refresh button clicks).
 * @param {object} callbackQuery - Telegram callback query object.
 * @param {string} token - Bot token.
 */
async function handleCallbackQuery(callbackQuery, token) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;
    const userId = callbackQuery.from.id;
    
    // Answer callback query first (to remove loading state)
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: "Refreshing code..."
        })
    });
    
    try {
        if (data.startsWith('refresh:')) {
            const secret = data.substring(8); // Remove 'refresh:' prefix
            
            // Generate new TOTP
            await handleSecret(secret, chatId, callbackQuery.message, token, true, messageId);
            
        } else if (data.startsWith('show_secret:')) {
            const secret = data.substring(12); // Remove 'show_secret:' prefix
            
            // Show full secret
            const totpCode = await generateTOTP(secret);
            const epochSeconds = Math.floor(Date.now() / 1000);
            const secondsRemaining = 30 - (epochSeconds % 30);
            const userLink = `[${callbackQuery.from.first_name || 'User'}](tg://user?id=${userId})`;
            
            const response = 
                `*🔓 Full Secret Display*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `*🔢 Code:* \`${totpCode}\`\n` +
                `*⏱️ Expires in:* \`${secondsRemaining}\` seconds\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `*🔐 Full Secret:* \`${secret}\`\n` +
                `*👤 Generated for:* ${userLink}\n\n` +
                `_⚠️ Keep this secret secure! Do not share._\n` +
                `_⚠️ Code refreshes automatically every 30 seconds_`;
            
            const keyboard = createSecretKeyboard(secret);
            
            await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    message_id: messageId,
                    text: response,
                    parse_mode: PARSE_MODE,
                    reply_markup: keyboard
                })
            });
            
        } else if (data.startsWith('hide_secret:')) {
            const secret = data.substring(12); // Remove 'hide_secret:' prefix
            
            // Hide secret (go back to masked view)
            const totpCode = await generateTOTP(secret);
            const epochSeconds = Math.floor(Date.now() / 1000);
            const secondsRemaining = 30 - (epochSeconds % 30);
            const userLink = `[${callbackQuery.from.first_name || 'User'}](tg://user?id=${userId})`;
            const maskedSecret = maskSecret(secret, 4, 4);
            
            const response = 
                `*✅ TOTP Code Generated Successfully*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `*🔢 Code:* \`${totpCode}\`\n` +
                `*⏱️ Expires in:* \`${secondsRemaining}\` seconds\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `*🔐 Secret:* \`${maskedSecret}\`\n` +
                `*👤 Generated for:* ${userLink}\n\n` +
                `_⚠️ Code refreshes automatically every 30 seconds_\n` +
                `_🔒 Your secret is never stored on our servers_`;
            
            const keyboard = createRefreshKeyboard(secret);
            
            await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    message_id: messageId,
                    text: response,
                    parse_mode: PARSE_MODE,
                    reply_markup: keyboard
                })
            });
        }
        
    } catch (error) {
        console.error("Callback query error:", error);
        
        // Send error message
        await sendMessage(
            chatId,
            `❌ *Error Refreshing Code*\n\n` +
            `Please send your secret again.\n\n` +
            `Error: ${error.message.substring(0, 100)}`,
            null, true, token, PARSE_MODE
        );
    }
}

// --- Main Handler Logic ---

/**
 * Main handler for Telegram updates.
 */
export async function handleUpdate(update, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    
    if (!token) {
        console.error("TELEGRAM_BOT_TOKEN_ENV is not set in environment.");
        return;
    }
    
    // Handle callback queries (refresh button clicks)
    if (update.callback_query) {
        await handleCallbackQuery(update.callback_query, token);
        return;
    }
    
    // Check if update contains a message with text
    if (!update.message || !update.message.text) {
        if (update.message) {
            await sendMessage(
                update.message.chat.id,
                `❌ *Unsupported Message Type*\n\n` +
                `Please send text messages or commands only.\n` +
                `Type /help for instructions.`,
                null, true, token, PARSE_MODE
            );
        }
        return;
    }
    
    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text.trim();
    
    try {
        // Handle command or secret
        if (text.startsWith('/')) {
            await handleCommand(text, chatId, message, token);
        } else {
            // Treat as secret (unknown commands are also treated as secrets)
            await handleSecret(text, chatId, message, token);
        }
        
        // Log successful request
        await logRequest(message, true);
        
    } catch (error) {
        // Log error
        await logRequest(message, false, error);
        
        // Send user-friendly error message
        const errorMessage = getFriendlyErrorMessage(error);
        
        await sendMessage(
            chatId,
            `❌ *Error*\n\n${errorMessage}\n\n` +
            `*Tips:*\n` +
            `• Use only uppercase A-Z and numbers 2-7\n` +
            `• Minimum 16 characters\n` +
            `• Type /format for detailed instructions`,
            null, true, token, PARSE_MODE
        );
    }
        }
