// _middleware.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import { handleUpdate } from './handlers';

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
        
        // waitUntil ကို အသုံးပြု၍ processing ကို background တွင် လုပ်ဆောင်သည်။
        waitUntil(handleUpdate(update, env));

        return new Response('OK', { status: 200 });
    } catch (e) {
        console.error('Worker Error:', e);
        // Error ရှိသော်လည်း Telegram retries ကို ရှောင်ရန် OK ပြန်ပေးသည်။
        return new Response('Error processing update', { status: 200 });
    }
}
// NOTE: We only export the onRequest hook, as per Cloudflare's /functions directory pattern.
