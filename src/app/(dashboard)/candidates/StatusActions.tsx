"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTransition, useState } from "react"
import { updateApplicationStatus, sendCandidateEmail } from "@/app/actions/jobActions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function StatusActionItem({ 
    stage, 
    candidateId, 
    isDisabled
}: { 
    stage: string, 
    candidateId: string, 
    isDisabled: boolean
}) {
    const [isPending, startTransition] = useTransition();

    return (
        <DropdownMenuItem 
            disabled={isDisabled || isPending}
            className="cursor-pointer"
            onSelect={(e) => {
                e.preventDefault() // prevent closing immediately so we can show "Updating..."
                startTransition(async () => {
                    await updateApplicationStatus(candidateId, stage);
                });
            }}
        >
            {isPending ? "Updating..." : stage}
        </DropdownMenuItem>
    )
}

export function RejectActionItem({ 
    candidateId, 
    isDisabled
}: { 
    candidateId: string, 
    isDisabled: boolean
}) {
    const [isPending, startTransition] = useTransition();

    return (
        <DropdownMenuItem 
            disabled={isDisabled || isPending}
            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            onSelect={(e) => {
                e.preventDefault()
                startTransition(async () => {
                    await updateApplicationStatus(candidateId, "Rejected");
                });
            }}
        >
            {isPending ? "Rejecting..." : "Reject Candidate"}
        </DropdownMenuItem>
    )
}

export function SendEmailActionItem({ 
    candidateId 
}: { 
    candidateId: string
}) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (!message) return;
        startTransition(async () => {
            await sendCandidateEmail(candidateId, message);
            setOpen(false);
            setMessage("");
            alert("Email sent successfully!");
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                    Send Email
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Send Custom Email</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label>Message</Label>
                        <Textarea 
                            placeholder="Write the description of your email..." 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[150px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSend} disabled={isPending || !message}>
                        {isPending ? "Sending..." : "Send Email"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
