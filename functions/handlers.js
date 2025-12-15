// handlers.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import { handle2FASecret } from './functions/2fa_handlers.js';
import { sendMessage } from './utils.js';
import { 
    TELEGRAM_BOT_TOKEN_ENV, 
    PARSE_MODE,
    LANGUAGE_PACK
} from './config.js';

// အခြေခံ command များအတွက် handler (ဥပမာ: /start)
export async function handleCommand(chatId, userId, commandBase, paramString, env) {
    const token = env[TELEGRAM_BOT_TOKEN_ENV];
    const lang = LANGUAGE_PACK.default; // hardcode

    if (commandBase === '/start') {
        const welcome_message = `👋 Welcome! Send me a Base32 secret key to generate a TOTP code.\n\n*Example:* \`JBSWY3DPEHPK3PXP\``;
        await sendMessage(chatId, welcome_message, null, true, token, PARSE_MODE);
    } else {
        const unknown_command_message = `Unknown command: ${commandBase}`;
        await sendMessage(chatId, unknown_command_message, null, true, token, PARSE_MODE);
    }
}

// ဤ handler သည် command မဟုတ်သော စာသားများအားလုံးကို စီမံဆောင်ရွက်သည်။
export async function handleTextMessage(chatId, userId, message, env) {
    const raw_secret = message.text;
    
    // Command စစ်ဆေးခြင်း (ဥပမာ: /start ကဲ့သို့ command များ မဟုတ်ရ)
    if (raw_secret.startsWith('/')) {
        // command handler မှ စီမံပြီးသား command ကို text handler တွင် ထပ်မံလုပ်ဆောင်ရန် မလိုပါ။
        // ဤနေရာတွင် command handler ၏ logic ကို ပြန်လည်မလုပ်ဆောင်ပါ။
        return; 
    }

    // ဤနေရာတွင် 2FA Secret Handler ကို တိုက်ရိုက်ခေါ်သည်။
    await handle2FASecret(chatId, userId, message, raw_secret, env);
}
