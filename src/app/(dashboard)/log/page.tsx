"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { addSymptomLog, updateUserProfile } from "@/lib/db";
import {
    Heart,
    Save,
    Loader2,
    CheckCircle,
    ChevronLeft,
    Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

const flowLevels = [
    { value: "none", label: "None", emoji: "⚪" },
    { value: "light", label: "Light", emoji: "🩸" },
    { value: "medium", label: "Medium", emoji: "💧" },
    { value: "heavy", label: "Heavy", emoji: "🌊" },
];

const moods = [
    { value: "happy", label: "Happy", emoji: "😊" },
    { value: "calm", label: "Calm", emoji: "😌" },
    { value: "neutral", label: "Neutral", emoji: "😐" },
    { value: "anxious", label: "Anxious", emoji: "😰" },
    { value: "sad", label: "Sad", emoji: "😢" },
    { value: "irritable", label: "Irritable", emoji: "😤" },
];

export default function LogPage() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Form state
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [flowLevel, setFlowLevel] = useState<"none" | "light" | "medium" | "heavy">("none");
    const [painScale, setPainScale] = useState(0);
    const [mood, setMood] = useState("neutral");
    const [energyLevel, setEnergyLevel] = useState(5);
    const [sleepHours, setSleepHours] = useState(7);
    const [notes, setNotes] = useState("");
    const [isPeriodStart, setIsPeriodStart] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            await addSymptomLog({
                userId: user.uid,
                date: new Date(date),
                flowLevel,
                painScale,
                mood,
                energyLevel,
                sleepHours,
                notes: notes.trim() || undefined,
            });

            // Update last period start if this is marked as period start
            if (isPeriodStart && (flowLevel !== "none")) {
                await updateUserProfile(user.uid, {
                    lastPeriodStart: Timestamp.fromDate(new Date(date)),
                });
            }

            setSaved(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);
        } catch (error) {
            console.error("Error saving log:", error);
        } finally {
            setSaving(false);
        }
    };

    if (saved) {
        return (
            <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="text-center animate-fadeIn">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-teal-100 flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Logged Successfully!</h2>
                    <p className="text-slate-600">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-24 lg:pb-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Log Symptoms</h1>
                    <p className="text-slate-600">Track your daily health</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div className="glass p-6 rounded-2xl">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                        <Calendar className="w-4 h-4" />
                        Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={format(new Date(), "yyyy-MM-dd")}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-lavender-500 focus:ring-2 focus:ring-lavender-500/20 outline-none"
                    />
                </div>

                {/* Flow Level */}
                <div className="glass p-6 rounded-2xl">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                        <Heart className="w-4 h-4" />
                        Flow Level
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                        {flowLevels.map((level) => (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => setFlowLevel(level.value as typeof flowLevel)}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${flowLevel === level.value
                                        ? "border-lavender-500 bg-lavender-50"
                                        : "border-slate-200 hover:border-lavender-300"
                                    }`}
                            >
                                <span className="text-2xl block mb-1">{level.emoji}</span>
                                <span className="text-xs font-medium text-slate-700">{level.label}</span>
                            </button>
                        ))}
                    </div>

                    {flowLevel !== "none" && (
                        <label className="flex items-center gap-3 mt-4 p-3 bg-lavender-50 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPeriodStart}
                                onChange={(e) => setIsPeriodStart(e.target.checked)}
                                className="w-5 h-5 rounded border-lavender-300 text-lavender-500 focus:ring-lavender-500"
                            />
                            <span className="text-sm text-lavender-700">This is the first day of my period</span>
                        </label>
                    )}
                </div>

                {/* Pain Scale */}
                <div className="glass p-6 rounded-2xl">
                    <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-3">
                        <span>Pain Level</span>
                        <span className="text-lg font-bold text-lavender-600">{painScale}/10</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={painScale}
                        onChange={(e) => setPainScale(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-lavender-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>No pain</span>
                        <span>Moderate</span>
                        <span>Severe</span>
                    </div>
                </div>

                {/* Mood */}
                <div className="glass p-6 rounded-2xl">
                    <label className="text-sm font-medium text-slate-700 mb-3 block">
                        Mood
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {moods.map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                onClick={() => setMood(m.value)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${mood === m.value
                                        ? "border-lavender-500 bg-lavender-50"
                                        : "border-slate-200 hover:border-lavender-300"
                                    }`}
                            >
                                <span className="text-2xl block mb-1">{m.emoji}</span>
                                <span className="text-xs font-medium text-slate-700">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Energy Level */}
                <div className="glass p-6 rounded-2xl">
                    <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-3">
                        <span>Energy Level</span>
                        <span className="text-lg font-bold text-teal-600">{energyLevel}/10</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-teal-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>Exhausted</span>
                        <span>Moderate</span>
                        <span>Energetic</span>
                    </div>
                </div>

                {/* Sleep Hours */}
                <div className="glass p-6 rounded-2xl">
                    <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-3">
                        <span>Sleep Hours</span>
                        <span className="text-lg font-bold text-indigo-600">{sleepHours}h</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="12"
                        step="0.5"
                        value={sleepHours}
                        onChange={(e) => setSleepHours(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>0h</span>
                        <span>6h</span>
                        <span>12h</span>
                    </div>
                </div>

                {/* Notes */}
                <div className="glass p-6 rounded-2xl">
                    <label className="text-sm font-medium text-slate-700 mb-3 block">
                        Notes (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional symptoms, observations, or notes..."
                        rows={3}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-lavender-500 focus:ring-2 focus:ring-lavender-500/20 outline-none resize-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-gradient-to-r from-lavender-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-lavender-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Log
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
