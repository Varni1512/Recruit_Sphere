"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTransition } from "react"
import { updateApplicationStatus } from "@/app/actions/jobActions"

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
