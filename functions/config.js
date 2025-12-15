// config.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

// ⚠️ Environment Variables ၏ နာမည်ကို သတ်မှတ်ခြင်း။
// ဤ နာမည်ကို Cloudflare Worker, Vercel, သို့မဟုတ် အခြား environment တွင် သတ်မှတ်ထားရပါမည်။
export const TELEGRAM_BOT_TOKEN_ENV = 'TELEGRAM_BOT_TOKEN'; 

// ဤ bot အတွက် ဘာသာစကား စာသားများကို စုစည်းထားသော နေရာ။
// db.js မရှိတော့သဖြင့် hardcode လုပ်ထားခြင်းဖြစ်သည်။
export const LANGUAGE_PACK = {
    // ပုံသေ ဘာသာစကား (Default Language)
    'default': 'en', 

    // အင်္ဂလိပ် ဘာသာစကား (English)
    'en': { 
        '2fa_secret_missing': "*❌ Secret not provided.* Please send me the Base32 secret directly.",
        '2fa_invalid_secret': "*❌ Invalid Secret.* Please provide a valid Base32 secret string (A-Z, 2-7).",
        '2fa_error': "*❌ Error generating code.* Please check your secret.",
        'loading_message': "*Generating TOTP code...*",
        'unsupported_update': "I can only process text messages for TOTP generation.",
    },

    // မြန်မာ ဘာသာစကား (Myanmar - ဥပမာ)
    'my': { 
        '2fa_secret_missing': "*❌ လျှို့ဝှက်ကုဒ်မထည့်သွင်းပါ။* Base32 လျှို့ဝှက်ကုဒ်ကို တိုက်ရိုက်ပို့ပေးပါ။",
        '2fa_invalid_secret': "*❌ မမှန်ကန်သော လျှို့ဝှက်ကုဒ်။* မှန်ကန်သော Base32 စာသား (A-Z, 2-7) ကို ပေးပို့ပါ။",
        '2fa_error': "*❌ ကုဒ်ထုတ်လုပ်ရာတွင် အမှားပေါ်။* လျှို့ဝှက်ကုဒ်ကို စစ်ဆေးပါ။",
        'loading_message': "*TOTP ကုဒ်ကို ထုတ်လုပ်နေသည်...*",
        'unsupported_update': "TOTP ထုတ်လုပ်ရန်အတွက် စာသားမက်ဆေ့ချ်များကိုသာ စီမံဆောင်ရွက်နိုင်ပါသည်။",
    }
};

// --- Constants ---
export const PARSE_MODE = 'Markdown';
