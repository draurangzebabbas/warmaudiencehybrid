"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    IconExternalLink,
    IconRefresh,
    IconCircleCheckFilled,
    IconClock,
    IconLayoutColumns,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconSearch,
    IconX,
    IconTrash,
    IconDownload,
    IconFilter,
    IconDotsVertical,
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandX,
    IconBrandTiktok,
    IconMapPin,
    IconBrandGoogleMaps,
    IconCopy,
    IconClipboardCheck,
    IconBadgeFilled
} from "@tabler/icons-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState
} from "@tanstack/react-table";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase, getAuthenticatedSupabaseClient } from "@/src/lib/supabase";
import { useEffect } from "react";

// --- Types ---

type PersonalProfile = {
    _id: string;
    supabaseId?: string; // New: Supabase ID
    linkedinUrl: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    profilePic?: string;
    headline?: string;
    email?: string;
    location?: any;
    city?: string;
    country?: string;
    followers?: number;
    connections?: number;
    companyName?: string;
    isPremium?: boolean;
    isInfluencer?: boolean;
    openToWork?: boolean;
    isVerified?: boolean;
    updatedAt: number;
    about?: string;
    tags?: string[];
    junctionId: any;
};

type CompanyProfile = {
    _id: string;
    supabaseId?: string; // New: Supabase ID
    linkedinUrl: string;
    companyName?: string;
    logoUrl?: string;
    websiteUrl?: string;
    description?: string;
    employeeCount?: number;
    followerCount?: number;
    city?: string;
    country?: string;
    isVerified?: boolean;
    updatedAt: number;
    tags?: string[];
    junctionId: any;
};

type GoogleMapsLead = {
    junctionId: any;
    googleMapsId?: string;
    url: string;
    title?: string;
    totalScore?: number;
    reviewsCount?: number;
    phone?: string;
    emails?: string[];
    city?: string;
    website?: string;
    address?: string;
    socials?: any;
    imageUrl?: string;
    tags?: string[];
    updatedAt: number;
};

type WebsiteContact = {
    junctionId: any;
    domain: string;
    emails?: string[];
    phones?: string[];
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    pinterest?: string;
    sourceUrls?: string[];
    socials?: any;
    updatedAt: number;
    tags?: string[];
    _id: string;
    extraData?: any;
};

type InstagramLead = {
    _id: string;
    junctionId: any;
    username: string;
    fullName?: string;
    profilePicUrl?: string;
    biography?: string;
    externalUrl?: string;
    email?: string;
    phone?: string;
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
    isBusinessAccount?: boolean;
    isVerified?: boolean;
    isPrivate?: boolean;
    cityName?: string;
    publicEmail?: string;
    publicPhoneNumber?: string;
    socials?: any;
    updatedAt: number;
    tags?: string[];
    reelsCount?: number;
    medianViews?: number;
    viewsFollowersRatio?: string;
    medianEr?: string;
    quality?: string;
    lastPostDays?: number;
    category?: string;
    isProfessionalAccount?: boolean;
    highlightReelCount?: number;
    mutualFollow?: boolean;
    detectedLanguage?: string;
    facebookId?: string;
    bioLinks?: any[];
    allEmails?: string[];
    allPhones?: string[];
    businessContactMethod?: string;
    hasChannel?: boolean;
    businessCategory?: string;
    overallCategory?: string;
    pronouns?: string[];
    extraData?: any;
};

// --- Page Component ---

export default function ProfilesPage() {
    const user = useQuery(api.auth.getCurrentUser);
    const getToken = useAction(api.actions.supabaseAuth.getSupabaseToken);

    // --- Helper hook for Supabase fetching ---
    function useLeadsFromSupabase(userId: string | undefined, profileType: string) {
        const [leads, setLeads] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);
        const [refreshKey, setRefreshKey] = useState(0);

        const refresh = () => setRefreshKey(prev => prev + 1);

        useEffect(() => {
            if (!userId) return;
            setLoading(true);

            getToken().then((token) => {
                if (!token) {
                    setLoading(false);
                    return;
                }

                const secureClient = getAuthenticatedSupabaseClient(token);

                secureClient
                    .from("user_leads")
                    .select(`
                        id,
                        tags,
                        created_at,
                        personal: linkedin_profiles (*),
                        company: company_profiles (*),
                        google_maps: google_maps_leads (*),
                        website_contact: website_contacts (*),
                        instagram: instagram_leads (*),
                        x: x_leads (*)
                    `)
                    .eq("user_id", userId)
                    .eq("profile_type", profileType)
                    .order("created_at", { ascending: false })
                    .then(({ data, error }) => {
                        if (error) {
                            console.error("Supabase fetch error:", error);
                            setLoading(false);
                            return;
                        }
                        if (data) {
                            const formatted = data
                                .map(d => {
                                    const detailsRaw = d.personal || d.company || d.google_maps || d.website_contact || d.instagram || d.x;
                                    if (!detailsRaw) return null;
                                    const details = Array.isArray(detailsRaw) ? detailsRaw[0] : detailsRaw;
                                    if (!details) return null;
                                    if (profileType === "personal") {
                                        return {
                                            ...details,
                                            linkedinUrl: details.linkedin_url,
                                            publicIdentifier: details.public_identifier,
                                            firstName: details.first_name,
                                            lastName: details.last_name,
                                            fullName: details.full_name,
                                            companyName: details.company_name,
                                            jobTitle: details.job_title,
                                            isPremium: details.is_premium,
                                            isInfluencer: details.is_influencer,
                                            openToWork: details.open_to_work,
                                            isVerified: details.is_verified,
                                            profilePic: details.profile_pic,
                                            updatedAt: new Date(details.updated_at || d.created_at).getTime(),
                                            tags: d.tags,
                                            junctionId: d.id,
                                            _id: d.id
                                        };
                                    } else if (profileType === "company") {
                                        return {
                                            ...details,
                                            companyName: details.company_name,
                                            linkedinUrl: details.linkedin_url,
                                            websiteUrl: details.website_url,
                                            logoUrl: details.logo_url,
                                            employeeCount: details.employee_count,
                                            employeeCountRange: details.employee_count_range,
                                            followerCount: details.follower_count,
                                            isVerified: details.is_verified,
                                            updatedAt: new Date(details.updated_at || d.created_at).getTime(),
                                            tags: d.tags,
                                            junctionId: d.id,
                                            _id: d.id
                                        };
                                    } else if (profileType === "website_contact") {
                                        let socials = details.socials;
                                        if (typeof socials === 'string') {
                                            try { socials = JSON.parse(socials); } catch (e) { socials = {}; }
                                        }
                                        return {
                                            ...details,
                                            socials,
                                            sourceUrls: details.source_urls || [],
                                            extraData: details.extra_data || {},
                                            updatedAt: new Date(details.updated_at || d.created_at).getTime(),
                                            tags: d.tags,
                                            junctionId: d.id,
                                            _id: d.id
                                        };
                                    } else if (profileType === "google_maps") {
                                        let socials = details.socials;
                                        if (typeof socials === 'string') {
                                            try { socials = JSON.parse(socials); } catch (e) { socials = {}; }
                                        }
                                        return {
                                            ...details,
                                            socials,
                                            totalScore: details.total_score || details.totalScore,
                                            reviewsCount: details.reviews_count || details.reviewsCount,
                                            imageUrl: details.image_url || details.imageUrl,
                                            placeId: details.place_id || details.placeId,
                                            updatedAt: new Date(details.updated_at || d.created_at).getTime(),
                                            tags: d.tags,
                                            junctionId: d.id,
                                            _id: d.id
                                        };
                                    } else if (profileType === "x") {
                                        return {
                                            ...details,
                                            fullName: details.full_name,
                                            profilePicUrl: details.profile_pic_url,
                                            externalUrl: details.external_url,
                                            followersCount: details.followers_count,
                                            followingCount: details.following_count,
                                            tweetsCount: details.tweets_count,
                                            mediaCount: details.media_count,
                                            verifiedType: details.verified_type,
                                            isProtected: details.is_protected,
                                            accountCreatedAt: details.account_created_at,
                                            url: details.url,
                                            foundFor: details.found_for,
                                            isVerified: details.is_verified,
                                            isBlueVerified: details.is_blue_verified,
                                            extraData: details.extra_data,
                                            updatedAt: new Date(details.updated_at || d.created_at).getTime(),
                                            tags: d.tags,
                                            junctionId: d.id,
                                            _id: d.id
                                        };
                                    } else { // instagram
                                        let socials = details.socials;
                                        if (typeof socials === 'string') {
                                            try { socials = JSON.parse(socials); } catch (e) { socials = {}; }
                                        }
                                        return {
                                            ...details,
                                            socials,
                                            fullName: details.full_name,
                                            profilePicUrl: details.profile_pic_url,
                                            externalUrl: details.external_url,
                                            followersCount: details.followers_count,
                                            followingCount: details.following_count,
                                            postsCount: details.posts_count,
                                            isBusinessAccount: details.is_business_account,
                                            isVerified: details.is_verified,
                                            isPrivate: details.is_private,
                                            cityName: details.city_name,
                                            publicEmail: details.public_email,
                                            publicPhoneNumber: details.public_phone_number,
                                            reelsCount: details.reels_count,
                                            medianViews: details.median_views,
                                            viewsFollowersRatio: details.views_followers_ratio,
                                            medianEr: details.median_er,
                                            quality: details.quality,
                                            lastPostDays: details.last_post_days,
                                            category: details.category,
                                            isProfessionalAccount: details.is_professional_account,
                                            highlightReelCount: details.highlight_reel_count,
                                            mutualFollow: details.mutual_follow,
                                            detectedLanguage: details.detected_language,
                                            facebookId: details.facebook_id,
                                            bioLinks: details.bio_links,
                                            allEmails: details.all_emails,
                                            allPhones: details.all_phones,
                                            businessContactMethod: details.business_contact_method,
                                            hasChannel: details.has_channel,
                                            businessCategory: details.business_category,
                                            overallCategory: details.overall_category,
                                            pronouns: details.pronouns,
                                            extraData: details.extra_data,
                                            updatedAt: new Date(details.updated_at || d.created_at).getTime(),
                                            tags: d.tags,
                                            junctionId: d.id,
                                            _id: d.id
                                        };
                                    }
                                })
                                .filter(Boolean);
                            setLeads(formatted);
                        }
                        setLoading(false);
                    });
            });
        }, [userId, profileType, refreshKey]);

        return { leads, loading, refresh };
    }

    // --- State & Mutations ---
    const { leads: personal, loading: loadingPersonal } = useLeadsFromSupabase(user?._id, "personal");
    const { leads: company, loading: loadingCompany } = useLeadsFromSupabase(user?._id, "company");
    const { leads: googleMaps, loading: loadingGoogleMaps } = useLeadsFromSupabase(user?._id, "google_maps");
    const { leads: websiteContacts, loading: loadingWebsiteContacts, refresh: refreshWebsiteContacts } = useLeadsFromSupabase(user?._id, "website_contact");
    const { leads: instagramLeads, loading: loadingInstagramLeads } = useLeadsFromSupabase(user?._id, "instagram");
    const { leads: xLeads, loading: loadingXLeads, refresh: refreshXLeads } = useLeadsFromSupabase(user?._id, "x");

    const getOrCreateKey = useAction(api.actions.supabase.getOrCreateWebhookKey);



    // --- Filter State ---
    const [personalFilters, setPersonalFilters] = useState({
        hasEmail: "all" as "all" | "yes" | "no",
        hasAbout: "all" as "all" | "yes" | "no",
        hasHeadline: "all" as "all" | "yes" | "no",
        hasProfilePic: "all" as "all" | "yes" | "no",
        minConnections: 0,
        maxConnections: 1000000,
        minFollowers: 0,
        maxFollowers: 10000000,
        location: "",
        tags: "",
        isPremium: "all" as "all" | "yes" | "no",
        isInfluencer: "all" as "all" | "yes" | "no",
        isOpenToWork: "all" as "all" | "yes" | "no",
        isVerified: "all" as "all" | "yes" | "no",
    });

    const [companyFilters, setCompanyFilters] = useState({
        hasWebsite: "all" as "all" | "yes" | "no",
        hasLogo: "all" as "all" | "yes" | "no",
        hasDescription: "all" as "all" | "yes" | "no",
        minEmployees: 0,
        maxEmployees: 1000000,
        minFollowers: 0,
        maxFollowers: 10000000,
        location: "",
        tags: "",
        isVerified: "all" as "all" | "yes" | "no",
    });

    const [googleMapsFilters, setGoogleMapsFilters] = useState({
        hasEmail: "all" as "all" | "yes" | "no",
        hasPhone: "all" as "all" | "yes" | "no",
        hasWebsite: "all" as "all" | "yes" | "no",
        hasInstagram: "all" as "all" | "yes" | "no",
        hasTikTok: "all" as "all" | "yes" | "no",
        hasFacebook: "all" as "all" | "yes" | "no",
        hasTwitter: "all" as "all" | "yes" | "no",
        hasLinkedIn: "all" as "all" | "yes" | "no",
        minScore: 0,
        minReviews: 0,
        location: "",
        tags: "",
    });

    const [websiteContactsFilters, setWebsiteContactsFilters] = useState({
        hasEmail: "all" as "all" | "yes" | "no",
        hasPhone: "all" as "all" | "yes" | "no",
        hasInstagram: "all" as "all" | "yes" | "no",
        hasTikTok: "all" as "all" | "yes" | "no",
        hasFacebook: "all" as "all" | "yes" | "no",
        hasTwitter: "all" as "all" | "yes" | "no",
        hasLinkedIn: "all" as "all" | "yes" | "no",
        tags: "",
    });

    const [instagramFilters, setInstagramFilters] = useState({
        hasEmail: "all" as "all" | "yes" | "no",
        hasPhone: "all" as "all" | "yes" | "no",
        minFollowers: 0,
        maxFollowers: 10000000,
        minFollowing: 0,
        maxFollowing: 10000000,
        isVerified: "all" as "all" | "yes" | "no",
        isBusinessAccount: "all" as "all" | "yes" | "no",
        isProfessionalAccount: "all" as "all" | "yes" | "no",
        isPrivate: "all" as "all" | "yes" | "no",
        mutualFollow: "all" as "all" | "yes" | "no",
        hasChannel: "all" as "all" | "yes" | "no",
        quality: "all" as "all" | "Good" | "Average" | "Bad",
        hasWebsite: "all" as "all" | "yes" | "no",
        hasExternalUrl: "all" as "all" | "yes" | "no",
        minPosts: 0,
        minReels: 0,
        minER: 0,
        minViews: 0,
        maxLastPostDays: 0,
        location: "",
        tags: "",
    });

    const [xFilters, setXFilters] = useState({
        hasEmail: "all" as "all" | "yes" | "no",
        hasPhone: "all" as "all" | "yes" | "no",
        hasWebsite: "all" as "all" | "yes" | "no",
        isVerified: "all" as "all" | "yes" | "no",
        isProtected: "all" as "all" | "yes" | "no",
        minFollowers: 0,
        maxFollowers: 10000000,
        minFollowing: 0,
        maxFollowing: 10000000,
        minTweets: 0,
        maxTweets: 10000000,
        minMedia: 0,
        maxMedia: 10000000,
        joinedBefore: "",
        joinedAfter: "",
        location: "",
        tags: "",
    });
    
    const [selectedInstagramLead, setSelectedInstagramLead] = useState<InstagramLead | null>(null);

    // --- Handlers ---
    const handleDeleteProfile = async (id: any) => {
        if (!confirm("Are you sure you want to remove this lead from your list? (Global data will be preserved)")) return;
        try {
            const token = await getToken();
            if (!token) throw new Error("Unauthorized");
            const secureClient = getAuthenticatedSupabaseClient(token);

            const { error } = await secureClient
                .from("user_leads")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Lead removed");
            window.location.reload();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleUpdateWebsiteContact = async (domain: string) => {
        try {
            toast.loading(`Updating data for ${domain}...`, { id: 'update-contact' });
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/update-website-contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ domain })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Data updated for ${domain}`, { id: 'update-contact' });
                refreshWebsiteContacts();
            } else {
                toast.error(data.error || 'Failed to update data', { id: 'update-contact' });
            }
        } catch (error) {
            toast.error('Connection error', { id: 'update-contact' });
        }
    };

    const handleUpdateProfile = async (url: string) => {
        try {
            toast.info("Queueing update...");
            const apiData = await getOrCreateKey();
            if (!apiData?.key) throw new Error("Could not retrieve API Key");

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-linkedin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiData.key}`
                },
                body: JSON.stringify({ profileUrls: [url] })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Update failed");
            }
            toast.success("Profile update queued");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleUpdateXProfile = async (username: string) => {
        try {
            toast.info("Queueing update...");
            const apiData = await getOrCreateKey();
            if (!apiData?.key) throw new Error("Could not retrieve API Key");

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-x-profiles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiData.key}`
                },
                body: JSON.stringify({ usernames: [username] })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Update failed");
            }
            toast.success("X profile update queued");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    // --- Filtered Data ---
    const filteredPersonal = useMemo(() => {
        return personal.filter((p) => {
            if (personalFilters.hasEmail === "yes" && !p.email) return false;
            if (personalFilters.hasEmail === "no" && p.email) return false;
            if (personalFilters.hasAbout === "yes" && !p.about) return false;
            if (personalFilters.hasAbout === "no" && p.about) return false;
            if (personalFilters.hasHeadline === "yes" && !p.headline) return false;
            if (personalFilters.hasHeadline === "no" && p.headline) return false;
            if (personalFilters.hasProfilePic === "yes" && !p.profilePic) return false;
            if (personalFilters.hasProfilePic === "no" && p.profilePic) return false;

            const connections = p.connections || 0;
            if (connections < personalFilters.minConnections) return false;
            if (personalFilters.maxConnections > 0 && connections > personalFilters.maxConnections) return false;

            const followers = p.followers || 0;
            if (followers < personalFilters.minFollowers) return false;
            if (personalFilters.maxFollowers > 0 && followers > personalFilters.maxFollowers) return false;

            if (personalFilters.location) {
                const loc = (p.country || p.location?.country || "").toLowerCase();
                const city = (p.city || p.location?.city || "").toLowerCase();
                const q = personalFilters.location.toLowerCase();
                if (!loc.includes(q) && !city.includes(q)) return false;
            }

            if (personalFilters.tags) {
                const q = personalFilters.tags.toLowerCase();
                const hasMatch = (p.tags || []).some((t: string) => t.toLowerCase().includes(q));
                if (!hasMatch) return false;
            }

            if (personalFilters.isPremium === "yes" && !p.isPremium) return false;
            if (personalFilters.isPremium === "no" && p.isPremium) return false;
            if (personalFilters.isInfluencer === "yes" && !p.isInfluencer) return false;
            if (personalFilters.isInfluencer === "no" && p.isInfluencer) return false;
            if (personalFilters.isOpenToWork === "yes" && !p.openToWork) return false;
            if (personalFilters.isOpenToWork === "no" && p.openToWork) return false;
            if (personalFilters.isVerified === "yes" && !p.isVerified) return false;
            if (personalFilters.isVerified === "no" && p.isVerified) return false;

            return true;
        });
    }, [personal, personalFilters]);

    const filteredCompany = useMemo(() => {
        return company.filter((c) => {
            if (companyFilters.hasWebsite === "yes" && !c.websiteUrl) return false;
            if (companyFilters.hasWebsite === "no" && c.websiteUrl) return false;
            if (companyFilters.hasLogo === "yes" && !c.logoUrl) return false;
            if (companyFilters.hasLogo === "no" && c.logoUrl) return false;
            if (companyFilters.hasDescription === "yes" && !c.description) return false;
            if (companyFilters.hasDescription === "no" && c.description) return false;

            const employees = c.employeeCount || 0;
            if (employees < companyFilters.minEmployees) return false;
            if (companyFilters.maxEmployees > 0 && employees > companyFilters.maxEmployees) return false;

            const followers = c.followerCount || 0;
            if (followers < companyFilters.minFollowers) return false;
            if (companyFilters.maxFollowers > 0 && followers > companyFilters.maxFollowers) return false;

            if (companyFilters.location) {
                const loc = (c.country || "").toLowerCase();
                const city = (c.city || "").toLowerCase();
                const q = companyFilters.location.toLowerCase();
                if (!loc.includes(q) && !city.includes(q)) return false;
            }

            if (companyFilters.tags) {
                const q = companyFilters.tags.toLowerCase();
                const hasMatch = (c.tags || []).some((t: string) => t.toLowerCase().includes(q));
                if (!hasMatch) return false;
            }

            if (companyFilters.isVerified === "yes" && !c.isVerified) return false;
            if (companyFilters.isVerified === "no" && c.isVerified) return false;

            return true;
        });
    }, [company, companyFilters]);

    const filteredGoogleMaps = useMemo(() => {
        return googleMaps.filter((g) => {
            if (googleMapsFilters.hasEmail === "yes" && (!g.emails || g.emails.length === 0)) return false;
            if (googleMapsFilters.hasEmail === "no" && g.emails && g.emails.length > 0) return false;
            if (googleMapsFilters.hasPhone === "yes" && !g.phone) return false;
            if (googleMapsFilters.hasPhone === "no" && g.phone) return false;
            if (googleMapsFilters.hasWebsite === "yes" && !g.website) return false;
            if (googleMapsFilters.hasWebsite === "no" && g.website) return false;
            if (googleMapsFilters.hasInstagram === "yes" && !g.socials?.instagram) return false;
            if (googleMapsFilters.hasInstagram === "no" && g.socials?.instagram) return false;
            if (googleMapsFilters.hasTikTok === "yes" && !g.socials?.tiktok) return false;
            if (googleMapsFilters.hasTikTok === "no" && g.socials?.tiktok) return false;
            if (googleMapsFilters.hasFacebook === "yes" && !g.socials?.facebook) return false;
            if (googleMapsFilters.hasFacebook === "no" && g.socials?.facebook) return false;
            if (googleMapsFilters.hasTwitter === "yes" && !g.socials?.twitter) return false;
            if (googleMapsFilters.hasTwitter === "no" && g.socials?.twitter) return false;
            if (googleMapsFilters.hasLinkedIn === "yes" && !g.socials?.linkedin) return false;
            if (googleMapsFilters.hasLinkedIn === "no" && g.socials?.linkedin) return false;

            if (g.totalScore && g.totalScore < googleMapsFilters.minScore) return false;
            if (g.reviewsCount && g.reviewsCount < googleMapsFilters.minReviews) return false;
            if (googleMapsFilters.location && !g.city?.toLowerCase().includes(googleMapsFilters.location.toLowerCase())) return false;

            if (googleMapsFilters.tags) {
                const q = googleMapsFilters.tags.toLowerCase();
                const hasMatch = (g.tags || []).some((t: string) => t.toLowerCase().includes(q));
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [googleMaps, googleMapsFilters]);

    const filteredWebsiteContacts = useMemo(() => {
        return websiteContacts.filter((w) => {
            if (websiteContactsFilters.hasEmail === "yes" && (!w.emails || w.emails.length === 0)) return false;
            if (websiteContactsFilters.hasEmail === "no" && w.emails && w.emails.length > 0) return false;
            if (websiteContactsFilters.hasPhone === "yes" && (!w.phones || w.phones.length === 0)) return false;
            if (websiteContactsFilters.hasPhone === "no" && w.phones && w.phones.length > 0) return false;

            if (websiteContactsFilters.hasInstagram === "yes" && !w.socials?.instagram) return false;
            if (websiteContactsFilters.hasInstagram === "no" && w.socials?.instagram) return false;
            if (websiteContactsFilters.hasTikTok === "yes" && !w.socials?.tiktok) return false;
            if (websiteContactsFilters.hasTikTok === "no" && w.socials?.tiktok) return false;
            if (websiteContactsFilters.hasFacebook === "yes" && !w.socials?.facebook) return false;
            if (websiteContactsFilters.hasFacebook === "no" && w.socials?.facebook) return false;
            if (websiteContactsFilters.hasTwitter === "yes" && !w.socials?.twitter) return false;
            if (websiteContactsFilters.hasTwitter === "no" && w.socials?.twitter) return false;
            if (websiteContactsFilters.hasLinkedIn === "yes" && !w.socials?.linkedin) return false;
            if (websiteContactsFilters.hasLinkedIn === "no" && w.socials?.linkedin) return false;

            if (websiteContactsFilters.tags) {
                const q = websiteContactsFilters.tags.toLowerCase();
                const hasMatch = (w.tags || []).some((t: string) => t.toLowerCase().includes(q));
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [websiteContacts, websiteContactsFilters]);

    const filteredInstagram = useMemo(() => {
        return instagramLeads.filter((ig) => {
            if (instagramFilters.hasEmail === "yes" && !ig.email && !ig.publicEmail) return false;
            if (instagramFilters.hasEmail === "no" && (ig.email || ig.publicEmail)) return false;
            if (instagramFilters.hasPhone === "yes" && !ig.phone && !ig.publicPhoneNumber) return false;
            if (instagramFilters.hasPhone === "no" && (ig.phone || ig.publicPhoneNumber)) return false;

            const followers = ig.followersCount || 0;
            if (followers < instagramFilters.minFollowers) return false;
            if (instagramFilters.maxFollowers > 0 && followers > instagramFilters.maxFollowers) return false;

            const following = ig.followingCount || 0;
            if (following < instagramFilters.minFollowing) return false;
            if (instagramFilters.maxFollowing > 0 && following > instagramFilters.maxFollowing) return false;

            if (instagramFilters.isVerified === "yes" && !ig.isVerified) return false;
            if (instagramFilters.isVerified === "no" && ig.isVerified) return false;
            if (instagramFilters.isBusinessAccount === "yes" && !ig.isBusinessAccount) return false;
            if (instagramFilters.isBusinessAccount === "no" && ig.isBusinessAccount) return false;
            if (instagramFilters.isPrivate === "yes" && !ig.isPrivate) return false;
            if (instagramFilters.isPrivate === "no" && ig.isPrivate) return false;
            if (instagramFilters.isProfessionalAccount === "yes" && !ig.isProfessionalAccount) return false;
            if (instagramFilters.isProfessionalAccount === "no" && ig.isProfessionalAccount) return false;
            if (instagramFilters.mutualFollow === "yes" && !ig.mutualFollow) return false;
            if (instagramFilters.mutualFollow === "no" && ig.mutualFollow) return false;
            if (instagramFilters.hasChannel === "yes" && !ig.hasChannel) return false;
            if (instagramFilters.hasChannel === "no" && ig.hasChannel) return false;
            
            if (instagramFilters.hasWebsite === "yes" && !ig.externalUrl && (!ig.bioLinks || ig.bioLinks.length === 0)) return false;
            if (instagramFilters.hasWebsite === "no" && (ig.externalUrl || (ig.bioLinks && ig.bioLinks.length > 0))) return false;
            
            if (instagramFilters.hasExternalUrl === "yes" && (!ig.bioLinks || ig.bioLinks.length === 0)) return false;
            if (instagramFilters.hasExternalUrl === "no" && ig.bioLinks && ig.bioLinks.length > 0) return false;

            if ((ig.postsCount || 0) < instagramFilters.minPosts) return false;
            if ((ig.reelsCount || 0) < instagramFilters.minReels) return false;
            if (instagramFilters.minViews > 0 && (ig.medianViews || 0) < instagramFilters.minViews) return false;
            
            if (instagramFilters.minER > 0) {
                const erValue = typeof ig.medianEr === 'string' ? parseFloat(ig.medianEr.replace('%', '')) : (ig.medianEr || 0);
                if (erValue < instagramFilters.minER) return false;
            }

            if (instagramFilters.maxLastPostDays > 0) {
                if (ig.lastPostDays === null || ig.lastPostDays === undefined || ig.lastPostDays > instagramFilters.maxLastPostDays) return false;
            }

            if (instagramFilters.quality !== "all") {
                if (ig.quality !== instagramFilters.quality) return false;
            }

            if (instagramFilters.location) {
                const city = (ig.cityName || "").toLowerCase();
                const street = (ig.addressStreet || "").toLowerCase();
                const q = instagramFilters.location.toLowerCase();
                if (!city.includes(q) && !street.includes(q)) return false;
            }

            if (instagramFilters.tags) {
                const q = instagramFilters.tags.toLowerCase();
                const hasMatch = (ig.tags || []).some((t: string) => t.toLowerCase().includes(q));
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [instagramLeads, instagramFilters]);

    const filteredX = useMemo(() => {
        return xLeads.filter((xProfile) => {
            const followers = xProfile.followersCount || 0;
            if (followers < xFilters.minFollowers) return false;
            if (xFilters.maxFollowers > 0 && followers > xFilters.maxFollowers) return false;

            const following = xProfile.followingCount || 0;
            if (following < xFilters.minFollowing) return false;
            if (xFilters.maxFollowing > 0 && following > xFilters.maxFollowing) return false;

            const tweets = xProfile.tweetsCount || 0;
            if (tweets < xFilters.minTweets) return false;
            if (xFilters.maxTweets > 0 && tweets > xFilters.maxTweets) return false;

            const media = xProfile.mediaCount || 0;
            if (media < xFilters.minMedia) return false;
            if (xFilters.maxMedia > 0 && media > xFilters.maxMedia) return false;

            if (xFilters.joinedBefore || xFilters.joinedAfter) {
                const createdAtStr = xProfile.accountCreatedAt || xProfile.createdAt;
                if (createdAtStr) {
                    const createdDate = new Date(createdAtStr).getTime();
                    if (xFilters.joinedAfter) {
                        const afterDate = new Date(xFilters.joinedAfter).getTime();
                        if (createdDate < afterDate) return false;
                    }
                    if (xFilters.joinedBefore) {
                        const beforeDate = new Date(xFilters.joinedBefore).getTime();
                        if (createdDate > beforeDate) return false;
                    }
                }
            }

            if (xFilters.isVerified === "yes" && !xProfile.isVerified) return false;
            if (xFilters.isVerified === "no" && xProfile.isVerified) return false;

            if (xFilters.isProtected === "yes" && !xProfile.isProtected) return false;
            if (xFilters.isProtected === "no" && xProfile.isProtected) return false;

            if (xFilters.hasEmail === "yes" && !xProfile.email) return false;
            if (xFilters.hasEmail === "no" && xProfile.email) return false;

            if (xFilters.hasPhone === "yes" && !xProfile.phone) return false;
            if (xFilters.hasPhone === "no" && xProfile.phone) return false;

            if (xFilters.hasWebsite === "yes" && !xProfile.externalUrl) return false;
            if (xFilters.hasWebsite === "no" && xProfile.externalUrl) return false;

            if (xFilters.location) {
                const loc = (xProfile.location || "").toLowerCase();
                const q = xFilters.location.toLowerCase();
                if (!loc.includes(q)) return false;
            }

            if (xFilters.tags) {
                const q = xFilters.tags.toLowerCase();
                const hasMatch = (xProfile.tags || []).some((t: string) => t.toLowerCase().includes(q));
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [xLeads, xFilters]);

    // --- Column Definitions ---
    const personalColumns = useMemo<ColumnDef<PersonalProfile>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "profilePic",
            header: "Profile",
            cell: ({ row }) => (
                <Avatar className="h-9 w-9">
                    <AvatarImage src={row.original.profilePic || undefined} alt={row.original.fullName} />
                    <AvatarFallback>{row.original.fullName?.slice(0, 2) || "NA"}</AvatarFallback>
                </Avatar>
            ),
        },
        {
            accessorKey: "fullName",
            header: "Full Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <a 
                        href={row.original.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium hover:underline hover:text-primary transition-colors"
                    >
                        {row.original.fullName || "Unknown"}
                    </a>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{row.original.headline}</span>
                </div>
            ),
        },
        {
            id: "badges",
            header: "Badges",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.isVerified && <IconCircleCheckFilled className="size-4 text-blue-500" title="Verified" />}
                    {row.original.isPremium && <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px] h-4 px-1">PREMIUM</Badge>}
                    {row.original.isInfluencer && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] h-4 px-1">INFLUENCER</Badge>}
                    {row.original.openToWork && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] h-4 px-1">OPEN TO WORK</Badge>}
                </div>
            )
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => row.original.email || <span className="text-muted-foreground text-xs">N/A</span>,
        },
        {
            accessorKey: "country",
            header: "Location",
            cell: ({ row }) => (
                <div className="flex flex-col text-xs">
                    <span>{row.original.city || row.original.location?.city}</span>
                    <span className="text-muted-foreground">{row.original.country || row.original.location?.country}</span>
                </div>
            ),
        },
        {
            accessorKey: "followers",
            header: "Followers",
            cell: ({ row }) => row.original.followers?.toLocaleString() || "-",
        },
        {
            accessorKey: "connections",
            header: "Connections",
            cell: ({ row }) => row.original.connections?.toLocaleString() || "-",
        },
        {
            accessorKey: "companyName",
            header: "Company",
            cell: ({ row }) => row.original.companyName || <span className="text-muted-foreground text-xs">N/A</span>,
        },
        {
            accessorKey: "updatedAt",
            header: "Last Updated",
            cell: ({ row }) => {
                if (!row.original.updatedAt) return "-";
                return (
                    <div className="flex items-center text-xs text-muted-foreground" title={new Date(row.original.updatedAt).toLocaleString()}>
                        <IconClock className="mr-1 size-3" />
                        {formatDistanceToNow(row.original.updatedAt, { addSuffix: true })}
                    </div>
                )
            }
        },
        {
            accessorKey: "tags",
            header: "Tags",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {row.original.tags?.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[9px] px-1 h-3.5 bg-muted/30">
                            {tag}
                        </Badge>
                    ))}
                    {(!row.original.tags || row.original.tags.length === 0) && <span className="text-muted-foreground text-[10px]">-</span>}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <IconDotsVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.linkedinUrl)}>
                            Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdateProfile(row.original.linkedinUrl)}>
                            <IconRefresh className="mr-2 h-4 w-4" /> Update Data
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={row.original.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                <IconExternalLink className="mr-2 h-4 w-4" /> View on LinkedIn
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProfile(row.original.junctionId)}>
                            Delete Lead
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], []);

    const companyColumns = useMemo<ColumnDef<CompanyProfile>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "logoUrl",
            header: "Logo",
            cell: ({ row }) => (
                <Avatar className="h-9 w-9 rounded-md">
                    <AvatarImage src={row.original.logoUrl || undefined} alt={row.original.companyName} />
                    <AvatarFallback className="rounded-md">{row.original.companyName?.slice(0, 2) || "CO"}</AvatarFallback>
                </Avatar>
            ),
        },
        {
            accessorKey: "companyName",
            header: "Company Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.original.companyName || "Unknown"}</span>
                    {row.original.isVerified && <IconCircleCheckFilled className="size-4 text-blue-500" />}
                </div>
            ),
        },
        {
            accessorKey: "websiteUrl",
            header: "Website",
            cell: ({ row }) => (
                row.original.websiteUrl ? (
                    <a href={row.original.websiteUrl} target="_blank" className="text-xs text-blue-500 hover:underline truncate max-w-[150px]">
                        {row.original.websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                ) : "-"
            ),
        },
        {
            accessorKey: "employeeCount",
            header: "Employees",
            cell: ({ row }) => row.original.employeeCount?.toLocaleString() || "-",
        },
        {
            accessorKey: "followerCount",
            header: "Followers",
            cell: ({ row }) => row.original.followerCount?.toLocaleString() || "-",
        },
        {
            accessorKey: "country",
            header: "Location",
            cell: ({ row }) => {
                if (!row.original.city && !row.original.country) return "-";
                return (
                    <div className="flex flex-col text-xs">
                        <span>{row.original.city}</span>
                        <span className="text-muted-foreground">{row.original.country}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground truncate max-w-[200px] inline-block" title={row.original.description}>
                    {row.original.description || "-"}
                </span>
            ),
        },
        {
            accessorKey: "tags",
            header: "Tags",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {row.original.tags?.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[9px] px-1 h-3.5 bg-muted/30">
                            {tag}
                        </Badge>
                    ))}
                    {(!row.original.tags || row.original.tags.length === 0) && <span className="text-muted-foreground text-[10px]">-</span>}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <IconDotsVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.linkedinUrl)}>
                            Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdateProfile(row.original.linkedinUrl)}>
                            <IconRefresh className="mr-2 h-4 w-4" /> Update Data
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={row.original.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                <IconExternalLink className="mr-2 h-4 w-4" /> View on LinkedIn
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProfile(row.original.junctionId)}>
                            Delete Lead
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], []);

    const googleMapsColumns = useMemo<ColumnDef<GoogleMapsLead>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "imageUrl",
            header: "Image",
            cell: ({ row }) => (
                <Avatar className="h-9 w-9 rounded-md border border-border/50">
                    <AvatarImage
                        src={row.original.imageUrl || undefined}
                        alt={row.original.title}
                        className="object-cover"
                        referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="rounded-md">
                        <IconBrandGoogleMaps className="size-4 text-muted-foreground/40" />
                    </AvatarFallback>
                </Avatar>
            ),
        },
        {
            accessorKey: "title",
            header: "Business Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.title || "Unknown"}</span>
                </div>
            ),
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => row.original.phone || "-",
        },
        {
            accessorKey: "website",
            header: "Website",
            cell: ({ row }) => (
                row.original.website ? (
                    <a href={row.original.website} target="_blank" className="text-xs text-blue-500 hover:underline truncate max-w-[120px]">
                        {row.original.website.replace(/^https?:\/\//, '')}
                    </a>
                ) : "-"
            ),
        },
        {
            id: "rating",
            header: "Rating",
            cell: ({ row }) => row.original.totalScore ? (
                <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium">{row.original.totalScore}</span>
                    <span className="text-yellow-500">★</span>
                    <span className="text-muted-foreground">({row.original.reviewsCount || 0})</span>
                </div>
            ) : "-",
        },
        {
            accessorKey: "emails",
            header: "Emails",
            cell: ({ row }) => {
                const emails = row.original.emails || [];
                if (emails.length === 0) return "-";
                return (
                    <div className="flex flex-col gap-0.5">
                        {emails.slice(0, 2).map((email, i) => (
                            <span key={i} className="text-xs truncate max-w-[150px]" title={email}>{email}</span>
                        ))}
                        {emails.length > 2 && <span className="text-[10px] text-muted-foreground">+{emails.length - 2} more</span>}
                    </div>
                );
            }
        },
        {
            accessorKey: "tags",
            header: "Tags",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {row.original.tags?.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[9px] px-1 h-3.5 bg-muted/30">
                            {tag}
                        </Badge>
                    ))}
                    {(!row.original.tags || row.original.tags.length === 0) && <span className="text-muted-foreground text-[10px]">-</span>}
                </div>
            )
        },
        {
            id: "socials",
            header: "Socials",
            cell: ({ row }) => {
                const s = row.original.socials;
                if (!s) return "-";
                return (
                    <div className="flex gap-1.5 text-muted-foreground">
                        {s.linkedin && <a href={s.linkedin} target="_blank" className="hover:text-blue-600"><IconBrandLinkedin size={16} /></a>}
                        {s.facebook && <a href={s.facebook} target="_blank" className="hover:text-blue-600"><IconBrandFacebook size={16} /></a>}
                        {s.instagram && <a href={s.instagram} target="_blank" className="hover:text-pink-600"><IconBrandInstagram size={16} /></a>}
                        {s.twitter && <a href={s.twitter} target="_blank" className="hover:text-black dark:hover:text-white"><IconBrandX size={16} /></a>}
                        {s.tiktok && <a href={s.tiktok} target="_blank" className="hover:text-black dark:hover:text-white"><IconBrandTiktok size={16} /></a>}
                    </div>
                );
            }
        },
        {
            accessorKey: "url",
            header: "Google Maps Url",
            cell: ({ row }) => (
                <a
                    href={row.original.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                >
                    <IconBrandGoogleMaps size={14} className="text-red-500" /> View
                </a>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <IconDotsVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.url)}>
                            Copy Maps URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={row.original.url} target="_blank" rel="noopener noreferrer">
                                <IconExternalLink className="mr-2 h-4 w-4" /> View on Google Maps
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProfile(row.original.junctionId)}>
                            Delete Lead
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], []);

    const instagramColumns = useMemo<ColumnDef<InstagramLead>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "profilePicUrl",
            header: "Profile",
            cell: ({ row }) => {
                const [status, setStatus] = useState<'direct' | 'proxy' | 'error'>('direct');
                const rawSrc = row.original.profilePicUrl || (row.original as any).profile_pic_url;
                const username = row.original.username || "IG";
                const initials = username.slice(0, 2).toUpperCase();

                if (!rawSrc || status === 'error') {
                    return (
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                            {initials}
                        </div>
                    );
                }

                // Using images.weserv.nl which is very reliable for proxying and resizing
                const src = status === 'proxy' 
                    ? `https://images.weserv.nl/?url=${encodeURIComponent(rawSrc)}&w=150&h=150&fit=cover`
                    : rawSrc;

                return (
                    <div 
                        className="h-9 w-9 rounded-full overflow-hidden border border-border bg-muted"
                        title={username}
                    >
                        <img 
                            key={src}
                            src={src} 
                            alt={username} 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => {
                                if (status === 'direct') setStatus('proxy');
                                else setStatus('error');
                            }}
                        />
                    </div>
                );
            },
        },
        {
            accessorKey: "username",
            header: "Username",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <a 
                        href={`https://www.instagram.com/${row.original.username}/`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium hover:text-blue-600 transition-colors flex items-center gap-1 group"
                    >
                        @{row.original.username}
                        <IconExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                    </a>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{row.original.fullName}</span>
                </div>
            ),
        },
        {
            id: "badges",
            header: "Badges",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.isVerified && <IconCircleCheckFilled className="size-4 text-blue-500" title="Verified" />}
                    {row.original.isBusinessAccount && <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px] h-4 px-1">BUSINESS</Badge>}
                    {row.original.isProfessionalAccount && <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] h-4 px-1">PROFESSIONAL</Badge>}
                    {row.original.isPrivate && <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-[10px] h-4 px-1">PRIVATE</Badge>}
                    {row.original.mutualFollow && <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100 text-[10px] h-4 px-1">MUTUAL</Badge>}
                </div>
            )
        },
        {
            accessorKey: "biography",
            header: "Bio",
            cell: ({ row }) => (
                <div 
                    className="max-w-[200px] truncate text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                    title="Double click to view full bio"
                    onDoubleClick={() => setSelectedInstagramLead(row.original)}
                >
                    {row.original.biography || "-"}
                </div>
            )
        },
        {
            id: "content_summary",
            header: "Content",
            cell: ({ row }) => {
                const images = row.original.extraData?.images || [];
                if (images.length === 0) return <span className="text-muted-foreground text-[10px]">-</span>;
                return (
                    <div 
                        className="flex -space-x-2 overflow-hidden cursor-pointer hover:space-x-0.5 transition-all"
                        onClick={() => setSelectedInstagramLead(row.original)}
                    >
                        {images.slice(0, 3).map((img: any, i: number) => (
                            <div key={i} className="inline-block h-6 w-6 rounded-sm ring-1 ring-background bg-muted overflow-hidden">
                                <img 
                                    src={img.thumbnailSrc || img.src} 
                                    className="h-full w-full object-cover" 
                                    alt="" 
                                    onError={(e: any) => e.target.src = "https://placehold.co/100x100?text=No+Image"}
                                />
                            </div>
                        ))}
                        {images.length > 3 && (
                            <div className="inline-block h-6 w-6 rounded-sm ring-1 ring-background bg-muted flex items-center justify-center text-[8px] font-bold">
                                +{images.length - 3}
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => row.original.category || "-",
        },
        {
            accessorKey: "medianEr",
            header: "ER",
            cell: ({ row }) => row.original.medianEr || "-",
        },
        {
            accessorKey: "quality",
            header: "Quality",
            cell: ({ row }) => {
                const q = row.original.quality;
                if (!q) return "-";
                const color = q.toLowerCase() === "good" ? "text-green-600" : q.toLowerCase() === "average" ? "text-amber-600" : "text-red-600";
                return <span className={`font-medium ${color}`}>{q}</span>
            },
        },
        {
            accessorKey: "reelsCount",
            header: "Reels",
            cell: ({ row }) => row.original.reelsCount || "-",
        },
        {
            accessorKey: "medianViews",
            header: "Avg Views",
            cell: ({ row }) => row.original.medianViews?.toLocaleString() || "-",
        },
        {
            accessorKey: "detectedLanguage",
            header: "Lang",
            cell: ({ row }) => row.original.detectedLanguage || "-",
        },
        {
            accessorKey: "followersCount",
            header: "Followers",
            cell: ({ row }) => row.original.followersCount?.toLocaleString() || "-",
        },
        {
            accessorKey: "followingCount",
            header: "Following",
            cell: ({ row }) => row.original.followingCount?.toLocaleString() || "-",
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => row.original.email || row.original.publicEmail || <span className="text-muted-foreground text-xs">N/A</span>,
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => row.original.phone || row.original.publicPhoneNumber || <span className="text-muted-foreground text-xs">N/A</span>,
        },
        {
            accessorKey: "cityName",
            header: "City",
            cell: ({ row }) => row.original.cityName || "-",
        },
        {
            accessorKey: "externalUrl",
            header: "Website",
            cell: ({ row }) => (
                row.original.externalUrl ? (
                    <a 
                        href={row.original.externalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1 text-[10px]"
                    >
                        <IconExternalLink size={12} />
                        {new URL(row.original.externalUrl).hostname.replace('www.', '')}
                    </a>
                ) : <span className="text-muted-foreground text-[10px]">-</span>
            ),
        },
        {
            id: "bio_links",
            header: "Bio Links",
            cell: ({ row }) => {
                const links = row.original.bioLinks || [];
                if (links.length === 0) return <span className="text-muted-foreground text-[10px]">-</span>;
                return (
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {links.map((link: any, idx: number) => (
                            <a 
                                key={idx} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                title={link.title || link.url}
                                className="inline-flex items-center gap-0.5 bg-muted/30 px-1 py-0.5 rounded border border-border hover:bg-muted/50 text-[8px]"
                            >
                                <IconExternalLink size={8} className="text-muted-foreground" />
                                {link.linkType || "Link"}
                            </a>
                        ))}
                    </div>
                );
            }
        },
        {
            accessorKey: "tags",
            header: "Tags",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {row.original.tags?.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[9px] px-1 h-3.5 bg-muted/30">
                            {tag}
                        </Badge>
                    ))}
                    {(!row.original.tags || row.original.tags.length === 0) && <span className="text-muted-foreground text-[10px]">-</span>}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <IconDotsVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedInstagramLead(row.original)}>
                            <IconSearch className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`https://instagram.com/${row.original.username}`} target="_blank" rel="noopener noreferrer">
                                <IconExternalLink className="mr-2 h-4 w-4" /> View on Instagram
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProfile(row.original.junctionId)}>
                            Delete Lead
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], []);

    const xColumns = useMemo<ColumnDef<any>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "username",
            header: "Profile",
            cell: ({ row }) => {
                const isVerified = row.original.isVerified || row.original.is_verified;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={row.original.profilePicUrl || row.original.profile_pic_url} />
                            <AvatarFallback>{row.original.fullName?.substring(0, 2).toUpperCase() || row.original.username?.substring(0, 2).toUpperCase() || "X"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm flex items-center gap-1">
                                {row.original.fullName || row.original.full_name || row.original.username}
                                {isVerified && <IconBadgeFilled className="text-blue-500 h-4 w-4" />}
                            </span>
                            <a
                                href={`https://x.com/${row.original.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-blue-500 transition-colors flex items-center gap-1"
                            >
                                @{row.original.username}
                                <IconExternalLink size={10} />
                            </a>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "followers",
            header: "Followers",
            cell: ({ row }) => (row.original.followersCount || row.original.followers_count)?.toLocaleString() || "-",
        },
        {
            accessorKey: "following",
            header: "Following",
            cell: ({ row }) => (row.original.followingCount || row.original.following_count)?.toLocaleString() || "-",
        },
        {
            accessorKey: "foundFor",
            header: "Found For",
            cell: ({ row }) => (
                <div className="text-xs max-w-[150px] truncate" title={row.original.foundFor}>
                    {row.original.foundFor || "-"}
                </div>
            )
        },
        {
            accessorKey: "bio",
            header: "Bio",
            cell: ({ row }) => {
                const bio = row.original.extraData?.biography || row.original.extraData?.description || row.original.description || row.original.biography || row.original.extraData?.bio || row.original.bio;
                return (
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={bio}>
                        {bio || "-"}
                    </div>
                )
            }
        },
        {
            accessorKey: "tweets",
            header: "Tweets",
            cell: ({ row }) => (row.original.tweetsCount || row.original.tweets_count)?.toLocaleString() || "-",
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => row.original.email || <span className="text-muted-foreground text-xs">N/A</span>,
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => row.original.phone || <span className="text-muted-foreground text-xs">N/A</span>,
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => row.original.location || "-",
        },
        {
            accessorKey: "externalUrl",
            header: "Website",
            cell: ({ row }) => {
                const url = row.original.externalUrl || row.original.external_url;
                if (!url) return "-";
                try {
                    return (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-[10px]">
                            <IconExternalLink size={12} />
                            {new URL(url).hostname.replace('www.', '')}
                        </a>
                    );
                } catch {
                    return <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{url}</span>;
                }
            },
        },
        {
            accessorKey: "mediaCount",
            header: "Media",
            cell: ({ row }) => (row.original.mediaCount || row.original.media_count)?.toLocaleString() || "-",
        },
        {
            accessorKey: "accountCreatedAt",
            header: "Joined",
            cell: ({ row }) => {
                const date = row.original.accountCreatedAt || row.original.account_created_at;
                if (!date) return "-";
                return new Date(date).toLocaleDateString();
            },
        },
        {
            accessorKey: "tags",
            header: "Tags",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {row.original.tags?.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-[9px] px-1 h-3.5 bg-muted/30">
                            {tag}
                        </Badge>
                    ))}
                    {(!row.original.tags || row.original.tags.length === 0) && <span className="text-muted-foreground text-[10px]">-</span>}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <IconDotsVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <a href={`https://x.com/${row.original.username}`} target="_blank" rel="noopener noreferrer">
                                <IconExternalLink className="mr-2 h-4 w-4" /> View on X
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateXProfile(row.original.username)}>
                            <IconRefresh className="mr-2 h-4 w-4" /> Update Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProfile(row.original.junctionId)}>
                            Delete Lead
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], []);

    const websiteContactColumns = useMemo<ColumnDef<WebsiteContact>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "domain",
            header: "Domain",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <img
                        src={`https://www.google.com/s2/favicons?sz=64&domain=${row.original.domain}`}
                        alt=""
                        className="size-4 rounded-sm"
                    />
                    <a
                        href={`https://${row.original.domain}`}
                        target="_blank"
                        className="font-medium hover:text-blue-500 transition-colors"
                    >
                        {row.original.domain}
                    </a>
                </div>
            ),
        },
        {
            accessorKey: "sourceUrls",
            header: "Found At",
            cell: ({ row }) => {
                const urls = row.original.sourceUrls || [];
                const s = row.original.socials || {};
                const extra = row.original.extraData || {};
                const hasDetails = ((row.original.emails?.length || 0) > 0) || ((row.original.phones?.length || 0) > 0) ||
                    (s.linkedin || s.facebook || s.instagram || s.twitter || s.tiktok || s.youtube || s.pinterest);

                if (!hasDetails) return "-";

                // Use sourceUrls if available, otherwise fallback to the original start URL we checked
                const displayUrls = urls.length > 0 ? urls : (extra.originalStartUrl ? [extra.originalStartUrl] : []);

                if (displayUrls.length === 0) return "-";
                return (
                    <div className="flex flex-col gap-0.5">
                        {displayUrls.slice(0, 1).map((url, i) => (
                            <a
                                key={i}
                                href={url}
                                target="_blank"
                                className="text-[10px] text-blue-500 hover:underline truncate max-w-[120px]"
                                title={url}
                            >
                                {url.replace(/^https?:\/\//, '').split('/')[1] ? `/${url.replace(/^https?:\/\//, '').split('/').slice(1).join('/')}` : '/'}
                            </a>
                        ))}
                        {displayUrls.length > 1 && <span className="text-[9px] text-muted-foreground">+{displayUrls.length - 1} more</span>}
                    </div>
                );
            }
        },
        {
            accessorKey: "emails",
            header: "Emails",
            cell: ({ row }) => {
                const emails = row.original.emails || [];
                if (emails.length === 0) return "-";
                return (
                    <div className="flex flex-col gap-0.5">
                        {emails.slice(0, 2).map((email, i) => (
                            <span key={i} className="text-xs truncate max-w-[150px]" title={email}>{email}</span>
                        ))}
                        {emails.length > 2 && <span className="text-[10px] text-muted-foreground">+{emails.length - 2} more</span>}
                    </div>
                );
            }
        },
        {
            accessorKey: "phones",
            header: "Phones",
            cell: ({ row }) => {
                const phones = row.original.phones || [];
                if (phones.length === 0) return "-";
                return (
                    <div className="flex flex-col gap-0.5">
                        {phones.slice(0, 2).map((phone, i) => (
                            <span key={i} className="text-xs truncate max-w-[150px]" title={phone}>{phone}</span>
                        ))}
                        {phones.length > 2 && <span className="text-[10px] text-muted-foreground">+{phones.length - 2} more</span>}
                    </div>
                );
            }
        },
        {
            id: "socials",
            header: "Socials",
            cell: ({ row }) => {
                const s = row.original.socials;
                if (!s) return "-";
                return (
                    <div className="flex gap-1.5 text-muted-foreground">
                        {s.linkedin && <a href={s.linkedin} target="_blank" className="hover:text-blue-600"><IconBrandLinkedin size={16} /></a>}
                        {s.facebook && <a href={s.facebook} target="_blank" className="hover:text-blue-600"><IconBrandFacebook size={16} /></a>}
                        {s.instagram && <a href={s.instagram} target="_blank" className="hover:text-pink-600"><IconBrandInstagram size={16} /></a>}
                        {s.twitter && <a href={s.twitter} target="_blank" className="hover:text-black dark:hover:text-white"><IconBrandX size={16} /></a>}
                        {s.tiktok && <a href={s.tiktok} target="_blank" className="hover:text-black dark:hover:text-white"><IconBrandTiktok size={16} /></a>}
                    </div>
                );
            }
        },
        {
            accessorKey: "tags",
            header: "Tags",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {row.original.tags?.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[9px] px-1 h-3.5 bg-muted/30">
                            {tag}
                        </Badge>
                    ))}
                    {(!row.original.tags || row.original.tags.length === 0) && <span className="text-muted-foreground text-[10px]">-</span>}
                </div>
            )
        },
        {
            accessorKey: "updatedAt",
            header: "Last Updated",
            cell: ({ row }) => {
                if (!row.original.updatedAt) return "-";
                return (
                    <div className="flex items-center text-xs text-muted-foreground" title={new Date(row.original.updatedAt).toLocaleString()}>
                        <IconClock className="mr-1 size-3" />
                        {formatDistanceToNow(row.original.updatedAt, { addSuffix: true })}
                    </div>
                )
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <IconDotsVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.domain)}>
                            Copy Domain
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateWebsiteContact(row.original.domain)}>
                            <IconRefresh className="mr-2 size-4" />
                            Update Data
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProfile(row.original.junctionId)}>
                            Delete Lead
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], []);

    // --- Main UI ---
    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Leads</h1>
                    <p className="text-muted-foreground text-sm">
                        View and manage all extracted target leads from LinkedIn and Google Maps.
                    </p>
                </div>
            </div>

            <div className="px-6 md:px-8 pb-8">
                <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="p-0">
                        <Tabs defaultValue="personal">
                            <TabsList className="mb-4">
                                <TabsTrigger value="personal">Linkedin Personal Profiles</TabsTrigger>
                                <TabsTrigger value="company">Linkedin Company Profiles</TabsTrigger>
                                <TabsTrigger value="google_maps">Google Map Lead</TabsTrigger>
                                <TabsTrigger value="website_contact">Website Contacts</TabsTrigger>
                                <TabsTrigger value="instagram">Instagram Lead</TabsTrigger>
                                <TabsTrigger value="tiktok">TikTok Lead</TabsTrigger>
                                <TabsTrigger value="facebook">Facebook Lead</TabsTrigger>
                                <TabsTrigger value="x">X Lead</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal">
                                <GenericProfileTable
                                    data={filteredPersonal}
                                    columns={personalColumns}
                                    isLoading={loadingPersonal}

                                    filterColumn="fullName"
                                    type="personal"
                                    filters={personalFilters}
                                    setFilters={setPersonalFilters}
                                    onBulkDelete={async (ids) => {
                                        if (confirm(`Are you sure you want to remove ${ids.length} profiles?`)) {
                                            const { error } = await supabase.from("user_leads").delete().in("id", ids);
                                            if (error) toast.error(error.message);
                                            else {
                                                toast.success("Profiles removed");
                                                window.location.reload();
                                            }
                                        }
                                    }}

                                    onBulkUpdate={async (urls) => {
                                        toast.info(`Queueing update for ${urls.length} profiles...`);
                                        try {
                                            const apiData = await getOrCreateKey();
                                            if (!apiData?.key) throw new Error("Could not retrieve API Key");
                                            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-linkedin`, {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "Authorization": `Bearer ${apiData.key}`
                                                },
                                                body: JSON.stringify({ profileUrls: urls, force: true })
                                            });
                                            if (!res.ok) throw new Error("Bulk update failed");
                                            toast.success("Bulk update queued");
                                        } catch (e: any) {
                                            toast.error(e.message);
                                        }
                                    }}
                                />
                            </TabsContent>

                            <TabsContent value="company">
                                <GenericProfileTable
                                    data={filteredCompany}
                                    columns={companyColumns}
                                    isLoading={loadingCompany}

                                    filterColumn="companyName"
                                    type="company"
                                    filters={companyFilters}
                                    setFilters={setCompanyFilters}
                                    onBulkDelete={async (ids) => {
                                        if (confirm(`Are you sure you want to remove ${ids.length} companies?`)) {
                                            const { error } = await supabase.from("user_leads").delete().in("id", ids);
                                            if (error) toast.error(error.message);
                                            else {
                                                toast.success("Companies removed");
                                                window.location.reload();
                                            }
                                        }
                                    }}

                                    onBulkUpdate={async (urls) => {
                                        toast.info(`Queueing update for ${urls.length} companies...`);
                                        try {
                                            const apiData = await getOrCreateKey();
                                            if (!apiData?.key) throw new Error("Could not retrieve API Key");
                                            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-linkedin`, {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "Authorization": `Bearer ${apiData.key}`
                                                },
                                                body: JSON.stringify({ profileUrls: urls, force: true })
                                            });
                                            if (!res.ok) throw new Error("Bulk update failed");
                                            toast.success("Bulk update queued");
                                        } catch (e: any) {
                                            toast.error(e.message);
                                        }
                                    }}
                                />
                            </TabsContent>

                            <TabsContent value="google_maps">
                                <GenericProfileTable
                                    data={filteredGoogleMaps}
                                    columns={googleMapsColumns}
                                    isLoading={loadingGoogleMaps}
                                    filterColumn="title"
                                    type="google_maps"
                                    filters={googleMapsFilters}
                                    setFilters={setGoogleMapsFilters}
                                    onBulkDelete={async (ids) => {
                                        if (confirm(`Are you sure you want to remove ${ids.length} Google Maps leads?`)) {
                                            const { error } = await supabase.from("user_leads").delete().in("id", ids);
                                            if (error) toast.error(error.message);
                                            else {
                                                toast.success("Leads removed");
                                                window.location.reload();
                                            }
                                        }
                                    }}
                                />
                            </TabsContent>
                            <TabsContent value="website_contact">
                                <GenericProfileTable
                                    data={filteredWebsiteContacts}
                                    columns={websiteContactColumns}
                                    isLoading={loadingWebsiteContacts}
                                    filterColumn="domain"
                                    type="website_contact"
                                    filters={websiteContactsFilters}
                                    setFilters={setWebsiteContactsFilters}
                                    onBulkDelete={async (ids) => {
                                        if (confirm(`Are you sure you want to remove ${ids.length} Website Contacts?`)) {
                                            const { error } = await supabase.from("user_leads").delete().in("id", ids);
                                            if (error) toast.error(error.message);
                                            else {
                                                toast.success("Contacts removed");
                                                window.location.reload();
                                            }
                                        }
                                    }}
                                />
                            </TabsContent>
                            <TabsContent value="instagram">
                                <GenericProfileTable
                                    data={filteredInstagram}
                                    columns={instagramColumns}
                                    isLoading={loadingInstagramLeads}
                                    filterColumn="username"
                                    type="instagram"
                                    filters={instagramFilters}
                                    setFilters={setInstagramFilters}
                                    onBulkDelete={async (ids) => {
                                        if (confirm(`Are you sure you want to remove ${ids.length} Instagram leads?`)) {
                                            const { error } = await supabase.from("user_leads").delete().in("id", ids);
                                            if (error) toast.error(error.message);
                                            else {
                                                toast.success("Leads removed");
                                                window.location.reload();
                                            }
                                        }
                                    }}
                                />
                            </TabsContent>
                            
                            <TabsContent value="tiktok">
                                <div className="py-12 text-center border rounded-lg bg-muted/20">
                                    <h3 className="text-lg font-medium">TikTok Leads Coming Soon</h3>
                                    <p className="text-sm text-muted-foreground mt-1">This integration is under development.</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="facebook">
                                <div className="py-12 text-center border rounded-lg bg-muted/20">
                                    <h3 className="text-lg font-medium">Facebook Leads Coming Soon</h3>
                                    <p className="text-sm text-muted-foreground mt-1">This integration is under development.</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="x">
                                <GenericProfileTable
                                    data={filteredX}
                                    columns={xColumns}
                                    isLoading={loadingXLeads}
                                    filterColumn="username"
                                    type="x"
                                    filters={xFilters}
                                    setFilters={setXFilters}
                                    onBulkDelete={async (ids) => {
                                        if (confirm(`Are you sure you want to remove ${ids.length} X leads?`)) {
                                            const { error } = await supabase.from("user_leads").delete().in("id", ids);
                                            if (error) toast.error(error.message);
                                            else {
                                                toast.success("Leads removed");
                                                window.location.reload();
                                            }
                                        }
                                    }}
                                    onBulkUpdate={async (urls) => {
                                        toast.info(`Queueing update for ${urls.length} X profiles...`);
                                        try {
                                            const apiData = await getOrCreateKey();
                                            if (!apiData?.key) throw new Error("Could not retrieve API Key");

                                            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-x-profiles`, {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "Authorization": `Bearer ${apiData.key}`
                                                },
                                                body: JSON.stringify({ usernames: urls })
                                            });

                                            if (!res.ok) {
                                                const err = await res.json();
                                                throw new Error(err.error || "Bulk update failed");
                                            }
                                            toast.success("X profile updates queued");
                                        } catch (e: any) {
                                            toast.error(e.message);
                                        }
                                    }}
                                    searchPlaceholder="Filter X profiles..."
                                    onRefresh={refreshXLeads}
                                    bulkActions={{
                                        show: true,
                                        actions: [
                                            {
                                                label: "Export Selected",
                                                onClick: (rows) => {
                                                    const csv = rows.map(r => `${r.username},${r.fullName || ''},${r.followersCount || ''},${r.externalUrl || ''}`).join("\n");
                                                    const blob = new Blob([csv], { type: 'text/csv' });
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = 'x_leads.csv';
                                                    a.click();
                                                }
                                            }
                                        ]
                                    }}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            <InstagramDetailsSheet 
                lead={selectedInstagramLead} 
                onClose={() => setSelectedInstagramLead(null)} 
            />
        </div>
    );
}

function InstagramDetailsSheet({ lead, onClose }: { lead: InstagramLead | null, onClose: () => void }) {
    if (!lead) return null;

    return (
        <Sheet open={!!lead} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-[500px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <IconBrandInstagram className="size-5 text-pink-600" />
                        Instagram Profile Details
                    </SheetTitle>
                    <SheetDescription>
                        Comprehensive data extracted for @{lead.username}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Header Info */}
                    <div className="flex items-start gap-4">
                        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20 bg-muted">
                            <img 
                                src={lead.profilePicUrl ? (lead.profilePicUrl.includes('googleusercontent.com') || lead.profilePicUrl.includes('weserv.nl') ? lead.profilePicUrl : `https://images.weserv.nl/?url=${encodeURIComponent(lead.profilePicUrl)}&w=200&h=200&fit=cover`) : ""} 
                                alt={lead.username}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">@{lead.username}</h3>
                                {lead.hasChannel && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-4 text-[9px] px-1">CHANNEL</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">{lead.fullName}</p>
                            {lead.pronouns && lead.pronouns.length > 0 && (
                                <p className="text-[10px] text-muted-foreground italic">({lead.pronouns.join(" / ")})</p>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {lead.isVerified && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 h-5 text-[10px]">VERIFIED</Badge>}
                                {lead.isBusinessAccount && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 h-5 text-[10px]">BUSINESS</Badge>}
                                {lead.isProfessionalAccount && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 h-5 text-[10px]">PROFESSIONAL</Badge>}
                                {lead.isPrivate && <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 h-5 text-[10px]">PRIVATE</Badge>}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Biography Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Biography</Label>
                            {lead.businessContactMethod && lead.businessContactMethod !== "UNKNOWN" && (
                                <Badge variant="outline" className="text-[9px] h-4 text-muted-foreground border-muted-foreground/30">
                                    {lead.businessContactMethod}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed bg-muted/30 p-3 rounded-lg border">
                            {lead.biography || "No biography available."}
                        </p>
                    </div>

                    {/* Categories */}
                    {(lead.category || lead.businessCategory || lead.overallCategory) && (
                        <div className="space-y-2">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold">Categories</Label>
                            <div className="flex flex-wrap gap-2">
                                {lead.category && <Badge variant="secondary" className="text-[10px] h-5">{lead.category}</Badge>}
                                {lead.businessCategory && <Badge variant="secondary" className="text-[10px] h-5">{lead.businessCategory}</Badge>}
                                {lead.overallCategory && <Badge variant="secondary" className="text-[10px] h-5">{lead.overallCategory}</Badge>}
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-muted/30 p-3 rounded-lg border text-center">
                            <p className="text-lg font-bold">{lead.followersCount?.toLocaleString() || "0"}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Followers</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg border text-center">
                            <p className="text-lg font-bold">{lead.followingCount?.toLocaleString() || "0"}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Following</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg border text-center">
                            <p className="text-lg font-bold">{lead.postsCount?.toLocaleString() || "0"}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Posts</p>
                        </div>
                    </div>

                    {/* Engagement & Performance */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Engagement Rate</Label>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{lead.medianEr || "N/A"}</span>
                                {lead.quality && (
                                    <Badge variant="outline" className={`text-[9px] h-4 ${
                                        lead.quality.toLowerCase() === 'good' ? 'border-green-200 text-green-700 bg-green-50' : 
                                        lead.quality.toLowerCase() === 'average' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                                        'border-red-200 text-red-700 bg-red-50'
                                    }`}>
                                        {lead.quality.toUpperCase()}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Avg Views / Reels</Label>
                            <p className="font-bold">{lead.medianViews?.toLocaleString() || "0"} <span className="text-[10px] font-normal text-muted-foreground">({lead.reelsCount || 0} reels)</span></p>
                        </div>
                    </div>

                    <Separator />

                    {/* Performance Metrics Detail */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Highlights</Label>
                            <p className="text-sm font-medium">{lead.highlightReelCount || 0} collections</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Language</Label>
                            <p className="text-sm font-medium">{lead.detectedLanguage ? lead.detectedLanguage.toUpperCase() : "N/A"}</p>
                        </div>
                    </div>

                    {(lead.cityName || lead.facebookId) && (
                        <div className="grid grid-cols-2 gap-4">
                             {lead.cityName && (
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground uppercase">Location</Label>
                                    <p className="text-sm font-medium flex items-center gap-1">
                                        <IconMapPin size={12} className="text-red-500" />
                                        {lead.cityName}
                                    </p>
                                </div>
                            )}
                            {lead.facebookId && (
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground uppercase">Facebook ID</Label>
                                    <p className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{lead.facebookId}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Media Gallery / Content */}
                    {lead.extraData?.images && lead.extraData.images.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Recent Content</Label>
                                <Badge variant="outline" className="text-[9px] h-4">{lead.extraData.images.length} posts</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {lead.extraData.images.map((post: any, idx: number) => (
                                    <div key={idx} className="group relative aspect-square rounded-md overflow-hidden bg-muted border border-border">
                                        <img 
                                            src={post.thumbnailSrc || post.src} 
                                            className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                                            alt=""
                                            onError={(e: any) => e.target.src = "https://placehold.co/200x200?text=Error"}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                                            <div className="flex items-center gap-1">
                                                <span>❤️ {post.likes?.toLocaleString() || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>💬 {post.commentsCount?.toLocaleString() || 0}</span>
                                            </div>
                                            {post.isVideo && <Badge className="bg-white/20 text-white text-[8px] h-3 px-1 mt-1 border-none backdrop-blur-sm">VIDEO</Badge>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Contact & Links */}
                    <div className="space-y-4">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Contact & Links</Label>
                        
                        <div className="space-y-4">
                            {/* Emails */}
                            {(lead.email || (lead.allEmails && lead.allEmails.length > 0)) && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                                        <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <IconExternalLink className="size-3" />
                                        </div>
                                        Emails
                                    </div>
                                    <div className="flex flex-col gap-1 pl-7">
                                        {lead.email && <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline font-medium">{lead.email} <span className="text-[10px] text-muted-foreground">(Primary)</span></a>}
                                        {lead.allEmails?.filter(e => e !== lead.email).map((email, idx) => (
                                            <a key={idx} href={`mailto:${email}`} className="text-sm text-primary/80 hover:underline">{email}</a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Phones */}
                            {(lead.phone || (lead.allPhones && lead.allPhones.length > 0)) && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                                        <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <IconExternalLink className="size-3" />
                                        </div>
                                        Phone Numbers
                                    </div>
                                    <div className="flex flex-col gap-1 pl-7">
                                        {lead.phone && <span className="text-sm font-medium">{lead.phone} <span className="text-[10px] text-muted-foreground">(Primary)</span></span>}
                                        {lead.allPhones?.filter(p => p !== lead.phone).map((phone, idx) => (
                                            <span key={idx} className="text-sm text-foreground/80">{phone}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {lead.externalUrl && (
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <IconExternalLink className="size-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Main Website</span>
                                        <a href={lead.externalUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all">
                                            {lead.externalUrl}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {lead.facebookId && (
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="size-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <IconBrandFacebook className="size-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Facebook Account</span>
                                        <a href={`https://facebook.com/${lead.facebookId}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                            View Facebook Profile
                                        </a>
                                        <span className="text-[9px] text-muted-foreground">ID: {lead.facebookId}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bio Links Array */}
                        {lead.bioLinks && lead.bioLinks.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Bio Links & External Assets ({lead.bioLinks.length})</Label>
                                <div className="grid grid-cols-1 gap-2">
                                    {lead.bioLinks.map((link: any, idx: number) => (
                                        <a 
                                            key={idx} 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-2 rounded border bg-muted/20 hover:bg-muted/40 transition-colors text-xs"
                                        >
                                            <span className="font-medium truncate mr-2">{link.title || link.url}</span>
                                            <div className="flex items-center gap-1">
                                                {link.linkType && <Badge variant="outline" className="text-[8px] h-3 px-1">{link.linkType}</Badge>}
                                                <IconExternalLink className="size-3 text-muted-foreground" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Social Media Shortcuts */}
                    {lead.socials && Object.values(lead.socials).some(v => !!v) && (
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Other Socials</Label>
                            <div className="flex flex-wrap gap-2">
                                {lead.socials.facebook && (
                                    <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
                                        <a href={lead.socials.facebook} target="_blank" rel="noopener noreferrer">
                                            <IconBrandFacebook className="size-4 text-blue-600" /> Facebook
                                        </a>
                                    </Button>
                                )}
                                {lead.socials.twitter && (
                                    <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
                                        <a href={lead.socials.twitter} target="_blank" rel="noopener noreferrer">
                                            <IconBrandX className="size-4" /> Twitter
                                        </a>
                                    </Button>
                                )}
                                {lead.socials.tiktok && (
                                    <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
                                        <a href={lead.socials.tiktok} target="_blank" rel="noopener noreferrer">
                                            <IconBrandTiktok className="size-4" /> TikTok
                                        </a>
                                    </Button>
                                )}
                                {lead.socials.youtube && (
                                    <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
                                        <a href={lead.socials.youtube} target="_blank" rel="noopener noreferrer">
                                            <IconBrandYoutube className="size-4 text-red-600" /> YouTube
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Location & Meta */}
                    <div className="grid grid-cols-2 gap-4 pb-8">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase">Location</Label>
                            <div className="flex items-center gap-1 text-sm font-medium">
                                <IconMapPin className="size-3 text-muted-foreground" />
                                {lead.cityName || "Global / Unknown"}
                            </div>
                        </div>
                        <div className="space-y-1 text-right">
                            <Label className="text-[10px] text-muted-foreground uppercase">Last Scraped</Label>
                            <p className="text-xs text-muted-foreground">
                                {lead.updatedAt ? formatDistanceToNow(lead.updatedAt, { addSuffix: true }) : "Unknown"}
                            </p>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function IconBrandYoutube({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z" />
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
        </svg>
    )
}

// --- Generic Table Implementation ---

// --- Generic Table Implementation ---

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
    filterColumn: string
    type: "personal" | "company" | "google_maps" | "website_contact" | "instagram" | "x"
    filters: any
    setFilters: (filters: any) => void
    onBulkDelete?: (ids: any[]) => Promise<void>
    onBulkUpdate?: (urls: string[]) => Promise<void>
    searchPlaceholder?: string
    onRefresh?: () => void
    filterContent?: React.ReactNode
    bulkActions?: { show: boolean; actions: { label: string; onClick: (rows: any[]) => void }[] }
}

function GenericProfileTable<TData, TValue>({
    columns,
    data,
    isLoading,
    filterColumn,
    type,
    filters,
    setFilters,
    onBulkDelete,
    onBulkUpdate,
    searchPlaceholder: _searchPlaceholder,
    onRefresh: _onRefresh,
    filterContent: _filterContent,
    bulkActions: _bulkActions,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination
        },
    })

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h3 className="text-lg font-semibold">Overview</h3>
                    <p className="text-sm text-muted-foreground">Manage and track your scraped profiles.</p>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={`Search ${type === "personal" ? "names" : "companies"}...`}
                            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm pl-9"
                        />
                    </div>
                    <FilterSheet type={type} filters={filters} setFilters={setFilters} />
                </div>
                <div className="flex gap-2">
                    {Object.keys(rowSelection).length > 0 && (
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-md animate-in fade-in slide-in-from-left-2">
                            <span className="text-xs font-medium">{Object.keys(rowSelection).length} selected</span>
                            <div className="h-4 w-px bg-border mx-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs gap-1.5"
                                onClick={() => {
                                    const urls = table.getSelectedRowModel().rows.map(r => {
                                        const orig = r.original as any;
                                        return orig.linkedinUrl || orig.url || orig.domain || orig.username;
                                    }).filter(Boolean);
                                    onBulkUpdate?.(urls);
                                }}
                            >
                                <IconRefresh className="size-3.5" />
                                Update
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    const ids = table.getSelectedRowModel().rows.map(r => (r.original as any).junctionId);
                                    onBulkDelete?.(ids);
                                    setRowSelection({});
                                }}
                            >
                                <IconTrash className="size-3.5" />
                                Delete
                            </Button>
                            <div className="h-4 w-px bg-border mx-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs gap-1.5"
                                onClick={() => {
                                    const selectedRows = table.getSelectedRowModel().rows.map(r => r.original);
                                    const csvData = selectedRows.map((item: any) => {
                                        if (type === "personal") {
                                            return {
                                                "Full Name": item.fullName || "",
                                                "First Name": item.firstName || "",
                                                "Last Name": item.lastName || "",
                                                "LinkedIn URL": item.linkedinUrl || "",
                                                "Public Identifier": item.publicIdentifier || item.public_identifier || "",
                                                "Profile Pic URL": item.profilePic || "",
                                                "Headline": item.headline || "",
                                                "Email": item.email || "",
                                                "Company Name": item.companyName || "",
                                                "Job Title": item.jobTitle || "",
                                                "City": item.city || item.location?.city || "",
                                                "Country": item.country || item.location?.country || "",
                                                "Postal Code": item.postal_code || "",
                                                "Followers": item.followers || 0,
                                                "Connections": item.connections || 0,
                                                "Premium": item.isPremium ? "Yes" : "No",
                                                "Influencer": item.isInfluencer ? "Yes" : "No",
                                                "Open To Work": item.openToWork ? "Yes" : "No",
                                                "Verified": item.isVerified ? "Yes" : "No",
                                                "Tags": (item.tags || []).join(", "),
                                                "About": (item.about || "").replace(/\n/g, " "),
                                                "Updated At": item.updatedAt ? new Date(item.updatedAt).toISOString() : ""
                                            };
                                        } else if (type === "company") {
                                            return {
                                                "Company Name": item.companyName || "",
                                                "Website": item.websiteUrl || "",
                                                "LinkedIn URL": item.linkedinUrl || "",
                                                "Logo URL": item.logoUrl || "",
                                                "Description": (item.description || "").replace(/\n/g, " "),
                                                "Employee Count": item.employeeCount || 0,
                                                "Employee Range": item.employeeCountRange || "",
                                                "Follower Count": item.followerCount || 0,
                                                "City": item.city || "",
                                                "Country": item.country || "",
                                                "Postal Code": item.postal_code || "",
                                                "Verified": item.isVerified ? "Yes" : "No",
                                                "Tags": (item.tags || []).join(", "),
                                                "Updated At": item.updatedAt ? new Date(item.updatedAt).toISOString() : ""
                                            };
                                        } else if (type === "google_maps") {
                                            return {
                                                "Business Name": item.title || "",
                                                "Category": item.category || "",
                                                "Address": item.address || "",
                                                "Rating": item.totalScore || 0,
                                                "Reviews": item.reviewsCount || 0,
                                                "Phone": item.phone || "",
                                                "Website": item.website || "",
                                                "Google Maps URL": item.url || "",
                                                "Place ID": item.placeId || item.place_id || "",
                                                "Image URL": item.imageUrl || item.image_url || "",
                                                "Emails": (item.emails || []).join(", "),
                                                "Facebook": item.socials?.facebook || "",
                                                "Instagram": item.socials?.instagram || "",
                                                "Twitter": item.socials?.twitter || "",
                                                "TikTok": item.socials?.tiktok || "",
                                                "LinkedIn": item.socials?.linkedin || "",
                                                "Youtube": item.socials?.youtube || "",
                                                "Pinterest": item.socials?.pinterest || "",
                                                "City": item.city || "",
                                                "Tags": (item.tags || []).join(", "),
                                                "Updated At": item.updatedAt ? new Date(item.updatedAt).toISOString() : ""
                                            };
                                        } else if (type === "website_contact") {
                                            return {
                                                "Domain": item.domain || "",
                                                "Emails": (item.emails || []).join(", "),
                                                "Phones": (item.phones || []).join(", "),
                                                "LinkedIn": item.linkedin || item.socials?.linkedin || "",
                                                "Facebook": item.facebook || item.socials?.facebook || "",
                                                "Instagram": item.instagram || item.socials?.instagram || "",
                                                "Twitter": item.twitter || item.socials?.twitter || "",
                                                "TikTok": item.tiktok || item.socials?.tiktok || "",
                                                "Youtube": item.youtube || item.socials?.youtube || "",
                                                "Pinterest": item.pinterest || item.socials?.pinterest || "",
                                                "Source URLs": (item.sourceUrls || []).join(", "),
                                                "Tags": (item.tags || []).join(", "),
                                                "Updated At": item.updatedAt ? new Date(item.updatedAt).toISOString() : ""
                                            };
                                        } else if (type === "instagram") {
                                            return {
                                                "Username": item.username || "",
                                                "Full Name": item.fullName || "",
                                                "Profile Pic URL": item.profilePicUrl || "",
                                                "Biography": (item.biography || "").replace(/\n/g, " "),
                                                "External URL": item.externalUrl || "",
                                                "Email": item.email || "",
                                                "Public Email": item.publicEmail || "",
                                                "Phone": item.phone || "",
                                                "Public Phone": item.publicPhoneNumber || "",
                                                "Followers": item.followersCount || 0,
                                                "Following": item.followingCount || 0,
                                                "Posts": item.postsCount || 0,
                                                "Business Account": item.isBusinessAccount ? "Yes" : "No",
                                                "Professional Account": item.isProfessionalAccount ? "Yes" : "No",
                                                "Private": item.isPrivate ? "Yes" : "No",
                                                "Verified": item.isVerified ? "Yes" : "No",
                                                "City": item.cityName || "",
                                                "Address": item.addressStreet || "",
                                                "Category": item.category || "",
                                                "Business Category": item.businessCategory || "",
                                                "Overall Category": item.overallCategory || "",
                                                "Engagement Rate": item.medianEr || "",
                                                "Quality": item.quality || "",
                                                "Reels Count": item.reelsCount || 0,
                                                "Highlight Reels": item.highlightReelCount || 0,
                                                "Avg Views": item.medianViews || 0,
                                                "Views/Followers Ratio": item.viewsFollowersRatio || "",
                                                "Last Post (Days)": item.lastPostDays || "",
                                                "Mutual Follow": item.mutualFollow ? "Yes" : "No",
                                                "Detected Language": item.detectedLanguage || "",
                                                "Facebook ID": item.facebookId || "",
                                                "Pronouns": (item.pronouns || []).join(" / "),
                                                "Tags": (item.tags || []).join(", "),
                                                "Updated At": item.updatedAt ? new Date(item.updatedAt).toISOString() : ""
                                            };
                                        }
                                        return {};
                                    });

                                    if (csvData.length > 0) {
                                        const headers = Object.keys(csvData[0] as any);
                                        const rows = csvData.map(obj => {
                                            return headers.map(header => {
                                                let val = (obj as any)[header] ?? "";
                                                let str = String(val).replace(/"/g, '""');
                                                return `"${str}"`;
                                            }).join(',');
                                        });
                                        const csvContent = [headers.join(','), ...rows].join('\n');

                                        navigator.clipboard.writeText(csvContent);
                                        toast.success(`${csvData.length} leads copied as CSV to clipboard`);
                                    }
                                }}
                            >
                                <IconCopy className="size-3.5" />
                                Copy CSV
                            </Button>
                            <div className="h-4 w-px bg-border mx-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => setRowSelection({})}
                            >
                                Clear
                            </Button>
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const csvData = data.map((item: any) => {
                                if (type === "personal") {
                                    return {
                                        "Full Name": item.fullName || "",
                                        "First Name": item.firstName || "",
                                        "Last Name": item.lastName || "",
                                        "LinkedIn URL": item.linkedinUrl || "",
                                        "Public Identifier": item.publicIdentifier || item.public_identifier || "",
                                        "Profile Pic URL": item.profilePic || "",
                                        "Headline": item.headline || "",
                                        "Email": item.email || "",
                                        "Company Name": item.companyName || "",
                                        "Job Title": item.jobTitle || "",
                                        "City": item.city || item.location?.city || "",
                                        "Country": item.country || item.location?.country || "",
                                        "Postal Code": item.postal_code || "",
                                        "Followers": item.followers || 0,
                                        "Connections": item.connections || 0,
                                        "Premium": item.isPremium ? "Yes" : "No",
                                        "Influencer": item.isInfluencer ? "Yes" : "No",
                                        "Open To Work": item.openToWork ? "Yes" : "No",
                                        "Verified": item.isVerified ? "Yes" : "No",
                                        "Tags": (item.tags || []).join(", "),
                                        "About": (item.about || "").replace(/\n/g, " "),
                                        "Updated At": item.updatedAt ? new Date(item.updatedAt).toISOString() : ""
                                    };
                                } else if (type === "company") {
                                    return {
                                        "Company Name": item.companyName || "",
                                        "Website": item.websiteUrl || "",
                                        "LinkedIn URL": item.linkedinUrl || "",
                                        "Logo URL": item.logoUrl || "",
                                        "Description": (item.description || "").replace(/\n/g, " "),
                                        "Employee Count": item.employeeCount || 0,
                                        "Employee Range": item.employeeCountRange || "",
                                        "Follower Count": item.followerCount || 0,
                                        "City": item.city || "",
                                        "Country": item.country || "",
                                        "Postal Code": item.postal_code || "",
                                        "Verified": item.isVerified ? "Yes" : "No",
                                        "Tags": (item.tags || []).join(", "),
                                        "Updated At": item.updatedAt ? new Date(item.updatedAt).toISOString() : ""
                                    };
                                } else if (type === "google_maps") {
                                    return {
                                        "Business Name": item.title || "",
                                        "Category": item.category || "",
                                        "Address": item.address || "",
                                        "Rating": item.totalScore || 0,
                                        "Reviews": item.reviewsCount || 0,
                                        "Phone": item.phone || "",
                                        "Website": item.website || "",
                                        "Google Maps URL": item.url || "",
                                        "Place ID": item.placeId || item.place_id || "",
                                        "Image URL": item.imageUrl || item.image_url || "",
                                        "Emails": (item.emails || []).join(", "),
                                        "Facebook": item.socials?.facebook || "",
                                        "Instagram": item.socials?.instagram || "",
                                        "Twitter": item.socials?.twitter || "",
                                        "TikTok": item.socials?.tiktok || "",
                                        "LinkedIn": item.socials?.linkedin || "",
                                        "Youtube": item.socials?.youtube || "",
                                        "Pinterest": item.socials?.pinterest || "",
                                        "City": item.city || "",
                                        "Tags": (item.tags || []).join(", "),
                                        "Updated At": item.updatedAt ? new Date(item.updatedAt).toISOString() : ""
                                    };
                                } else if (type === "website_contact") {
                                    return {
                                        "Domain": item.domain || "",
                                        "Emails": (item.emails || []).join(", "),
                                        "Phones": (item.phones || []).join(", "),
                                        "LinkedIn": item.linkedin || item.socials?.linkedin || "",
                                        "Facebook": item.facebook || item.socials?.facebook || "",
                                        "Instagram": item.instagram || item.socials?.instagram || "",
                                        "Twitter": item.twitter || item.socials?.twitter || "",
                                        "TikTok": item.tiktok || item.socials?.tiktok || "",
                                        "Youtube": item.youtube || item.socials?.youtube || "",
                                        "Pinterest": item.pinterest || item.socials?.pinterest || "",
                                        "Source URLs": (item.sourceUrls || []).join(", "),
                                        "Tags": (item.tags || []).join(", "),
                                        "Updated At": item.updatedAt ? new Date(item.updatedAt).toISOString() : ""
                                    };
                                } else if (type === "instagram") {
                                    return {
                                        "Username": item.username || "",
                                        "Full Name": item.fullName || "",
                                        "Profile Pic URL": item.profilePicUrl || "",
                                        "Biography": (item.biography || "").replace(/\n/g, " "),
                                        "External URL": item.externalUrl || "",
                                        "Email": item.email || "",
                                        "Public Email": item.publicEmail || "",
                                        "Phone": item.phone || "",
                                        "Public Phone": item.publicPhoneNumber || "",
                                        "Followers": item.followersCount || 0,
                                        "Following": item.followingCount || 0,
                                        "Posts": item.postsCount || 0,
                                        "Business Account": item.isBusinessAccount ? "Yes" : "No",
                                        "Professional Account": item.isProfessionalAccount ? "Yes" : "No",
                                        "Private": item.isPrivate ? "Yes" : "No",
                                        "Verified": item.isVerified ? "Yes" : "No",
                                        "City": item.cityName || "",
                                        "Address": item.addressStreet || "",
                                        "Category": item.category || "",
                                        "Business Category": item.businessCategory || "",
                                        "Overall Category": item.overallCategory || "",
                                        "Engagement Rate": item.medianEr || "",
                                        "Quality": item.quality || "",
                                        "Reels Count": item.reelsCount || 0,
                                        "Highlight Reels": item.highlightReelCount || 0,
                                        "Avg Views": item.medianViews || 0,
                                        "Views/Followers Ratio": item.viewsFollowersRatio || "",
                                        "Last Post (Days)": item.lastPostDays || "",
                                        "Mutual Follow": item.mutualFollow ? "Yes" : "No",
                                        "Detected Language": item.detectedLanguage || "",
                                        "Facebook ID": item.facebookId || "",
                                        "Pronouns": (item.pronouns || []).join(" / "),
                                        "Tags": (item.tags || []).join(", "),
                                        "Updated At": item.updatedAt ? new Date(item.updatedAt).toISOString() : ""
                                    };
                                }
                                return {};
                            });
                            const filename = `${type}-profiles-${new Date().toISOString().split('T')[0]}.csv`;
                            exportToCSV(csvData, filename);
                        }}
                    >
                        <IconDownload className="size-4 mr-2" />
                        Export CSV
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <IconLayoutColumns className="size-4 mr-2" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {typeof column.columnDef.header === 'string'
                                                ? column.columnDef.header
                                                : column.id.replace(/([A-Z])/g, ' $1').trim()}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center gap-6 lg:gap-8">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount() || 1}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <IconChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <IconChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FilterSheet({ type, filters, setFilters }: { type: "personal" | "company" | "google_maps" | "website_contact" | "instagram" | "x", filters: any, setFilters: (f: any) => void }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <IconFilter className="size-4" />
                    Filters
                    {(Object.values(filters).some(v => v === "yes" || v === "no" || (typeof v === 'string' && v.length > 0) || (typeof v === 'number' && v > 0 && v !== 1000000 && v !== 10000000))) && (
                        <Badge variant="secondary" className="h-4 px-1 text-[10px]">Active</Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[500px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                        Narrow down your {type === "personal" ? "personal" : type === "company" ? "company" : type === "google_maps" ? "Google Maps" : type === "instagram" ? "Instagram" : "website contact"} leads.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6 px-1 pb-10">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Reset</h4>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={() => {
                            if (type === "personal") {
                                setFilters({
                                    hasEmail: "all", hasAbout: "all", hasHeadline: "all", hasJobTitle: "all", hasProfilePic: "all",
                                    minConnections: 0, maxConnections: 1000000, minFollowers: 0, maxFollowers: 10000000,
                                    location: "", tags: "", isPremium: "all", isInfluencer: "all", isOpenToWork: "all", isVerified: "all"
                                });
                            } else if (type === "company") {
                                setFilters({
                                    hasWebsite: "all", hasLogo: "all", hasDescription: "all",
                                    minEmployees: 0, maxEmployees: 1000000, minFollowers: 0, maxFollowers: 10000000,
                                    location: "", tags: "", isVerified: "all"
                                });
                            } else if (type === "google_maps") {
                                setFilters({
                                    hasEmail: "all", hasPhone: "all", hasWebsite: "all",
                                    hasInstagram: "all", hasTikTok: "all", hasFacebook: "all", hasTwitter: "all", hasLinkedIn: "all",
                                    minScore: 0, minReviews: 0, location: "", tags: ""
                                });
                            } else if (type === "instagram") {
                                setFilters({
                                    hasEmail: "all", hasPhone: "all",
                                    minFollowers: 0, maxFollowers: 10000000,
                                    minFollowing: 0, maxFollowing: 10000000,
                                    isVerified: "all", isBusinessAccount: "all", isProfessionalAccount: "all",
                                    isPrivate: "all", mutualFollow: "all", hasChannel: "all", quality: "all",
                                    hasWebsite: "all", hasExternalUrl: "all",
                                    minPosts: 0, minReels: 0, minER: 0, minViews: 0, maxLastPostDays: 0,
                                    location: "", tags: ""
                                });
                            } else if (type === "x") {
                                setFilters({
                                    hasEmail: "all", hasPhone: "all", hasWebsite: "all",
                                    isVerified: "all", isProtected: "all",
                                    minFollowers: 0, maxFollowers: 10000000,
                                    minFollowing: 0, maxFollowing: 10000000,
                                    minTweets: 0, maxTweets: 10000000,
                                    minMedia: 0, maxMedia: 10000000,
                                    joinedBefore: "", joinedAfter: "",
                                    location: "", tags: ""
                                });
                            } else {
                                setFilters({
                                    hasEmail: "all", hasPhone: "all",
                                    hasInstagram: "all", hasTikTok: "all", hasFacebook: "all", hasTwitter: "all", hasLinkedIn: "all",
                                    tags: ""
                                });
                            }
                        }}>Clear All</Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {type !== "website_contact" && (
                            <div className="space-y-2">
                                <Label className="text-xs">Location Search</Label>
                                <div className="relative">
                                    <IconSearch className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Country or city..."
                                        value={filters.location ?? ""}
                                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                        className="pl-8 h-8 text-xs bg-muted/20"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label className="text-xs">Filter by Tag</Label>
                            <div className="relative">
                                <IconSearch className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Source or campaign tag..."
                                    value={filters.tags ?? ""}
                                    onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                                    className="pl-8 h-8 text-xs bg-muted/20"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    <div className="space-y-4">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Badges & Status</Label>
                        <div className="grid grid-cols-1 gap-3">
                            {type === "personal" ? (
                                <>
                                    <ThreeStateFilter label="Premium Account" value={filters.isPremium} onChange={(v) => setFilters({ ...filters, isPremium: v })} />
                                    <ThreeStateFilter label="Influencer" value={filters.isInfluencer} onChange={(v) => setFilters({ ...filters, isInfluencer: v })} />
                                    <ThreeStateFilter label="Verified Profile" value={filters.isVerified} onChange={(v) => setFilters({ ...filters, isVerified: v })} />
                                    <ThreeStateFilter label="Open To Work" value={filters.isOpenToWork} onChange={(v) => setFilters({ ...filters, isOpenToWork: v })} />
                                </>
                            ) : type === "company" ? (
                                <ThreeStateFilter label="Verified Page" value={filters.isVerified} onChange={(v) => setFilters({ ...filters, isVerified: v })} />
                            ) : type === "instagram" ? (
                                <>
                                    <ThreeStateFilter label="Verified" value={filters.isVerified} onChange={(v) => setFilters({ ...filters, isVerified: v })} />
                                    <ThreeStateFilter label="Business Account" value={filters.isBusinessAccount} onChange={(v) => setFilters({ ...filters, isBusinessAccount: v })} />
                                    <ThreeStateFilter label="Professional" value={filters.isProfessionalAccount} onChange={(v) => setFilters({ ...filters, isProfessionalAccount: v })} />
                                    <ThreeStateFilter label="Private" value={filters.isPrivate} onChange={(v) => setFilters({ ...filters, isPrivate: v })} />
                                    <ThreeStateFilter label="Mutual Follow" value={filters.mutualFollow} onChange={(v) => setFilters({ ...filters, mutualFollow: v })} />
                                    <ThreeStateFilter label="Has Channel" value={filters.hasChannel} onChange={(v) => setFilters({ ...filters, hasChannel: v })} />
                                </>
                            ) : type === "x" ? (
                                <>
                                    <ThreeStateFilter label="Verified Account" value={filters.isVerified} onChange={(v) => setFilters({ ...filters, isVerified: v })} />
                                    <ThreeStateFilter label="Protected Account" value={filters.isProtected} onChange={(v) => setFilters({ ...filters, isProtected: v })} />
                                </>
                            ) : null}
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    <div className="space-y-4">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data Completeness</Label>
                        <div className="grid grid-cols-1 gap-3">
                            {type === "personal" ? (
                                <>
                                    <ThreeStateFilter label="Has Email" value={filters.hasEmail} onChange={(v) => setFilters({ ...filters, hasEmail: v })} />
                                    <ThreeStateFilter label="Has Headline" value={filters.hasHeadline} onChange={(v) => setFilters({ ...filters, hasHeadline: v })} />
                                    <ThreeStateFilter label="Has About Section" value={filters.hasAbout} onChange={(v) => setFilters({ ...filters, hasAbout: v })} />
                                    <ThreeStateFilter label="Has Profile Pic" value={filters.hasProfilePic} onChange={(v) => setFilters({ ...filters, hasProfilePic: v })} />
                                </>
                            ) : type === "company" ? (
                                <>
                                    <ThreeStateFilter label="Has Website" value={filters.hasWebsite} onChange={(v) => setFilters({ ...filters, hasWebsite: v })} />
                                    <ThreeStateFilter label="Has Logo" value={filters.hasLogo} onChange={(v) => setFilters({ ...filters, hasLogo: v })} />
                                    <ThreeStateFilter label="Has Description" value={filters.hasDescription} onChange={(v) => setFilters({ ...filters, hasDescription: v })} />
                                </>
                            ) : type === "instagram" ? (
                                <>
                                    <ThreeStateFilter label="Has Email" value={filters.hasEmail} onChange={(v) => setFilters({ ...filters, hasEmail: v })} />
                                    <ThreeStateFilter label="Has Phone" value={filters.hasPhone} onChange={(v) => setFilters({ ...filters, hasPhone: v })} />
                                    <ThreeStateFilter label="Has Website" value={filters.hasWebsite} onChange={(v) => setFilters({ ...filters, hasWebsite: v })} />
                                    <ThreeStateFilter label="Has Bio Links" value={filters.hasExternalUrl} onChange={(v) => setFilters({ ...filters, hasExternalUrl: v })} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Lead Quality</Label>
                                            <Select value={filters.quality} onValueChange={(v) => setFilters({ ...filters, quality: v })}>
                                                <SelectTrigger className="h-8 text-xs bg-muted/20">
                                                    <SelectValue placeholder="Any Quality" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Any Quality</SelectItem>
                                                    <SelectItem value="Good">Good</SelectItem>
                                                    <SelectItem value="Average">Average</SelectItem>
                                                    <SelectItem value="Bad">Bad</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Max Last Post (Days)</Label>
                                            <Input
                                                type="number"
                                                placeholder="Days..."
                                                value={filters.maxLastPostDays || ""}
                                                onChange={(e) => setFilters({ ...filters, maxLastPostDays: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                                className="h-8 text-xs bg-muted/20"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : type === "x" ? (
                                <>
                                    <ThreeStateFilter label="Has Email" value={filters.hasEmail} onChange={(v) => setFilters({ ...filters, hasEmail: v })} />
                                    <ThreeStateFilter label="Has Phone" value={filters.hasPhone} onChange={(v) => setFilters({ ...filters, hasPhone: v })} />
                                    <ThreeStateFilter label="Has Website" value={filters.hasWebsite} onChange={(v) => setFilters({ ...filters, hasWebsite: v })} />
                                </>
                            ) : (
                                <>
                                    <ThreeStateFilter label="Has Email" value={filters.hasEmail} onChange={(v) => setFilters({ ...filters, hasEmail: v })} />
                                    <ThreeStateFilter label="Has Phone" value={filters.hasPhone} onChange={(v) => setFilters({ ...filters, hasPhone: v })} />
                                    <ThreeStateFilter label="Has Website" value={filters.hasWebsite} onChange={(v) => setFilters({ ...filters, hasWebsite: v })} />
                                    <Separator className="my-1 opacity-50" />
                                    <ThreeStateFilter label="Has Instagram" value={filters.hasInstagram} onChange={(v) => setFilters({ ...filters, hasInstagram: v })} />
                                    <ThreeStateFilter label="Has TikTok" value={filters.hasTikTok} onChange={(v) => setFilters({ ...filters, hasTikTok: v })} />
                                    <ThreeStateFilter label="Has Facebook" value={filters.hasFacebook} onChange={(v) => setFilters({ ...filters, hasFacebook: v })} />
                                    <ThreeStateFilter label="Has X (Twitter)" value={filters.hasTwitter} onChange={(v) => setFilters({ ...filters, hasTwitter: v })} />
                                    <ThreeStateFilter label="Has LinkedIn" value={filters.hasLinkedIn} onChange={(v) => setFilters({ ...filters, hasLinkedIn: v })} />
                                </>
                            )}
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    {(type === "personal" || type === "company") && (
                        <div className="space-y-4">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{type === "personal" ? "Connections" : "Company Size"}</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={(type === "personal" ? filters.minConnections : filters.minEmployees) || ""}
                                    onChange={(e) => setFilters({ ...filters, [type === "personal" ? "minConnections" : "minEmployees"]: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    className="h-8 text-xs"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={(type === "personal" ? (filters.maxConnections === 1000000 ? "" : filters.maxConnections) : (filters.maxEmployees === 1000000 ? "" : filters.maxEmployees)) || ""}
                                    onChange={(e) => setFilters({ ...filters, [type === "personal" ? "maxConnections" : "maxEmployees"]: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    )}

                    {type === "google_maps" && (
                        <>
                            <div className="space-y-4">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rating & Reviews</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Min Rating</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="0.0"
                                            value={filters.minScore || ""}
                                            onChange={(e) => setFilters({ ...filters, minScore: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Min Reviews</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={filters.minReviews || ""}
                                            onChange={(e) => setFilters({ ...filters, minReviews: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {type === "instagram" && (
                        <div className="space-y-4">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Engagement & Content</Label>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Min Posts</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.minPosts || ""}
                                        onChange={(e) => setFilters({ ...filters, minPosts: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                        className="h-8 text-xs bg-muted/20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Min Reels</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.minReels || ""}
                                        onChange={(e) => setFilters({ ...filters, minReels: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                        className="h-8 text-xs bg-muted/20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Min ER %</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="0.0"
                                        value={filters.minER || ""}
                                        onChange={(e) => setFilters({ ...filters, minER: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                                        className="h-8 text-xs bg-muted/20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Min Views</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.minViews || ""}
                                        onChange={(e) => setFilters({ ...filters, minViews: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                        className="h-8 text-xs bg-muted/20"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {(type === "personal" || type === "company" || type === "instagram" || type === "x") && (
                        <div className="space-y-4">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {type === "personal" ? "Followers" : type === "company" ? "Followers" : "Followers"}
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minFollowers || ""}
                                    onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    className="h-8 text-xs"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={(filters.maxFollowers === 10000000 ? "" : filters.maxFollowers) || ""}
                                    onChange={(e) => setFilters({ ...filters, maxFollowers: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    )}

                    {(type === "instagram" || type === "x") && (
                        <div className="space-y-4">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Following</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minFollowing || ""}
                                    onChange={(e) => setFilters({ ...filters, minFollowing: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    className="h-8 text-xs"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={(filters.maxFollowing === 10000000 ? "" : filters.maxFollowing) || ""}
                                    onChange={(e) => setFilters({ ...filters, maxFollowing: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    )}

                    {type === "x" && (
                        <div className="space-y-4">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tweets</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minTweets || ""}
                                    onChange={(e) => setFilters({ ...filters, minTweets: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    className="h-8 text-xs"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={(filters.maxTweets === 10000000 ? "" : filters.maxTweets) || ""}
                                    onChange={(e) => setFilters({ ...filters, maxTweets: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    )}

                    {type === "x" && (
                        <div className="space-y-4">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Media</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minMedia || ""}
                                    onChange={(e) => setFilters({ ...filters, minMedia: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    className="h-8 text-xs"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={(filters.maxMedia === 10000000 ? "" : filters.maxMedia) || ""}
                                    onChange={(e) => setFilters({ ...filters, maxMedia: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    )}

                    {type === "x" && (
                        <div className="space-y-4">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joined Date</Label>
                            <div className="flex items-center gap-2">
                                <div className="w-full">
                                    <Label className="text-[10px] text-muted-foreground mb-1 block">After</Label>
                                    <Input
                                        type="date"
                                        value={filters.joinedAfter || ""}
                                        onChange={(e) => setFilters({ ...filters, joinedAfter: e.target.value })}
                                        className="h-8 text-xs w-full"
                                    />
                                </div>
                                <span className="text-muted-foreground self-end mb-2">-</span>
                                <div className="w-full">
                                    <Label className="text-[10px] text-muted-foreground mb-1 block">Before</Label>
                                    <Input
                                        type="date"
                                        value={filters.joinedBefore || ""}
                                        onChange={(e) => setFilters({ ...filters, joinedBefore: e.target.value })}
                                        className="h-8 text-xs w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

function ThreeStateFilter({ label, value, onChange }: { label: string, value: "all" | "yes" | "no", onChange: (v: "all" | "yes" | "no") => void }) {
    return (
        <div className="flex items-center justify-between py-1 border-b border-muted/30 pb-2">
            <span className="text-xs font-medium">{label}</span>
            <div className="flex bg-muted/50 rounded-md p-0.5 border">
                {(["all", "yes", "no"] as const).map((opt) => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`px-3 py-1 text-[10px] rounded-sm transition-all ${value === opt
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {opt === "all" ? "Any" : opt === "yes" ? "Yes" : "No"}
                    </button>
                ))}
            </div>
        </div>
    )
}

function exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return;

    // 1. Extract headers from the first object
    const headers = Object.keys(data[0] as any);

    // 2. Map data rows
    const rows = data.map(obj => {
        return headers
            .map(header => {
                let val = (obj as any)[header] ?? "";
                let str = String(val);
                // Escape quotes and wrap in quotes to handle commas within text
                str = str.replace(/"/g, '""');
                return `"${str}"`;
            })
            .join(',');
    });

    // 3. Assemble CSV content
    const csvContent = [headers.join(','), ...rows].join('\n');

    // 4. Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
