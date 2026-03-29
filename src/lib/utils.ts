import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
export function formatError(error: any): string {
    const message = typeof error === "string" ? error : error?.message || "An unexpected error occurred";

    // Convex/Server error cleanup
    if (message.includes("Limit Reached:")) {
        const match = message.match(/Limit Reached:.*?(?=\s+at|$)/);
        return match ? match[0] : message;
    }

    // Generic cleanup for "Uncaught Error: ..." or similar
    return message
        .replace(/^\[Request ID:.*?\]\s*/i, "")
        .replace(/^Server Error\s*/i, "")
        .replace(/^Uncaught Error:\s*/i, "")
        .replace(/\s+at\s+.*$/, "")
        .trim();
}
