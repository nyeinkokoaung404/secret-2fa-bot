///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import { handleUpdate } from './handlers.js';

/**
 * Cloudflare Worker entry point.
 * This function intercepts all requests and delegates Telegram updates to the handler.
 * @param {Object} context The request context, including request, env, and waitUntil.
 */
export async function onRequest({ request, env, waitUntil }) {
    if (request.method !== 'POST') {
        return new Response('Secret 2FA Bot is running. Send updates via POST.', { status: 200 });
    }

    try {
        const update = await request.json();
        
        // Use waitUntil to ensure processing happens without blocking the immediate HTTP response.
        waitUntil(handleUpdate(update, env));

        return new Response('OK', { status: 200 });
    } catch (e) {
        console.error('Worker Error:', e);
        // Respond with OK even on error to prevent Telegram from retrying endlessly
        return new Response('Error processing update', { status: 200 });
    }
}
