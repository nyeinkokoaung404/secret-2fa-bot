// functions/_middleware.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import { handleUpdate } from './2fa_handlers.js'; 

// Cloudflare Worker entry point.
export async function onRequest({ request, env, waitUntil }) {
    if (request.method !== 'POST') {
        return new Response('Secret 2FA Bot is running. Send updates via POST.', { status: 200 });
    }

    try {
        const update = await request.json();
        
        waitUntil(handleUpdate(update, env));

        return new Response('OK', { status: 200 });
    } catch (e) {
        console.error('Worker Error:', e);
        return new Response('Error processing update', { status: 200 });
    }
}
