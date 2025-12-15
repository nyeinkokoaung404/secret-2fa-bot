// functions/handlers.js

import { handleUpdate } from './2fa_handlers.js';

/**
 * Re-exports the main update handler function from 2fa_handlers.js
 * to be used by the Cloudflare Worker middleware.
 */
export { handleUpdate };
