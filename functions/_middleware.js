// _middleware.js
///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

import { handleUpdate } from './handlers';

/**
 * Cloudflare Worker entry point.
 * This function intercepts all requests and delegates Telegram updates to the handler.
 */
export async function onRequest({ request, env, waitUntil }) {
    if (request.method !== 'POST') {
        return new Response('Secret 2FA Bot is running. Send updates via POST.', { status: 200 });
    }

    try {
        const update = await request.json();
        
        // ⚠️ အရေးကြီးသည်- handleUpdate ကို await ဖြင့် ခေါ်ယူခြင်းဖြင့်
        // TOTP မျိုးဆက်အတွက် လိုအပ်သော cryptographic လုပ်ဆောင်ချက်များကို
        // Worker ၏ execution context တွင် ပြီးစီးရန် အာမခံပါသည်။
        await handleUpdate(update, env); 
        
        // Telegram API မှ OK ပြန်ရရန် ချက်ချင်း response ပြန်ပေးသည်။
        return new Response('OK', { status: 200 });
        
    } catch (e) {
        console.error('Worker Error in middleware:', e);
        // Error ရှိသော်လည်း Telegram retries ကို ရှောင်ရန် OK ပြန်ပေးသည်။
        return new Response('Error processing request body', { status: 200 });
    }
}
// NOTE: We only export the onRequest hook, as per Cloudflare's /functions directory pattern.
