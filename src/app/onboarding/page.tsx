"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Heart, ChevronRight, ChevronLeft, Check, Shield, Loader2 } from "lucide-react";

const ageRanges = [
    "Under 18",
    "18-24",
    "25-34",
    "35-44",
    "45-54",
    "55+",
];

const conditions = [
    { id: "pcos", label: "PCOS", description: "Polycystic Ovary Syndrome" },
    { id: "endometriosis", label: "Endometriosis", description: "Tissue growth outside uterus" },
    { id: "fibroids", label: "Fibroids", description: "Non-cancerous uterine growths" },
    { id: "thyroid", label: "Thyroid Issues", description: "Hypo/Hyperthyroidism" },
    { id: "anemia", label: "Anemia", description: "Low blood iron levels" },
    { id: "diabetes", label: "Diabetes", description: "Type 1 or Type 2" },
    { id: "none", label: "None", description: "No known conditions" },
    { id: "prefer-not", label: "Prefer not to say", description: "" },
];

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [ageRange, setAgeRange] = useState("");
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [language, setLanguage] = useState("en");
    const [loading, setLoading] = useState(false);
    const { user, refreshProfile } = useAuth();
    const router = useRouter();

    const totalSteps = 3;

    const toggleCondition = (conditionId: string) => {
        if (conditionId === "none" || conditionId === "prefer-not") {
            setSelectedConditions([conditionId]);
        } else {
            setSelectedConditions((prev) => {
                const filtered = prev.filter((c) => c !== "none" && c !== "prefer-not");
                if (filtered.includes(conditionId)) {
                    return filtered.filter((c) => c !== conditionId);
                }
                return [...filtered, conditionId];
            });
        }
    };

    const handleComplete = async () => {
        if (!user) return;

        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                ageRange,
                knownConditions: selectedConditions,
                language,
                onboardingComplete: true,
                updatedAt: Timestamp.now(),
            });
            await refreshProfile();
            router.push("/dashboard");
        } catch (error) {
            console.error("Error completing onboarding:", error);
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        if (step === 1) return ageRange !== "";
        if (step === 2) return selectedConditions.length > 0;
        return true;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-500 to-teal-500 flex items-center justify-center">
                            <Heart className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Ovira AI</h1>
                    <p className="text-slate-600">Let&apos;s personalize your experience</p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? "bg-gradient-to-r from-lavender-500 to-teal-500" : "bg-slate-200"
                                }`}
                        />
                    ))}
                </div>

                {/* Step Content */}
                <div className="glass rounded-3xl p-8">
                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">What&apos;s your age range?</h2>
                            <p className="text-slate-600 mb-6">This helps us provide age-appropriate health insights.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {ageRanges.map((age) => (
                                    <button
                                        key={age}
                                        onClick={() => setAgeRange(age)}
                                        className={`p-4 rounded-xl border-2 transition-all ${ageRange === age
                                                ? "border-lavender-500 bg-lavender-50 text-lavender-700"
                                                : "border-slate-200 hover:border-lavender-300"
                                            }`}
                                    >
                                        <span className="font-medium">{age}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fadeIn">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Any known health conditions?</h2>
                            <p className="text-slate-600 mb-6">Select all that apply. This is optional but helps us provide better insights.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {conditions.map((condition) => (
                                    <button
                                        key={condition.id}
                                        onClick={() => toggleCondition(condition.id)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedConditions.includes(condition.id)
                                                ? "border-lavender-500 bg-lavender-50"
                                                : "border-slate-200 hover:border-lavender-300"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium text-slate-900">{condition.label}</span>
                                                {condition.description && (
                                                    <p className="text-sm text-slate-500">{condition.description}</p>
                                                )}
                                            </div>
                                            {selectedConditions.includes(condition.id) && (
                                                <Check className="w-5 h-5 text-lavender-500" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fadeIn">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Privacy & Disclaimer</h2>
                            <p className="text-slate-600 mb-6">Please read and acknowledge the following.</p>

                            <div className="space-y-4 mb-6">
                                <div className="p-4 bg-lavender-50 rounded-xl border border-lavender-200">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-6 h-6 text-lavender-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-lavender-900">Your Data is Secure</h3>
                                            <p className="text-sm text-lavender-700 mt-1">
                                                Your health data is encrypted and stored securely. You can export or delete your data at any time from your profile settings.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 flex-shrink-0 mt-0.5 text-amber-600">⚕️</div>
                                        <div>
                                            <h3 className="font-semibold text-amber-900">Medical Disclaimer</h3>
                                            <p className="text-sm text-amber-700 mt-1">
                                                Ovira AI provides health insights, not medical diagnoses. Always consult a qualified healthcare provider for medical advice, diagnosis, or treatment.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Preferred Language
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-lavender-500 focus:ring-2 focus:ring-lavender-500/20 outline-none"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="hi">हिंदी</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < totalSteps ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={!canProceed()}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-lavender-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-lavender-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Get Started
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Step Indicator */}
                <p className="text-center mt-4 text-sm text-slate-500">
                    Step {step} of {totalSteps}
                </p>
            </div>
        </div>
    );
}
