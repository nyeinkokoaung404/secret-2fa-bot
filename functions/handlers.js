// In your main message handler, add this logic:

import { handleSecretMessage, handle2FACommand } from './2fa_handlers.js';

// In your message handler function:
export async function handleMessage(message, env) {
    const chatId = message.chat.id;
    const userId = message.from?.id;
    const text = message.text?.trim();
    
    if (!text) return;
    
    // Check if it's a command
    if (isCommandMessage(message)) {
        // Parse command and call handle2FACommand
        // ... your existing command parsing logic ...
    } else {
        // Handle direct secret message
        await handleSecretMessage(chatId, userId, message, env);
    }
}
