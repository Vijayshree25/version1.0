"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { deleteUser } from "firebase/auth";
import {
    User,
    Shield,
    Download,
    Trash2,
    LogOut,
    ChevronRight,
    AlertTriangle,
    Loader2,
    CheckCircle,
    Globe,
    Heart,
} from "lucide-react";
import { getSymptomLogs, getHealthReports } from "@/lib/db";

export default function ProfilePage() {
    const { user, userProfile, signOut } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [exported, setExported] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    const handleExportData = async () => {
        if (!user) return;
        setExportLoading(true);

        try {
            // Fetch all user data
            const [logs, reports] = await Promise.all([
                getSymptomLogs(user.uid, 1000),
                getHealthReports(user.uid),
            ]);

            const exportData = {
                profile: {
                    email: user.email,
                    ageRange: userProfile?.ageRange,
                    knownConditions: userProfile?.knownConditions,
                    language: userProfile?.language,
                    createdAt: userProfile?.createdAt,
                },
                symptomLogs: logs,
                healthReports: reports,
                exportedAt: new Date().toISOString(),
            };

            // Download as JSON
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ovira-data-export-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setExported(true);
            setTimeout(() => setExported(false), 3000);
        } catch (error) {
            console.error("Error exporting data:", error);
        } finally {
            setExportLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Delete user's symptom logs
            const logsQuery = query(
                collection(db, "symptomLogs"),
                where("userId", "==", user.uid)
            );
            const logsSnapshot = await getDocs(logsQuery);
            await Promise.all(logsSnapshot.docs.map((d) => deleteDoc(d.ref)));

            // Delete user's health reports
            const reportsQuery = query(
                collection(db, "healthReports"),
                where("userId", "==", user.uid)
            );
            const reportsSnapshot = await getDocs(reportsQuery);
            await Promise.all(reportsSnapshot.docs.map((d) => deleteDoc(d.ref)));

            // Delete user profile
            await deleteDoc(doc(db, "users", user.uid));

            // Delete Firebase Auth user
            await deleteUser(user);

            router.push("/");
        } catch (error) {
            console.error("Error deleting account:", error);
            // If re-authentication is required
            alert("Please sign out and sign in again, then try deleting your account.");
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    return (
        <div className="max-w-2xl mx-auto pb-24 lg:pb-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Profile & Settings</h1>
                <p className="text-slate-600">Manage your account and privacy</p>
            </div>

            {/* Profile Card */}
            <div className="glass p-6 rounded-2xl mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender-500 to-teal-500 flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {userProfile?.displayName || user?.email?.split("@")[0] || "User"}
                        </h2>
                        <p className="text-slate-600">{user?.email}</p>
                        {userProfile?.ageRange && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-lavender-100 text-lavender-700 text-xs rounded-full">
                                {userProfile.ageRange}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-4">
                {/* Health Conditions */}
                {userProfile?.knownConditions && userProfile.knownConditions.length > 0 && (
                    <div className="glass p-5 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <Heart className="w-5 h-5 text-lavender-500" />
                            <span className="font-medium text-slate-900">Health Conditions</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {userProfile.knownConditions
                                .filter((c) => c !== "none" && c !== "prefer-not")
                                .map((condition) => (
                                    <span
                                        key={condition}
                                        className="px-3 py-1 bg-lavender-100 text-lavender-700 rounded-full text-sm capitalize"
                                    >
                                        {condition}
                                    </span>
                                ))}
                            {userProfile.knownConditions.includes("none") && (
                                <span className="text-slate-500 text-sm">No conditions specified</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Language */}
                <div className="glass p-5 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-teal-500" />
                            <div>
                                <span className="font-medium text-slate-900">Language</span>
                                <p className="text-sm text-slate-500">
                                    {userProfile?.language === "en"
                                        ? "English"
                                        : userProfile?.language === "es"
                                            ? "Español"
                                            : userProfile?.language === "fr"
                                                ? "Français"
                                                : userProfile?.language === "hi"
                                                    ? "हिंदी"
                                                    : "English"}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                </div>

                {/* Privacy & Data Section */}
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-lavender-500" />
                            <span className="font-semibold text-slate-900">Privacy & Data</span>
                        </div>
                    </div>

                    {/* Export Data */}
                    <button
                        onClick={handleExportData}
                        disabled={exportLoading}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                        <div className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-slate-500" />
                            <div className="text-left">
                                <span className="font-medium text-slate-900">Export My Data</span>
                                <p className="text-sm text-slate-500">Download all your data as JSON</p>
                            </div>
                        </div>
                        {exportLoading ? (
                            <Loader2 className="w-5 h-5 text-lavender-500 animate-spin" />
                        ) : exported ? (
                            <CheckCircle className="w-5 h-5 text-teal-500" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                    </button>

                    {/* Delete Account */}
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <div className="text-left">
                                <span className="font-medium text-red-600">Delete Account</span>
                                <p className="text-sm text-slate-500">Permanently delete all data</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="w-full glass p-4 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5 text-slate-500" />
                        <span className="font-medium text-slate-900">Sign Out</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fadeIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Delete Account?</h3>
                                <p className="text-sm text-slate-600">This action cannot be undone</p>
                            </div>
                        </div>

                        <p className="text-slate-600 mb-6">
                            All your data including symptom logs, health reports, and personal information will be permanently deleted.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Account"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
