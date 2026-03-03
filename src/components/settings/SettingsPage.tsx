import { useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { User, CheckCircle, Settings2, Wand2 } from "lucide-react";
import { loadUserData, saveUserData } from "../../lib/userData";

const FONT_SIZES = [
    { id: "small", label: "Small" },
    { id: "medium", label: "Medium" },
    { id: "large", label: "Large" },
] as const;

function SettingsCard({
    icon: Icon,
    title,
    children,
}: {
    icon: typeof User;
    title: string;
    children: ReactNode;
}) {
    return (
        <div
            className="rounded-2xl p-5 space-y-4"
            style={{
                background: "rgba(106,36,40,0.6)",
                border: "1px solid rgba(220,160,72,0.15)",
            }}
        >
            <div className="flex items-center gap-2">
                <Icon size={15} style={{ color: "#DCA048" }} />
                <span
                    style={{
                        color: "#DCA048",
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        fontWeight: 600,
                    }}
                >
                    {title}
                </span>
            </div>
            {children}
        </div>
    );
}

export function SettingsPage() {
    const initial = useMemo(() => loadUserData(), []);
    const navigate = useNavigate();
    const [saved, setSaved] = useState(false);

    // Profile
    const [name, setName] = useState(initial.name);

    // Display
    const [showTransliteration, setShowTransliteration] = useState(
        initial.showTransliteration !== false,
    );
    const [showTranslation, setShowTranslation] = useState(
        initial.showTranslation !== false,
    );
    const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
        initial.fontSize ?? "medium",
    );
    const [dhikrMode, setDhikrMode] = useState<"basic" | "custom">(
        initial.dhikrMode ?? "basic",
    );
    const [pinnedWirdId, setPinnedWirdId] = useState<string | null>(
        initial.pinnedWirdId ?? null,
    );
    const customWirds = initial.customWirds || [];

    useEffect(() => {
        try {
            const stored = JSON.parse(
                localStorage.getItem("dhikr_user_data") || "{}",
            );
            setName(stored.name || "");
        } catch {
            /* ignore */
        }
    }, []);

    const save = () => {
        saveUserData({
            name,
            showTransliteration,
            showTranslation,
            fontSize,
            dhikrMode,
            pinnedWirdId: dhikrMode === "custom" ? pinnedWirdId : null,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
    };

    return (
        <div className="min-h-full p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <h1
                            className="text-white"
                            style={{ fontWeight: 700, fontSize: "1.5rem" }}
                        >
                            Settings
                        </h1>
                        <p
                            style={{
                                color: "rgba(215,194,159,0.5)",
                                fontSize: "0.82rem",
                            }}
                        >
                            Profile and display preferences
                        </p>
                    </div>
                    <motion.div
                        animate={{
                            opacity: saved ? 1 : 0,
                            scale: saved ? 1 : 0.8,
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                        style={{
                            background: "rgba(72,177,110,0.15)",
                            border: "1px solid rgba(72,177,110,0.3)",
                        }}
                    >
                        <CheckCircle size={12} style={{ color: "#48B16E" }} />
                        <span style={{ color: "#48B16E", fontSize: "0.75rem" }}>
                            Saved
                        </span>
                    </motion.div>
                </div>
            </motion.div>

            {/* Profile */}
            <SettingsCard icon={User} title="Profile">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name…"
                    className="w-full rounded-xl px-4 py-2.5 outline-none"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(220,160,72,0.2)",
                        color: "white",
                        fontSize: "0.9rem",
                    }}
                />
            </SettingsCard>

            {/* Daily Wird */}
            <SettingsCard icon={Wand2} title="My Daily Wird">
                <p
                    style={{
                        color: "#D7C29F",
                        fontSize: "0.82rem",
                        lineHeight: 1.6,
                    }}
                >
                    Build your personal litany from our library of classical
                    books — Hisn al-Muslim, Wird al-Latif, Ratib al-Haddad,
                    Dala'il al-Khayrat, and Al-Adhkar.
                </p>
                <div
                    className="flex rounded-xl p-1"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                >
                    {(["basic", "custom"] as const).map((mode) => {
                        const active = dhikrMode === mode;
                        return (
                            <button
                                key={mode}
                                onClick={() => {
                                    setDhikrMode(mode);
                                    if (
                                        mode === "custom" &&
                                        !pinnedWirdId &&
                                        customWirds[0]
                                    ) {
                                        setPinnedWirdId(customWirds[0].id);
                                    }
                                }}
                                className="flex-1 py-2 rounded-lg"
                                style={{
                                    background: active
                                        ? "linear-gradient(135deg,#DCA048,#CF9555)"
                                        : "transparent",
                                    color: active
                                        ? "white"
                                        : "rgba(215,194,159,0.55)",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                }}
                            >
                                {mode === "basic" ? "Basic Adhkar" : "Wird"}
                            </button>
                        );
                    })}
                </div>

                {dhikrMode === "custom" && (
                    <div className="space-y-2">
                        <p
                            style={{
                                color: "rgba(215,194,159,0.65)",
                                fontSize: "0.76rem",
                            }}
                        >
                            Pinned Wird (used for daily progress/goals)
                        </p>
                        {customWirds.length === 0 ? (
                            <p
                                style={{
                                    color: "#D7C29F",
                                    fontSize: "0.78rem",
                                }}
                            >
                                No wirds yet. Create one below.
                            </p>
                        ) : (
                            <select
                                value={pinnedWirdId ?? ""}
                                onChange={(e) =>
                                    setPinnedWirdId(e.target.value || null)
                                }
                                className="w-full rounded-xl px-3 py-2"
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    color: "white",
                                }}
                            >
                                <option value="">Select wird</option>
                                {customWirds.map((wird) => (
                                    <option key={wird.id} value={wird.id}>
                                        {wird.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/wird")}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white"
                    style={{
                        background: "linear-gradient(135deg,#DCA048,#CF9555)",
                        fontSize: "0.88rem",
                    }}
                >
                    <Wand2 size={14} /> Open Wird Builder
                </motion.button>
            </SettingsCard>

            {/* Display */}
            <SettingsCard icon={Settings2} title="Display">
                {/* Transliteration */}
                <label
                    className="flex items-center justify-between rounded-xl px-3 py-2.5"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <div>
                        <p style={{ color: "white", fontSize: "0.88rem" }}>
                            Show Transliteration
                        </p>
                        <p style={{ color: "#D7C29F", fontSize: "0.72rem" }}>
                            Romanised pronunciation guide
                        </p>
                    </div>
                    <input
                        type="checkbox"
                        checked={showTransliteration}
                        onChange={(e) =>
                            setShowTransliteration(e.target.checked)
                        }
                    />
                </label>

                {/* Translation */}
                <label
                    className="flex items-center justify-between rounded-xl px-3 py-2.5"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <div>
                        <p style={{ color: "white", fontSize: "0.88rem" }}>
                            Show Translation
                        </p>
                        <p style={{ color: "#D7C29F", fontSize: "0.72rem" }}>
                            English meaning
                        </p>
                    </div>
                    <input
                        type="checkbox"
                        checked={showTranslation}
                        onChange={(e) => setShowTranslation(e.target.checked)}
                    />
                </label>

                {/* Font size */}
                <div>
                    <p
                        style={{
                            color: "rgba(215,194,159,0.6)",
                            fontSize: "0.78rem",
                            marginBottom: 8,
                        }}
                    >
                        Arabic Font Size
                    </p>
                    <div className="flex gap-2">
                        {FONT_SIZES.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setFontSize(id)}
                                className="px-4 py-2 rounded-xl flex-1"
                                style={{
                                    background:
                                        fontSize === id
                                            ? "rgba(220,160,72,0.22)"
                                            : "rgba(255,255,255,0.05)",
                                    border: `1px solid ${fontSize === id ? "rgba(220,160,72,0.5)" : "rgba(255,255,255,0.1)"}`,
                                    color: "white",
                                    fontSize: "0.82rem",
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </SettingsCard>

            {/* Save */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={save}
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{
                    background: "linear-gradient(135deg,#DCA048,#CF9555)",
                    fontSize: "0.9rem",
                }}
            >
                Save Changes
            </motion.button>
        </div>
    );
}
