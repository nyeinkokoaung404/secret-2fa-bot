// functions/config.js

export const TELEGRAM_BOT_TOKEN_ENV = 'TELEGRAM_BOT_TOKEN';

// This is the default ban message.
export const BAN_REPLY = "*🛑 You are banned from using this bot.*";

// The maximum allowed length for a Base32 secret string.
// Standard TOTP secrets are typically 16 to 32 characters (10 to 20 bytes).
export const MAX_SECRET_LENGTH = 100; 

// Simple placeholder for text localization, since 'utils.js' is removed.
export function get_text(key, lang) {
    const texts = {
        '2fa_invalid_secret': "*❌ Invalid Secret.* Please provide a valid Base32 secret string (A-Z, 2-7).",
        '2fa_error': "*❌ Error generating code.* Please try again.",
    };
    // In a real bot, 'lang' would be used to select the language.
    return texts[key];
}
