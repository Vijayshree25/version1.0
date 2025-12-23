"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSymptomLogs, calculateStreak, SymptomLog } from "@/lib/db";
import { analyzeHealthRisks, predictNextPeriod } from "@/lib/healthAnalyzer";
import {
    Calendar,
    Flame,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    PenLine,
    MessageCircle,
    FileText,
    Heart,
    Moon,
    Zap,
    Smile,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function DashboardPage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const [logs, setLogs] = useState<SymptomLog[]>([]);
    const [streak, setStreak] = useState(0);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (!loading && user && userProfile && !userProfile.onboardingComplete) {
            router.push("/onboarding");
        }
    }, [user, userProfile, loading, router]);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            try {
                const [fetchedLogs, fetchedStreak] = await Promise.all([
                    getSymptomLogs(user.uid, 30),
                    calculateStreak(user.uid),
                ]);
                setLogs(fetchedLogs);
                setStreak(fetchedStreak);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoadingData(false);
            }
        }
        if (user) {
            fetchData();
        }
    }, [user]);

    if (loading || loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Heart className="w-12 h-12 text-lavender-500 animate-pulse" />
            </div>
        );
    }

    const healthRisks = analyzeHealthRisks(logs);
    const cycleInfo = userProfile?.lastPeriodStart
        ? predictNextPeriod(
            new Date(userProfile.lastPeriodStart),
            userProfile.averageCycleLength || 28
        )
        : null;

    const latestLog = logs[0];
    const todayFormatted = format(new Date(), "EEEE, MMMM d");

    // Calculate averages from recent logs
    const avgPain = logs.length > 0
        ? (logs.reduce((sum, log) => sum + log.painScale, 0) / logs.length).toFixed(1)
        : "—";
    const avgEnergy = logs.length > 0
        ? (logs.reduce((sum, log) => sum + log.energyLevel, 0) / logs.length).toFixed(1)
        : "—";
    const avgSleep = logs.length > 0
        ? (logs.reduce((sum, log) => sum + log.sleepHours, 0) / logs.length).toFixed(1)
        : "—";

    return (
        <div className="max-w-6xl mx-auto pb-20 lg:pb-0">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
                    Welcome back{userProfile?.displayName ? `, ${userProfile.displayName.split(" ")[0]}` : ""}! 👋
                </h1>
                <p className="text-slate-600">{todayFormatted}</p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                <Link
                    href="/log"
                    className="glass p-4 rounded-2xl text-center card-hover group"
                >
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-lavender-400 to-lavender-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PenLine className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Log Symptoms</span>
                </Link>
                <Link
                    href="/chat"
                    className="glass p-4 rounded-2xl text-center card-hover group"
                >
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">AI Chat</span>
                </Link>
                <Link
                    href="/reports"
                    className="glass p-4 rounded-2xl text-center card-hover group"
                >
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-lavender-400 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Get Report</span>
                </Link>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Cycle Day */}
                <div className="glass p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-lavender-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Cycle Day</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        {cycleInfo ? `Day ${cycleInfo.currentDay}` : "—"}
                    </p>
                    {cycleInfo && (
                        <p className="text-sm text-slate-500 mt-1">
                            {cycleInfo.daysUntil > 0
                                ? `${cycleInfo.daysUntil} days until period`
                                : "Period expected"}
                        </p>
                    )}
                </div>

                {/* Streak */}
                <div className="glass p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Flame className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Streak</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{streak}</p>
                    <p className="text-sm text-slate-500 mt-1">days logged</p>
                </div>

                {/* Avg Energy */}
                <div className="glass p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Avg Energy</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{avgEnergy}</p>
                    <p className="text-sm text-slate-500 mt-1">out of 10</p>
                </div>

                {/* Avg Sleep */}
                <div className="glass p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Avg Sleep</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{avgSleep}</p>
                    <p className="text-sm text-slate-500 mt-1">hours/night</p>
                </div>
            </div>

            {/* Health Insights Card */}
            <div className={`glass p-6 rounded-2xl mb-8 border-2 ${healthRisks.level === "high"
                    ? "border-red-200 bg-red-50/50"
                    : healthRisks.level === "medium"
                        ? "border-amber-200 bg-amber-50/50"
                        : "border-teal-200 bg-teal-50/50"
                }`}>
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${healthRisks.level === "high"
                            ? "bg-red-100"
                            : healthRisks.level === "medium"
                                ? "bg-amber-100"
                                : "bg-teal-100"
                        }`}>
                        {healthRisks.level === "low" ? (
                            <CheckCircle className="w-6 h-6 text-teal-600" />
                        ) : healthRisks.level === "medium" ? (
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">Health Insights</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${healthRisks.level === "high"
                                    ? "bg-red-100 text-red-700"
                                    : healthRisks.level === "medium"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-teal-100 text-teal-700"
                                }`}>
                                {healthRisks.level.charAt(0).toUpperCase() + healthRisks.level.slice(1)} Risk
                            </span>
                        </div>
                        <p className="text-slate-600 mb-3">{healthRisks.explanation}</p>
                        {healthRisks.flags.length > 0 && (
                            <ul className="space-y-1 mb-3">
                                {healthRisks.flags.map((flag, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                        <span className="text-lavender-500 mt-1">•</span>
                                        {flag}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="text-xs text-slate-500 italic">{healthRisks.disclaimer}</p>
                    </div>
                </div>
            </div>

            {/* Latest Log Summary */}
            {latestLog && (
                <div className="glass p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">Latest Log</h3>
                        <span className="text-sm text-slate-500">
                            {format(new Date(latestLog.date), "MMM d, yyyy")}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Flow</p>
                                <p className="font-medium text-slate-900 capitalize">{latestLog.flowLevel}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                <span className="text-lg">😣</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Pain</p>
                                <p className="font-medium text-slate-900">{latestLog.painScale}/10</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                                <Smile className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Mood</p>
                                <p className="font-medium text-slate-900 capitalize">{latestLog.mood}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Energy</p>
                                <p className="font-medium text-slate-900">{latestLog.energyLevel}/10</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No Logs Prompt */}
            {logs.length === 0 && (
                <div className="glass p-8 rounded-2xl text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lavender-100 flex items-center justify-center">
                        <PenLine className="w-8 h-8 text-lavender-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Start Logging</h3>
                    <p className="text-slate-600 mb-4">
                        Log your first symptoms to get personalized health insights.
                    </p>
                    <Link
                        href="/log"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-lavender-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <PenLine className="w-5 h-5" />
                        Log Symptoms
                    </Link>
                </div>
            )}
        </div>
    );
}
