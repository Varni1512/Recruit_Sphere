import { Building2 } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background relative overflow-hidden">
            {/* Left Graphic Panel (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 flex-col justify-between p-10 overflow-hidden text-zinc-100">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-0 left-0 right-0 h-full bg-[radial-gradient(circle_800px_at_100%_200px,rgba(120,119,198,0.15),transparent)]"></div>

                {/* Logo and Branding */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-xl">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">Recruit Sphere</span>
                </div>

                {/* Testimonial / Hero Text */}
                <div className="relative z-10 max-w-lg mb-8">
                    <h2 className="text-4xl font-semibold tracking-tight mb-6 leading-tight">
                        Streamline your hiring. <br /> Empower your candidates.
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                        The all-in-one modern applicant tracking system built for speed, collaboration, and a premium candidate experience.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            <img className="w-10 h-10 rounded-full border-2 border-zinc-950" src="https://i.pravatar.cc/100?img=1" alt="Avatar 1" />
                            <img className="w-10 h-10 rounded-full border-2 border-zinc-950" src="https://i.pravatar.cc/100?img=2" alt="Avatar 2" />
                            <img className="w-10 h-10 rounded-full border-2 border-zinc-950" src="https://i.pravatar.cc/100?img=3" alt="Avatar 3" />
                            <img className="w-10 h-10 rounded-full border-2 border-zinc-950" src="https://i.pravatar.cc/100?img=4" alt="Avatar 4" />
                        </div>
                        <div className="text-sm font-medium text-zinc-300">
                            Trusted by 10,000+ recruiters
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-6 sm:p-12 relative bg-background">
                {/* Mobile Logo Only */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Recruit Sphere</span>
                </div>

                <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>

                <div className="w-full max-w-sm xl:max-w-md z-10 mt-12 lg:mt-0">
                    {children}
                </div>
            </div>
        </div>
    )
}
