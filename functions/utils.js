// functions/utils.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import { DEFAULT_PARSE_MODE } from './config.js';

/**
 * Sends a message to a Telegram chat
 * @param {number|string} chatId - Target chat ID
 * @param {string} text - Message text
 * @param {Object} replyMarkup - Reply markup (keyboard)
 * @param {boolean} disableWebPagePreview - Disable link preview
 * @param {string} token - Bot token
 * @param {string} parseMode - Parse mode (HTML/Markdown)
 * @returns {Promise<Object>} Telegram API response
 */
export async function sendMessage(
    chatId, 
    text, 
    replyMarkup = null, 
    disableWebPagePreview = true, 
    token, 
    parseMode = DEFAULT_PARSE_MODE
) {
    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        
        const payload = {
            chat_id: chatId,
            text: text,
            disable_web_page_preview: disableWebPagePreview,
            parse_mode: parseMode
        };
        
        if (replyMarkup) {
            payload.reply_markup = replyMarkup;
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
 * Edits an existing message
 * @param {number|string} chatId - Chat ID
 * @param {number} messageId - Message ID to edit
 * @param {string} text - New text
 * @param {Object} replyMarkup - New reply markup
 * @param {boolean} disableWebPagePreview - Disable link preview
 * @param {string} token - Bot token
 * @param {string} parseMode - Parse mode
 * @returns {Promise<Object>} Telegram API response
 */
export async function editMessageText(
    chatId, 
    messageId, 
    text, 
    replyMarkup = null, 
    disableWebPagePreview = true, 
    token, 
    parseMode = DEFAULT_PARSE_MODE
) {
    try {
        const url = `https://api.telegram.org/bot${token}/editMessageText`;
        
        const payload = {
            chat_id: chatId,
            message_id: messageId,
            text: text,
            disable_web_page_preview: disableWebPagePreview,
            parse_mode: parseMode
        };
        
        if (replyMarkup) {
            payload.reply_markup = replyMarkup;
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error editing message:', error);
        throw error;
    }
}

/**
 * Deletes a message
 * @param {number|string} chatId - Chat ID
 * @param {number} messageId - Message ID to delete
 * @param {string} token - Bot token
 * @returns {Promise<Object>} Telegram API response
 */
export async function deleteMessage(chatId, messageId, token) {
    try {
        const url = `https://api.telegram.org/bot${token}/deleteMessage`;
        
        const payload = {
            chat_id: chatId,
            message_id: messageId
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
    }
}

/**
 * Sends a photo to a Telegram chat
 * @param {number|string} chatId - Target chat ID
 * @param {string} photo - Photo URL or file_id
 * @param {string} caption - Photo caption
 * @param {Object} replyMarkup - Reply markup
 * @param {string} token - Bot token
 * @param {string} parseMode - Parse mode
 * @returns {Promise<Object>} Telegram API response
 */
export async function sendPhoto(
    chatId, 
    photo, 
    caption = '', 
    replyMarkup = null, 
    token, 
    parseMode = DEFAULT_PARSE_MODE
) {
    try {
        const url = `https://api.telegram.org/bot${token}/sendPhoto`;
        
        const payload = {
            chat_id: chatId,
            photo: photo,
            caption: caption,
            parse_mode: parseMode
        };
        
        if (replyMarkup) {
            payload.reply_markup = replyMarkup;
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error sending photo:', error);
        throw error;
    }
}

/**
 * Answers a callback query
 * @param {string} callbackQueryId - Callback query ID
 * @param {string} text - Text to show (optional)
 * @param {boolean} showAlert - Show as alert
 * @param {string} token - Bot token
 * @returns {Promise<Object>} Telegram API response
 */
export async function answerCallbackQuery(
    callbackQueryId, 
    text = '', 
    showAlert = false, 
    token
) {
    try {
        const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
        
        const payload = {
            callback_query_id: callbackQueryId,
            show_alert: showAlert
        };
        
        if (text) {
            payload.text = text;
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error answering callback query:', error);
        throw error;
    }
}

/**
 * Gets text from language resources
 * @param {string} key - Text key
 * @param {string} language - Language code
 * @param {Object} replacements - Text replacements
 * @returns {string} Localized text
 */
export function get_text(key, language = 'en', replacements = {}) {
    try {
        // Import config dynamically to avoid circular dependencies
        const { TEXT_RESOURCES, DEFAULT_LANGUAGE } = require('./config.js');
        
        const lang = TEXT_RESOURCES[language] || TEXT_RESOURCES[DEFAULT_LANGUAGE];
        
        if (!lang || !lang[key]) {
            // Fallback to English
            const enLang = TEXT_RESOURCES[DEFAULT_LANGUAGE];
            return enLang[key] || key;
        }
        
        let text = lang[key];
        
        // Apply replacements
        for (const [placeholder, value] of Object.entries(replacements)) {
            text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
        }
        
        return text;
    } catch (error) {
        console.error('Error getting text:', error);
        return key;
    }
}

/**
 * Checks if a message is a command
 * @param {Object} message - Telegram message object
 * @returns {boolean} True if message is a command
 */
export function isCommandMessage(message) {
    if (!message || !message.text) return false;
    
    const text = message.text.trim();
    
    // Check for bot commands (starts with /)
    if (text.startsWith('/')) {
        return true;
    }
    
    // Check for commands in entities
    if (message.entities) {
        return message.entities.some(entity => entity.type === 'bot_command');
    }
    
    // Check for bot mentions
    if (text.includes('@')) {
        const parts = text.split(' ');
        return parts.some(part => part.startsWith('/'));
    }
    
    return false;
}

/**
 * Parses a command from message text
 * @param {string} text - Message text
 * @returns {Object} Parsed command with base and parameters
 */
export function parseCommand(text) {
    if (!text) return { base: '', params: '', paramString: '' };
    
    const trimmed = text.trim();
    
    // Remove bot mention if present
    let commandText = trimmed.split('@')[0];
    
    // Split into command and parameters
    const parts = commandText.split(/\s+/);
    const base = parts[0];
    const params = parts.slice(1);
    const paramString = params.join(' ');
    
    return {
        base: base.toLowerCase(),
        params: params,
        paramString: paramString
    };
}

/**
 * Extracts chat type from message
 * @param {Object} message - Telegram message object
 * @returns {string} Chat type ('private', 'group', 'supergroup', 'channel')
 */
export function getChatType(message) {
    if (!message || !message.chat) return 'private';
    
    return message.chat.type || 'private';
}

/**
 * Formats seconds into MM:SS format
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Sanitizes text for Markdown parsing
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeMarkdown(text) {
    if (!text) return '';
    
    // Escape Markdown special characters
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    
    let sanitized = text;
    specialChars.forEach(char => {
        const regex = new RegExp(`\\${char}`, 'g');
        sanitized = sanitized.replace(regex, `\\${char}`);
    });
    
    return sanitized;
}

/**
 * Creates a user mention link
 * @param {number} userId - User ID
 * @param {string} userName - User name
 * @returns {string} Markdown user mention
 */
export function createUserMention(userId, userName) {
    if (!userId || !userName) return 'Unknown User';
    return `[${userName}](tg://user?id=${userId})`;
}

/**
 * Validates if a string is a valid Base32 secret
 * @param {string} secret - Secret to validate
 * @returns {boolean} True if valid
 */
export function isValidBase32(secret) {
    if (!secret) return false;
    
    // Base32 regex (A-Z, 2-7, case insensitive)
    const base32Regex = /^[A-Z2-7]+=*$/i;
    
    // Clean the secret
    const cleaned = secret.toUpperCase().replace(/\s/g, '').replace(/[^A-Z2-7]/g, '');
    
    return base32Regex.test(cleaned) && cleaned.length >= 16;
}

/**
 * Truncates text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Simple rate limiting function
 * @param {string} key - Rate limit key
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum requests per window
 * @returns {Object} Rate limit status
 */
export function checkRateLimit(key, windowMs, maxRequests) {
    const now = Date.now();
    
    // Initialize rate limit storage
    if (!global.rateLimits) {
        global.rateLimits = {};
    }
    
    if (!global.rateLimits[key]) {
        global.rateLimits[key] = {
            requests: [],
            windowMs: windowMs
        };
    }
    
    const limit = global.rateLimits[key];
    
    // Remove old requests outside the window
    limit.requests = limit.requests.filter(time => now - time < windowMs);
    
    // Check if limit exceeded
    if (limit.requests.length >= maxRequests) {
        const oldestRequest = limit.requests[0];
        const waitTime = Math.ceil((oldestRequest + windowMs - now) / 1000);
        return {
            allowed: false,
            waitTime: waitTime,
            remaining: 0
        };
    }
    
    // Add new request
    limit.requests.push(now);
    
    return {
        allowed: true,
        waitTime: 0,
        remaining: maxRequests - limit.requests.length
    };
}

/**
 * Logs an action to console (could be extended to log to file or database)
 * @param {string} action - Action description
 * @param {Object} data - Additional data
 * @param {string} level - Log level (info, warn, error)
 */
export function logAction(action, data = {}, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        action,
        level,
        data
    };
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${action}`, data);
    
    // You could add file logging or database logging here
    // Example: write to Cloudflare Workers KV
    // await env.LOGS.put(`log_${Date.now()}`, JSON.stringify(logEntry));
}

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Creates a delay/pause
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
export function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

// Export all utility functions
export default {
    sendMessage,
    editMessageText,
    deleteMessage,
    sendPhoto,
    answerCallbackQuery,
    get_text,
    isCommandMessage,
    parseCommand,
    getChatType,
    formatTime,
    sanitizeMarkdown,
    createUserMention,
    isValidBase32,
    truncateText,
    checkRateLimit,
    logAction,
    escapeHtml,
    delay,
    generateRandomString
};
