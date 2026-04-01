import { NextRequest, NextResponse } from "next/server";

function isPdfUrl(url: string) {
    return /\.pdf($|\?)/i.test(url);
}

function normalizeCloudinaryUrl(url: string) {
    return url.startsWith("http://res.cloudinary.com") ? url.replace("http://", "https://") : url;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    let url = searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    url = normalizeCloudinaryUrl(url);

    try {
        const range = request.headers.get("range");
        const response = await fetch(url, {
            headers: range ? { range } : undefined,
        });
        
        if (response.status === 401 && url.includes('cloudinary.com')) {
            return new NextResponse(
                "Access to this PDF is blocked by Cloudinary's security settings for free accounts. Since uploads are now stored locally, please delete this resume and re-upload it to view and download it properly.", 
                { 
                    status: 401, 
                    headers: { "Content-Type": "text/plain" } 
                }
            );
        }

        if (!response.ok) {
            return new NextResponse("Failed to fetch PDF", { status: response.status });
        }

        const buffer = await response.arrayBuffer();
        // Force PDF content type for previews to override Cloudinary's raw stream default
        const contentType = "application/pdf";
        const fileNameFromUrl = url.split("/").pop()?.split("?")[0] || "resume.pdf";
        const contentDisposition = `inline; filename="${fileNameFromUrl.endsWith('.pdf') ? fileNameFromUrl : fileNameFromUrl + '.pdf'}"`;
        const contentRange = response.headers.get("content-range");
        const acceptRanges = response.headers.get("accept-ranges");
        const contentLength = response.headers.get("content-length");

        const status = response.status === 206 ? 206 : 200;

        return new NextResponse(buffer, {
            status,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": contentDisposition,
                ...(contentRange ? { "Content-Range": contentRange } : {}),
                ...(contentLength ? { "Content-Length": contentLength } : {}),
                ...(acceptRanges ? { "Accept-Ranges": acceptRanges } : { "Accept-Ranges": "bytes" }),
                // Avoid caching blank/error previews while debugging and during frequent updates.
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
