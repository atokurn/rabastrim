"use client";

import { Search, Flame, Clock, Star } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function SearchPage() {
    const [query, setQuery] = useState("");

    const genres = ["Romance", "Action", "Costume", "Thriller", "Comedy", "Fantasy", "Mystery", "Youth"];

    const initialTrending = [
        { rank: 1, title: "Fated Hearts", change: "up" },
        { rank: 2, title: "The Unclouded Soul", change: "same" },
        { rank: 3, title: "Shine on Me", change: "up" },
        { rank: 4, title: "Sword and Beloved", change: "down" },
        { rank: 5, title: "Love Game", change: "new" },
    ];

    return (
        <div className="pt-20 pb-20 container mx-auto px-4 min-h-screen">
            {/* Search Input */}
            <div className="relative max-w-2xl mx-auto mb-8">
                <input
                    type="text"
                    placeholder="Search for drama, movies..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-[#1f2126] text-white text-lg px-6 py-4 rounded-full pl-14 focus:outline-none focus:ring-2 focus:ring-[#00cc55]"
                    autoFocus
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            </div>

            {!query ? (
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Search History */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-white">History</h3>
                            <button className="text-gray-500 hover:text-white text-sm">Clear</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["Hidden Love", "My Demon", "Story of Kunning Palace"].map((term) => (
                                <button key={term} className="bg-[#1f2126] px-3 py-1.5 rounded-full text-sm text-gray-300 hover:text-white hover:bg-[#2e3036] transition-colors flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> {term}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hot Search */}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                            <Flame className="text-red-500 w-5 h-5" /> Hot Search
                        </h3>
                        <div className="space-y-4">
                            {initialTrending.map((item) => (
                                <div key={item.rank} className="flex items-center gap-4 group cursor-pointer">
                                    <span className={`
                            w-6 h-6 flex items-center justify-center rounded text-sm font-bold
                            ${item.rank <= 3 ? "bg-gradient-to-br from-[#cba46a] to-yellow-600 text-black" : "bg-gray-700 text-gray-400"}
                        `}>
                                        {item.rank}
                                    </span>
                                    <span className="text-gray-300 group-hover:text-[#00cc55] transition-colors">{item.title}</span>
                                    {item.change === "new" && <span className="bg-red-500 text-[10px] px-1 rounded text-white font-bold">NEW</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Genres */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="font-bold text-lg text-white mb-4">Browse by Genre</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {genres.map(genre => (
                                <Link href={`/drama?genre=${genre}`} key={genre} className="bg-[#1f2126] h-20 rounded-lg flex items-center justify-center text-gray-300 font-medium hover:bg-[#2e3036] hover:text-[#00cc55] transition-colors">
                                    {genre}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Mock Results */
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="space-y-2">
                            <div className="aspect-[3/4] bg-[#1f2126] rounded-lg overflow-hidden relative">
                                <img src={`https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg`} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="line-clamp-1 text-sm font-medium">Result Title {i}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
