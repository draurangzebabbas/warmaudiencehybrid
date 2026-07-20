"use client";
import React from "react";

import { supabase } from "@/src/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    IconCurrencyDollar,
    IconUsers,
    IconClick,
    IconCopy,
    IconLoader
} from "@tabler/icons-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { IconSettings, IconShieldCheck, IconWallet } from "@tabler/icons-react";

// Helper to format currency
const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

// Helper to fill zero-data dates
const generateChartData = (commissions: any[], days = 30) => {
    const data = [];
    const now = new Date();
    const map = new Map();

    // Group commissions by date
    if (commissions) {
        commissions.forEach((c: any) => {
            const date = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            map.set(date, (map.get(date) || 0) + c.commission_amount);
        });
    }

    // Fill last N days
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        data.push({
            date: dateStr,
            amount: map.get(dateStr) || 0,
        });
    }
    return data;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {label}
                        </span>
                        <span className="font-bold text-muted-foreground">
                            {formatCurrency(payload[0].value || 0)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function AffiliateDashboard() {
    return (
        <React.Suspense fallback={
            <div className="flex h-full items-center justify-center p-8">
                <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <AffiliateDashboardContent />
        </React.Suspense>
    );
}

function AffiliateDashboardContent() {
    // 0. Check if enabled
    if (process.env.NEXT_PUBLIC_AFFILIATE_ENABLED !== 'true') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                <h1 className="text-2xl font-bold">Affiliate Program</h1>
                <p className="text-muted-foreground max-w-sm mt-2">
                    The affiliate program is currently not active for this project.
                    Please check back later or contact support.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => window.location.href = '/dashboard'}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    // 1. Fetch Data via Supabase API routes
    const [profile, setProfile] = useState<any>(undefined);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [commissions, setCommissions] = useState<any[]>([]);

    const fetchData = async () => {
        // Profile (auto-creates if missing)
        const profileRes = await fetch("/api/affiliate/profile");
        const profileData = await profileRes.json();
        setProfile(profileData.profile ?? null);

        if (!profileData.profile) return;

        const affiliateId = profileData.profile.id;

        // Referrals
        const { data: refs } = await supabase
            .from("affiliate_referrals")
            .select("*")
            .eq("affiliate_id", affiliateId)
            .order("signup_date", { ascending: false });
        setReferrals(refs || []);

        // Payouts
        const { data: pays } = await supabase
            .from("affiliate_payouts")
            .select("*")
            .eq("affiliate_id", affiliateId)
            .order("requested_at", { ascending: false });
        setPayouts(pays || []);

        // Commissions
        const { data: comms } = await supabase
            .from("affiliate_commissions")
            .select("*")
            .eq("affiliate_id", affiliateId)
            .order("created_at", { ascending: false });
        setCommissions(comms || []);
    };

    useEffect(() => { fetchData(); }, []);

    // Mutations replaced by API calls
    const createProfile = async () => {
        await fetch("/api/affiliate/profile"); // GET auto-creates
        await fetchData();
    };

    const [isPayoutLoading, setIsPayoutLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [timeRange, setTimeRange] = useState("30");
    const [mounted, setMounted] = useState(false);

    // Settings state
    // Settings state
    const [payoutEmail, setPayoutEmail] = useState("");
    const [payoutName, setPayoutName] = useState("");
    const [payoutMethod, setPayoutMethod] = useState("wise_bank");
    const [payoutBankCountry, setPayoutBankCountry] = useState("US");
    const [payoutBankCurrency, setPayoutBankCurrency] = useState("USD");
    const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
    const [payoutRoutingNumber, setPayoutRoutingNumber] = useState("");
    const [payoutIban, setPayoutIban] = useState("");
    const [payoutSwiftCode, setPayoutSwiftCode] = useState("");
    const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(false);

    // Sync state with profile data when it loads
    useEffect(() => {
        setMounted(true);
        if (profile) {
            setPayoutEmail(profile.payout_email || "");
            setPayoutName(profile.payout_name || "");
            setPayoutMethod(profile.payout_method || "wise_email");
            setPayoutBankCountry(profile.payout_bank_country || "US");
            setPayoutBankCurrency(profile.payout_bank_currency || "USD");
            setPayoutAccountNumber(profile.payout_account_number || "");
            setPayoutRoutingNumber(profile.payout_routing_number || "");
            setPayoutIban(profile.payout_iban || "");
            setPayoutSwiftCode(profile.payout_swift_code || "");
            setAutoPayoutEnabled(profile.auto_payout_enabled || false);
        }
    }, [profile]);

    const chartData = useMemo(() =>
        generateChartData(commissions || [], parseInt(timeRange)),
        [commissions, timeRange]);

    // Sync payout settings from profile

    const handleActivate = async () => {
        setIsCreating(true);
        try {
            await createProfile();
            toast.success("Affiliate account activated!");
        } catch (error) {
            toast.error("Failed to activate account");
        } finally {
            setIsCreating(false);
        }
    };

    // 2. Loading State
    if (profile === undefined) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // 3. Not an Affiliate State (Self-healing UI)
    if (profile === null) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 p-12 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                    <IconBadge className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Join our Affiliate Program</h2>
                <p className="max-w-md text-muted-foreground">
                    Earn 30% commission on every subscription you refer.
                    Click below to activate your unique referral link.
                </p>
                <Button onClick={handleActivate} disabled={isCreating}>
                    {isCreating ? <IconLoader className="animate-spin mr-2" /> : null}
                    {isCreating ? "Activating..." : "Activate Affiliate Account"}
                </Button>
            </div>
        );
    }

    // 4. Helper Functions
    const copyLink = () => {
        const link = `${window.location.origin}?ref=${profile.referral_code}`;
        navigator.clipboard.writeText(link);
        toast.success("Referral link copied!");
    };

    const handleRequestPayout = async () => {
        if (!profile) return;

        const isEmailMethod = payoutMethod === "wise_email";
        const isBankMethod = payoutMethod === "wise_bank";

        if (!payoutName) {
            toast.error("Account holder name is required.");
            return;
        }

        if (isEmailMethod && !payoutEmail) {
            toast.error("Wise email is required for email payouts.");
            return;
        }

        if (isBankMethod && !payoutAccountNumber && !payoutIban) {
            toast.error("Bank details (Account Number or IBAN) are required.");
            return;
        }

        if (profile.available_balance < 50) {
            toast.error("Minimum payout is $50");
            return;
        }

        try {
            setIsPayoutLoading(true);
            const response = await fetch("/api/affiliate/payout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: profile.available_balance })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to request payout");
            }

            toast.success(data.message || "Payout requested successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to request payout");
        } finally {
            setIsPayoutLoading(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSavingSettings(true);
            const res = await fetch("/api/affiliate/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    payout_email: payoutEmail,
                    payout_name: payoutName,
                    payout_method: payoutMethod,
                    payout_bank_country: payoutBankCountry,
                    payout_bank_currency: payoutBankCurrency,
                    payout_account_number: payoutAccountNumber,
                    payout_routing_number: payoutRoutingNumber,
                    payout_iban: payoutIban,
                    payout_swift_code: payoutSwiftCode,
                    auto_payout_enabled: autoPayoutEnabled,
                }),
            });
            if (!res.ok) throw new Error("Save failed");
            toast.success("Payout method saved!");
        } catch (error) {
            toast.error("Failed to save payout method");
        } finally {
            setIsSavingSettings(false);
        }
    };
    if (!mounted) return null;

    return (
        <div className="flex flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
                    <p className="text-muted-foreground">
                        Monitor your performance and earnings in real-time.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Ref Code</span>
                        <div className="h-4 w-[1px] bg-border" />
                        <span className="font-mono font-medium text-foreground">{profile.referral_code}</span>
                    </div>
                    <Button onClick={copyLink} variant="outline" className="gap-2">
                        <IconCopy className="h-4 w-4" />
                        Copy Link
                    </Button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:border-primary/50 transition-colors shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(profile.total_earnings)}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="text-green-500 font-medium">Lifetime</span> commission
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:border-primary/50 transition-colors border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                        <IconCurrencyDollar className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(profile.available_balance)}</div>
                        <Button
                            variant="link"
                            className="h-auto p-0 text-xs text-muted-foreground mt-1 cursor-not-allowed opacity-50"
                            disabled={true}
                        >
                            Payouts Coming Soon
                        </Button>
                    </CardContent>
                </Card>
                <Card className="hover:border-primary/50 transition-colors shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profile.total_signups}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {profile.total_conversions} paid customers
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:border-primary/50 transition-colors shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <IconClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(profile.total_clicks > 0 ? (profile.total_signups / profile.total_clicks * 100).toFixed(1) : 0)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {profile.total_clicks} total clicks
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart Section */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-7 lg:col-span-4 xl:col-span-5 h-[400px] flex flex-col shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Revenue Overview</CardTitle>
                            <CardDescription>Your daily commission earnings over time.</CardDescription>
                        </div>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                                <SelectItem value="90">Last 3 months</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 pl-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Right Column: Quick Actions / Promo */}
                <Card className="col-span-7 lg:col-span-3 xl:col-span-2 flex flex-col justify-center items-center text-center p-6 bg-muted/20 border-dashed shadow-sm">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                        <IconCurrencyDollar className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Boost Your Earnings</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-6">
                        Share your link on social media to reach more potential customers. The more you share, the more you earn!
                    </p>
                    <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                        <Button variant="outline" className="w-full" onClick={() => {
                            const text = encodeURIComponent("Check out this amazing tool! I highly recommend it.");
                            const url = encodeURIComponent(`${window.location.origin}?ref=${profile.referral_code}`);
                            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                        }}>
                            Twitter
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => {
                            const text = encodeURIComponent("Check out this amazing tool! I highly recommend it. ");
                            const url = encodeURIComponent(`${window.location.origin}?ref=${profile.referral_code}`);
                            window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}${url}`, '_blank');
                        }}>
                            LinkedIn
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="referrals" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="referrals">Referrals</TabsTrigger>
                        <TabsTrigger value="payouts">Payout History</TabsTrigger>
                        <TabsTrigger value="settings">Payout Method</TabsTrigger>
                    </TabsList>
                </div>

                {/* Referrals Tab */}
                <TabsContent value="referrals">
                    <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted/50 sticky top-0 z-10 font-medium">
                                <TableRow>
                                    <TableHead className="w-[200px]">User</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Plan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                {!referrals || referrals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No referrals yet. Share your link to get started!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    referrals.map((ref: any) => (
                                        <TableRow key={ref._id}>
                                            <TableCell className="font-medium">{ref.referred_user_email}</TableCell>
                                            <TableCell>{new Date(ref.signup_date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge className={ref.status === "paid" ? "bg-green-500 hover:bg-green-600 text-white" : ""} variant={ref.status === "paid" ? "default" : "secondary"}>
                                                    {ref.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">{ref.plan || "-"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* Payouts Tab */}
                <TabsContent value="payouts">
                    <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted/50 sticky top-0 z-10 font-medium">
                                <TableRow>
                                    <TableHead>Date Requested</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date Completed</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                {!payouts || payouts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No payouts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payouts.map((payout: any) => (
                                        <TableRow key={payout._id}>
                                            <TableCell>{new Date(payout.requested_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">${payout.amount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge className={payout.status === "completed" ? "bg-green-500 hover:bg-green-600 text-white" : ""} variant={
                                                    payout.status === "completed" ? "default" :
                                                        payout.status === "failed" ? "destructive" : "secondary"
                                                }>
                                                    {payout.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {payout.completed_at ? new Date(payout.completed_at).toLocaleDateString() : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                    <Card className="max-w-2xl mx-auto shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <IconWallet className="h-5 w-5 text-primary" />
                                <CardTitle>Payout Method</CardTitle>
                            </div>
                            <CardDescription>
                                Configure how you want to receive your commissions.
                                We support Wise Email payouts (Easiest) and Direct Bank payouts (Global).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveSettings} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="method">Payout Strategy</Label>
                                    <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                                        <SelectTrigger id="method">
                                            <SelectValue placeholder="Select Method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="wise_bank">
                                                <div className="flex items-center gap-2">
                                                    <IconWallet className="h-4 w-4" />
                                                    <span>Direct Bank Account</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Enter your bank details directly for faster processing.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payoutName">Account Holder Full Name</Label>
                                    <Input
                                        id="payoutName"
                                        type="text"
                                        placeholder="John Doe"
                                        value={payoutName}
                                        onChange={(e) => setPayoutName(e.target.value)}
                                        required
                                    />
                                </div>

                                {payoutMethod === "wise_email" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Wise Account Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your-email@example.com"
                                            value={payoutEmail}
                                            onChange={(e) => setPayoutEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                {payoutMethod === "wise_bank" && (
                                    <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Bank Country (ISO)</Label>
                                                <Input
                                                    placeholder="US"
                                                    value={payoutBankCountry}
                                                    onChange={(e) => setPayoutBankCountry(e.target.value.toUpperCase())}
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Currency (ISO)</Label>
                                                <Input
                                                    placeholder="USD"
                                                    value={payoutBankCurrency}
                                                    onChange={(e) => setPayoutBankCurrency(e.target.value.toUpperCase())}
                                                    maxLength={3}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>IBAN (For Europe/GB)</Label>
                                            <Input
                                                placeholder="GB29..."
                                                value={payoutIban}
                                                onChange={(e) => setPayoutIban(e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Account Number (US/ABA)</Label>
                                                <Input
                                                    placeholder="12345678"
                                                    value={payoutAccountNumber}
                                                    onChange={(e) => setPayoutAccountNumber(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Routing Number (US/ABA)</Label>
                                                <Input
                                                    placeholder="021000021"
                                                    value={payoutRoutingNumber}
                                                    onChange={(e) => setPayoutRoutingNumber(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/30">
                                    <Checkbox
                                        id="autoPayout"
                                        checked={autoPayoutEnabled}
                                        onCheckedChange={(checked) => setAutoPayoutEnabled(checked as boolean)}
                                    />
                                    <div className="space-y-1 leading-none">
                                        <Label htmlFor="autoPayout">
                                            Enable Auto-Payout
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically request a payout when balance exceeds $50.00.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-4 text-sm text-primary border border-primary/10">
                                    <IconShieldCheck className="h-5 w-5 shrink-0" />
                                    <p>
                                        Payouts are processed once your balance reaches the <strong>$50.00</strong> threshold.
                                    </p>
                                </div>

                                <Button type="submit" className="w-full" disabled={isSavingSettings}>
                                    {isSavingSettings ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isSavingSettings ? "Saving..." : "Save Payout Method"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function IconBadge({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.78 4 4 0 0 1 0-6.74Z" />
        </svg>
    )
}

