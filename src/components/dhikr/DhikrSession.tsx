import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    CheckCircle,
    Star,
    Info,
    Sun,
    Moon,
    BookOpen,
    Sparkles,
    Wand2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dhikr, DhikrCategory } from "../../data/dhikr";
import { useDatabase } from "../../lib/useDatabase";
import { getDhikrSessionForDate } from "../../lib/dhikrSession";
import {
    getActiveLitaniesForUser,
    getSessionItems,
    loadUserData,
    saveUserData,
} from "../../lib/userData";

const CATEGORY_META: Record<
    DhikrCategory,
    { label: string; Icon: typeof Sun }
> = {
    morning: { label: "Morning", Icon: Sun },
    evening: { label: "Evening", Icon: Moon },
    "after-prayer": { label: "After Prayer", Icon: BookOpen },
    general: { label: "General", Icon: Sparkles },
};

type SessionCategory = {
    id: DhikrCategory;
    label: string;
    Icon: typeof Sun;
    dhikr: Dhikr[];
};

const FONT_SIZE_MAP = { small: "1.3rem", medium: "1.6rem", large: "2rem" };

function PulsingOrb({ intensity = 1 }: { intensity?: number }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <motion.div
                className="absolute inset-0 rounded-3xl"
                animate={{
                    background: [
                        "radial-gradient(ellipse at 50% 100%, rgba(220,160,72,0.06) 0%, transparent 70%)",
                        `radial-gradient(ellipse at 50% 100%, rgba(220,160,72,${0.06 + intensity * 0.1}) 0%, transparent 70%)`,
                        "radial-gradient(ellipse at 50% 100%, rgba(220,160,72,0.06) 0%, transparent 70%)",
                    ],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}

function CounterButton({
    count,
    target,
    onTap,
    complete,
}: {
    count: number;
    target: number;
    onTap: () => void;
    complete: boolean;
}) {
    const pct = target > 0 ? Math.min(count / target, 1) : 1;
    const r = 68;
    const circ = 2 * Math.PI * r;

    return (
        <motion.button
            onClick={onTap}
            disabled={complete}
            whileTap={{ scale: 0.93 }}
            className="relative flex items-center justify-center mx-auto"
            style={{ width: 160, height: 160 }}
        >
            {/* Ring */}
            <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 160 160"
            >
                <circle
                    cx="80"
                    cy="80"
                    r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="6"
                />
                <motion.circle
                    cx="80"
                    cy="80"
                    r={r}
                    fill="none"
                    stroke={complete ? "#48B16E" : "url(#btnGrad)"}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    animate={{ strokeDashoffset: circ * (1 - pct) }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                />
                <defs>
                    <linearGradient
                        id="btnGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="#DCA048" />
                        <stop offset="100%" stopColor="#CF9555" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Center circle */}
            <motion.div
                className="relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center"
                style={{
                    background: complete
                        ? "linear-gradient(135deg, rgba(72,177,110,0.3), rgba(72,177,110,0.1))"
                        : "linear-gradient(135deg, rgba(106,36,40,0.8), rgba(74,21,24,0.9))",
                    border: `2px solid ${complete ? "rgba(72,177,110,0.6)" : "rgba(220,160,72,0.3)"}`,
                    boxShadow: complete
                        ? "0 0 40px rgba(72,177,110,0.3)"
                        : "0 0 40px rgba(220,160,72,0.2)",
                }}
                animate={
                    complete
                        ? {}
                        : {
                              boxShadow: [
                                  "0 0 20px rgba(220,160,72,0.15)",
                                  "0 0 40px rgba(220,160,72,0.3)",
                                  "0 0 20px rgba(220,160,72,0.15)",
                              ],
                          }
                }
                transition={{ duration: 2, repeat: Infinity }}
            >
                {complete ? (
                    <CheckCircle size={36} style={{ color: "#48B16E" }} />
                ) : (
                    <>
                        <motion.span
                            key={count}
                            initial={{ scale: 1.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                color: "white",
                                fontWeight: 700,
                                fontSize: "2rem",
                                lineHeight: 1,
                            }}
                        >
                            {count}
                        </motion.span>
                        <span style={{ color: "#DCA048", fontSize: "0.7rem" }}>
                            / {target}
                        </span>
                    </>
                )}
            </motion.div>
        </motion.button>
    );
}

function InfoPanel({ dhikr, onClose }: { dhikr: Dhikr; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="rounded-2xl p-5 space-y-3"
            style={{
                background: "rgba(106,36,40,0.7)",
                border: "1px solid rgba(220,160,72,0.2)",
                backdropFilter: "blur(12px)",
            }}
        >
            <div className="flex items-center justify-between">
                <span
                    style={{
                        color: "#DCA048",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                    }}
                >
                    Source
                </span>
                <button
                    onClick={onClose}
                    style={{ color: "#D7C29F", fontSize: "0.8rem" }}
                >
                    Close
                </button>
            </div>
            <p style={{ color: "white", fontSize: "0.9rem", fontWeight: 500 }}>
                {dhikr.source}
            </p>
            {dhikr.benefit && (
                <div
                    className="rounded-xl p-3"
                    style={{
                        background: "rgba(220,160,72,0.08)",
                        border: "1px solid rgba(220,160,72,0.15)",
                    }}
                >
                    <p
                        style={{
                            color: "#D7C29F",
                            fontSize: "0.82rem",
                            lineHeight: 1.6,
                        }}
                    >
                        {dhikr.benefit}
                    </p>
                </div>
            )}
        </motion.div>
    );
}

export function DhikrSession() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [direction, setDirection] = useState(1);
    const [showInfo, setShowInfo] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState<string>("all");
    const [selectedDay, setSelectedDay] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
    const [userDataRefreshKey, setUserDataRefreshKey] = useState(0);
    // mode: basic = built-in adhkar, custom = user's wird
    const [dhikrMode, setDhikrMode] = useState<"basic" | "custom">(
        () => loadUserData().dhikrMode ?? "basic",
    );

    const db = useDatabase();
    const dbRef = useRef(db);
    dbRef.current = db;

    // Re-load userData whenever mode changes so categories update
    const userData = useMemo(() => {
        const d = loadUserData();
        return { ...d, dhikrMode };
    }, [dhikrMode, userDataRefreshKey]);

    const persistMode = (mode: "basic" | "custom") => {
        const fallbackWirdId =
            mode === "custom"
                ? userData.pinnedWirdId || userData.customWirds[0]?.id || null
                : null;
        setDhikrMode(mode);
        saveUserData({
            dhikrMode: mode,
            pinnedWirdId: fallbackWirdId,
        });
        setUserDataRefreshKey((v) => v + 1);
        setCurrentIndex(0);
        setActiveSectionId("all");
    };

    const persistPinnedWird = (wirdId: string | null) => {
        saveUserData({
            dhikrMode: "custom",
            pinnedWirdId: wirdId,
        });
        setDhikrMode("custom");
        setUserDataRefreshKey((v) => v + 1);
        setCurrentIndex(0);
        setActiveSectionId("all");
    };
    const fontSize =
        FONT_SIZE_MAP[userData.fontSize as keyof typeof FONT_SIZE_MAP] ??
        "1.6rem";
    const showTranslit = userData.showTransliteration !== false;
    const showTranslation = userData.showTranslation !== false;

    // In basic mode, section filtering isn't shown — keep activeLitanies for custom mode section chips
    const activeLitanies = useMemo(
        () =>
            dhikrMode === "custom" ? getActiveLitaniesForUser(userData) : [],
        [userData, dhikrMode],
    );
    const itemMetaById = useMemo(() => {
        const map: Record<string, { sectionId: string; sectionTitle: string }> =
            {};
        for (const litany of activeLitanies) {
            const sectionId = litany.sectionId || litany.id;
            const sectionTitle = litany.sectionTitle || litany.title;
            for (const item of litany.items) {
                map[item.id] = { sectionId, sectionTitle };
            }
        }
        return map;
    }, [activeLitanies]);
    const categories = useMemo<SessionCategory[]>(() => {
        const ordered: DhikrCategory[] = [
            "morning",
            "evening",
            "after-prayer",
            "general",
        ];
        // Use getSessionItems so custom wirds are respected per category
        const built = ordered
            .map((id) => ({
                id,
                label: CATEGORY_META[id].label,
                Icon: CATEGORY_META[id].Icon,
                dhikr: getSessionItems(userData, id),
            }))
            .filter((cat) => cat.dhikr.length > 0);

        if (built.length === 0) {
            return [
                {
                    id: "morning" as DhikrCategory,
                    label: "Morning",
                    Icon: Sun,
                    dhikr: [],
                },
            ];
        }

        return built;
    }, [userData]);

    useEffect(() => {
        if (activeCategory >= categories.length) {
            setActiveCategory(0);
            setCurrentIndex(0);
            setShowInfo(false);
        }
    }, [activeCategory, categories.length]);

    const category = categories[activeCategory] ?? categories[0];
    const sectionOptions = useMemo(
        () =>
            activeLitanies
                .filter((litany) => litany.category === category.id)
                .map((litany) => ({
                    id: litany.sectionId || litany.id,
                    title: litany.sectionTitle || litany.title,
                })),
        [activeLitanies, category.id],
    );
    const dhikrList = useMemo(() => {
        if (activeSectionId === "all") {
            return category.dhikr;
        }
        return category.dhikr.filter(
            (item) => itemMetaById[item.id]?.sectionId === activeSectionId,
        );
    }, [category.dhikr, itemMetaById, activeSectionId]);
    const current = dhikrList[currentIndex];
    const currentCount = counts[current?.id] ?? 0;
    const isComplete = currentCount >= current?.targetCount;
    const userId: string = userData.id || userData.userId || "default";
    const uiKey = (() => {
        return `dhikr_session_ui_${userId}_${userData.traditionId}_${selectedDay}`;
    })();

    useEffect(() => {
        if (activeSectionId === "all") return;
        const exists = sectionOptions.some((s) => s.id === activeSectionId);
        if (!exists) {
            setActiveSectionId("all");
            setCurrentIndex(0);
            setShowInfo(false);
        }
    }, [activeSectionId, sectionOptions]);

    useEffect(() => {
        setCurrentIndex(0);
        setShowInfo(false);
    }, [activeSectionId]);

    const tap = useCallback(() => {
        if (!current || isComplete) return;

        // Always update the UI immediately
        setCounts((prev) => {
            const next = (prev[current.id] ?? 0) + 1;

            // Persist to DB as best-effort (don't block UI). Methods will init DB internally.
            const currentDb = dbRef.current;
            if (currentDb) {
                currentDb
                    .incrementDailyAdhkar(
                        userId,
                        selectedDay,
                        current.id,
                        current.targetCount,
                        1,
                    )
                    .catch((e) =>
                        console.error("incrementDailyAdhkar failed", e),
                    );
                currentDb
                    .addNotification({
                        userId,
                        kind: "activity",
                        notifType: "info",
                        title: "Dhikr progress updated",
                        subtitle: `${selectedDay} • ${category.label}: ${current.id} (${next}/${current.targetCount})`,
                        content: current.translation,
                        relatedId: current.id,
                    })
                    .catch(() => {});
            }
            return { ...prev, [current.id]: next };
        });
    }, [current, isComplete, selectedDay, userId, category.label]);

    // Auto-select category based on local timezone/time (only for "today")
    useEffect(() => {
        // Prefer persisted UI state for today (allows tab switch + return)
        let shouldRestore = false;
        try {
            const raw = localStorage.getItem(uiKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed.activeCategory === "number") {
                    setActiveCategory(parsed.activeCategory);
                    shouldRestore = true;
                }
                if (typeof parsed.currentIndex === "number") {
                    setCurrentIndex(parsed.currentIndex);
                    shouldRestore = true;
                }
            }
        } catch {
            // ignore
        }

        // If already restored from localStorage or viewing a past day, skip auto-select
        if (shouldRestore) return;

        const now = new Date();
        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        // Only auto-select category if viewing today
        if (selectedDay === todayKey) {
            const session = getDhikrSessionForDate(now);
            const idx = categories.findIndex((c) => c.id === session);
            if (idx >= 0) {
                setActiveCategory(idx);
                setCurrentIndex(0);
                setShowInfo(false);
            }
        }
    }, [uiKey, selectedDay, categories]);

    // Persist UI state whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(
                uiKey,
                JSON.stringify({ activeCategory, currentIndex }),
            );
        } catch {
            // ignore
        }
    }, [uiKey, activeCategory, currentIndex]);

    // Restore DAILY progress for selected day
    useEffect(() => {
        let cancelled = false;
        const currentDb = dbRef.current;

        if (!currentDb) {
            return;
        }

        (async () => {
            try {
                const rows = await currentDb.getDailyAdhkarProgress(
                    userId,
                    selectedDay,
                );
                if (cancelled) return;
                const restored: Record<string, number> = {};
                for (const r of rows) {
                    const id = (r as any).adhkarId ?? (r as any).adhkar_id;
                    const cnt = (r as any).count ?? 0;
                    if (id) restored[id] = cnt;
                }
                setCounts(restored);
            } catch (e) {
                console.error("getDailyAdhkarProgress failed", e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [userId, selectedDay]);

    // Refresh progress when returning to the app/tab
    useEffect(() => {
        let cancelled = false;

        const refresh = async () => {
            const currentDb = dbRef.current;
            if (!currentDb) return;

            try {
                const rows = await currentDb.getDailyAdhkarProgress(
                    userId,
                    selectedDay,
                );
                if (cancelled) return;
                const restored: Record<string, number> = {};
                for (const r of rows) {
                    const id = (r as any).adhkarId ?? (r as any).adhkar_id;
                    const cnt = (r as any).count ?? 0;
                    if (id) restored[id] = cnt;
                }
                setCounts(restored);
            } catch (e) {
                console.error("refresh getDailyAdhkarProgress failed", e);
            }
        };

        const onVis = () => {
            if (document.visibilityState === "visible") {
                refresh();
            }
        };

        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", onVis);

        return () => {
            cancelled = true;
            window.removeEventListener("focus", refresh);
            document.removeEventListener("visibilitychange", onVis);
        };
    }, [userId, selectedDay]);

    // Keyboard shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                tap();
            }
            if (e.code === "ArrowRight") goNext();
            if (e.code === "ArrowLeft") goPrev();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [tap]);

    const goNext = () => {
        if (currentIndex < dhikrList.length - 1) {
            setDirection(1);
            setCurrentIndex((i) => i + 1);
            setShowInfo(false);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex((i) => i - 1);
            setShowInfo(false);
        }
    };

    const resetCurrent = () => {
        if (!current) return;
        const currentDb = dbRef.current;
        setCounts((prev) => ({ ...prev, [current.id]: 0 }));
        if (currentDb && currentDb.isInitialized) {
            currentDb
                .setDailyAdhkarCount(
                    userId,
                    selectedDay,
                    current.id,
                    current.targetCount,
                    0,
                )
                .catch((e) => {
                    if (!(e as any)?.message?.includes("Tauri not ready")) {
                        console.error("setDailyAdhkarCount failed", e);
                    }
                });
        }
    };

    const allDone =
        dhikrList.length > 0 &&
        dhikrList.every((d) => (counts[d.id] ?? 0) >= d.targetCount);

    return (
        <div className="min-h-full flex flex-col p-4 md:p-6 max-w-2xl mx-auto">
            {/* Header + mode toggle */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6"
            >
                <h1
                    className="text-white mb-4"
                    style={{ fontWeight: 700, fontSize: "1.5rem" }}
                >
                    Dhikr Session
                </h1>

                {/* ── Basic / My Wird toggle ── */}
                <div
                    className="flex rounded-2xl p-1 mb-5"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.09)",
                    }}
                >
                    {(["basic", "custom"] as const).map((mode) => {
                        const active = dhikrMode === mode;
                        return (
                            <motion.button
                                key={mode}
                                onClick={() => persistMode(mode)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold"
                                style={{
                                    background: active
                                        ? "linear-gradient(135deg,#DCA048,#CF9555)"
                                        : "transparent",
                                    color: active
                                        ? "white"
                                        : "rgba(215,194,159,0.55)",
                                    fontSize: "0.88rem",
                                    border: "none",
                                }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {mode === "basic" ? (
                                    <BookOpen size={14} />
                                ) : (
                                    <Wand2 size={14} />
                                )}
                                {mode === "basic" ? "Basic Adhkar" : "Wird"}
                            </motion.button>
                        );
                    })}
                </div>

                {/* ── My Wird sub-picker ── */}
                <AnimatePresence>
                    {dhikrMode === "custom" && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            {userData.customWirds.length === 0 ? (
                                <button
                                    onClick={() => navigate("/wird")}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
                                    style={{
                                        background: "rgba(220,160,72,0.1)",
                                        border: "1px dashed rgba(220,160,72,0.4)",
                                        color: "#DCA048",
                                        fontSize: "0.84rem",
                                    }}
                                >
                                    <Wand2 size={14} /> Create your first wird
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <select
                                        value={userData.pinnedWirdId || ""}
                                        onChange={(e) =>
                                            persistPinnedWird(
                                                e.target.value || null,
                                            )
                                        }
                                        className="w-full rounded-xl px-3 py-2"
                                        style={{
                                            background:
                                                "rgba(255,255,255,0.06)",
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            color: "white",
                                            fontSize: "0.82rem",
                                        }}
                                    >
                                        {userData.customWirds.map((wird) => (
                                            <option
                                                key={wird.id}
                                                value={wird.id}
                                            >
                                                {wird.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => navigate("/wird")}
                                        className="px-3 py-1.5 rounded-xl"
                                        style={{
                                            background:
                                                "rgba(255,255,255,0.04)",
                                            border: "1px dashed rgba(220,160,72,0.3)",
                                            color: "#DCA048",
                                            fontSize: "0.78rem",
                                        }}
                                    >
                                        + Manage Wirds
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Calendar day selector */}
                <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                        <p
                            style={{
                                color: "rgba(215,194,159,0.6)",
                                fontSize: "0.75rem",
                            }}
                        >
                            Selected day
                        </p>
                        <input
                            type="date"
                            value={selectedDay}
                            max={(() => {
                                const d = new Date();
                                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                            })()}
                            onChange={(e) => {
                                setSelectedDay(e.target.value);
                                setCurrentIndex(0);
                                setShowInfo(false);
                            }}
                            className="px-3 py-2 rounded-xl"
                            style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                color: "white",
                            }}
                        />
                    </div>
                    <button
                        onClick={() => {
                            const d = new Date();
                            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                            setSelectedDay(today);
                            setCurrentIndex(0);
                            setShowInfo(false);
                        }}
                        className="px-4 py-2 rounded-xl"
                        style={{
                            background: "rgba(220,160,72,0.15)",
                            border: "1px solid rgba(220,160,72,0.35)",
                            color: "white",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                        }}
                    >
                        Today
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap pb-1">
                    {categories.map((cat, i) => {
                        const done = cat.dhikr.every(
                            (d) => (counts[d.id] ?? 0) >= d.targetCount,
                        );
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(i);
                                    setCurrentIndex(0);
                                    setShowInfo(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all"
                                style={{
                                    background:
                                        activeCategory === i
                                            ? "rgba(220,160,72,0.2)"
                                            : "rgba(255,255,255,0.05)",
                                    border: `1px solid ${activeCategory === i ? "rgba(220,160,72,0.5)" : "rgba(255,255,255,0.08)"}`,
                                    color:
                                        activeCategory === i
                                            ? "white"
                                            : "rgba(215,194,159,0.5)",
                                    fontSize: "0.8rem",
                                }}
                            >
                                <cat.Icon
                                    size={14}
                                    style={{
                                        color:
                                            activeCategory === i
                                                ? "#DCA048"
                                                : "rgba(215,194,159,0.5)",
                                    }}
                                />
                                {cat.label}
                                {done && (
                                    <CheckCircle
                                        size={12}
                                        style={{ color: "#48B16E" }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {dhikrMode === "custom" && sectionOptions.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap pb-1">
                        <button
                            onClick={() => setActiveSectionId("all")}
                            className="px-3 py-1.5 rounded-lg whitespace-nowrap"
                            style={{
                                background:
                                    activeSectionId === "all"
                                        ? "rgba(220,160,72,0.2)"
                                        : "rgba(255,255,255,0.05)",
                                border: `1px solid ${activeSectionId === "all" ? "rgba(220,160,72,0.5)" : "rgba(255,255,255,0.08)"}`,
                                color: "white",
                                fontSize: "0.75rem",
                            }}
                        >
                            All Sections
                        </button>
                        {sectionOptions.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSectionId(section.id)}
                                className="px-3 py-1.5 rounded-lg whitespace-nowrap"
                                style={{
                                    background:
                                        activeSectionId === section.id
                                            ? "rgba(220,160,72,0.2)"
                                            : "rgba(255,255,255,0.05)",
                                    border: `1px solid ${activeSectionId === section.id ? "rgba(220,160,72,0.5)" : "rgba(255,255,255,0.08)"}`,
                                    color: "white",
                                    fontSize: "0.75rem",
                                }}
                            >
                                {section.title}
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* All done celebration */}
            <AnimatePresence>
                {allDone && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="rounded-2xl p-6 text-center mb-6"
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(72,177,110,0.2), rgba(106,36,40,0.6))",
                            border: "1px solid rgba(72,177,110,0.4)",
                        }}
                    >
                        <CheckCircle
                            size={40}
                            style={{ color: "#48B16E", margin: "0 auto 12px" }}
                        />
                        <p
                            className="text-white"
                            style={{ fontWeight: 700, fontSize: "1.1rem" }}
                        >
                            Alhamdulillah! Session Complete
                        </p>
                        <p
                            style={{
                                color: "#D7C29F",
                                fontSize: "0.85rem",
                                marginTop: 4,
                            }}
                        >
                            May Allah accept your dhikr
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mb-6">
                {dhikrList.map((d, i) => {
                    const done = (counts[d.id] ?? 0) >= d.targetCount;
                    return (
                        <button key={d.id} onClick={() => setCurrentIndex(i)}>
                            <motion.div
                                className="rounded-full"
                                animate={{
                                    width: i === currentIndex ? 24 : 8,
                                    background: done
                                        ? "#48B16E"
                                        : i === currentIndex
                                          ? "#DCA048"
                                          : "rgba(255,255,255,0.2)",
                                }}
                                style={{ height: 8 }}
                                transition={{ duration: 0.3 }}
                            />
                        </button>
                    );
                })}
            </div>

            {/* Main dhikr card */}
            {dhikrList.length === 0 && (
                <div
                    className="rounded-2xl p-6 text-center"
                    style={{
                        background: "rgba(106,36,40,0.55)",
                        border: "1px solid rgba(220,160,72,0.2)",
                    }}
                >
                    <p style={{ color: "white", fontWeight: 600 }}>
                        No active litanies for this category.
                    </p>
                    <p
                        style={{
                            color: "#D7C29F",
                            fontSize: "0.82rem",
                            marginTop: 6,
                        }}
                    >
                        Enable modules in Settings or change your daily goal.
                    </p>
                </div>
            )}
            {current && (
                <div className="flex-1 flex flex-col gap-4">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={current.id}
                            custom={direction}
                            initial={{
                                x: direction > 0 ? 80 : -80,
                                opacity: 0,
                            }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="relative rounded-3xl overflow-hidden p-6 space-y-5"
                            style={{
                                background: "rgba(106,36,40,0.55)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(220,160,72,0.2)",
                                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                                minHeight: 260,
                            }}
                        >
                            <PulsingOrb
                                intensity={
                                    currentCount /
                                    Math.max(current.targetCount, 1)
                                }
                            />

                            {/* Category label */}
                            <div className="flex items-center justify-between">
                                <span
                                    style={{
                                        color: "#DCA048",
                                        fontSize: "0.7rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.15em",
                                    }}
                                >
                                    {category.label} Adhkar · {currentIndex + 1}
                                    /{dhikrList.length}
                                </span>
                                <span
                                    style={{
                                        color: "rgba(215,194,159,0.6)",
                                        fontSize: "0.68rem",
                                    }}
                                >
                                    {itemMetaById[current.id]?.sectionTitle ||
                                        "Section"}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowInfo((v) => !v)}
                                        className="opacity-60 hover:opacity-100"
                                    >
                                        <Info
                                            size={15}
                                            style={{ color: "#DCA048" }}
                                        />
                                    </button>
                                    <button
                                        onClick={resetCurrent}
                                        className="opacity-60 hover:opacity-100"
                                    >
                                        <RotateCcw
                                            size={15}
                                            style={{ color: "#DCA048" }}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Arabic text */}
                            <p
                                dir="rtl"
                                className="text-white text-right leading-loose"
                                style={{
                                    fontFamily:
                                        "Noto Naskh Arabic, Amiri, serif",
                                    fontSize,
                                }}
                            >
                                {current.arabic}
                            </p>

                            {showTranslit && (
                                <p
                                    style={{
                                        color: "#CF9555",
                                        fontSize: "0.9rem",
                                        lineHeight: 1.7,
                                    }}
                                >
                                    {current.transliteration}
                                </p>
                            )}

                            {showTranslation && (
                                <p
                                    style={{
                                        color: "#D7C29F",
                                        fontSize: "0.82rem",
                                        lineHeight: 1.7,
                                        fontStyle: "italic",
                                    }}
                                >
                                    "{current.translation}"
                                </p>
                            )}

                            <p
                                style={{
                                    color: "rgba(215,194,159,0.4)",
                                    fontSize: "0.7rem",
                                }}
                            >
                                {current.source}
                            </p>

                            {/* Arabic decoration */}
                            <div
                                className="absolute right-3 bottom-3 opacity-[0.06] pointer-events-none select-none"
                                style={{
                                    fontFamily: "Amiri, serif",
                                    fontSize: "8rem",
                                    color: "#CF9555",
                                    lineHeight: 1,
                                }}
                                dir="rtl"
                            >
                                ذ
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Info panel */}
                    <AnimatePresence>
                        {showInfo && (
                            <InfoPanel
                                dhikr={current}
                                onClose={() => setShowInfo(false)}
                            />
                        )}
                    </AnimatePresence>

                    {/* Counter */}
                    <div className="space-y-4">
                        <CounterButton
                            count={currentCount}
                            target={current.targetCount}
                            onTap={tap}
                            complete={isComplete}
                        />

                        <p
                            className="text-center"
                            style={{
                                color: "rgba(215,194,159,0.4)",
                                fontSize: "0.72rem",
                            }}
                        >
                            {isComplete
                                ? "SubhanAllah! Tap next to continue"
                                : "Tap or press Space to count"}
                        </p>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={goPrev}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all disabled:opacity-30"
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    color: "#D7C29F",
                                    fontSize: "0.85rem",
                                }}
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>

                            <div className="flex items-center gap-2">
                                {isComplete && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <Star
                                            size={16}
                                            style={{ color: "#DCA048" }}
                                        />
                                    </motion.div>
                                )}
                                <span
                                    style={{
                                        color: "rgba(215,194,159,0.5)",
                                        fontSize: "0.78rem",
                                    }}
                                >
                                    {currentCount}/{current.targetCount}
                                </span>
                            </div>

                            <button
                                onClick={goNext}
                                disabled={currentIndex === dhikrList.length - 1}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all disabled:opacity-30"
                                style={{
                                    background: isComplete
                                        ? "linear-gradient(135deg, #DCA048, #CF9555)"
                                        : "rgba(255,255,255,0.05)",
                                    border: isComplete
                                        ? "none"
                                        : "1px solid rgba(255,255,255,0.08)",
                                    color: isComplete ? "white" : "#D7C29F",
                                    fontSize: "0.85rem",
                                }}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Keyboard hint */}
                    <p
                        className="text-center hidden md:block"
                        style={{
                            color: "rgba(215,194,159,0.3)",
                            fontSize: "0.68rem",
                        }}
                    >
                        Space to count · ← → to navigate
                    </p>
                </div>
            )}
        </div>
    );
}
