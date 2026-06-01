"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Bell, Menu, X, Code, BookOpen, FileText, MessageSquare, Trophy, Plus, Check, Loader2, Sparkles } from "lucide-react";

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Realtime Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
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
  }, [supabase]);

  // Fetch initial notifications
  const fetchNotifications = async (uid: string) => {
    setIsNotifLoading(true);
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsNotifLoading(false);
    }
  };

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
          setNotifications((prev) => [payload.new, ...prev.slice(0, 4)]);
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

  const handleNotifClick = async (notif: any) => {
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
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="text-primary font-mono text-2xl font-black">{`{`}</span>
            <span className="text-zinc-900 dark:text-white font-sans tracking-wide">DevSync</span>
            <span className="text-primary font-mono text-2xl font-black">{`}`}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-primary dark:text-zinc-300 dark:hover:text-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              readOnly
              onClick={() => router.push("/search")}
              placeholder="Search... (⌘K)"
              className="w-48 lg:w-64 rounded-full border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:bg-zinc-950 transition-all cursor-pointer"
            />
          </div>

          <button
            onClick={() => router.push("/search")}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:hidden transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          <Link
            href="/resources/upload"
            className="hidden sm:flex items-center gap-1 rounded-full bg-primary hover:bg-primary-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Contribute</span>
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-all cursor-pointer"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-3xl border border-zinc-150 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in slide-in-from-top-3 duration-150 z-50">
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                      Mark read
                    </button>
                  )}
                </div>

                {isNotifLoading ? (
                  <div className="flex h-24 items-center justify-center">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-400">
                    No notifications yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={notif.link ?? "/"}
                        onClick={() => handleNotifClick(notif)}
                        className={`block p-2.5 rounded-2xl text-[11px] leading-relaxed transition-all ${
                          notif.is_read 
                            ? "text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-850" 
                            : "bg-primary-50/40 border border-primary-100/50 text-zinc-950 font-bold dark:bg-primary-950/10 dark:border-primary-900/10 dark:text-white hover:bg-primary-50/60"
                        }`}
                      >
                        <p>{notif.message}</p>
                        <span className="text-[9px] text-zinc-400 font-medium block mt-1">
                          {new Date(notif.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative flex items-center">
            <Link
              href="/profile/me"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-950 font-bold text-xs ring-2 ring-transparent hover:ring-primary transition-all overflow-hidden"
            >
              AS
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 md:hidden transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-zinc-100 bg-white px-2 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 hover:text-primary dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-primary transition-all"
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/resources/upload"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium bg-primary-50 text-primary dark:bg-primary-950 dark:text-primary-300 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Contribute a Resource</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
