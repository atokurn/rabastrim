import { db, contents, Content, NewContent } from "@/lib/db";
import { eq, ilike, desc, sql, and, notInArray } from "drizzle-orm";

export async function upsertContent(data: NewContent) {
    return db
        .insert(contents)
        .values(data)
        .onConflictDoUpdate({
            target: [contents.provider, contents.providerContentId],
            set: {
                title: data.title,
                description: data.description,
                posterUrl: data.posterUrl,
                episodeCount: data.episodeCount,
                region: data.region,
                contentType: data.contentType,
                tags: data.tags,
                releaseDate: data.releaseDate,
                releaseYear: data.releaseYear,
                releaseStatus: data.releaseStatus,
                releaseSource: data.releaseSource,
                fetchedAt: new Date(),
                fetchedFrom: data.fetchedFrom,
            },
        })
        .returning();
}

const PAGE_SIZE = 20;

export async function getContent(cursor?: number, limit: number = PAGE_SIZE) {
    let query = db
        .select()
        .from(contents)
        .where(eq(contents.status, "active"))
        // Composite score: viewCount * 2 + popularityScore (ingest signal)
        .orderBy(desc(sql`(${contents.viewCount} * 2 + ${contents.popularityScore})`), desc(contents.updatedAt))
        .limit(limit);

    if (cursor) {
        query.offset(cursor);
    }

    return await query;
}

export async function searchContent(query: string, limit: number = 8) {
    if (!query) return [];

    // 1. Exact/Prefix matches first (highest priority)
    const prefixMatches = await db
        .select()
        .from(contents)
        .where(
            and(
                eq(contents.status, "active"),
                ilike(contents.title, `${query}%`)
            )
        )
        .orderBy(desc(contents.viewCount))
        .limit(limit);

    if (prefixMatches.length >= limit) {
        return prefixMatches;
    }

    // Track found IDs to avoid duplicates
    const foundIds = new Set(prefixMatches.map(c => c.id));
    const results = [...prefixMatches];

    // 2. Fuzzy matches (contains query)
    const needed = limit - results.length;
    if (needed > 0) {
        const fuzzyConditions = [
            eq(contents.status, "active"),
            ilike(contents.title, `%${query}%`)
        ];

        if (foundIds.size > 0) {
            fuzzyConditions.push(notInArray(contents.id, Array.from(foundIds)));
        }

        const fuzzyMatches = await db
            .select()
            .from(contents)
            .where(and(...fuzzyConditions))
            .orderBy(desc(contents.viewCount))
            .limit(needed);

        fuzzyMatches.forEach(m => {
            foundIds.add(m.id);
            results.push(m);
        });
    }

    // 3. Keyword-based search (for related titles like "Cinta" matching "Alunan Cinta", "Tersalah Cinta", etc.)
    // Split query into keywords and search for each
    const keywords = query.split(/\s+/).filter(k => k.length >= 3);

    for (const keyword of keywords) {
        if (results.length >= limit) break;

        const stillNeeded = limit - results.length;
        const keywordConditions = [
            eq(contents.status, "active"),
            ilike(contents.title, `%${keyword}%`)
        ];

        if (foundIds.size > 0) {
            keywordConditions.push(notInArray(contents.id, Array.from(foundIds)));
        }

        const keywordMatches = await db
            .select()
            .from(contents)
            .where(and(...keywordConditions))
            .orderBy(desc(contents.viewCount))
            .limit(stillNeeded);

        keywordMatches.forEach(m => {
            foundIds.add(m.id);
            results.push(m);
        });
    }

    // 4. Search for dubbing versions (Sulih Suara) of matched titles
    // Extract base title without dubbing suffix and find related versions
    if (results.length > 0 && results.length < limit) {
        const baseTitlePattern = results[0].title
            .replace(/\s*\(Sulih Suara\).*$/i, '')
            .replace(/\s*\(Dubbing\).*$/i, '')
            .trim();

        if (baseTitlePattern.length >= 3) {
            const stillNeeded = limit - results.length;
            const dubbingConditions = [
                eq(contents.status, "active"),
                ilike(contents.title, `%${baseTitlePattern}%`)
            ];

            if (foundIds.size > 0) {
                dubbingConditions.push(notInArray(contents.id, Array.from(foundIds)));
            }

            const dubbingMatches = await db
                .select()
                .from(contents)
                .where(and(...dubbingConditions))
                .orderBy(desc(contents.viewCount))
                .limit(stillNeeded);

            dubbingMatches.forEach(m => {
                foundIds.add(m.id);
                results.push(m);
            });
        }
    }

    return results.slice(0, limit);
}

export async function incrementViewCount(id: string) {
    await db
        .update(contents)
        .set({
            viewCount: sql`${contents.viewCount} + 1`
        })
        .where(eq(contents.id, id));
}

export async function getForHomepageGrouped(limitPerProvider: number = 12) {
    const providers = ["dramabox", "flickreels", "melolo", "netshort"];

    const results = await Promise.all(
        providers.map(async (provider) => {
            const items = await db
                .select()
                .from(contents)
                .where(and(eq(contents.provider, provider), eq(contents.status, "active")))
                .orderBy(desc(contents.viewCount), desc(contents.updatedAt))
                .limit(limitPerProvider);

            return {
                provider,
                items
            };
        })
    );

    return results.filter(r => r.items.length > 0);
}
