import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDatabase } from "../../lib/useDatabase";
import { X, Volume2, RefreshCw } from "lucide-react";

interface FloatingNotificationProps {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    duration?: number;
    onClose: () => void;
}

/**
 * Floating notification that appears at the top of the screen
 * Wiggles to get attention and expands on hover to show content
 */
export function FloatingNotification({
    title,
    subtitle,
    content,
    duration = 10,
    onClose,
}: Omit<FloatingNotificationProps, "id">) {
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (duration && duration > 0) {
            const timer = setTimeout(onClose, duration * 1000);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <motion.div
            layout
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            onHoverStart={() => {
                setIsExpanded(true);
            }}
            onHoverEnd={() => {
                setIsExpanded(false);
            }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm cursor-pointer"
        >
            {/* Wiggling animation container */}
            <motion.div
                animate={
                    !isExpanded
                        ? {
                              rotate: [0, -2, 2, -2, 0],
                              y: [0, -4, 4, -4, 0],
                          }
                        : { rotate: 0, y: 0 }
                }
                transition={
                    !isExpanded
                        ? { duration: 0.6, repeat: Infinity, repeatDelay: 3 }
                        : { duration: 0.3 }
                }
            >
                <div
                    className="rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(220,160,72,0.2) 0%, rgba(106,36,40,0.8) 100%)",
                        backdropFilter: "blur(20px)",
                        border: "2px solid rgba(220,160,72,0.6)",
                        boxShadow:
                            "0 20px 60px rgba(220,160,72,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                    }}
                >
                    {/* Compact view */}
                    <motion.div
                        animate={{
                            paddingBottom: isExpanded ? 0 : 16,
                            paddingTop: isExpanded ? 0 : 16,
                        }}
                        className="p-4"
                    >
                        <div className="flex items-start gap-4 justify-between">
                            <div className="flex-1 min-w-0">
                                <motion.div
                                    animate={{
                                        opacity: !isExpanded ? 1 : 0,
                                        height: !isExpanded ? "auto" : 0,
                                    }}
                                    className="overflow-hidden"
                                >
                                    <p
                                        style={{
                                            color: "#DCA048",
                                            fontSize: "0.7rem",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.15em",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {title}
                                    </p>
                                    <p
                                        style={{
                                            color: "white",
                                            fontSize: "0.9rem",
                                            fontWeight: 600,
                                            marginTop: "0.25rem",
                                        }}
                                        className="truncate"
                                    >
                                        {subtitle}
                                    </p>
                                </motion.div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                }}
                                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={16} style={{ color: "#DCA048" }} />
                            </button>
                        </div>

                        {/* Expanded content view */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-t border-white/10 mt-4 pt-4 space-y-3"
                                >
                                    <div
                                        className="rounded-xl p-3"
                                        style={{
                                            background: "rgba(0,0,0,0.2)",
                                            border: "1px solid rgba(220,160,72,0.2)",
                                        }}
                                    >
                                        <p
                                            dir="rtl"
                                            style={{
                                                color: "white",
                                                fontSize: "0.95rem",
                                                lineHeight: 1.6,
                                                fontFamily: "Amiri, serif",
                                            }}
                                            className="text-right"
                                        >
                                            {content}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #DCA048, #CF9555)",
                                                color: "white",
                                                fontWeight: 600,
                                            }}
                                        >
                                            <RefreshCw size={14} />
                                            Perform Now
                                        </button>
                                        <button
                                            className="px-3 py-2 rounded-lg text-sm"
                                            style={{
                                                background:
                                                    "rgba(255,255,255,0.05)",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                color: "#D7C29F",
                                            }}
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Shimmer effect */}
                    {!isExpanded && (
                        <motion.div
                            className="absolute inset-0 rounded-2xl"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                            }}
                            animate={{
                                x: ["-100%", "100%"],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1,
                            }}
                        />
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

interface NotificationCenterProps {
    maxNotifications?: number;
}

type NotificationItem = Omit<FloatingNotificationProps, "onClose">;

/**
 * Notification center component - manages multiple notifications
 */
export function NotificationCenter({
    maxNotifications = 3,
}: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const db = useDatabase();

    // Use ref to always access latest db
    const dbRef = useRef(db);
    dbRef.current = db;

    const userId = (() => {
        try {
            const u = JSON.parse(
                localStorage.getItem("dhikr_user_data") || "{}",
            );
            return u.id || u.userId || "default";
        } catch {
            return "default";
        }
    })();

    // Hydrate from DB on mount
    useEffect(() => {
        let cancelled = false;
        const currentDb = dbRef.current;

        if (!currentDb) return;

        (async () => {
            try {
                const rows = await currentDb.getRecentNotifications(
                    userId,
                    maxNotifications,
                    false,
                );
                if (cancelled) return;
                const mapped: NotificationItem[] = rows.map((r: any) => ({
                    id: r.id,
                    title: r.title,
                    subtitle: r.subtitle || "",
                    content: r.content || "",
                    duration: 10,
                }));
                setNotifications(mapped);
            } catch {
                // ignore
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [userId, maxNotifications]);

    // Global notification handler
    useEffect(() => {
        const handleNotification = (event: CustomEvent) => {
            const notif = event.detail as NotificationItem;
            const currentDb = dbRef.current;

            // Persist to DB (best effort)
            if (currentDb) {
                currentDb
                    .addNotification({
                        userId,
                        kind: "reminder",
                        notifType: "info",
                        title: (notif as any).title,
                        subtitle: (notif as any).subtitle,
                        content: (notif as any).content,
                    })
                    .catch(() => {});
            }

            setNotifications((prev) => {
                const updated = [notif, ...prev];
                return updated.slice(0, maxNotifications);
            });
        };

        window.addEventListener("dhikr:notify" as any, handleNotification);
        return () =>
            window.removeEventListener(
                "dhikr:notify" as any,
                handleNotification,
            );
    }, [maxNotifications, userId]);

    return (
        <div className="fixed inset-0 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((notif) => (
                    <FloatingNotification
                        key={notif.id}
                        {...notif}
                        onClose={() =>
                            (async () => {
                                setNotifications((prev) =>
                                    prev.filter((n) => n.id !== notif.id),
                                );
                                // Mark read + dismiss in DB
                                const currentDb = dbRef.current;
                                if (currentDb) {
                                    await currentDb
                                        .markNotificationRead(notif.id)
                                        .catch(() => {});
                                    await currentDb
                                        .dismissNotification(notif.id)
                                        .catch(() => {});
                                }
                            })()
                        }
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

/**
 * Trigger a notification globally
 */
export function showNotification(
    title: string,
    subtitle: string,
    content: string,
    duration?: number,
) {
    const event = new CustomEvent("dhikr:notify", {
        detail: {
            id: `notif_${Date.now()}_${Math.random()}`,
            title,
            subtitle,
            content,
            duration,
        },
    });
    window.dispatchEvent(event as any);
}
