"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Bell, CheckCircle2, AlertCircle, Info, Loader2, CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    jobId?: string | null;
    read: boolean;
    createdAt: string;
}

export function NotificationsBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications ?? []);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll alle 60s
        const interval = setInterval(fetchNotifications, 60_000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const unread = notifications.filter((n) => !n.read).length;

    const markRead = async (id: string) => {
        await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = async () => {
        await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markAllRead: true }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "results_ready": return <CheckCircle2 className="w-4 h-4 text-secondary" />;
            case "error": return <AlertCircle className="w-4 h-4 text-destructive" />;
            default: return <Info className="w-4 h-4 text-primary" />;
        }
    };

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                onClick={() => setOpen((p) => !p)}
                className="relative w-9 h-9 flex items-center justify-center rounded-none hover:bg-muted transition-colors"
                id="notifications-bell"
                aria-label="Benachrichtigungen"
            >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-none bg-destructive/10 text-destructive text-[10px] font-bold flex items-center justify-center px-0.5">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {/* Popover */}
            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    <div className="absolute right-0 top-11 z-50 w-80 bg-background rounded-none shadow-2xl border border-border overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <h3 className="text-sm font-bold text-foreground">Benachrichtigungen</h3>
                            {unread > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Alle gelesen
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                            {loading && notifications.length === 0 && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            {!loading && notifications.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                    <Bell className="w-10 h-10 text-muted-foreground mb-2" />
                                    <p className="text-xs text-muted-foreground">Keine Benachrichtigungen</p>
                                </div>
                            )}
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.read && markRead(n.id)}
                                    className={cn(
                                        "flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted transition-colors",
                                        !n.read && "bg-primary/10/60"
                                    )}
                                >
                                    <div className="flex-shrink-0 mt-0.5">{getIcon(n.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {new Date(n.createdAt).toLocaleString("de-DE", {
                                                day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                    {!n.read && (
                                        <div className="w-2 h-2 rounded-none bg-primary/10 mt-1.5 flex-shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
