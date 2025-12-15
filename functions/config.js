// functions/config.js

export const TELEGRAM_BOT_TOKEN_ENV = 'TELEGRAM_BOT_TOKEN';

// The maximum allowed length for a Base32 secret string.
export const MAX_SECRET_LENGTH = 100; 

// --- Welcome Message for /start command ---
export const WELCOME_MESSAGE = 
    `👋 *Welcome to the Secret 2FA Generator Bot!*\n\n` +
    `*How to use:*\n` +
    `Simply send me your Base32 secret key (e.g., \`JBSWY3DPEHPK3PXP\`).\n` +
    `I will instantly calculate and return the current 6-digit TOTP code for you.\n\n` +
    `*Note:* This bot does not store your secret keys.`;
