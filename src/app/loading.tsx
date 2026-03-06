import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-sm fixed inset-0 z-50">
            <div className="flex flex-col items-center gap-4 text-primary">
                <Loader2 className="h-12 w-12 animate-spin" />
                <h2 className="text-xl font-semibold tracking-tight">Loading Recruit Sphere...</h2>
            </div>
        </div>
    )
}
