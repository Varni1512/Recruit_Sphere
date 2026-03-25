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

export function RecentApplications({ applications }: { applications?: any[] }) {
    if (!applications || applications.length === 0) {
        return <div className="text-center p-4 text-muted-foreground">No recent applications found.</div>
    }

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
                {applications.map((app) => (
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
