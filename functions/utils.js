///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import { PARSE_MODE } from './config.js';

//Send Message Function
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

// Edit Message Function
export async function editMessageText(chatId, messageId, text, reply_markup, token, parse_mode = PARSE_MODE) {
    const url = `https://api.telegram.org/bot${token}/editMessageText`;
    const body = {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: parse_mode,
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
