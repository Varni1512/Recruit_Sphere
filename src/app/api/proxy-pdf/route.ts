import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    let url = searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    // Fix HTTP to HTTPS if necessary
    if (url.startsWith('http://res.cloudinary.com')) {
        url = url.replace('http://', 'https://');
    }

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            return new NextResponse("Failed to fetch PDF", { status: response.status });
        }

        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline; filename=\"resume.pdf\"",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
