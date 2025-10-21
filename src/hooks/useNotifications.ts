import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string;
  type: 'profile_changes' | 'role_change' | 'challenge' | 'reward';
  entity_id: string;
  entity_type: 'profile_changes' | 'role_change' | 'challenge' | 'reward';
  message: string;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user.id}`,
      }, (payload) => {
        const notification = payload.new as Notification;
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((count) => count + 1);
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((count) => count - 1);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('recipient_id', user.id);
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = async () => {
    if (!user) return;
    await supabase.from("notifications").delete().eq('recipient_id', user.id);
    setNotifications([]);
    setUnreadCount(0);
  }

  return { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, clearAll };
}
