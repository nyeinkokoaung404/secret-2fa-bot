// functions/config.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

// --- Environment Variable Names ---
export const TELEGRAM_BOT_TOKEN_ENV = 'TELEGRAM_BOT_TOKEN';
export const ADMIN_CHAT_ID_ENV = 'ADMIN_CHAT_ID';
export const DATABASE_URL_ENV = 'DATABASE_URL';
export const DATABASE_TOKEN_ENV = 'DATABASE_TOKEN';

// --- Bot Configuration ---
export const BOT_NAME = 'TOTP Generator Bot';
export const BOT_USERNAME = '@YourBotUsername'; // Replace with your bot's username

// --- Ban System ---
export const BAN_REPLY = `🚫 *You are banned from using this bot.*\n\n` +
                         `If you believe this is a mistake, please contact the administrator.`;

export const BAN_DURATIONS = {
    TEMPORARY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    PERMANENT: null // null means permanent ban
};

// --- Rate Limiting ---
export const RATE_LIMITS = {
    TOTP_GENERATION: {
        WINDOW_MS: 10 * 1000, // 10 seconds
        MAX_REQUESTS: 3
    },
    MESSAGES: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 20
    }
};

// --- TOTP Settings ---
export const TOTP_SETTINGS = {
    TIME_STEP: 30, // seconds
    CODE_LENGTH: 6,
    MIN_SECRET_LENGTH: 16,
    MAX_SECRET_LENGTH: 32
};

// --- Messages ---
export const MESSAGES = {
    WELCOME: `👋 *Welcome to ${BOT_NAME}!*\n\n` +
             `I can generate TOTP (Time-based One-Time Password) codes for you.\n\n` +
             `*How to use:*\n` +
             `1. Send me your Base32 secret\n` +
             `2. Or use the command: /2fa <secret>\n\n` +
             `*Example:*\n` +
             `\`JBSWY3DPEHPK3PXP\`\n` +
             `or\n` +
             `\`/2fa JBSWY3DPEHPK3PXP\`\n\n` +
             `*⚠️ Important:*\n` +
             `• Your secret is never stored\n` +
             `• Codes expire in 30 seconds\n` +
             `• Keep your secrets secure!`,
    
    HELP: `*🤖 Bot Commands:*\n\n` +
          `/start - Show welcome message\n` +
          `/help - Show this help message\n` +
          `/2fa <secret> - Generate TOTP code\n` +
          `/lang - Change language\n` +
          `/about - About this bot\n\n` +
          `*Quick Usage:*\n` +
          `Just send your Base32 secret directly (no command needed)!\n\n` +
          `*Supported Languages:*\n` +
          `• English (default)\n` +
          `• Myanmar (မြန်မာ)\n\n` +
          `*Features:*\n` +
          `✅ Direct secret processing\n` +
          `✅ Secure code generation\n` +
          `✅ User-friendly interface\n` +
          `✅ Multi-language support`,
    
    ABOUT: `*ℹ️ About ${BOT_NAME}*\n\n` +
           `*Version:* 2.0.0\n` +
           `*Developer:* @nkka404\n` +
           `*Channel:* @premium_channel_404\n\n` +
           `*Features:*\n` +
           `• TOTP code generation\n` +
           `• Direct secret processing\n` +
           `• Secure & private\n` +
           `• No data storage\n\n` +
           `*Open Source:*\n` +
           `This bot is open source. You can view the code on GitHub.\n\n` +
           `*Disclaimer:*\n` +
           `This bot is for educational purposes only. Use at your own risk.`,
    
    SECURITY_WARNING: `⚠️ *Security Notice*\n\n` +
                      `• Never share your TOTP codes with anyone\n` +
                      `• This bot doesn't store your secrets\n` +
                      `• Generated codes expire in 30 seconds\n` +
                      `• Ensure your device time is synchronized`
};

// --- Language Support ---
export const SUPPORTED_LANGUAGES = {
    en: 'English',
    my: 'မြန်မာ'
};

// --- Default Language ---
export const DEFAULT_LANGUAGE = 'en';

// --- Text Resources (for translation) ---
export const TEXT_RESOURCES = {
    en: {
        // General
        'welcome': MESSAGES.WELCOME,
        'help': MESSAGES.HELP,
        'about': MESSAGES.ABOUT,
        'security_warning': MESSAGES.SECURITY_WARNING,
        
        // 2FA Related
        '2fa_secret_missing': '❌ *Secret not provided.*\nPlease include the Base32 secret.',
        '2fa_invalid_secret': '❌ *Invalid Secret.*\nPlease provide a valid Base32 secret string.',
        '2fa_invalid_secret_length': '❌ *Secret too short.*\nMinimum 16 characters required.',
        '2fa_generating': '🔐 *Generating TOTP code...*',
        '2fa_success': '✅ *TOTP Code Generated*',
        '2fa_error': '❌ *Error generating code*',
        '2fa_expires_in': 'Expires in',
        '2fa_seconds': 'seconds',
        '2fa_via_direct': 'Via: Direct Secret Message',
        '2fa_via_command': 'Via: Command',
        
        // Rate limiting
        'rate_limit_exceeded': '⚠️ *Rate limit exceeded.*\nPlease wait {seconds} seconds.',
        
        // Language
        'lang_current': 'Current language: {language}',
        'lang_select': 'Please select a language:',
        'lang_changed': '✅ Language changed to: {language}',
        'lang_error': '❌ Error changing language',
        
        // Admin
        'admin_only': '❌ This command is for administrators only.',
        
        // Errors
        'error_general': '❌ An error occurred. Please try again.',
        'error_internal': '❌ Internal server error.',
        
        // Success
        'success': '✅ Success!',
        
        // User info
        'generated_by': 'Generated By',
        'secret': 'Secret',
        'code': 'Code'
    },
    
    my: {
        // General
        'welcome': `👋 *${BOT_NAME} မှကြိုဆိုပါတယ်!*\n\n` +
                   `ကျွန်တော်က TOTP (Time-based One-Time Password) codes များထုတ်ပေးနိုင်ပါတယ်။\n\n` +
                   `*အသုံးပြုနည်း:*\n` +
                   `1. Base32 secret ကိုပို့ပါ\n` +
                   `2. သို့မဟုတ် command အသုံးပြုပါ: /2fa <secret>\n\n` +
                   `*ဥပမာ:*\n` +
                   `\`JBSWY3DPEHPK3PXP\`\n` +
                   `သို့မဟုတ်\n` +
                   `\`/2fa JBSWY3DPEHPK3PXP\`\n\n` +
                   `*⚠️ အရေးကြီးသတိပေးချက်:*\n` +
                   `• သင့် secret ကိုသိမ်းဆည်းထားခြင်းမရှိပါ\n` +
                   `• Codes များသည် ၃၀ စက္ကန့်အတွင်းသက်တမ်းကုန်ဆုံးပါမည်\n` +
                   `• သင့် secret များကိုလုံခြုံစွာထားပါ`,
        
        'help': `*🤖 Bot Commands:*\n\n` +
                `/start - အစပြုရန်မက်ဆေ့ဂျ်\n` +
                `/help - ဤအကူညီမက်ဆေ့ဂျ်\n` +
                `/2fa <secret> - TOTP code ထုတ်ရန်\n` +
                `/lang - ဘာသာစကားပြောင်းရန်\n` +
                `/about - ဤဘော့အကြောင်း\n\n` +
                `*အမြန်အသုံးပြုနည်း:*\n` +
                `Base32 secret ကိုတိုက်ရိုက်ပို့ပါ (command မလိုအပ်ပါ)\n\n` +
                `*ပံ့ပိုးထားသောဘာသာစကားများ:*\n` +
                `• English (အင်္ဂလိပ်)\n` +
                `• Myanmar (မြန်မာ)\n\n` +
                `*ဝန်ဆောင်မှုများ:*\n` +
                `✅ တိုက်ရိုက် secret လုပ်ဆောင်ခြင်း\n` +
                `✅ လုံခြုံသော code ထုတ်လုပ်ခြင်း\n` +
                `✅ အသုံးပြုရလွယ်ကူသော interface\n` +
                `✅ ဘာသာစကားအမျိုးမျိုးပံ့ပိုးခြင်း`,
        
        'about': `*ℹ️ ${BOT_NAME} အကြောင်း*\n\n` +
                 `*ဗားရှင်း:* 2.0.0\n` +
                 `*ဖန်တီးသူ:* @nkka404\n` +
                 `*ချန်နယ်:* @premium_channel_404\n\n` +
                 `*ဝန်ဆောင်မှုများ:*\n` +
                 `• TOTP code ထုတ်လုပ်ခြင်း\n` +
                 `• တိုက်ရိုက် secret လုပ်ဆောင်ခြင်း\n` +
                 `• လုံခြုံပြီးသီးသန့်ဖြစ်ခြင်း\n` +
                 `• ဒေတာသိမ်းဆည်းခြင်းမရှိပါ\n\n` +
                 `*Open Source:*\n` +
                 `ဤဘော့သည် open source ဖြစ်ပါသည်။ GitHub တွင်ကုဒ်များကြည့်နိုင်ပါသည်။\n\n` +
                 `*သတိပေးချက်:*\n` +
                 `ဤဘော့သည် ပညာသင်ဆုရည်ရွယ်ချက်များအတွက်သာဖြစ်ပါသည်။ သင်၏အန္တရာယ်ဖြင့်အသုံးပြုပါ။`,
        
        'security_warning': `⚠️ *လုံခြုံရေးသတိပေးချက်*\n\n` +
                            `• သင်၏ TOTP codes များကိုမည်သူ့ကိုမျှမျှဝေပါနှင့်\n` +
                            `• ဤဘော့သည် သင်၏ secrets များကိုသိမ်းဆည်းထားခြင်းမရှိပါ\n` +
                            `• ထုတ်လုပ်ထားသော codes များသည် ၃၀ စက္ကန့်အတွင်းသက်တမ်းကုန်ဆုံးပါမည်\n` +
                            `• သင်၏ device အချိန်ကိုတိကျစွာညှိပါ`,
        
        // 2FA Related
        '2fa_secret_missing': '❌ *Secret မပါရှိပါ။*\nBase32 secret ထည့်သွင်းပေးပါ။',
        '2fa_invalid_secret': '❌ *မမှန်ကန်သော Secret။*\nမှန်ကန်သော Base32 secret string တစ်ခုပေးပါ။',
        '2fa_invalid_secret_length': '❌ *Secret သည်တိုတောင်းလွန်းသည်။*\nအနည်းဆုံး ၁၆ လုံးလိုအပ်ပါသည်။',
        '2fa_generating': '🔐 *TOTP code ထုတ်လုပ်နေပါသည်...*',
        '2fa_success': '✅ *TOTP Code ထုတ်လုပ်ပြီးပါပြီ*',
        '2fa_error': '❌ *Code ထုတ်လုပ်ရာတွင်အမှားတစ်ခုဖြစ်နေသည်*',
        '2fa_expires_in': 'သက်တမ်းကုန်ဆုံးရန်',
        '2fa_seconds': 'စက္ကန့်',
        '2fa_via_direct': 'နည်းလမ်း: တိုက်ရိုက် Secret Message',
        '2fa_via_command': 'နည်းလမ်း: Command',
        
        // Rate limiting
        'rate_limit_exceeded': '⚠️ *Rate limit ကျော်လွန်သွားပါသည်။*\n{seconds} စက္ကန့်စောင့်ပါ။',
        
        // Language
        'lang_current': 'လက်ရှိဘာသာစကား: {language}',
        'lang_select': 'ဘာသာစကားရွေးချယ်ပါ:',
        'lang_changed': '✅ ဘာသာစကားပြောင်းလိုက်သည်: {language}',
        'lang_error': '❌ ဘာသာစကားပြောင်းရာတွင်အမှားဖြစ်နေသည်',
        
        // Admin
        'admin_only': '❌ ဤ command သည် administrator များအတွက်သာဖြစ်ပါသည်။',
        
        // Errors
        'error_general': '❌ အမှားတစ်ခုဖြစ်နေသည်။ ကျေးဇူးပြု၍ထပ်ကြိုးစားပါ။',
        'error_internal': '❌ Internal server error.',
        
        // Success
        'success': '✅ အောင်မြင်ပါပြီ!',
        
        // User info
        'generated_by': 'ထုတ်လုပ်သူ',
        'secret': 'Secret',
        'code': 'Code'
    }
};

// --- Inline Keyboard Templates ---
export const KEYBOARDS = {
    language: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🇬🇧 English', callback_data: 'lang_en' },
                    { text: '🇲🇲 Myanmar', callback_data: 'lang_my' }
                ]
            ]
        }
    },
    
    main_menu: {
        reply_markup: {
            keyboard: [
                [{ text: '🔐 Generate TOTP' }],
                [{ text: 'ℹ️ Help' }, { text: '🌐 Language' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    }
};

// --- Default Parse Mode ---
export const DEFAULT_PARSE_MODE = 'Markdown';

// --- Cache Settings ---
export const CACHE_TTL = 60 * 1000; // 1 minute

// --- Export all ---
export default {
    TELEGRAM_BOT_TOKEN_ENV,
    ADMIN_CHAT_ID_ENV,
    DATABASE_URL_ENV,
    DATABASE_TOKEN_ENV,
    BOT_NAME,
    BOT_USERNAME,
    BAN_REPLY,
    BAN_DURATIONS,
    RATE_LIMITS,
    TOTP_SETTINGS,
    MESSAGES,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    TEXT_RESOURCES,
    KEYBOARDS,
    DEFAULT_PARSE_MODE,
    CACHE_TTL
};
