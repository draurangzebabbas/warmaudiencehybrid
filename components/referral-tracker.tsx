"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const COOKIE_NAME = "affiliate_ref";
const COOKIE_DAYS = 30;

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
    return null;
}

function setCookie(name: string, value: string, days: number) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * ReferralTracker — renders null, handles two side effects:
 *
 * 1. On landing: if ?ref=CODE in URL, save to cookie + fire track-click API.
 * 2. On load: if cookie exists and user is logged in, link the referral via API.
 *    This handles the case where a user clicks a ref link, then signs up later.
 */
export function ReferralTracker() {
    const searchParams = useSearchParams();
    const hasTracked = useRef(false);
    const hasLinked = useRef(false);
    const supabase = createClient();

    // Effect 1: Capture ?ref=CODE and track the click
    useEffect(() => {
        const refCode = searchParams.get("ref");
        if (!refCode || hasTracked.current) return;
        hasTracked.current = true;

        // Save to cookie (30-day attribution window)
        setCookie(COOKIE_NAME, refCode, COOKIE_DAYS);

        // Fire-and-forget click tracking
        fetch("/api/affiliate/track-click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: refCode,
                country: null, // Optionally pass from IP geolocation in future
                userAgent: navigator.userAgent,
            }),
        }).catch(() => {}); // Silent — never block UI
    }, [searchParams]);

    // Effect 2: If user is now logged in and has an unlinked referral cookie, link it
    useEffect(() => {
        if (hasLinked.current) return;

        const savedCode = getCookie(COOKIE_NAME);
        if (!savedCode) return;

        const linkIfAuthenticated = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            hasLinked.current = true;

            await fetch("/api/affiliate/link-referral", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    referralCode: savedCode,
                    newUserId: user.id,
                    newUserEmail: user.email,
                }),
            }).catch(() => {});
        };

        // Small delay to let auth settle after page load
        const timer = setTimeout(linkIfAuthenticated, 1500);
        return () => clearTimeout(timer);
    }, [supabase]);

    return null;
}
