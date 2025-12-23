"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    Send,
    Bot,
    User,
    Loader2,
    Sparkles,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const starterQuestions = [
    "Why do I feel so tired during my period?",
    "Is it normal to have irregular cycles?",
    "What foods help with cramps?",
    "How can I track my fertility?",
    "What are signs of hormonal imbalance?",
];

export default function ChatPage() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: messageText.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: messageText.trim(),
                    context: {
                        ageRange: userProfile?.ageRange,
                        conditions: userProfile?.knownConditions,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            console.error("Chat error:", err);
            setError("Failed to get a response. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex-shrink-0 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-500 to-teal-500 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Ovira AI Assistant</h1>
                        <p className="text-sm text-slate-600">Your empathetic health companion</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 glass rounded-2xl overflow-hidden flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-lavender-100 to-teal-100 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-lavender-500" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">
                                How can I help you today?
                            </h2>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                Ask me anything about women&apos;s health, menstrual cycles, or wellness. I&apos;m here to provide helpful, stigma-free information.
                            </p>

                            {/* Starter Questions */}
                            <div className="space-y-2 max-w-md mx-auto">
                                {starterQuestions.map((question, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessage(question)}
                                        className="w-full p-3 text-left text-sm text-slate-700 bg-white/60 hover:bg-white rounded-xl border border-slate-200 hover:border-lavender-300 transition-all"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            {message.role === "assistant" && (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] p-4 rounded-2xl ${message.role === "user"
                                        ? "bg-gradient-to-r from-lavender-500 to-teal-500 text-white"
                                        : "bg-white border border-slate-200"
                                    }`}
                            >
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {message.content}
                                </p>
                            </div>
                            {message.role === "user" && (
                                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-slate-600" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-lavender-500" />
                                    <span className="text-sm text-slate-500">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                            <button
                                onClick={() => {
                                    setError("");
                                    if (messages.length > 0) {
                                        const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
                                        if (lastUserMessage) {
                                            sendMessage(lastUserMessage.content);
                                        }
                                    }
                                }}
                                className="ml-auto flex items-center gap-1 text-red-600 hover:text-red-800"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Retry
                            </button>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Disclaimer */}
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-200">
                    <p className="text-xs text-amber-700 text-center">
                        ⚕️ AI responses are for informational purposes only. Always consult a healthcare provider for medical advice.
                    </p>
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
                    <div className="flex gap-3">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your question..."
                            rows={1}
                            className="flex-1 p-3 rounded-xl border border-slate-200 focus:border-lavender-500 focus:ring-2 focus:ring-lavender-500/20 outline-none resize-none"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="px-4 py-3 bg-gradient-to-r from-lavender-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
