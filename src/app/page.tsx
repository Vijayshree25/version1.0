"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Heart, Shield, Brain, ArrowRight, Sparkles, Play } from "lucide-react";

export default function Home() {
    const { user, loading, isDemoMode, enterDemoMode } = useAuth();
    const router = useRouter();

    const handleTryDemo = () => {
        enterDemoMode();
        router.push("/dashboard");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse-soft">
                    <Heart className="w-16 h-16 text-lavender-500" />
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen">
            {/* Demo Mode Banner */}
            {isDemoMode && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 text-center">
                    <p className="text-sm font-medium">
                        🎮 <strong>Demo Mode Active</strong> — Firebase is not configured.
                        <button
                            onClick={handleTryDemo}
                            className="ml-2 underline hover:no-underline"
                        >
                            Explore the demo →
                        </button>
                    </p>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-lavender-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-soft"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-soft" style={{ animationDelay: "1s" }}></div>
                    <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-lavender-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-soft" style={{ animationDelay: "2s" }}></div>
                </div>

                {/* Navigation */}
                <nav className="relative z-10 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-500 to-teal-500 flex items-center justify-center">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">Ovira AI</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="px-6 py-2.5 bg-gradient-to-r from-lavender-500 to-teal-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-lavender-500/25 transition-all duration-300"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-6 py-2.5 text-slate-700 hover:text-lavender-600 font-medium transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-6 py-2.5 bg-gradient-to-r from-lavender-500 to-teal-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-lavender-500/25 transition-all duration-300"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-lavender-100 text-lavender-700 rounded-full text-sm font-medium mb-8 animate-fadeIn">
                            <Sparkles className="w-4 h-4" />
                            <span>AI-Powered Preventive Care</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 animate-slideUp">
                            Your Health,{" "}
                            <span className="gradient-text">Understood</span>
                        </h1>

                        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto animate-slideUp" style={{ animationDelay: "0.1s" }}>
                            Ovira AI shifts women's healthcare from prediction to prevention — using AI, empathy, and accessible technology.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp" style={{ animationDelay: "0.2s" }}>
                            {isDemoMode && !user ? (
                                <>
                                    <button
                                        onClick={handleTryDemo}
                                        className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-lavender-500 to-teal-500 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-lavender-500/30 transition-all duration-300"
                                    >
                                        <Play className="w-5 h-5" />
                                        Try Demo
                                    </button>
                                    <Link
                                        href="#features"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 glass rounded-full font-semibold text-lg text-slate-700 hover:bg-white/80 transition-all duration-300"
                                    >
                                        Learn More
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={user ? "/dashboard" : "/signup"}
                                        className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-lavender-500 to-teal-500 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-lavender-500/30 transition-all duration-300"
                                    >
                                        Start Your Journey
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        href="#features"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 glass rounded-full font-semibold text-lg text-slate-700 hover:bg-white/80 transition-all duration-300"
                                    >
                                        Learn More
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">
                            More Than a Period Tracker
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Ovira AI empowers you with insights, not just dates. We focus on preventive care to catch potential issues early.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass rounded-3xl p-8 card-hover">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender-400 to-lavender-600 flex items-center justify-center mb-6">
                                <Brain className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">AI Health Insights</h3>
                            <p className="text-slate-600">
                                Our AI analyzes your symptoms to identify potential health concerns early, from anemia indicators to hormonal imbalances.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass rounded-3xl p-8 card-hover">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-6">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Privacy First</h3>
                            <p className="text-slate-600">
                                Your health data is encrypted and secure. Export or delete your data anytime. You're always in control.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass rounded-3xl p-8 card-hover">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender-400 to-teal-500 flex items-center justify-center mb-6">
                                <Heart className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Doctor-Ready Reports</h3>
                            <p className="text-slate-600">
                                Generate comprehensive PDF reports to share with your healthcare provider, making consultations more productive.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="glass rounded-3xl p-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Ready to Take Control of Your Health?
                        </h2>
                        <p className="text-lg text-slate-600 mb-8">
                            Join thousands of women who are breaking the stigma and taking proactive steps towards better health.
                        </p>
                        <Link
                            href={user ? "/dashboard" : "/signup"}
                            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-lavender-500 to-teal-500 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-lavender-500/30 transition-all duration-300"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender-500 to-teal-500 flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold gradient-text">Ovira AI</span>
                        </div>
                        <p className="text-sm text-slate-500">
                            © 2024 Ovira AI. Empowering women's health through technology.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                            <Link href="/privacy" className="hover:text-lavender-600 transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-lavender-600 transition-colors">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
