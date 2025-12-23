"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSymptomLogs, getHealthReports, addHealthReport, SymptomLog, HealthReport } from "@/lib/db";
import { analyzeHealthRisks } from "@/lib/healthAnalyzer";
import { generateHealthPDF } from "@/lib/pdf";
import {
    FileText,
    Download,
    Loader2,
    Calendar,
    Plus,
    AlertCircle,
    CheckCircle,
    Clock,
} from "lucide-react";
import { format, subDays } from "date-fns";

export default function ReportsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [reports, setReports] = useState<HealthReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }
        fetchReports();
    }, [user, router]);

    const fetchReports = async () => {
        if (!user) return;
        try {
            const fetchedReports = await getHealthReports(user.uid);
            setReports(fetchedReports);
        } catch (err) {
            console.error("Error fetching reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        if (!user) return;
        setGenerating(true);
        setError("");

        try {
            const endDate = new Date();
            const startDate = subDays(endDate, 30);

            // Fetch logs for the period
            const logs = await getSymptomLogs(user.uid, 30);

            if (logs.length === 0) {
                setError("No symptom logs found. Please log some symptoms first to generate a report.");
                setGenerating(false);
                return;
            }

            // Analyze health risks
            const risks = analyzeHealthRisks(logs);

            // Calculate summary stats
            const avgPain = logs.reduce((sum, log) => sum + log.painScale, 0) / logs.length;
            const avgEnergy = logs.reduce((sum, log) => sum + log.energyLevel, 0) / logs.length;
            const avgSleep = logs.reduce((sum, log) => sum + log.sleepHours, 0) / logs.length;

            // Get common moods
            const moodCounts: Record<string, number> = {};
            logs.forEach((log) => {
                moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
            });
            const commonMoods = Object.entries(moodCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([mood]) => mood);

            // Calculate period days
            const periodDays = logs.filter((log) => log.flowLevel !== "none").length;

            const reportData: Omit<HealthReport, "id"> = {
                userId: user.uid,
                generatedAt: new Date(),
                startDate,
                endDate,
                cycleData: {
                    averageLength: 28, // Default, could be calculated from historical data
                    periodDays,
                },
                symptoms: {
                    averagePain: Math.round(avgPain * 10) / 10,
                    commonMoods,
                    averageEnergy: Math.round(avgEnergy * 10) / 10,
                    averageSleep: Math.round(avgSleep * 10) / 10,
                },
                risks: {
                    level: risks.level,
                    flags: risks.flags,
                },
            };

            // Generate PDF
            const pdfBlob = await generateHealthPDF(reportData, logs);

            // Save report to Firestore
            await addHealthReport(reportData);

            // Download PDF
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ovira-health-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Refresh reports list
            await fetchReports();
        } catch (err) {
            console.error("Error generating report:", err);
            setError("Failed to generate report. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const downloadReport = async (report: HealthReport) => {
        if (!user) return;

        try {
            const logs = await getSymptomLogs(user.uid, 30);
            const reportData: Omit<HealthReport, "id"> = {
                ...report,
                userId: user.uid,
            };
            const pdfBlob = await generateHealthPDF(reportData, logs);

            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ovira-health-report-${format(report.generatedAt, "yyyy-MM-dd")}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading report:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-lavender-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 lg:pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Health Reports</h1>
                    <p className="text-slate-600">Doctor-ready PDF summaries</p>
                </div>
                <button
                    onClick={generateReport}
                    disabled={generating}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-lavender-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            New Report
                        </>
                    )}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Info Card */}
            <div className="glass p-6 rounded-2xl mb-8">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-lavender-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-lavender-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-1">Doctor-Ready Reports</h3>
                        <p className="text-slate-600 text-sm">
                            Generate comprehensive PDF reports summarizing your health data over the past 30 days.
                            These reports include symptom trends, cycle information, and AI-flagged health insights
                            that you can share with your healthcare provider.
                        </p>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            {reports.length === 0 ? (
                <div className="glass p-12 rounded-2xl text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Reports Yet</h3>
                    <p className="text-slate-600 mb-6">
                        Generate your first health report to get started.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="glass p-5 rounded-2xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-100 to-teal-100 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-lavender-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">
                                        Health Report
                                    </h4>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {format(report.generatedAt, "MMM d, yyyy")}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {format(report.startDate, "MMM d")} - {format(report.endDate, "MMM d")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.risks.level === "high"
                                        ? "bg-red-100 text-red-700"
                                        : report.risks.level === "medium"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-teal-100 text-teal-700"
                                    }`}>
                                    {report.risks.level === "low" ? (
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Low Risk
                                        </span>
                                    ) : (
                                        `${report.risks.level.charAt(0).toUpperCase() + report.risks.level.slice(1)} Risk`
                                    )}
                                </span>
                                <button
                                    onClick={() => downloadReport(report)}
                                    className="p-2 rounded-xl hover:bg-lavender-100 text-lavender-600 transition-colors"
                                    title="Download PDF"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
