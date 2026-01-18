"use client";

import { GuestWarning } from "@/components/user/GuestWarning";
import { UserHeader } from "@/components/user/UserHeader";
import { UserMenu } from "@/components/user/UserMenu";
import { useUserStore } from "@/lib/auth/store";
import { Drawer } from "@/components/ui/Drawer";
import Link from "next/link";
import { Send, MessageSquare, HelpCircle, Mail, ChevronRight as ChevronIcon, ChevronLeft, ChevronDown, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function SupportPage() {
    const { initGuest } = useUserStore();
    const { t } = useTranslation();
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Initialize guest if not logged in
    useEffect(() => {
        initGuest();
    }, [initGuest]);

    const telegramBotName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "RabastrimBot";

    const TOPICS = [
        { value: "bug", label: t("support.topic_bug") },
        { value: "feature", label: t("support.topic_feature") },
        { value: "content", label: t("support.topic_content") },
        { value: "other", label: t("support.topic_other") },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulator sending feedback
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log("Feedback submitted:", { subject, message });

        setIsSubmitting(false);
        setIsSuccess(true);
        setSubject("");
        setMessage("");

        setTimeout(() => setIsSuccess(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[#121418] pb-24 md:pt-16">
            <div className="hidden md:block border-b border-gray-800 bg-[#1f2126]">
                <UserHeader />
            </div>

            <div className="md:hidden">
                {/* UserHeader removed for mobile full screen feel */}
            </div>

            <main className="container mx-auto px-4 md:py-6">
                <GuestWarning />

                <div className="md:mt-6 md:grid md:grid-cols-[280px_1fr] md:gap-8 md:items-start">
                    {/* Desktop Sidebar / Menu */}
                    <div className="hidden md:flex flex-col gap-2">
                        <UserMenu desktopOnly />
                    </div>

                    <div className="flex flex-col gap-6 md:gap-8">
                        {/* Header Mobile Only (Sticky) */}
                        <div className="md:hidden sticky top-0 z-10 bg-[#121418]/95 backdrop-blur-sm py-4 -mx-4 px-4 border-b border-gray-800/50 mb-2 flex items-center gap-3">
                            <Link href="/user" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                                <ChevronLeft className="w-6 h-6" />
                            </Link>
                            <h2 className="text-lg font-bold text-white flex-1">{t("support.title")}</h2>
                        </div>

                        {/* Card 1: Hubungi Kami */}
                        <div className="bg-[#1f2126] rounded-xl p-5 md:p-6 border border-gray-800/50">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-blue-400" />
                                {t("support.need_help")}
                            </h3>
                            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                                {t("support.help_description")}
                            </p>

                            <a
                                href={`https://t.me/${telegramBotName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#0088cc] text-white font-bold rounded-lg hover:bg-[#0077b5] transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                </svg>
                                {t("support.chat_telegram")}
                            </a>
                        </div>

                        {/* Card 2: FAQ */}
                        <div className="bg-[#1f2126] rounded-xl p-5 md:p-6 border border-gray-800/50">
                            <h3 className="text-lg font-bold text-white mb-4">{t("support.faq_title")}</h3>
                            <div className="space-y-4">
                                <FAQItem
                                    question={t("support.faq_download_q")}
                                    answer={t("support.faq_download_a")}
                                />
                                <FAQItem
                                    question={t("support.faq_playback_q")}
                                    answer={t("support.faq_playback_a")}
                                />
                                <FAQItem
                                    question={t("support.faq_free_q")}
                                    answer={t("support.faq_free_a")}
                                />
                            </div>
                        </div>

                        {/* Card 3: Form Feedback */}
                        <div className="bg-[#1f2126] rounded-xl p-5 md:p-6 border border-gray-800/50">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-green-400" />
                                {t("support.feedback_title")}
                            </h3>
                            <p className="text-gray-400 text-sm mb-5">
                                {t("support.feedback_description")}
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-1.5">
                                        {t("support.subject")}
                                    </label>
                                    <TopicSelector value={subject} onChange={setSubject} topics={TOPICS} selectLabel={t("support.select_topic")} />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-1.5">
                                        {t("support.message")}
                                    </label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={5}
                                        placeholder={t("support.message_placeholder")}
                                        required
                                        className="w-full bg-[#121418] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00cc55] focus:ring-1 focus:ring-[#00cc55] transition-colors resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !subject || !message}
                                    className="w-full bg-[#00cc55] text-white font-bold py-3 rounded-lg hover:bg-[#00bb4e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                                >
                                    {isSubmitting ? (
                                        <span className="animate-pulse">{t("support.sending")}</span>
                                    ) : isSuccess ? (
                                        <span className="flex items-center gap-2">{t("support.sent")} <span className="text-lg">✓</span></span>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            {t("support.submit")}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>


                    </div>
                </div>
            </main>
        </div>
    );
}

interface TopicOption {
    value: string;
    label: string;
}

function TopicSelector({ value, onChange, topics, selectLabel }: { value: string, onChange: (val: string) => void, topics: TopicOption[], selectLabel: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedLabel = topics.find((t) => t.value === value)?.label || selectLabel;

    return (
        <>
            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(true)}
                className="relative w-full bg-[#121418] border border-gray-700 rounded-lg px-4 py-3 text-white cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between group"
            >
                <span className={value ? "text-white" : "text-gray-500"}>{selectedLabel}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </div>

            {/* Mobile Drawer */}
            <div className="md:hidden">
                <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title={selectLabel}>
                    <div className="flex flex-col gap-2">
                        {topics.map((topic) => (
                            <button
                                key={topic.value}
                                onClick={() => {
                                    onChange(topic.value);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${value === topic.value
                                    ? "bg-[#00cc55]/10 border-[#00cc55] text-[#00cc55]"
                                    : "bg-[#121418] border-gray-800 text-gray-300 hover:bg-gray-800"
                                    }`}
                            >
                                <span className="font-medium">{topic.label}</span>
                                {value === topic.value && <Check className="w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                </Drawer>
            </div>

            {/* Desktop Dropdown */}
            {isOpen && (
                <div className="hidden md:block absolute z-20 mt-2 w-full max-w-[calc(100%-4rem)] md:max-w-full bg-[#1f2126] border border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                    {topics.map((topic) => (
                        <button
                            key={topic.value}
                            onClick={() => {
                                onChange(topic.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-800 transition-colors flex items-center justify-between ${value === topic.value ? "text-[#00cc55] bg-[#00cc55]/5" : "text-gray-300"
                                }`}
                        >
                            {topic.label}
                            {value === topic.value && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                    {/* Backdrop for desktop click-outside */}
                    <div className="fixed inset-0 z-[-1]" onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                    }} />
                </div>
            )}
        </>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    return (
        <details className="group border border-gray-800 rounded-lg bg-[#121418] overflow-hidden">
            <summary className="flex justify-between items-center p-4 cursor-pointer list-none text-gray-200 font-medium hover:bg-gray-800/50 transition-colors select-none">
                <span>{question}</span>
                <span className="transition-transform duration-200 group-open:rotate-180 text-gray-500">
                    <ChevronIcon className="w-4 h-4" />
                </span>
            </summary>
            <div className="px-4 pb-4 pt-0 text-gray-400 text-sm leading-relaxed group-open:animate-fadeIn">
                <div className="h-px bg-gray-800 mb-3 w-full"></div>
                {answer}
            </div>
        </details>
    )
}
