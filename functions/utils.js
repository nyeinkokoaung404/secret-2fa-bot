// utils.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import {
    LANGUAGE_PACK,
    PARSE_MODE,
} from './config.js';

/**
 * ဘာသာစကား pack မှ သက်ဆိုင်ရာ စာသားကို ရယူသည်။ (db.js မသုံးဘဲ hardcode)
 * @param {string} key - စာသား၏ key
 * @param {string} lang_code - ဘာသာစကား code (e.g., 'en', 'my')
 * @returns {string | null}
 */
export function get_text(key, lang_code = 'default') {
    const pack = LANGUAGE_PACK[lang_code] || LANGUAGE_PACK[LANGUAGE_PACK.default];
    return pack ? pack[key] : null;
}

/**
 * Telegram API သို့ message ပို့ရန် wrapper
 * @param {number} chatId - ပို့မည့် chat ID
 * @param {string} text - စာသား
 * @param {Object | null} reply_markup - Keyboard markup
 * @param {boolean} disable_web_page_preview - Web page preview ပိတ်ရန်
 * @param {string} token - Bot Token
 * @param {string} parse_mode - Parse mode (Markdown, HTML)
 * @returns {Promise<Response>}
 */
export async function sendMessage(chatId, text, reply_markup, disable_web_page_preview, token, parse_mode = PARSE_MODE) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const body = {
        chat_id: chatId,
        text: text,
        parse_mode: parse_mode,
        disable_web_page_preview: disable_web_page_preview,
    };

    if (reply_markup) {
        body.reply_markup = reply_markup;
    }

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
}

/**
 * Telegram API သို့ မက်ဆေ့ချ်ကို ပြင်ဆင်ရန် wrapper
 * @param {number} chatId - ပြင်ဆင်မည့် chat ID
 * @param {number} messageId - ပြင်ဆင်မည့် message ID
 * @param {string} text - စာသား
 * @param {Object | null} reply_markup - Keyboard markup
 * @param {boolean} disable_web_page_preview - Web page preview ပိတ်ရန်
 * @param {string} token - Bot Token
 * @param {string} parse_mode - Parse mode (Markdown, HTML)
 * @returns {Promise<Response>}
 */
export async function editMessageText(chatId, messageId, text, reply_markup, disable_web_page_preview, token, parse_mode = PARSE_MODE) {
    const url = `https://api.telegram.org/bot${token}/editMessageText`;
    const body = {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: parse_mode,
        disable_web_page_preview: disable_web_page_preview,
    };

    if (reply_markup) {
        body.reply_markup = reply_markup;
    }

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
}

// ဤနေရာတွင် db.js ၏ logic များ မပါဝင်ပါ။
