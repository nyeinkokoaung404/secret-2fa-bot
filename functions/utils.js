///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import { PARSE_MODE } from './config.js';

/**
 * @param {number} chatId
 * @param {string} text
 * @param {Object | null} reply_markup
 * @param {boolean} disable_web_page_preview
 * @param {string} token
 * @param {string} parse_mode
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
