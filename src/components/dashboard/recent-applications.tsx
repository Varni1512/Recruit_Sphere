import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const recentApplications = [
    {
        id: "1",
        name: "Olivia Martin",
        email: "olivia.martin@email.com",
        role: "Frontend Developer",
        status: "Interview",
        date: "Today",
        avatar: "OM",
    },
    {
        id: "2",
        name: "Jackson Lee",
        email: "jackson.lee@email.com",
        role: "Senior UX Designer",
        status: "Screening",
        date: "Yesterday",
        avatar: "JL",
    },
    {
        id: "3",
        name: "Isabella Nguyen",
        email: "isabella.nguyen@email.com",
        role: "Product Manager",
        status: "Offer",
        date: "2 days ago",
        avatar: "IN",
    },
    {
        id: "4",
        name: "William Kim",
        email: "will@email.com",
        role: "Backend Engineer",
        status: "Shortlisted",
        date: "3 days ago",
        avatar: "WK",
    },
    {
        id: "5",
        name: "Sofia Davis",
        email: "sofia.davis@email.com",
        role: "Marketing Manager",
        status: "Applied",
        date: "3 days ago",
        avatar: "SD",
    },
]

export function RecentApplications() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recentApplications.map((app) => (
                    <TableRow key={app.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://avatar.vercel.sh/${app.id}.png`} alt={app.name} />
                                    <AvatarFallback>{app.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{app.name}</span>
                                    <span className="text-xs text-muted-foreground">{app.email}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-sm">{app.role}</TableCell>
                        <TableCell>
                            <Badge
                                variant={
                                    app.status === "Offer" ? "default" :
                                        app.status === "Interview" ? "secondary" :
                                            "outline"
                                }
                            >
                                {app.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                            {app.date}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
