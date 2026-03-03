import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
    ArrowLeft,
    ArrowRight,
    Plus,
    Check,
    Trash2,
    ArrowUp,
    ArrowDown,
    BookOpen,
    Bell,
    Save,
    Wand2,
} from "lucide-react";
import type { DhikrCategory } from "../../data/dhikr";
import { BOOK_REGISTRY, getAllBookItems } from "../../data/books";
import type { AdhkarBook, BookSection, BookAdhkarItem } from "../../data/books";
import type { Wird } from "../../lib/wirdTypes";
import { createWird, createWirdItem } from "../../lib/wirdTypes";
import { loadUserData, saveUserData } from "../../lib/userData";

type Step = "name" | "content" | "notify" | "overview";

const SESSION_CATEGORIES: DhikrCategory[] = [
    "morning",
    "evening",
    "after-prayer",
    "general",
];

const SESSION_LABELS: Record<DhikrCategory, string> = {
    morning: "Morning",
    evening: "Evening",
    "after-prayer": "After Prayer",
    general: "General",
};

function stepIndex(step: Step): number {
    return ["name", "content", "notify", "overview"].indexOf(step);
}

function stepTitle(step: Step): string {
    if (step === "name") return "Name / Sessions";
    if (step === "content") return "Content Lines";
    if (step === "notify") return "Push Notifications";
    return "Overview & Save";
}

function cardStyle() {
    return {
        background: "rgba(106,36,40,0.6)",
        border: "1px solid rgba(220,160,72,0.2)",
    } as const;
}

function sanitizeDraft(draft: Wird): Wird {
    return {
        ...draft,
        items: draft.items.filter(
            (item) => item.sourceId && item.sourceId.trim() !== "",
        ),
        updatedAt: Date.now(),
    };
}

function StepDots({ step }: { step: Step }) {
    const current = stepIndex(step);
    return (
        <div className="flex items-center gap-1.5 justify-center">
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className="rounded-full"
                    animate={{
                        width: i === current ? 20 : 7,
                        background:
                            i <= current ? "#DCA048" : "rgba(255,255,255,0.2)",
                    }}
                    style={{ height: 7 }}
                />
            ))}
        </div>
    );
}

function PickerOverlay({
    onClose,
    onSelect,
}: {
    onClose: () => void;
    onSelect: (item: BookAdhkarItem) => void;
}) {
    const [phase, setPhase] = useState<"books" | "chapters" | "items">("books");
    const [book, setBook] = useState<AdhkarBook | null>(null);
    const [section, setSection] = useState<BookSection | null>(null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0"
                style={{ background: "rgba(0,0,0,0.65)" }}
                onClick={onClose}
            />
            <div
                className="relative w-full max-w-2xl max-h-[80vh] overflow-auto rounded-2xl p-4 space-y-3"
                style={cardStyle()}
            >
                <div className="flex items-center justify-between">
                    <p style={{ color: "white", fontWeight: 700 }}>
                        {phase === "books" && "Select Book"}
                        {phase === "chapters" &&
                            `Select Chapter - ${book?.title}`}
                        {phase === "items" && `Select Wird - ${section?.title}`}
                    </p>
                    <button
                        onClick={onClose}
                        style={{
                            color: "rgba(215,194,159,0.7)",
                            fontSize: "0.8rem",
                        }}
                    >
                        Close
                    </button>
                </div>

                {phase === "books" && (
                    <div className="space-y-2">
                        {BOOK_REGISTRY.map((b) => (
                            <button
                                key={b.id}
                                onClick={() => {
                                    setBook(b);
                                    setPhase("chapters");
                                }}
                                className="w-full text-left rounded-xl px-4 py-3"
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.09)",
                                    color: "white",
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <BookOpen
                                        size={14}
                                        style={{ color: "#DCA048" }}
                                    />
                                    <span style={{ fontWeight: 600 }}>
                                        {b.title}
                                    </span>
                                </div>
                                <p
                                    style={{
                                        color: "rgba(215,194,159,0.6)",
                                        fontSize: "0.75rem",
                                        marginTop: 4,
                                    }}
                                >
                                    {b.sections.length} chapters
                                </p>
                            </button>
                        ))}
                    </div>
                )}

                {phase === "chapters" && book && (
                    <>
                        <button
                            onClick={() => setPhase("books")}
                            style={{ color: "#DCA048", fontSize: "0.78rem" }}
                        >
                            {"<- Back to books"}
                        </button>
                        <div className="space-y-2">
                            {book.sections.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        setSection(s);
                                        setPhase("items");
                                    }}
                                    className="w-full text-left rounded-xl px-4 py-3"
                                    style={{
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.09)",
                                        color: "white",
                                    }}
                                >
                                    <p style={{ fontWeight: 600 }}>{s.title}</p>
                                    <p
                                        style={{
                                            color: "rgba(215,194,159,0.6)",
                                            fontSize: "0.75rem",
                                            marginTop: 4,
                                        }}
                                    >
                                        {s.adhkar.length} adhkar
                                    </p>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {phase === "items" && section && (
                    <>
                        <button
                            onClick={() => setPhase("chapters")}
                            style={{ color: "#DCA048", fontSize: "0.78rem" }}
                        >
                            {"<- Back to chapters"}
                        </button>
                        <div className="space-y-2">
                            {section.adhkar.map((i) => (
                                <button
                                    key={i.id}
                                    onClick={() => onSelect(i)}
                                    className="w-full text-left rounded-xl px-4 py-3"
                                    style={{
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.09)",
                                        color: "white",
                                    }}
                                >
                                    <p
                                        dir="rtl"
                                        style={{
                                            fontFamily:
                                                "Noto Naskh Arabic, Amiri, serif",
                                            fontSize: "0.95rem",
                                            lineHeight: 1.8,
                                        }}
                                    >
                                        {i.arabic}
                                    </p>
                                    <p
                                        style={{
                                            color: "rgba(215,194,159,0.65)",
                                            fontSize: "0.75rem",
                                            marginTop: 4,
                                        }}
                                    >
                                        {i.translation}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function StepNameSession({
    draft,
    onChange,
    onNext,
    onCancel,
}: {
    draft: Wird;
    onChange: (next: Wird) => void;
    onNext: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="space-y-5">
            <p
                style={{
                    color: "#DCA048",
                    fontSize: "0.75rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                }}
            >
                Step 1 / 4 - Name & Sessions
            </p>
            <input
                value={draft.name}
                onChange={(e) => onChange({ ...draft, name: e.target.value })}
                placeholder="Name your wird"
                className="w-full rounded-xl px-4 py-3"
                style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(220,160,72,0.3)",
                    color: "white",
                }}
            />

            <div className="flex flex-wrap gap-2">
                {SESSION_CATEGORIES.map((cat) => {
                    const active = draft.sessions.includes(cat);
                    return (
                        <button
                            key={cat}
                            onClick={() => {
                                const sessions = active
                                    ? draft.sessions.filter((s) => s !== cat)
                                    : [...draft.sessions, cat];
                                onChange({ ...draft, sessions });
                            }}
                            className="px-3 py-2 rounded-xl"
                            style={{
                                background: active
                                    ? "rgba(220,160,72,0.2)"
                                    : "rgba(255,255,255,0.05)",
                                border: `1px solid ${active ? "rgba(220,160,72,0.5)" : "rgba(255,255,255,0.1)"}`,
                                color: active
                                    ? "white"
                                    : "rgba(215,194,159,0.65)",
                            }}
                        >
                            {SESSION_LABELS[cat]}
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl"
                    style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "#D7C29F",
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={onNext}
                    disabled={!draft.name.trim() || draft.sessions.length === 0}
                    className="px-4 py-2 rounded-xl text-white"
                    style={{
                        background: "linear-gradient(135deg,#DCA048,#CF9555)",
                        opacity:
                            !draft.name.trim() || draft.sessions.length === 0
                                ? 0.4
                                : 1,
                    }}
                >
                    Next <ArrowRight size={14} className="inline ml-1" />
                </button>
            </div>
        </div>
    );
}

function StepContent({
    draft,
    onChange,
    onNext,
    onBack,
}: {
    draft: Wird;
    onChange: (next: Wird) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const allItems = useMemo(() => getAllBookItems(), []);
    const byId = useMemo(
        () => new Map(allItems.map((i) => [i.id, i])),
        [allItems],
    );
    const [pickerLineIndex, setPickerLineIndex] = useState<number | null>(null);

    const lines = draft.items;

    const ensureLine = (index: number) => {
        if (lines[index]) return;
        onChange({ ...draft, items: [...lines, createWirdItem("")] });
    };

    const selectForLine = (index: number, item: BookAdhkarItem) => {
        const next = [...draft.items];
        const existing = next[index];
        next[index] = {
            ...(existing || createWirdItem(item.id)),
            sourceId: item.id,
            enabled: true,
        };
        const last = next[next.length - 1];
        if (last && last.sourceId) next.push(createWirdItem(""));
        onChange({ ...draft, items: next });
        setPickerLineIndex(null);
    };

    const moveLine = (index: number, dir: -1 | 1) => {
        const target = index + dir;
        if (target < 0 || target >= lines.length) return;
        const next = [...lines];
        [next[index], next[target]] = [next[target], next[index]];
        onChange({ ...draft, items: next });
    };

    const removeLine = (index: number) => {
        const next = lines.filter((_, i) => i !== index);
        onChange({
            ...draft,
            items: next.length ? next : [createWirdItem("")],
        });
    };

    return (
        <div className="space-y-4">
            <p
                style={{
                    color: "#DCA048",
                    fontSize: "0.75rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                }}
            >
                Step 2 / 4 - Content Lines
            </p>

            <div className="space-y-2">
                {lines.map((line, i) => {
                    const src = line.sourceId ? byId.get(line.sourceId) : null;
                    return (
                        <div
                            key={line.id}
                            className="rounded-xl p-3"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <div className="flex items-start gap-2">
                                <div className="flex flex-col gap-1 mt-1">
                                    <button
                                        onClick={() => moveLine(i, -1)}
                                        style={{
                                            opacity: i === 0 ? 0.25 : 1,
                                            color: "#DCA048",
                                        }}
                                    >
                                        <ArrowUp size={12} />
                                    </button>
                                    <button
                                        onClick={() => moveLine(i, 1)}
                                        style={{
                                            opacity:
                                                i === lines.length - 1
                                                    ? 0.25
                                                    : 1,
                                            color: "#DCA048",
                                        }}
                                    >
                                        <ArrowDown size={12} />
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    {src ? (
                                        <>
                                            <p
                                                dir="rtl"
                                                className="truncate"
                                                style={{
                                                    color: "white",
                                                    fontFamily:
                                                        "Noto Naskh Arabic, Amiri, serif",
                                                }}
                                            >
                                                {src.arabic}
                                            </p>
                                            <p
                                                className="truncate"
                                                style={{
                                                    color: "#D7C29F",
                                                    fontSize: "0.75rem",
                                                }}
                                            >
                                                {src.translation}
                                            </p>
                                        </>
                                    ) : (
                                        <p
                                            style={{
                                                color: "rgba(215,194,159,0.6)",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            Empty line - choose a wird
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setPickerLineIndex(i)}
                                    className="px-2.5 py-1 rounded-lg"
                                    style={{
                                        background: "rgba(220,160,72,0.16)",
                                        color: "#DCA048",
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    {src ? "Change" : "+"}
                                </button>
                                <button
                                    onClick={() => removeLine(i)}
                                    style={{ color: "rgba(215,194,159,0.6)" }}
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    ensureLine(i + 1);
                                    setPickerLineIndex(i + 1);
                                }}
                                className="mt-2 text-left"
                                style={{
                                    color: "#DCA048",
                                    fontSize: "0.74rem",
                                }}
                            >
                                <Plus size={12} className="inline mr-1" /> Add
                                line below
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    onClick={onBack}
                    className="px-4 py-2 rounded-xl"
                    style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "#D7C29F",
                    }}
                >
                    <ArrowLeft size={14} className="inline mr-1" /> Back
                </button>
                <button
                    onClick={onNext}
                    disabled={sanitizeDraft(draft).items.length === 0}
                    className="px-4 py-2 rounded-xl text-white"
                    style={{
                        background: "linear-gradient(135deg,#DCA048,#CF9555)",
                        opacity:
                            sanitizeDraft(draft).items.length === 0 ? 0.4 : 1,
                    }}
                >
                    Next <ArrowRight size={14} className="inline ml-1" />
                </button>
            </div>

            {pickerLineIndex !== null && (
                <PickerOverlay
                    onClose={() => setPickerLineIndex(null)}
                    onSelect={(item) => selectForLine(pickerLineIndex, item)}
                />
            )}
        </div>
    );
}

function StepNotify({
    draft,
    onChange,
    onBack,
    onNext,
}: {
    draft: Wird;
    onChange: (next: Wird) => void;
    onBack: () => void;
    onNext: () => void;
}) {
    const notifications = draft.notifications || {
        enabled: false,
        intervalMinutes: 60,
        startTime: "06:00",
        endTime: "21:00",
    };

    return (
        <div className="space-y-4">
            <p
                style={{
                    color: "#DCA048",
                    fontSize: "0.75rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                }}
            >
                Step 3 / 4 - Push Notifications
            </p>
            <div className="rounded-xl p-4" style={cardStyle()}>
                <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell size={15} style={{ color: "#DCA048" }} />
                        <span style={{ color: "white", fontWeight: 600 }}>
                            Enable notifications for this wird
                        </span>
                    </div>
                    <input
                        type="checkbox"
                        checked={notifications.enabled}
                        onChange={(e) =>
                            onChange({
                                ...draft,
                                notifications: {
                                    ...notifications,
                                    enabled: e.target.checked,
                                },
                            })
                        }
                    />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                    <input
                        type="number"
                        min={5}
                        step={5}
                        value={notifications.intervalMinutes}
                        disabled={!notifications.enabled}
                        onChange={(e) =>
                            onChange({
                                ...draft,
                                notifications: {
                                    ...notifications,
                                    intervalMinutes: Math.max(
                                        5,
                                        Number(e.target.value || 5),
                                    ),
                                },
                            })
                        }
                        className="rounded-lg px-3 py-2"
                        style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "white",
                        }}
                    />
                    <input
                        type="time"
                        value={notifications.startTime}
                        disabled={!notifications.enabled}
                        onChange={(e) =>
                            onChange({
                                ...draft,
                                notifications: {
                                    ...notifications,
                                    startTime: e.target.value,
                                },
                            })
                        }
                        className="rounded-lg px-3 py-2"
                        style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "white",
                        }}
                    />
                    <input
                        type="time"
                        value={notifications.endTime}
                        disabled={!notifications.enabled}
                        onChange={(e) =>
                            onChange({
                                ...draft,
                                notifications: {
                                    ...notifications,
                                    endTime: e.target.value,
                                },
                            })
                        }
                        className="rounded-lg px-3 py-2"
                        style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "white",
                        }}
                    />
                </div>
            </div>
            <div className="flex gap-2 pt-2">
                <button
                    onClick={onBack}
                    className="px-4 py-2 rounded-xl"
                    style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "#D7C29F",
                    }}
                >
                    <ArrowLeft size={14} className="inline mr-1" /> Back
                </button>
                <button
                    onClick={onNext}
                    className="px-4 py-2 rounded-xl text-white"
                    style={{
                        background: "linear-gradient(135deg,#DCA048,#CF9555)",
                    }}
                >
                    Next <ArrowRight size={14} className="inline ml-1" />
                </button>
            </div>
        </div>
    );
}

function StepOverview({
    draft,
    onBack,
    onSave,
}: {
    draft: Wird;
    onBack: () => void;
    onSave: () => void;
}) {
    const allItems = useMemo(() => getAllBookItems(), []);
    const byId = useMemo(
        () => new Map(allItems.map((i) => [i.id, i])),
        [allItems],
    );
    const sanitized = sanitizeDraft(draft);

    return (
        <div className="space-y-4">
            <p
                style={{
                    color: "#DCA048",
                    fontSize: "0.75rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                }}
            >
                Step 4 / 4 - Overview & Save
            </p>
            <div className="rounded-xl p-4" style={cardStyle()}>
                <p style={{ color: "white", fontWeight: 700 }}>{draft.name}</p>
                <p
                    style={{
                        color: "rgba(215,194,159,0.65)",
                        fontSize: "0.78rem",
                        marginTop: 4,
                    }}
                >
                    Sessions:{" "}
                    {draft.sessions.map((s) => SESSION_LABELS[s]).join(", ")}
                </p>
                <p
                    style={{
                        color: "rgba(215,194,159,0.65)",
                        fontSize: "0.78rem",
                    }}
                >
                    Lines: {sanitized.items.length}
                </p>
            </div>
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {sanitized.items.map((line, i) => {
                    const src = byId.get(line.sourceId);
                    return (
                        <div
                            key={line.id}
                            className="rounded-xl px-3 py-2"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <p style={{ color: "#DCA048", fontSize: "0.7rem" }}>
                                Line {i + 1}
                            </p>
                            <p
                                dir="rtl"
                                className="truncate"
                                style={{
                                    color: "white",
                                    fontFamily:
                                        "Noto Naskh Arabic, Amiri, serif",
                                }}
                            >
                                {src?.arabic || line.sourceId}
                            </p>
                            <p
                                className="truncate"
                                style={{
                                    color: "rgba(215,194,159,0.65)",
                                    fontSize: "0.75rem",
                                }}
                            >
                                {src?.translation || ""}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-2 pt-2">
                <button
                    onClick={onBack}
                    className="px-4 py-2 rounded-xl"
                    style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "#D7C29F",
                    }}
                >
                    <ArrowLeft size={14} className="inline mr-1" /> Back
                </button>
                <button
                    onClick={onSave}
                    disabled={sanitized.items.length === 0}
                    className="px-4 py-2 rounded-xl text-white"
                    style={{
                        background: "linear-gradient(135deg,#48B16E,#3D9E61)",
                        opacity: sanitized.items.length === 0 ? 0.4 : 1,
                    }}
                >
                    <Save size={14} className="inline mr-1" /> Save Wird
                </button>
            </div>
        </div>
    );
}

function Landing({
    wirds,
    onNew,
    onEdit,
    onDelete,
    onToggleActive,
}: {
    wirds: Wird[];
    onNew: () => void;
    onEdit: (wird: Wird) => void;
    onDelete: (id: string) => void;
    onToggleActive: (id: string, session: DhikrCategory) => void;
}) {
    const userData = loadUserData();

    return (
        <div className="min-h-full p-4 md:p-6 max-w-2xl mx-auto space-y-5">
            <div>
                <h1
                    style={{
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1.5rem",
                    }}
                >
                    My Wirds
                </h1>
                <p
                    style={{
                        color: "rgba(215,194,159,0.55)",
                        fontSize: "0.82rem",
                    }}
                >
                    Create your own daily wird
                </p>
            </div>

            <button
                onClick={onNew}
                className="w-full rounded-2xl py-3.5"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(220,160,72,0.18), rgba(220,160,72,0.06))",
                    border: "1px dashed rgba(220,160,72,0.5)",
                    color: "#DCA048",
                    fontWeight: 600,
                }}
            >
                <Plus size={14} className="inline mr-1" /> Create New Wird
            </button>

            {wirds.map((wird) => (
                <div
                    key={wird.id}
                    className="rounded-2xl p-4 space-y-3"
                    style={cardStyle()}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p style={{ color: "white", fontWeight: 700 }}>
                                {wird.name}
                            </p>
                            <p
                                style={{
                                    color: "rgba(215,194,159,0.65)",
                                    fontSize: "0.75rem",
                                }}
                            >
                                {sanitizeDraft(wird).items.length} lines
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(wird)}
                                style={{
                                    color: "#DCA048",
                                    fontSize: "0.78rem",
                                }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(wird.id)}
                                style={{
                                    color: "rgba(215,194,159,0.7)",
                                    fontSize: "0.78rem",
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {wird.sessions.map((session) => {
                            const active =
                                userData.activeWirdIdBySession[session] ===
                                wird.id;
                            return (
                                <button
                                    key={session}
                                    onClick={() =>
                                        onToggleActive(wird.id, session)
                                    }
                                    className="px-2.5 py-1 rounded-lg"
                                    style={{
                                        background: active
                                            ? "rgba(72,177,110,0.2)"
                                            : "rgba(255,255,255,0.05)",
                                        border: `1px solid ${active ? "rgba(72,177,110,0.4)" : "rgba(255,255,255,0.1)"}`,
                                        color: active
                                            ? "#48B16E"
                                            : "rgba(215,194,159,0.7)",
                                        fontSize: "0.72rem",
                                    }}
                                >
                                    {active && (
                                        <Check
                                            size={10}
                                            className="inline mr-1"
                                        />
                                    )}
                                    {SESSION_LABELS[session]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {wirds.length === 0 && (
                <div
                    className="rounded-2xl p-8 text-center"
                    style={{
                        background: "rgba(106,36,40,0.4)",
                        border: "1px solid rgba(220,160,72,0.1)",
                    }}
                >
                    <Wand2
                        size={30}
                        style={{
                            color: "#DCA048",
                            margin: "0 auto 8px",
                            opacity: 0.5,
                        }}
                    />
                    <p style={{ color: "#D7C29F" }}>No wirds yet</p>
                </div>
            )}
        </div>
    );
}

function Wizard({
    initialDraft,
    onSave,
    onCancel,
}: {
    initialDraft: Wird;
    onSave: (wird: Wird) => void;
    onCancel: () => void;
}) {
    const [step, setStep] = useState<Step>("name");
    const [draft, setDraft] = useState<Wird>(
        initialDraft.items.length
            ? initialDraft
            : { ...initialDraft, items: [createWirdItem("")] },
    );

    return (
        <div className="min-h-full p-4 md:p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={onCancel}
                    style={{
                        color: "rgba(215,194,159,0.65)",
                        fontSize: "0.82rem",
                    }}
                >
                    <ArrowLeft size={14} className="inline mr-1" /> Cancel
                </button>
                <StepDots step={step} />
                <p
                    style={{
                        color: "rgba(215,194,159,0.65)",
                        fontSize: "0.78rem",
                    }}
                >
                    {stepTitle(step)}
                </p>
            </div>

            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl p-5"
                style={cardStyle()}
            >
                {step === "name" && (
                    <StepNameSession
                        draft={draft}
                        onChange={setDraft}
                        onNext={() => setStep("content")}
                        onCancel={onCancel}
                    />
                )}
                {step === "content" && (
                    <StepContent
                        draft={draft}
                        onChange={setDraft}
                        onBack={() => setStep("name")}
                        onNext={() => setStep("notify")}
                    />
                )}
                {step === "notify" && (
                    <StepNotify
                        draft={draft}
                        onChange={setDraft}
                        onBack={() => setStep("content")}
                        onNext={() => setStep("overview")}
                    />
                )}
                {step === "overview" && (
                    <StepOverview
                        draft={draft}
                        onBack={() => setStep("notify")}
                        onSave={() => onSave(sanitizeDraft(draft))}
                    />
                )}
            </motion.div>
        </div>
    );
}

export function WirdBuilder() {
    const [userData, setUserData] = useState(() => loadUserData());
    const [editingWird, setEditingWird] = useState<Wird | null>(null);

    const createNew = () => setEditingWird(createWird("", ["morning"]));

    const saveCurrent = (wird: Wird) => {
        const exists = userData.customWirds.some((w) => w.id === wird.id);
        const next = saveUserData({
            customWirds: exists
                ? userData.customWirds.map((w) => (w.id === wird.id ? wird : w))
                : [...userData.customWirds, wird],
        });
        setUserData(next);
        setEditingWird(null);
    };

    const remove = (id: string) => {
        const next = saveUserData({
            customWirds: userData.customWirds.filter((w) => w.id !== id),
            activeWirdIdBySession: Object.fromEntries(
                Object.entries(userData.activeWirdIdBySession).map(([k, v]) => [
                    k,
                    v === id ? null : v,
                ]),
            ) as typeof userData.activeWirdIdBySession,
        });
        setUserData(next);
    };

    const toggleActive = (id: string, session: DhikrCategory) => {
        const current = userData.activeWirdIdBySession[session];
        const nextActive = current === id ? null : id;
        const next = saveUserData({
            dhikrMode: nextActive ? "custom" : userData.dhikrMode,
            activeWirdIdBySession: {
                ...userData.activeWirdIdBySession,
                [session]: nextActive,
            },
        });
        setUserData(next);
    };

    if (editingWird) {
        return (
            <Wizard
                initialDraft={editingWird}
                onSave={saveCurrent}
                onCancel={() => setEditingWird(null)}
            />
        );
    }

    return (
        <Landing
            wirds={userData.customWirds}
            onNew={createNew}
            onEdit={setEditingWird}
            onDelete={remove}
            onToggleActive={toggleActive}
        />
    );
}
