"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Bell, Menu, X, BookOpen, FileText, MessageSquare, Trophy, Plus, Check, Loader2, Sparkles, Megaphone } from "lucide-react";

interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body?: string;
  message?: string;
  is_read: boolean;
  created_at: string;
  link?: string | null;
}

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Realtime Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        router.push("/search");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Fetch initial notifications helper with useCallback
  const fetchNotifications = useCallback(async (uid: string) => {
    setIsNotifLoading(true);
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) {
        setNotifications(data as NotificationItem[]);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsNotifLoading(false);
    }
  }, [supabase]);

  // Fetch Auth User & Notifications
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchNotifications(user.id);
      }
    };
    fetchUser();
  }, [supabase, fetchNotifications]);

  // Set up Supabase Realtime WebSocket listener
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationItem, ...prev.slice(0, 4)]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleNotifClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notif.id);
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsNotifOpen(false);
  };

  const navLinks = [
    { href: "/resources", label: "Resources", icon: BookOpen },
    { href: "/blogs", label: "Blogs", icon: FileText },
    { href: "/forums", label: "Discussions", icon: MessageSquare },
    { href: "/dsa", label: "DSA", icon: Trophy },
    { href: "/announcements", label: "Announcements", icon: Megaphone },
  ];

  return (
    <header className="sticky top-0 z-40 w-full pixel-nav">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5 font-pixel text-xs tracking-tight">
            <span className="text-primary text-sm">{`{`}</span>
            <span className="text-zinc-900">{`}`}</span>
            <span className="text-zinc-900 font-sans text-lg font-black ml-0.5">Devsync</span>
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-zinc-600 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <input
              type="text"
              readOnly
              onClick={() => router.push("/search")}
              placeholder="Search Devsync..."
              className="w-44 lg:w-56 pixel-input pl-9 pr-12 py-1.5 text-xs cursor-pointer"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold text-zinc-400 border border-zinc-200 bg-zinc-50">
                ⌘K
              </kbd>
            </div>
          </div>

          <button
            onClick={() => router.push("/search")}
            className="p-1.5 text-zinc-500 hover:text-primary sm:hidden transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-1.5 text-zinc-500 hover:text-primary transition-all cursor-pointer"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5 items-center justify-center bg-primary text-[6px] text-white font-bold" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 pixel-card p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-200 mb-2">
                  <h4 className="text-[10px] font-pixel text-zinc-900 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[9px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                      Mark read
                    </button>
                  )}
                </div>

                {isNotifLoading ? (
                  <div className="flex h-20 items-center justify-center">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-5 text-center text-[10px] text-zinc-400 font-pixel">
                    No notifications yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={notif.link ?? "/"}
                        onClick={() => handleNotifClick(notif)}
                        className={`block p-2 text-[11px] leading-relaxed transition-all border-2 ${
                          notif.is_read 
                            ? "text-zinc-500 border-transparent hover:bg-zinc-50" 
                            : "bg-primary-50 border-primary-100 text-zinc-900 font-bold hover:bg-primary-100/50"
                        }`}
                      >
                        <p>{notif.message}</p>
                        <span className="text-[9px] text-zinc-400 font-medium block mt-0.5">
                          {new Date(notif.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <Link
            href="/profile/me"
            className="flex h-8 w-8 items-center justify-center bg-primary-100 text-primary-950 font-bold text-xs border-2 border-primary-300 hover:border-primary transition-all overflow-hidden"
          >
            AS
          </Link>

          {/* Mobile Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-zinc-500 hover:text-primary md:hidden transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t-2 border-zinc-900 bg-white px-2 py-3 md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-primary transition-all"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/resources/upload"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-semibold bg-primary-50 text-primary transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Contribute a Resource</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
