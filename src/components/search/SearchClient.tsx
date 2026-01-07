"use client";

import { useState, useEffect } from "react";
import { useSearch } from "@/hooks/use-search";
import { SearchInput } from "./SearchInput";
import { SearchSuggestions } from "./SearchSuggestions";
import { SearchHistory } from "./SearchHistory";
import { PopularSearches } from "./PopularSearches";
import { SearchResults } from "./SearchResults";

interface PopularItem {
    id: string;
    title: string;
    cover: string;
    rank: number;
    episodes?: number;
    playCount?: string;
    provider: string;
}

interface SearchClientProps {
    initialPopular?: PopularItem[];
}

export function SearchClient({ initialPopular = [] }: SearchClientProps) {
    const {
        query,
        setQuery,
        suggestions,
        results,
        history,
        isSearching,
        showSuggestions,
        setShowSuggestions,
        lastSearchedQuery,
        pagination,
        sources,
        search,
        loadMore,
        clearSearch,
        addToHistory,
        clearHistory,
        removeFromHistory,
    } = useSearch();

    const [popular, setPopular] = useState<PopularItem[]>(initialPopular);
    const [isLoadingPopular, setIsLoadingPopular] = useState(initialPopular.length === 0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isMobile, setIsMobile] = useState(true); // Default to mobile (SSR safe)

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Fetch popular on mount if not provided
    useEffect(() => {
        if (initialPopular.length > 0) return;

        const fetchPopular = async () => {
            try {
                const res = await fetch("/api/search/popular");
                if (res.ok) {
                    const data = await res.json();
                    setPopular(data.popular || []);
                }
            } catch (error) {
                console.error("Failed to fetch popular:", error);
            } finally {
                setIsLoadingPopular(false);
            }
        };

        fetchPopular();
    }, [initialPopular]);

    const handleSubmit = () => {
        if (query.trim()) {
            search(query);
        }
    };

    const handleSuggestionSelect = (suggestion: { id: string; title: string; provider: string }) => {
        // Immediately hide suggestions before search starts
        setShowSuggestions(false);
        setQuery(suggestion.title);
        search(suggestion.title);
    };

    const handleHistorySelect = (term: string) => {
        setQuery(term);
        search(term);
    };

    const handleClear = () => {
        clearSearch();
    };

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        await loadMore();
        setIsLoadingMore(false);
    };
    // Show results if we have them
    const hasResults = results.length > 0;
    // Check if user is typing a new query (different from the one that produced current results)
    const isTypingNewQuery = query.trim().toLowerCase() !== lastSearchedQuery.toLowerCase();
    const showDiscovery = !hasResults && !isSearching;

    // Mobile: Fullscreen search UI
    if (isMobile) {
        return (
            <div className="min-h-screen bg-[#0f1014]">
                {/* Mobile Search Header */}
                <div className="sticky top-0 z-50 bg-[#0f1014] border-b border-gray-800/50 relative">
                    <SearchInput
                        value={query}
                        onChange={(value) => {
                            setQuery(value);
                            if (!value) {
                                clearSearch();
                            }
                        }}
                        onSubmit={handleSubmit}
                        onClear={handleClear}
                        onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                        showBackButton={true}
                    />

                    {/* Suggestions Dropdown */}
                    <SearchSuggestions
                        suggestions={suggestions}
                        query={query}
                        onSelect={handleSuggestionSelect}
                        isVisible={showSuggestions && !isSearching && (isTypingNewQuery || !hasResults)}
                    />
                </div>

                {/* Mobile Content */}
                <div className="pb-4">
                    {(hasResults || isSearching) && (
                        <SearchResults
                            results={results}
                            isLoading={isSearching}
                            isLoadingMore={isLoadingMore}
                            query={query}
                            pagination={pagination}
                            sources={sources}
                            onLoadMore={handleLoadMore}
                        />
                    )}

                    {showDiscovery && (
                        <>
                            <SearchHistory
                                history={history}
                                onSelect={handleHistorySelect}
                                onClear={clearHistory}
                                onRemove={removeFromHistory}
                            />
                            <PopularSearches
                                items={popular}
                                isLoading={isLoadingPopular}
                            />
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Desktop: Content with search input
    return (
        <div className="min-h-screen bg-[#0f1014] pt-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Desktop Search Input */}
                <div className="mb-8 relative max-w-2xl">
                    <SearchInput
                        value={query}
                        onChange={(value) => {
                            setQuery(value);
                            if (!value) {
                                clearSearch();
                            }
                        }}
                        onSubmit={handleSubmit}
                        onClear={handleClear}
                        onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                        showBackButton={false}
                        placeholder="Cari drama, film, anime..."
                    />

                    {/* Suggestions Dropdown */}
                    <SearchSuggestions
                        suggestions={suggestions}
                        query={query}
                        onSelect={handleSuggestionSelect}
                        isVisible={showSuggestions && !isSearching && (isTypingNewQuery || !hasResults)}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                    {/* Main Content */}
                    <div>
                        {(hasResults || isSearching) && (
                            <SearchResults
                                results={results}
                                isLoading={isSearching}
                                isLoadingMore={isLoadingMore}
                                query={query}
                                pagination={pagination}
                                sources={sources}
                                onLoadMore={handleLoadMore}
                            />
                        )}

                        {showDiscovery && (
                            <SearchHistory
                                history={history}
                                onSelect={handleHistorySelect}
                                onClear={clearHistory}
                                onRemove={removeFromHistory}
                            />
                        )}
                    </div>

                    {/* Sidebar - Popular Searches (always visible on desktop) */}
                    <aside className="hidden lg:block">
                        <PopularSearches
                            items={popular}
                            isLoading={isLoadingPopular}
                            variant="sidebar"
                        />
                    </aside>
                </div>

                {/* Show Popular below on smaller screens without sidebar */}
                {showDiscovery && (
                    <div className="lg:hidden mt-6">
                        <PopularSearches
                            items={popular}
                            isLoading={isLoadingPopular}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
