/**
 * Persistence module exports
 *
 * Provides both local (IndexedDB) and cloud (Supabase) storage for chat history.
 */

// Local storage (IndexedDB)
export * from './db';
export { useChatHistory } from './useChatHistory';

// Cloud sync (Supabase)
export { useChatSync } from './useChatSync';
