"use client";

import { useQuery, useMutation } from "convex/react";
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
    IconBrandTwitter,
    IconBrandTiktok
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
import { supabase } from "@/src/lib/supabase";
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

// --- Page Component ---

export default function ProfilesPage() {
    const personalRaw = useQuery(api.profiles.listPersonal);
    const companyRaw = useQuery(api.profiles.listCompany);
    const googleMapsRaw = useQuery(api.profiles.listGoogleMaps);
    
    // --- New: Supabase Enrichment State ---
    const [sbPersonal, setSbPersonal] = useState<Record<string, any>>({});
    const [sbCompany, setSbCompany] = useState<Record<string, any>>({});
    const [sbGoogleMaps, setSbGoogleMaps] = useState<Record<string, any>>({});

    // 1. Fetch data from Supabase for any profiles that have a supabaseId
    useEffect(() => {
        if (!personalRaw) return;
        const missingIds = personalRaw
            .filter(p => p.supabaseId && !sbPersonal[p.supabaseId])
            .map(p => p.supabaseId);
        
        if (missingIds.length > 0) {
            supabase.from("linkedin_profiles").select("*").in("id", missingIds)
                .then(({ data }) => {
                    if (data) {
                        const newBatch = { ...sbPersonal };
                        data.forEach(d => { newBatch[d.id] = d; });
                        setSbPersonal(newBatch);
                    }
                });
        }
    }, [personalRaw]);

    useEffect(() => {
        if (!companyRaw) return;
        const missingIds = companyRaw
            .filter(c => c.supabaseId && !sbCompany[c.supabaseId])
            .map(c => c.supabaseId);
        
        if (missingIds.length > 0) {
            supabase.from("company_profiles").select("*").in("id", missingIds)
                .then(({ data }) => {
                    if (data) {
                        const newBatch = { ...sbCompany };
                        data.forEach(d => { newBatch[d.id] = d; });
                        setSbCompany(newBatch);
                    }
                });
        }
    }, [companyRaw]);

    useEffect(() => {
        if (!googleMapsRaw) return;
        const missingIds = googleMapsRaw
            .filter(g => g.googleMapsId && !sbGoogleMaps[g.googleMapsId])
            .map(g => g.googleMapsId);
        
        if (missingIds.length > 0) {
            supabase.from("google_maps_leads").select("*").in("id", missingIds)
                .then(({ data }) => {
                    if (data) {
                        const newBatch = { ...sbGoogleMaps };
                        data.forEach(d => { newBatch[d.id] = d; });
                        setSbGoogleMaps(newBatch);
                    }
                });
        }
    }, [googleMapsRaw]);

    // 2. Merge Convex + Supabase data
    const personal = useMemo(() => {
        return (personalRaw || []).map(p => {
            if (p.supabaseId && sbPersonal[p.supabaseId]) {
                const s = sbPersonal[p.supabaseId];
                return {
                    ...p,
                    ...s, // Overwrite with Supabase data
                    firstName: s.first_name,
                    lastName: s.last_name,
                    fullName: s.full_name,
                    profilePic: s.profile_pic,
                    companyName: s.company_name,
                    updatedAt: new Date(s.updated_at).getTime(),
                };
            }
            return p;
        }) as PersonalProfile[];
    }, [personalRaw, sbPersonal]);

    const company = useMemo(() => {
        return (companyRaw || []).map(c => {
            if (c.supabaseId && sbCompany[c.supabaseId]) {
                const s = sbCompany[c.supabaseId];
                return {
                    ...c,
                    ...s,
                    logoUrl: s.logo_url,
                    websiteUrl: s.website_url,
                    employeeCount: s.employee_count,
                    followerCount: s.follower_count,
                    updatedAt: new Date(s.updated_at).getTime(),
                };
            }
            return c;
        }) as CompanyProfile[];
    }, [companyRaw, sbCompany]);

    const googleMaps = useMemo(() => {
        return (googleMapsRaw || []).map(g => {
            if (g.googleMapsId && sbGoogleMaps[g.googleMapsId]) {
                const s = sbGoogleMaps[g.googleMapsId];
                return {
                    ...g,
                    ...s,
                    totalScore: s.total_score,
                    reviewsCount: s.reviews_count,
                    address: s.address,
                    socials: s.socials,
                    imageUrl: s.image_url,
                    updatedAt: new Date(s.updated_at).getTime(),
                };
            }
            return g;
        }) as GoogleMapsLead[];
    }, [googleMapsRaw, sbGoogleMaps]);

    const removeProfile = useMutation(api.profiles.removeProfile);
    const removeProfiles = useMutation(api.profiles.removeProfiles);
    const getOrCreateKey = useMutation(api.apikeys.getOrCreateKey);

    const handleDeleteProfile = async (id: any) => {
        if (!confirm("Are you sure you want to remove this lead from your list? (Global data will be preserved)")) return;
        try {
            await removeProfile({ id });
            toast.success("Lead removed");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    // --- Filter State ---
    const [personalFilters, setPersonalFilters] = useState({
        hasEmail: "all" as "all" | "yes" | "no",
        hasAbout: "all" as "all" | "yes" | "no",
        hasHeadline: "all" as "all" | "yes" | "no",
        hasJobTitle: "all" as "all" | "yes" | "no",
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
        minScore: 0,
        minReviews: 0,
        location: "",
        tags: "",
    });

    // --- Filtered Data ---
    const filteredPersonal = useMemo(() => {
        return personal.filter((p) => {
            // 3-State Data Presence
            if (personalFilters.hasEmail === "yes" && !p.email) return false;
            if (personalFilters.hasEmail === "no" && p.email) return false;

            if (personalFilters.hasAbout === "yes" && !p.about) return false;
            if (personalFilters.hasAbout === "no" && p.about) return false;

            if (personalFilters.hasHeadline === "yes" && !p.headline) return false;
            if (personalFilters.hasHeadline === "no" && p.headline) return false;

            if (personalFilters.hasProfilePic === "yes" && !p.profilePic) return false;
            if (personalFilters.hasProfilePic === "no" && p.profilePic) return false;

            // Ranges
            const connections = p.connections || 0;
            if (connections < personalFilters.minConnections) return false;
            if (personalFilters.maxConnections > 0 && connections > personalFilters.maxConnections) return false;

            const followers = p.followers || 0;
            if (followers < personalFilters.minFollowers) return false;
            if (personalFilters.maxFollowers > 0 && followers > personalFilters.maxFollowers) return false;

            // Search Fields
            if (personalFilters.location) {
                const loc = (p.country || p.location?.country || "").toLowerCase();
                const city = (p.city || p.location?.city || "").toLowerCase();
                const q = personalFilters.location.toLowerCase();
                if (!loc.includes(q) && !city.includes(q)) return false;
            }

            if (personalFilters.tags) {
                const q = personalFilters.tags.toLowerCase();
                const hasMatch = (p.tags || []).some(t => t.toLowerCase().includes(q));
                if (!hasMatch) return false;
            }

            // 3-State Badges
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
            // 3-State Data Presence
            if (companyFilters.hasWebsite === "yes" && !c.websiteUrl) return false;
            if (companyFilters.hasWebsite === "no" && c.websiteUrl) return false;

            if (companyFilters.hasLogo === "yes" && !c.logoUrl) return false;
            if (companyFilters.hasLogo === "no" && c.logoUrl) return false;

            if (companyFilters.hasDescription === "yes" && !c.description) return false;
            if (companyFilters.hasDescription === "no" && c.description) return false;

            // Ranges
            const employees = c.employeeCount || 0;
            if (employees < companyFilters.minEmployees) return false;
            if (companyFilters.maxEmployees > 0 && employees > companyFilters.maxEmployees) return false;

            const followers = c.followerCount || 0;
            if (followers < companyFilters.minFollowers) return false;
            if (companyFilters.maxFollowers > 0 && followers > companyFilters.maxFollowers) return false;

            // Search Fields
            if (companyFilters.location) {
                const loc = (c.country || "").toLowerCase();
                const city = (c.city || "").toLowerCase();
                const q = companyFilters.location.toLowerCase();
                if (!loc.includes(q) && !city.includes(q)) return false;
            }

            if (companyFilters.tags) {
                const q = companyFilters.tags.toLowerCase();
                const hasMatch = (c.tags || []).some(t => t.toLowerCase().includes(q));
                if (!hasMatch) return false;
            }

            // 3-State Badges
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

            if (g.totalScore && g.totalScore < googleMapsFilters.minScore) return false;
            if (g.reviewsCount && g.reviewsCount < googleMapsFilters.minReviews) return false;

            if (googleMapsFilters.location && !g.city?.toLowerCase().includes(googleMapsFilters.location.toLowerCase())) return false;

            if (googleMapsFilters.tags) {
                const q = googleMapsFilters.tags.toLowerCase();
                const hasMatch = (g.tags || []).some(t => t.toLowerCase().includes(q));
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [googleMaps, googleMapsFilters]);

    const handleUpdateProfile = async (url: string) => {
        try {
            toast.info("Queueing update...");
            const apiData = await getOrCreateKey();
            if (!apiData?.key) throw new Error("Could not retrieve API Key");
            const key = apiData.key;

            const res = await fetch(`${process.env.NEXT_PUBLIC_RENDER_BACKEND_URL || "http://localhost:8000"}/api/scrape-linkedin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
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
            accessorKey: "firstName",
            header: "First Name",
            cell: ({ row }) => row.original.firstName || "-",
        },
        {
            accessorKey: "lastName",
            header: "Last Name",
            cell: ({ row }) => row.original.lastName || "-",
        },
        {
            accessorKey: "fullName",
            header: "Full Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.fullName || "Unknown"}</span>
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
            accessorKey: "about",
            header: "About",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate group relative" title={row.original.about}>
                    {row.original.about || "-"}
                </div>
            )
        },
        {
            accessorKey: "companyName",
            header: "Company",
            cell: ({ row }) => row.original.companyName || "-",
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
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate text-xs text-muted-foreground" title={row.original.description}>
                    {row.original.description || "N/A"}
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
            accessorKey: "country",
            header: "Location",
            cell: ({ row }) => (
                <div className="flex flex-col text-xs">
                    <span>{row.original.city}</span>
                    <span className="text-muted-foreground">{row.original.country}</span>
                </div>
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
            header: "Photo",
            cell: ({ row }) => (
                <Avatar className="h-9 w-9 rounded-md">
                    <AvatarImage src={row.original.imageUrl || undefined} alt={row.original.title} />
                    <AvatarFallback className="rounded-md">{row.original.title?.slice(0, 2) || "GM"}</AvatarFallback>
                </Avatar>
            ),
        },
        {
            accessorKey: "title",
            header: "Business Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.title || "Unknown"}</span>
                    <div className="flex items-center gap-1 text-[10px] text-amber-500">
                        <span>★ {row.original.totalScore || "0"}</span>
                        <span className="text-muted-foreground">({row.original.reviewsCount || "0"} reviews)</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => row.original.phone || "-",
        },
        {
            accessorKey: "emails",
            header: "Emails",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5 max-w-[150px]">
                    {row.original.emails?.slice(0, 2).map((email, idx) => (
                        <span key={idx} className="text-[10px] truncate">{email}</span>
                    ))}
                    {(row.original.emails?.length || 0) > 2 && <span className="text-[9px] text-muted-foreground">+{row.original.emails!.length - 2} more</span>}
                    {(!row.original.emails || row.original.emails.length === 0) && "-"}
                </div>
            ),
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
            accessorKey: "address",
            header: "Address",
            cell: ({ row }) => (
                <div className="max-w-[150px] truncate text-xs" title={row.original.address}>
                    {row.original.address || "-"}
                </div>
            ),
        },
        {
            accessorKey: "city",
            header: "City",
            cell: ({ row }) => row.original.city || "-",
        },
        {
            id: "socials",
            header: "Socials",
            cell: ({ row }) => {
                const s = row.original.socials;
                if (!s) return "-";
                return (
                    <div className="flex gap-1.5">
                        {s.facebook && <a href={s.facebook} target="_blank" className="text-blue-600 hover:opacity-80"><IconBrandFacebook size={14} /></a>}
                        {s.instagram && <a href={s.instagram} target="_blank" className="text-pink-600 hover:opacity-80"><IconBrandInstagram size={14} /></a>}
                        {s.linkedin && <a href={s.linkedin} target="_blank" className="text-blue-700 hover:opacity-80"><IconBrandLinkedin size={14} /></a>}
                        {s.twitter && <a href={s.twitter} target="_blank" className="text-sky-500 hover:opacity-80"><IconBrandTwitter size={14} /></a>}
                        {s.tiktok && <a href={s.tiktok} target="_blank" className="text-black hover:opacity-80"><IconBrandTiktok size={14} /></a>}
                    </div>
                )
            }
        },
        {
            accessorKey: "tags",
            header: "Tags",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 max-w-[120px]">
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
            header: "Added",
            cell: ({ row }) => {
                if (!row.original.updatedAt) return "-";
                return (
                    <div className="flex items-center text-xs text-muted-foreground">
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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.url)}>
                            Copy Maps URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={row.original.url} target="_blank" rel="noopener noreferrer">
                                <IconExternalLink className="mr-2 h-4 w-4" /> View on Maps
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


    return (
        <div className="p-0 space-y-6">
            <div className="px-6 pt-6 md:px-8 md:pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                            </TabsList>

                            <TabsContent value="personal">
                                <GenericProfileTable
                                    data={filteredPersonal}
                                    columns={personalColumns}
                                    isLoading={personalRaw === undefined}
                                    filterColumn="fullName"
                                    type="personal"
                                    filters={personalFilters}
                                    setFilters={setPersonalFilters}
                                    onBulkDelete={async (ids) => {
                                        if (confirm(`Are you sure you want to remove ${ids.length} profiles?`)) {
                                            await removeProfiles({ ids });
                                            toast.success("Profiles removed");
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
                                                body: JSON.stringify({ profileUrls: urls })
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
                                    isLoading={companyRaw === undefined}
                                    filterColumn="companyName"
                                    type="company"
                                    filters={companyFilters}
                                    setFilters={setCompanyFilters}
                                    onBulkDelete={async (ids) => {
                                        if (confirm(`Are you sure you want to remove ${ids.length} companies?`)) {
                                            await removeProfiles({ ids });
                                            toast.success("Companies removed");
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
                                                body: JSON.stringify({ profileUrls: urls })
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
                                    isLoading={googleMapsRaw === undefined}
                                    filterColumn="title"
                                    type="google_maps"
                                    filters={googleMapsFilters}
                                    setFilters={setGoogleMapsFilters}
                                    onBulkDelete={async (ids) => {
                                        if (confirm(`Are you sure you want to remove ${ids.length} Google Maps leads?`)) {
                                            await removeProfiles({ ids });
                                            toast.success("Leads removed");
                                        }
                                    }}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// --- Generic Table Implementation ---

// --- Generic Table Implementation ---

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
    filterColumn: string
    type: "personal" | "company" | "google_maps"
    filters: any
    setFilters: (filters: any) => void
    onBulkDelete?: (ids: any[]) => Promise<void>
    onBulkUpdate?: (urls: string[]) => Promise<void>
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
    onBulkUpdate
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
                                    const urls = table.getSelectedRowModel().rows.map(r => (r.original as any).linkedinUrl);
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
                                        "Profile Pic URL": item.profilePic || "",
                                        "Headline": item.headline || "",
                                        "Email": item.email || "",
                                        "City": item.city || item.location?.city || "",
                                        "Country": item.country || item.location?.country || "",
                                        "Followers": item.followers || 0,
                                        "Connections": item.connections || 0,
                                        "Premium": item.isPremium ? "Yes" : "No",
                                        "Influencer": item.isInfluencer ? "Yes" : "No",
                                        "Open To Work": item.openToWork ? "Yes" : "No",
                                        "Verified": item.isVerified ? "Yes" : "No",
                                        "Tags": (item.tags || []).join(", "),
                                        "About": (item.about || "").replace(/\n/g, " "),
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
                                        "Verified": item.isVerified ? "Yes" : "No",
                                        "Tags": (item.tags || []).join(", "),
                                    };
                                } else {
                                    return {
                                        "Business Name": item.title || "",
                                        "Address": item.address || "",
                                        "Rating": item.totalScore || 0,
                                        "Reviews": item.reviewsCount || 0,
                                        "Phone": item.phone || "",
                                        "Emails": (item.emails || []).join(", "),
                                        "Website": item.website || "",
                                        "Facebook": item.socials?.facebook || "",
                                        "Instagram": item.socials?.instagram || "",
                                        "LinkedIn": item.socials?.linkedin || "",
                                        "Twitter": item.socials?.twitter || "",
                                        "TikTok": item.socials?.tiktok || "",
                                        "City": item.city || "",
                                        "Google Maps URL": item.url || "",
                                        "Tags": (item.tags || []).join(", "),
                                        "Updated At": item.updatedAt ? new Date(item.updatedAt).toISOString() : ""
                                    };
                                }
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

function FilterSheet({ type, filters, setFilters }: { type: "personal" | "company" | "google_maps", filters: any, setFilters: (f: any) => void }) {
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
                        Narrow down your {type === "personal" ? "personal" : "company"} leads.
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
                            } else {
                                setFilters({
                                    hasWebsite: "all", hasLogo: "all", hasDescription: "all",
                                    minEmployees: 0, maxEmployees: 1000000, minFollowers: 0, maxFollowers: 10000000,
                                    location: "", tags: "", isVerified: "all"
                                });
                            }
                        }}>Clear All</Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
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
                            ) : (
                                <ThreeStateFilter label="Verified Page" value={filters.isVerified} onChange={(v) => setFilters({ ...filters, isVerified: v })} />
                            )}
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
                            ) : (
                                <>
                                    <ThreeStateFilter label="Has Website" value={filters.hasWebsite} onChange={(v) => setFilters({ ...filters, hasWebsite: v })} />
                                    <ThreeStateFilter label="Has Logo" value={filters.hasLogo} onChange={(v) => setFilters({ ...filters, hasLogo: v })} />
                                    <ThreeStateFilter label="Has Description" value={filters.hasDescription} onChange={(v) => setFilters({ ...filters, hasDescription: v })} />
                                </>
                            )}
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    <div className="space-y-4">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{type === "personal" ? "Network Size" : "Company Size"}</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={type === "personal" ? filters.minConnections : filters.minEmployees}
                                onChange={(e) => setFilters({ ...filters, [type === "personal" ? "minConnections" : "minEmployees"]: parseInt(e.target.value) || 0 })}
                                className="h-8 text-xs"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={type === "personal" ? filters.maxConnections : filters.maxEmployees}
                                onChange={(e) => setFilters({ ...filters, [type === "personal" ? "maxConnections" : "maxEmployees"]: parseInt(e.target.value) || 0 })}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Followers</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={filters.minFollowers}
                                onChange={(e) => setFilters({ ...filters, minFollowers: parseInt(e.target.value) || 0 })}
                                className="h-8 text-xs"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={filters.maxFollowers}
                                onChange={(e) => setFilters({ ...filters, maxFollowers: parseInt(e.target.value) || 0 })}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>
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
    const headers = Object.keys(data[0]);

    // 2. Map data rows
    const rows = data.map(obj => {
        return headers
            .map(header => {
                let val = obj[header] ?? "";
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
