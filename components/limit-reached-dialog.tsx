"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IconBolt, IconAlertCircle } from "@tabler/icons-react"
import Link from "next/link"

interface LimitReachedDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description?: string
    limitType: "trackers" | "leads"
    currentLimit: number
}

export function LimitReachedDialog({
    isOpen,
    onOpenChange,
    title = "Limit Reached",
    description,
    limitType,
    currentLimit
}: LimitReachedDialogProps) {
    const defaultDescription = limitType === "trackers" 
        ? `You've reached your limit of ${currentLimit} automated agent(s). Upgrade your plan to monitor more targets simultaneously.`
        : `You've reached your lead storage limit of ${currentLimit.toLocaleString()}. Upgrade your plan to store more leads and keep growing.`;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                        <IconAlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold">{title}</DialogTitle>
                    <DialogDescription className="text-center py-2">
                        {description || defaultDescription}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-center gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="px-6"
                    >
                        Maybe Later
                    </Button>
                    <Button
                        asChild
                        className="px-6 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        <Link href="/#pricing" className="flex items-center gap-2">
                            <IconBolt className="size-4" />
                            Upgrade Plan
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
