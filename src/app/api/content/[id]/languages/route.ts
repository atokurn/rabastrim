import { NextRequest, NextResponse } from "next/server";
import { db, contentLanguages, contents } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getLanguageLabel } from "@/lib/utils/language-utils";

export const dynamic = "force-dynamic";

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/content/[id]/languages
 * 
 * Returns available languages for a content (subtitle and dubbing)
 */
export async function GET(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    if (!id) {
        return NextResponse.json({ error: "Content ID required" }, { status: 400 });
    }

    try {
        // First check if content exists
        const content = await db
            .select({ id: contents.id, provider: contents.provider })
            .from(contents)
            .where(eq(contents.id, id))
            .limit(1);

        if (content.length === 0) {
            return NextResponse.json({ error: "Content not found" }, { status: 404 });
        }

        // Get all languages for this content
        const languages = await db
            .select()
            .from(contentLanguages)
            .where(eq(contentLanguages.contentId, id));

        // Group by type (subtitle/dubbing)
        const subtitles = languages
            .filter(l => l.type === "subtitle")
            .map(l => ({
                code: l.languageCode,
                label: getLanguageLabel(l.languageCode),
                providerLanguageId: l.providerLanguageId,
                isDefault: l.isDefault,
                source: l.source,
            }));

        const dubbing = languages
            .filter(l => l.type === "dubbing")
            .map(l => ({
                code: l.languageCode,
                label: getLanguageLabel(l.languageCode),
                providerLanguageId: l.providerLanguageId,
                isDefault: l.isDefault,
                source: l.source,
            }));

        // Find default languages
        const defaultSubtitle = subtitles.find(s => s.isDefault)?.code ||
            (subtitles.length > 0 ? subtitles[0].code : null);
        const defaultDubbing = dubbing.find(d => d.isDefault)?.code || null;

        // Determine primary source
        const primarySource = languages.length > 0
            ? (languages.find(l => l.isDefault)?.source || languages[0].source || "default")
            : "none";

        return NextResponse.json({
            contentId: id,
            provider: content[0].provider,
            default: {
                subtitle: defaultSubtitle,
                dubbing: defaultDubbing,
            },
            subtitle: subtitles,
            dubbing: dubbing,
            source: primarySource,
        });
    } catch (error) {
        console.error("[Languages API] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch languages", details: String(error) },
            { status: 500 }
        );
    }
}
