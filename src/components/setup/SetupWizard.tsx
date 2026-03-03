import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { invoke } from "@tauri-apps/api/core";
import { ChevronLeft, ChevronRight, CheckCircle, Clock } from "lucide-react";
import { BackgroundEffects } from "../shared/BackgroundEffects";
import { GoalTier, getTraditionById } from "../../data/traditions";
import { loadUserData, saveUserData } from "../../lib/userData";

interface SetupWizardProps {
    onComplete: () => void;
}

const GOAL_OPTIONS: { id: GoalTier; label: string; subtitle: string }[] = [
    {
        id: "essential",
        label: "5 mins - Essential",
        subtitle: "Core litanies only",
    },
    {
        id: "standard",
        label: "15 mins - Standard",
        subtitle: "Balanced daily cycle",
    },
    {
        id: "complete",
        label: "30+ mins - Complete",
        subtitle: "Full litany coverage",
    },
];

const STEP_TITLES = ["Welcome", "Daily Goal Setting", "Notification Sync"];

export function SetupWizard({ onComplete }: SetupWizardProps) {
    const initialData = useMemo(() => loadUserData(), []);
    const [step, setStep] = useState(0);
    const [name, setName] = useState(initialData.name || "");
    const traditionId = "global_hisn";
    const [goalTier, setGoalTier] = useState<GoalTier>(initialData.goalTier);
    const [windows, setWindows] = useState(initialData.reminderWindows);

    const tradition = getTraditionById(traditionId);

    const completeSetup = async () => {
        saveUserData({
            name,
            traditionId,
            goalTier,
            reminderWindows: windows,
        });
        localStorage.setItem("dhikr_setup_complete", "true");
        // Mark setup complete in Tauri store so Rust knows not to show setup on next launch
        try {
            await invoke("mark_setup_complete");
        } catch (err) {
            console.warn("Failed to mark setup complete in Tauri:", err);
        }
        onComplete();
    };

    return (
        <div
            className="fixed inset-0 overflow-hidden"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px" }}
        >
            <BackgroundEffects />

            <div className="relative z-10 h-full flex flex-col max-w-3xl mx-auto p-3 md:p-4 overflow-y-auto">
                <div className="mb-4">
                    <p
                        style={{
                            color: "#DCA048",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                        }}
                    >
                        Setup {step + 1} / 3
                    </p>
                    <h1
                        className="text-white"
                        style={{ fontWeight: 700, fontSize: "1.3rem" }}
                    >
                        {STEP_TITLES[step]}
                    </h1>
                    <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                            className="h-full"
                            style={{
                                background:
                                    "linear-gradient(90deg, #DCA048, #CF9555)",
                            }}
                            animate={{ width: `${((step + 1) / 3) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                <div
                    className="flex-1 rounded-3xl p-3 md:p-4 space-y-4"
                    style={{
                        background: "rgba(106,36,40,0.52)",
                        border: "1px solid rgba(220,160,72,0.22)",
                        backdropFilter: "blur(16px)",
                    }}
                >
                    {step === 0 && (
                        <>
                            <p
                                style={{
                                    color: "#D7C29F",
                                    fontSize: "0.8rem",
                                }}
                            >
                                Start with Basic Adhkar. You can build and
                                activate your own custom wird any time.
                            </p>

                            <div className="space-y-2">
                                <label
                                    style={{
                                        color: "#DCA048",
                                        fontSize: "0.78rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                    }}
                                >
                                    Your Name (optional)
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="How should we greet you?"
                                    className="w-full rounded-xl px-4 py-3"
                                    style={{
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(220,160,72,0.18)",
                                        color: "white",
                                    }}
                                />
                            </div>

                            <div
                                className="rounded-2xl p-4"
                                style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                }}
                            >
                                <p style={{ color: "white", fontWeight: 600 }}>
                                    Basic Adhkar Mode
                                </p>
                                <p
                                    style={{
                                        color: "#D7C29F",
                                        fontSize: "0.82rem",
                                        marginTop: 4,
                                    }}
                                >
                                    Built-in curated morning, evening,
                                    post-prayer, and general adhkar.
                                </p>
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <p
                                style={{
                                    color: "#D7C29F",
                                    fontSize: "0.92rem",
                                }}
                            >
                                Pick a daily availability mode. This controls
                                how much dhikr appears in your daily baseline.
                            </p>

                            <div className="space-y-3">
                                {GOAL_OPTIONS.map((goal) => {
                                    const selected = goal.id === goalTier;
                                    return (
                                        <button
                                            key={goal.id}
                                            type="button"
                                            onClick={() => setGoalTier(goal.id)}
                                            className="w-full rounded-2xl p-4 text-left"
                                            style={{
                                                background: selected
                                                    ? "rgba(220,160,72,0.2)"
                                                    : "rgba(255,255,255,0.04)",
                                                border: `1px solid ${selected ? "rgba(220,160,72,0.55)" : "rgba(255,255,255,0.08)"}`,
                                            }}
                                        >
                                            <p
                                                style={{
                                                    color: "white",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {goal.label}
                                            </p>
                                            <p
                                                style={{
                                                    color: "#D7C29F",
                                                    fontSize: "0.82rem",
                                                    marginTop: 3,
                                                }}
                                            >
                                                {goal.subtitle}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <p
                                style={{
                                    color: "#D7C29F",
                                    fontSize: "0.92rem",
                                }}
                            >
                                These default windows follow the selected
                                tradition ({tradition.cardLabel}). Adjust to
                                your local routine.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {(
                                    [
                                        ["morning", "Morning Window"],
                                        ["evening", "Evening Window"],
                                        ["night", "Night Window"],
                                    ] as const
                                ).map(([key, label]) => (
                                    <div
                                        key={key}
                                        className="rounded-2xl p-4"
                                        style={{
                                            background:
                                                "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock
                                                size={14}
                                                style={{ color: "#DCA048" }}
                                            />
                                            <p
                                                style={{
                                                    color: "#DCA048",
                                                    fontSize: "0.75rem",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.08em",
                                                }}
                                            >
                                                {label}
                                            </p>
                                        </div>
                                        <input
                                            type="time"
                                            value={windows[key]}
                                            onChange={(e) =>
                                                setWindows((prev) => ({
                                                    ...prev,
                                                    [key]: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-lg px-3 py-2"
                                            style={{
                                                background:
                                                    "rgba(255,255,255,0.08)",
                                                border: "1px solid rgba(220,160,72,0.18)",
                                                color: "white",
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div
                                className="rounded-2xl p-4"
                                style={{
                                    background: "rgba(72,177,110,0.13)",
                                    border: "1px solid rgba(72,177,110,0.28)",
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle
                                        size={14}
                                        style={{ color: "#48B16E" }}
                                    />
                                    <p
                                        style={{
                                            color: "#48B16E",
                                            fontWeight: 600,
                                            fontSize: "0.75rem",
                                        }}
                                    >
                                        Ready: {tradition.cardLabel} with{" "}
                                        {goalTier} mode.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="px-4 py-2 rounded-xl flex items-center gap-1 text-sm"
                        style={{
                            opacity: step === 0 ? 0.35 : 1,
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#D7C29F",
                        }}
                    >
                        <ChevronLeft size={16} />
                        Back
                    </button>

                    {step < 2 ? (
                        <button
                            type="button"
                            onClick={() => setStep((s) => Math.min(2, s + 1))}
                            className="px-6 py-2.5 rounded-xl text-white flex items-center gap-2"
                            style={{
                                background:
                                    "linear-gradient(135deg, #DCA048, #CF9555)",
                            }}
                        >
                            Continue
                            <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={completeSetup}
                            className="px-6 py-2.5 rounded-xl text-white flex items-center gap-2"
                            style={{
                                background:
                                    "linear-gradient(135deg, #48B16E, #3D9E61)",
                            }}
                        >
                            Complete Setup
                            <CheckCircle size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
