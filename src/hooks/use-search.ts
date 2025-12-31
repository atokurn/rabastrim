"use client";

import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "./use-debounce";

const HISTORY_KEY = "rabastrim_search_history";
const MAX_HISTORY = 10;

export interface SearchResult {
    id: string;
    title: string;
    cover: string;
    description?: string;
    episodes?: number;
    score?: number;
    tags?: string[];
    type?: string;
    provider: string;
}

export interface SearchSuggestion {
    id: string;
    title: string;
    provider: string;
}

export interface SearchParams {
    limit?: number;
    page?: number;
    type?: string;
}

export interface SearchPagination {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

/**
 * Custom hook for search functionality with pagination
 */
export function useSearch() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [pagination, setPagination] = useState<SearchPagination>({
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
    });

    const debouncedQuery = useDebounce(query, 300);

    // Load history from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(HISTORY_KEY);
            if (saved) {
                try {
                    setHistory(JSON.parse(saved));
                } catch {
                    setHistory([]);
                }
            }
        }
    }, []);

    // Fetch suggestions when debounced query changes
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.suggestions || []);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Failed to fetch suggestions:", error);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery]);

    // Add to history
    const addToHistory = useCallback((term: string) => {
        if (!term.trim()) return;

        setHistory((prev) => {
            const filtered = prev.filter((h) => h.toLowerCase() !== term.toLowerCase());
            const updated = [term, ...filtered].slice(0, MAX_HISTORY);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Clear history
    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    }, []);

    // Remove single history item
    const removeFromHistory = useCallback((term: string) => {
        setHistory((prev) => {
            const updated = prev.filter((h) => h !== term);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Perform search with pagination
    const search = useCallback(async (searchQuery: string, params?: SearchParams) => {
        if (!searchQuery.trim()) return;

        const page = params?.page || 1;
        const limit = params?.limit || 20;
        const type = params?.type || "all";

        setIsSearching(true);
        setShowSuggestions(false);

        // Only add to history on first page
        if (page === 1) {
            addToHistory(searchQuery);
        }

        try {
            const queryParams = new URLSearchParams({
                q: searchQuery,
                limit: String(limit),
                page: String(page),
                type,
            });

            const res = await fetch(`/api/search?${queryParams}`);
            if (res.ok) {
                const data = await res.json();

                if (page === 1) {
                    setResults(data.results || []);
                } else {
                    // Append results for infinite scroll
                    setResults(prev => [...prev, ...(data.results || [])]);
                }

                setPagination({
                    total: data.total || 0,
                    page: data.page || page,
                    limit: data.limit || limit,
                    hasMore: data.hasMore || false,
                });
            }
        } catch (error) {
            console.error("Search failed:", error);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [addToHistory]);

    // Load more results (next page)
    const loadMore = useCallback(async () => {
        if (!query.trim() || !pagination.hasMore || isSearching) return;

        await search(query, {
            page: pagination.page + 1,
            limit: pagination.limit,
        });
    }, [query, pagination, isSearching, search]);

    // Clear search
    const clearSearch = useCallback(() => {
        setQuery("");
        setResults([]);
        setSuggestions([]);
        setShowSuggestions(false);
        setPagination({ total: 0, page: 1, limit: 20, hasMore: false });
    }, []);

    return {
        query,
        setQuery,
        suggestions,
        results,
        history,
        isSearching,
        showSuggestions,
        setShowSuggestions,
        pagination,
        search,
        loadMore,
        clearSearch,
        addToHistory,
        clearHistory,
        removeFromHistory,
    };
}
