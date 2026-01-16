/**
 * Telegram Service
 * 
 * Handles sending notifications to Telegram channel for new dramas.
 * Uses Telegram Bot API sendPhoto method.
 */

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

interface SendPhotoOptions {
    chatId: string;
    photoUrl: string;
    caption: string;
    parseMode?: "HTML" | "Markdown" | "MarkdownV2";
}

interface TelegramResponse {
    ok: boolean;
    result?: {
        message_id: number;
        chat: {
            id: number;
            title: string;
        };
    };
    description?: string;
    error_code?: number;
}

/**
 * Send a photo with caption to Telegram
 */
export async function sendPhoto(options: SendPhotoOptions): Promise<TelegramResponse> {
    const botToken = process.env.TELEGRAM_CHANNEL_BOT_TOKEN;

    if (!botToken) {
        console.error("[Telegram] TELEGRAM_CHANNEL_BOT_TOKEN is not set");
        return { ok: false, description: "Bot token not configured" };
    }

    const url = `${TELEGRAM_API_BASE}${botToken}/sendPhoto`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: options.chatId,
                photo: options.photoUrl,
                caption: options.caption,
                parse_mode: options.parseMode || "HTML",
            }),
        });

        const data: TelegramResponse = await response.json();

        if (!data.ok) {
            console.error("[Telegram] API Error:", data.description);
        }

        return data;
    } catch (error) {
        console.error("[Telegram] Request failed:", error);
        return {
            ok: false,
            description: error instanceof Error ? error.message : "Request failed"
        };
    }
}

export interface DramaNotificationData {
    id: string;  // content ID
    provider: string;
    providerContentId: string;
    title: string;
    posterUrl: string | null;
    episodeCount: number | null;
    tags: string | null;  // JSON string
    contentType?: string | null;
}

/**
 * Send drama notification to Telegram channel
 */
export async function sendDramaNotification(drama: DramaNotificationData): Promise<{
    success: boolean;
    messageId?: number;
    error?: string;
}> {
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!channelId) {
        return { success: false, error: "TELEGRAM_CHANNEL_ID not configured" };
    }

    // Format the caption
    const caption = formatDramaCaption(drama);

    // Check if we have a poster URL
    if (!drama.posterUrl) {
        return { success: false, error: "No poster URL available" };
    }

    const result = await sendPhoto({
        chatId: channelId,
        photoUrl: drama.posterUrl,
        caption: caption,
        parseMode: "HTML",
    });

    if (result.ok && result.result) {
        return { success: true, messageId: result.result.message_id };
    }

    return { success: false, error: result.description || "Unknown error" };
}

/**
 * Format drama data into Telegram caption
 */
export function formatDramaCaption(drama: DramaNotificationData): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rabastrim.vercel.app";
    const lines: string[] = [];

    // Title
    lines.push(`<b>${escapeHtml(drama.title)}</b>`);
    lines.push("");

    // Episode list with links
    if (drama.episodeCount && drama.episodeCount > 0) {
        lines.push("Episode :");

        const episodeLinks: string[] = [];
        for (let i = 1; i <= drama.episodeCount; i++) {
            const url = `${baseUrl}/watch/${drama.provider}/${drama.providerContentId}?ep=${i}`;
            episodeLinks.push(`<a href="${url}">EP-${i}</a>`);
        }

        // Join with pipe separator, breaking lines every 7 episodes for readability
        const chunks: string[] = [];
        for (let i = 0; i < episodeLinks.length; i += 7) {
            chunks.push(episodeLinks.slice(i, i + 7).join(" | "));
        }
        lines.push(chunks.join("\n| "));
        lines.push("");
    }

    // Tags/Hashtags
    const tags = generateTags(drama);
    if (tags.length > 0) {
        lines.push(tags.join(" "));
    }

    return lines.join("\n");
}

/**
 * Generate hashtags from drama data
 */
function generateTags(drama: DramaNotificationData): string[] {
    const tags: string[] = [];

    // Add content type tag
    if (drama.contentType) {
        const typeTag = drama.contentType.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        if (typeTag) {
            tags.push(`#${typeTag}`);
        }
    } else {
        tags.push("#shortdrama");
    }

    // Add provider tag
    tags.push(`#${drama.provider}`);

    // Add tags from database
    if (drama.tags) {
        try {
            const parsedTags: string[] = JSON.parse(drama.tags);
            parsedTags.slice(0, 3).forEach((tag) => {
                const cleanTag = tag.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
                if (cleanTag && !tags.includes(`#${cleanTag}`)) {
                    tags.push(`#${cleanTag}`);
                }
            });
        } catch {
            // Ignore parse errors
        }
    }

    return tags;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
