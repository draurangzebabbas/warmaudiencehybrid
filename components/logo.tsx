"use client";

import Image from "next/image";

export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <LogoIcon className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight text-foreground">
                Warm<span className="text-primary">Audience</span>
            </span>
        </div>
    );
}

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
    return (
        <div className={`relative ${className}`}>
            <Image
                src="/logo.svg"
                alt="WarmAudience Logo"
                title="WarmAudience Logo"
                fill
                className="object-contain"
            />
        </div>
    );
}
