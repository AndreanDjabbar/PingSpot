import { NextRequest, NextResponse } from "next/server";

export const GET = async(req: NextRequest) => {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
        return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 404 });
        }

        const contentType = response.headers.get("content-type") || "image/jpeg";
        const arrayBuffer = await response.arrayBuffer();

        return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600",
        },
        });
    } catch (error) {
        console.error("Image proxy error:", error);
        return NextResponse.json({ error: "Error fetching image" }, { status: 500 });
    }
}
