/**
 * useChatSync - Cloud synchronization for chat history
 *
 * Provides offline-first experience with Supabase cloud backup.
 * Local IndexedDB remains the source of truth, with background sync to cloud.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import {
  ChatData,
  ChatMessage,
  saveChat,
  getChat,
  getChatsByProject,
  getAllChats,
} from './db';

// Supabase types
interface SupabaseChatSession {
  id: string;
  user_id: string;
  project_id: string | null;
  project_name: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface SupabaseChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  is_error: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  pendingChanges: number;
  error: string | null;
}

interface UseChatSyncOptions {
  projectName?: string;
  projectId?: string;
  autoSync?: boolean;
  syncInterval?: number; // ms
}

export function useChatSync({
  projectName,
  projectId,
  autoSync = true,
  syncInterval = 30000, // 30 seconds
}: UseChatSyncOptions = {}) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncAt: null,
    pendingChanges: 0,
    error: null,
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Check if user is authenticated
  const getUserId = useCallback(async (): Promise<string | null> => {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }, []);

  // Convert local ChatData to Supabase format
  const toSupabaseSession = (chat: ChatData, userId: string): Omit<SupabaseChatSession, 'id'> => ({
    user_id: userId,
    project_id: projectId || null,
    project_name: chat.projectName,
    description: chat.description,
    metadata: chat.metadata || {},
    created_at: chat.createdAt,
    updated_at: chat.updatedAt,
  });

  // Convert local ChatMessage to Supabase format
  const toSupabaseMessage = (msg: ChatMessage, sessionId: string): Omit<SupabaseChatMessage, 'id'> => ({
    session_id: sessionId,
    role: msg.role,
    content: msg.content,
    is_error: msg.isError || false,
    metadata: {},
    created_at: msg.timestamp,
  });

  // Convert Supabase format to local ChatData
  const fromSupabaseSession = (
    session: SupabaseChatSession,
    messages: SupabaseChatMessage[]
  ): ChatData => ({
    id: session.id,
    projectName: session.project_name,
    // Filter out system messages (not supported in local format) and cast role
    messages: messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.created_at,
        isError: m.is_error,
      })),
    description: session.description || 'Chat',
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    metadata: session.metadata as ChatData['metadata'],
  });

  // Upload a chat session to Supabase
  const uploadChat = useCallback(async (chat: ChatData): Promise<boolean> => {
    const userId = await getUserId();
    if (!userId || !supabase) return false;

    try {
      // Check if session already exists
      const { data: existing } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('id', chat.id)
        .single();

      if (existing) {
        // Update existing session
        const { error: updateError } = await supabase
          .from('chat_sessions')
          .update({
            description: chat.description,
            updated_at: chat.updatedAt,
            metadata: chat.metadata || {},
          })
          .eq('id', chat.id);

        if (updateError) throw updateError;

        // Delete old messages and insert new ones
        await supabase
          .from('chat_messages')
          .delete()
          .eq('session_id', chat.id);
      } else {
        // Insert new session
        const { error: insertError } = await supabase
          .from('chat_sessions')
          .insert({
            id: chat.id,
            ...toSupabaseSession(chat, userId),
          });

        if (insertError) throw insertError;
      }

      // Insert all messages
      if (chat.messages.length > 0) {
        const messages = chat.messages.map(m => ({
          id: m.id,
          ...toSupabaseMessage(m, chat.id),
        }));

        const { error: msgError } = await supabase
          .from('chat_messages')
          .insert(messages);

        if (msgError) throw msgError;
      }

      return true;
    } catch (error) {
      console.error('[ChatSync] Upload failed:', error);
      return false;
    }
  }, [getUserId, toSupabaseSession, toSupabaseMessage]);

  // Download all chat sessions from Supabase
  const downloadChats = useCallback(async (): Promise<ChatData[]> => {
    const userId = await getUserId();
    if (!userId || !supabase) return [];

    try {
      // Fetch sessions
      let query = supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (projectName) {
        query = query.eq('project_name', projectName);
      }

      const { data: sessions, error: sessionsError } = await query;
      if (sessionsError) throw sessionsError;
      if (!sessions || sessions.length === 0) return [];

      // Fetch all messages for these sessions
      const sessionIds = sessions.map(s => s.id);
      const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('*')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      // Group messages by session
      const messagesBySession = (messages || []).reduce((acc, msg) => {
        if (!acc[msg.session_id]) acc[msg.session_id] = [];
        acc[msg.session_id].push(msg);
        return acc;
      }, {} as Record<string, SupabaseChatMessage[]>);

      // Convert to local format
      return sessions.map(session =>
        fromSupabaseSession(session, messagesBySession[session.id] || [])
      );
    } catch (error) {
      console.error('[ChatSync] Download failed:', error);
      return [];
    }
  }, [getUserId, projectName, fromSupabaseSession]);

  // Sync local data with cloud
  const sync = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured || !supabase || syncStatus.isSyncing) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Get local chats
      const localChats = projectName
        ? await getChatsByProject(projectName)
        : await getAllChats();

      // Get cloud chats
      const cloudChats = await downloadChats();

      // Create maps for comparison
      const localMap = new Map(localChats.map(c => [c.id, c]));
      const cloudMap = new Map(cloudChats.map(c => [c.id, c]));

      // Upload local chats that are newer or don't exist in cloud
      let uploadCount = 0;
      for (const local of localChats) {
        const cloud = cloudMap.get(local.id);
        const localTime = new Date(local.updatedAt).getTime();
        const cloudTime = cloud ? new Date(cloud.updatedAt).getTime() : 0;

        if (!cloud || localTime > cloudTime) {
          await uploadChat(local);
          uploadCount++;
        }
      }

      // Download cloud chats that are newer or don't exist locally
      let downloadCount = 0;
      for (const cloud of cloudChats) {
        const local = localMap.get(cloud.id);
        const cloudTime = new Date(cloud.updatedAt).getTime();
        const localTime = local ? new Date(local.updatedAt).getTime() : 0;

        if (!local || cloudTime > localTime) {
          await saveChat(cloud);
          downloadCount++;
        }
      }

      console.log(`[ChatSync] Synced: ${uploadCount} uploaded, ${downloadCount} downloaded`);

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date().toISOString(),
        pendingChanges: 0,
      }));
    } catch (error) {
      console.error('[ChatSync] Sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [projectName, downloadChats, uploadChat, syncStatus.isSyncing]);

  // Upload a single chat immediately
  const uploadChatNow = useCallback(async (chatId: string): Promise<boolean> => {
    const chat = await getChat(chatId);
    if (!chat) return false;
    return uploadChat(chat);
  }, [uploadChat]);

  // Delete a chat from cloud
  const deleteFromCloud = useCallback(async (chatId: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[ChatSync] Delete failed:', error);
      return false;
    }
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      // Sync when coming back online
      if (autoSync) sync();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSync, sync]);

  // Auto-sync on interval
  useEffect(() => {
    if (!autoSync || !isSupabaseConfigured) return;

    // Initial sync after auth check
    const initSync = async () => {
      const userId = await getUserId();
      if (userId && !isInitializedRef.current) {
        isInitializedRef.current = true;
        sync();
      }
    };

    initSync();

    // Periodic sync
    syncTimeoutRef.current = setInterval(() => {
      if (navigator.onLine) {
        sync();
      }
    }, syncInterval);

    return () => {
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current);
      }
    };
  }, [autoSync, syncInterval, getUserId, sync]);

  // Mark pending changes (for UI indicator)
  const markPendingChange = useCallback(() => {
    setSyncStatus(prev => ({
      ...prev,
      pendingChanges: prev.pendingChanges + 1,
    }));
  }, []);

  return {
    syncStatus,
    sync,
    uploadChatNow,
    deleteFromCloud,
    downloadChats,
    markPendingChange,
    isConfigured: isSupabaseConfigured,
  };
}

export default useChatSync;
