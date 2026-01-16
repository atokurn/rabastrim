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

    console.log(`[Telegram] Sending photo to ${options.chatId}`);
    console.log(`[Telegram] Photo URL: ${options.photoUrl?.substring(0, 80)}...`);

    try {
        // Add timeout for Vercel edge functions
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

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
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: TelegramResponse = await response.json();

        if (!data.ok) {
            console.error("[Telegram] API Error:", data.description, data.error_code);
        } else {
            console.log("[Telegram] Success, message_id:", data.result?.message_id);
        }

        return data;
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Request failed";
        console.error("[Telegram] Request failed:", errorMsg);
        return {
            ok: false,
            description: errorMsg
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
 * Note: Telegram has 1024 character limit for captions
 */
export function formatDramaCaption(drama: DramaNotificationData): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://flysel.fun";
    const lines: string[] = [];

    // Title with link to drama page
    const dramaUrl = `${baseUrl}/watch/${drama.providerContentId}?provider=${drama.provider}`;
    lines.push(`<b>${escapeHtml(drama.title)}</b>`);
    lines.push("");

    // Episode info - simplified to fit 1024 char limit
    if (drama.episodeCount && drama.episodeCount > 0) {
        // Show first few episodes as links, then link to full list
        const maxEpisodesToShow = 10;
        const episodesToShow = Math.min(drama.episodeCount, maxEpisodesToShow);

        lines.push("Episode :");

        const episodeLinks: string[] = [];
        for (let i = 1; i <= episodesToShow; i++) {
            const url = `${baseUrl}/watch/${drama.providerContentId}?ep=${i}&provider=${drama.provider}`;
            episodeLinks.push(`<a href="${url}">EP-${i}</a>`);
        }

        // Join with pipe separator
        lines.push(episodeLinks.join(" | "));

        // Show remaining count with link to drama page
        if (drama.episodeCount > maxEpisodesToShow) {
            const remaining = drama.episodeCount - maxEpisodesToShow;
            lines.push(`<a href="${dramaUrl}">... dan ${remaining} episode lainnya</a>`);
        }
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
