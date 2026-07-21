"use client"

import {
    Dialog,
    DialogContent,
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
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border/60 shadow-2xl gap-0">


                <div className="flex flex-col items-center text-center px-8 pt-8 pb-8 gap-5">
                    {/* Icon */}
                    <div className="relative flex items-center justify-center">
                        <div className="absolute rounded-full bg-red-500/20 blur-xl h-16 w-16 scale-150" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
                            <IconAlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-[300px] mx-auto">
                            {description || defaultDescription}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-border/50" />

                    {/* Buttons - fully centered, equal width */}
                    <div className="flex items-center gap-3 w-full">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-10"
                        >
                            Maybe Later
                        </Button>
                        <Button
                            asChild
                            className="flex-1 h-10 font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                        >
                            <Link href="/#pricing" className="flex items-center justify-center gap-2">
                                <IconBolt className="size-4" />
                                Upgrade Plan
                            </Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
