"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const COOKIE_NAME = "affiliate_ref";
const COOKIE_DAYS = 30;

function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
}

export function ReferralTracker() {
    const searchParams = useSearchParams();
    const trackClick = useMutation(api.affiliate_program.trackClick);
    const linkReferral = useMutation(api.affiliate_program.linkMyReferral);
    const hasTracked = useRef(false);

    // 1. Capture & Track Clicks (Landing Page)
    useEffect(() => {
        const refCode = searchParams.get("ref");

        // Prevent double tracking in strict mode or re-renders
        if (refCode && !hasTracked.current) {
            hasTracked.current = true;

            // 1. Save to Cookie
            const date = new Date();
            date.setTime(date.getTime() + (COOKIE_DAYS * 24 * 60 * 60 * 1000));
            const expires = "expires=" + date.toUTCString();
            document.cookie = `${COOKIE_NAME}=${refCode};${expires};path=/;SameSite=Lax`;

            // 2. Track Click in Backend (Analytics)
            trackClick({ code: refCode }).catch(console.error);
        }
    }, [searchParams, trackClick]);

    // 2. Attribution Logic (Post-Signup/Login)
    // Always attempt to link if cookie exists.
    // Backend handles Auth check and deduplication (only links new users).
    useEffect(() => {
        // Wait 2s to allow Auth to initialize (since we don't have direct access to auth state here easily)
        const timer = setTimeout(() => {
            const savedCode = getCookie(COOKIE_NAME);
            if (savedCode) {
                linkReferral({ code: savedCode }).catch(() => {
                    // Ignore errors (user might not be logged in, or already linked)
                });
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [linkReferral]);

    return null;
}
