// _middleware.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import { 
    TELEGRAM_BOT_TOKEN_ENV, 
    PARSE_MODE,
    LANGUAGE_PACK,
} from './config.js';
import { sendMessage, get_text } from './utils.js';
import { handleCommand, handleTextMessage } from './handlers.js';

// Telegram Update Object ကို ခွဲခြမ်းစိတ်ဖြာပြီး သက်ဆိုင်ရာ Handler များသို့ လမ်းညွှန်ပေးသည်
export async function handleUpdate(update, env) {
    // Bot Token မရှိမရှိ စစ်ဆေးခြင်း။
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    if (!token) {
        console.error("TELEGRAM_BOT_TOKEN_ENV is not set in environment.");
        return new Response('Token not configured.', { status: 500 });
    }

    // စာသား မက်ဆေ့ချ် (text message) ကိုသာ စီမံဆောင်ရွက်သည်
    if (update.message && update.message.text) {
        const message = update.message;
        const chatId = message.chat.id;
        const userId = message.from.id;
        const text = message.text;
        
        // Command ဖြစ်မဖြစ် စစ်ဆေးခြင်း
        if (text.startsWith('/')) {
            const parts = text.split(/\s+/);
            const commandBase = parts[0].toLowerCase();
            const paramString = parts.slice(1).join(' ');
            
            // Command Handler ကို ခေါ်ဆိုခြင်း
            await handleCommand(chatId, userId, commandBase, paramString, env);
        } else {
            // Command မဟုတ်ပါက Text Message Handler ကို ခေါ်ဆိုခြင်း (Base32 secret အတွက်)
            await handleTextMessage(chatId, userId, message, env);
        }

        return new Response('OK', { status: 200 });

    } else if (update.message) {
        // စာသား မဟုတ်သော message (ဓာတ်ပုံ, ဗီဒီယို စသည်)
        const chatId = update.message.chat.id;
        const lang = LANGUAGE_PACK.default; // hardcode
        const error_message = get_text('unsupported_update', lang);

        await sendMessage(chatId, error_message, null, true, token, PARSE_MODE);
        return new Response('OK - Unsupported update type', { status: 200 });

    } else {
        // အခြား update အမျိုးအစားများ (inline query, callback query စသည်) ကို လျစ်လျူရှုခြင်း
        return new Response('OK - Not a message update', { status: 200 });
    }
}

// ဤ code ကို Cloudflare Worker ၏ export default { fetch(request, env) } function တွင် ထည့်သွင်းအသုံးပြုနိုင်ပါသည်။
// (ဥပမာ)

export default {
    async fetch(request, env) {
        if (request.method === 'POST') {
            try {
                const update = await request.json();
                return handleUpdate(update, env);
            } catch (e) {
                console.error("Error processing update:", e);
                return new Response('Error processing update', { status: 500 });
            }
        }
        return new Response('Method not allowed', { status: 405 });
    }
};
