"use client";

import { Play, Plus, Star } from "lucide-react";
import Image from "next/image";

export function Hero() {
    return (
        <section className="relative h-[85vh] w-full overflow-hidden">
            {/* Background Image - Placeholder */}
            <div className="absolute inset-0">
                <div className="relative w-full h-full">
                    {/* Using a placeholder image that looks like a drama poster */}
                    <img
                        src="https://image.tmdb.org/t/p/original/sRLC052ieEafQN95VcK8i0TS9Js.jpg"
                        alt="Hero Banner"
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Gradient Overlay - iQIYI style involves a heavy gradient from left and bottom */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#111319] via-[#111319]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111319] via-transparent to-transparent" />
                </div>
            </div>

            {/* Content */}
            <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pt-20">
                <div className="max-w-2xl space-y-6">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <span className="bg-[#00cc55] text-black px-1.5 py-0.5 rounded">Top 1</span>
                        <span className="bg-[#1f2126] text-[#00cc55] px-1.5 py-0.5 rounded border border-[#00cc55]/30">High Popularity</span>
                        <span className="bg-[#00cc55] text-black px-1.5 py-0.5 rounded">Original</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white drop-shadow-lg">
                        FATED <br /> HEARTS
                    </h1>

                    {/* Metadata Line */}
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-1 text-[#00cc55]">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-bold">9.8</span>
                        </div>
                        <span>2025</span>
                        <span className="border border-gray-600 px-1 rounded text-xs">13+</span>
                        <span>38 Episodes</span>
                        <span>Costume, Romance</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm md:text-base line-clamp-3 md:line-clamp-2 max-w-xl">
                        "Fated Hearts" is a romance period drama directed by Chu Yuibun.
                        The story follows the journey of a young noblewoman who finds herself entangled in a web of political intrigue and forbidden love.
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center gap-4 pt-4">
                        <button className="bg-[#00cc55] hover:bg-[#00b34a] text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-transform active:scale-95">
                            <Play className="w-5 h-5 fill-black" />
                            Watch Now
                        </button>
                        <button className="bg-[#1f2126]/80 hover:bg-[#2a2d35] text-white px-4 py-3 rounded-full font-bold transition-transform active:scale-95 border border-white/10">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
