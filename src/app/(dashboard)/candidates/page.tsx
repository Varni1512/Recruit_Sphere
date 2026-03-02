import { Eye, Filter, Link as LinkIcon, Mail, MapPin, MoreHorizontal, Search, Star } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

const candidates = [
    {
        id: "1",
        name: "Alex Carter",
        email: "alex.c@example.com",
        role: "Frontend Developer",
        status: "Shortlisted",
        score: 92,
        location: "New York, NY",
        experience: "5 years",
    },
    {
        id: "2",
        name: "Sarah Jenkins",
        email: "sarah.j@example.com",
        role: "UX Designer",
        status: "Interview",
        score: 88,
        location: "San Francisco, CA",
        experience: "4 years",
    },
    {
        id: "3",
        name: "Michael Chen",
        email: "m.chen@example.com",
        role: "Backend Engineer",
        status: "Applied",
        score: 75,
        location: "Remote",
        experience: "3 years",
    },
    {
        id: "4",
        name: "Emily Rodriguez",
        email: "emily.r@example.com",
        role: "Product Manager",
        status: "Offer",
        score: 96,
        location: "Austin, TX",
        experience: "7 years",
    },
    {
        id: "5",
        name: "David Kim",
        email: "dkim@example.com",
        role: "Frontend Developer",
        status: "Screening",
        score: 82,
        location: "Seattle, WA",
        experience: "2 years",
    },
]

export default function CandidatesPage() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
                    <p className="text-muted-foreground">
                        View and manage applications across all jobs.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex w-full max-w-sm items-center space-x-2 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search candidates by name, email..."
                                className="pl-8"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {candidates.map((candidate) => (
                            <TableRow key={candidate.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://avatar.vercel.sh/${candidate.id}.png`} alt={candidate.name} />
                                            <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{candidate.name}</span>
                                            <span className="text-xs text-muted-foreground">{candidate.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">{candidate.role}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {candidate.location}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            candidate.status === "Offer" ? "default" :
                                                candidate.status === "Interview" ? "secondary" :
                                                    candidate.status === "Shortlisted" ? "outline" : "default"
                                        }
                                    >
                                        {candidate.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-medium">{candidate.score}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="ghost" size="icon" className="mr-2">
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View candidate details</span>
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent className="sm:max-w-md w-[400px]">
                                            <SheetHeader>
                                                <div className="flex items-center gap-4 mt-6">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarImage src={`https://avatar.vercel.sh/${candidate.id}.png`} alt={candidate.name} />
                                                        <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <SheetTitle className="text-xl">{candidate.name}</SheetTitle>
                                                        <SheetDescription className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {candidate.location}
                                                        </SheetDescription>
                                                    </div>
                                                </div>
                                            </SheetHeader>
                                            <div className="grid gap-6 py-6">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        {candidate.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                                        <a href="#" className="text-primary hover:underline">LinkedIn Profile</a>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col border rounded-lg p-3 bg-muted/20">
                                                        <span className="text-xs text-muted-foreground">Applied Role</span>
                                                        <span className="font-medium text-sm">{candidate.role}</span>
                                                    </div>
                                                    <div className="flex flex-col border rounded-lg p-3 bg-muted/20">
                                                        <span className="text-xs text-muted-foreground">Experience</span>
                                                        <span className="font-medium text-sm">{candidate.experience}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium mb-3">Resume Score</h4>
                                                    <div className="flex items-center gap-4 border rounded-lg p-4 bg-muted/20">
                                                        <div className="text-3xl font-bold flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                                                            {candidate.score}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">Strong Match</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Candidate has 90% of the required skills and exceeds experience requirements.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center gap-3">
                                                    <Button className="w-full">Schedule Interview</Button>
                                                    <Button variant="outline" className="w-full">Reject</Button>
                                                </div>
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>Send Email</DropdownMenuItem>
                                            <DropdownMenuItem>Move to Next Stage</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">
                                                Reject Candidate
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
