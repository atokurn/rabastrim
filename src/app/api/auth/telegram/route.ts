import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface TelegramAuthData {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

function verifyTelegramAuth(authData: TelegramAuthData, botToken: string): boolean {
    const { hash, ...data } = authData;

    // Create data-check-string (sorted key=value pairs joined by \n)
    const checkString = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key as keyof typeof data]}`)
        .join('\n');

    // Create secret key from bot token
    const secretKey = crypto.createHash('sha256')
        .update(botToken)
        .digest();

    // Calculate HMAC-SHA256
    const hmac = crypto.createHmac('sha256', secretKey)
        .update(checkString)
        .digest('hex');

    // Verify hash matches
    if (hmac !== hash) {
        return false;
    }

    // Check auth_date is recent (within 24 hours)
    const authDate = authData.auth_date * 1000;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (now - authDate > maxAge) {
        return false;
    }

    return true;
}

export async function POST(request: NextRequest) {
    try {
        const authData: TelegramAuthData = await request.json();

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return NextResponse.json(
                { error: "Bot token not configured" },
                { status: 500 }
            );
        }

        // Verify the auth data
        const isValid = verifyTelegramAuth(authData, botToken);

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid authentication" },
                { status: 401 }
            );
        }

        // Auth is valid - return user data
        // In a real app, you'd create a session/JWT here
        const userData = {
            id: `telegram_${authData.id}`,
            name: [authData.first_name, authData.last_name].filter(Boolean).join(' '),
            avatar: authData.photo_url,
            username: authData.username,
            type: 'telegram',
        };

        return NextResponse.json({
            success: true,
            user: userData,
        });

    } catch (error) {
        console.error("Telegram auth error:", error);
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
        );
    }
}
