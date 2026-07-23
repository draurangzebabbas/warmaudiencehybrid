import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Maps profile_type to its join table and the columns we want to export for each platform
const TYPE_CONFIG: Record<string, { table: string; joinKey: string; columns: string[] }> = {
    google_maps: {
        table: "google_maps_leads",
        joinKey: "lead_id",
        columns: [
            "title", "price_range", "description", "website", "phone",
            "address", "city", "state", "country", "postal_code",
            "latitude", "longitude", "total_score", "reviews_count",
            "category_name", "categories", "email",
            "facebook", "twitter", "instagram", "linkedin",
            "permanently_closed", "business_status",
            "opening_hours", "url",
        ],
    },
    personal: {
        table: "linkedin_profiles",
        joinKey: "linkedin_id",
        columns: [
            "full_name", "first_name", "last_name", "headline", "email",
            "phone", "connections", "followers", "company_name", "job_title",
            "location", "city", "country", "is_premium", "open_to_work",
            "is_verified", "about", "linkedin_url",
        ],
    },
    company: {
        table: "company_profiles",
        joinKey: "company_id",
        columns: [
            "company_name", "linkedin_url", "website_url", "description",
            "employee_count", "employee_count_range", "follower_count",
            "city", "country", "is_verified",
        ],
    },
    instagram: {
        table: "instagram_leads",
        joinKey: "instagram_id",
        columns: [
            "username", "full_name", "biography", "website", "email",
            "public_phone_number", "followers_count", "following_count",
            "posts_count", "category", "is_professional_account",
            "is_verified", "profile_pic_url",
        ],
    },
    x: {
        table: "x_leads",
        joinKey: "x_id",
        columns: [
            "username", "full_name", "biography", "email", "phone",
            "location", "followers_count", "following_count", "tweets_count",
            "is_verified", "is_blue_verified", "verified_type",
            "external_url", "url", "account_created_at",
        ],
    },
    facebook: {
        table: "facebook_leads",
        joinKey: "facebook_id",
        columns: [
            "page_name", "title", "category", "email", "phone",
            "website", "address", "facebook_url", "intro",
            "likes_count", "followers_count", "creation_date",
        ],
    },
    website_contact: {
        table: "website_contacts",
        joinKey: "website_contact_id",
        columns: [
            "domain", "company_name", "first_name", "last_name", "full_name",
            "email", "phone", "job_title", "linkedin_url", "twitter_url",
            "facebook_url", "city", "country", "website",
        ],
    },
    facebook_group: {
        table: "facebook_group_leads",
        joinKey: "facebook_group_id",
        columns: [
            "username", "full_name", "profile_url", "email", "phone",
        ],
    },
};

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const type = url.searchParams.get("type");

        if (!type) {
            return NextResponse.json({ error: "Missing type parameter" }, { status: 400 });
        }

        const config = TYPE_CONFIG[type];
        if (!config) {
            return NextResponse.json({ error: `Unknown lead type: ${type}` }, { status: 400 });
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: authHeader,
                },
            },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch user_leads and join with the real lead table using the correct joinKey
        // We only select the columns we care about from the lead table (no internal DB fields)
        const selectQuery = `tags, ${config.table}(${config.columns.join(", ")})`;

        const { data: leads, error } = await supabase
            .from("user_leads")
            .select(selectQuery)
            .eq("user_id", user.id)
            .eq("profile_type", type);

        if (error) {
            console.error("Supabase error fetching leads for export:", error);
            return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
        }

        if (!leads || leads.length === 0) {
            return NextResponse.json({ error: "No leads found for export" }, { status: 404 });
        }

        // Flatten: merge the joined lead data with tags into one flat row
        const formattedData = leads
            .map((lead: any) => {
                const details = lead[config.table] as Record<string, any> | null;
                if (!details) return null;
                const row: Record<string, any> = { ...details };
                // Add tags as a human-readable column at the end
                if (lead.tags && lead.tags.length > 0) {
                    row["Tags"] = lead.tags.join("; ");
                }
                return row;
            })
            .filter(Boolean) as Record<string, any>[];

        if (formattedData.length === 0) {
            return NextResponse.json({ error: "No data to export" }, { status: 400 });
        }

        // Build CSV headers from the columns config + Tags
        const csvColumns = [...config.columns, "Tags"];

        // Escape helper for CSV
        const escapeCSV = (val: any): string => {
            if (val === null || val === undefined) return '""';
            let str = "";
            if (typeof val === "object") {
                if (Array.isArray(val)) str = val.join("; ");
                else str = JSON.stringify(val);
            } else {
                str = String(val);
            }
            str = str.replace(/"/g, '""');
            return `"${str}"`;
        };

        // Human-readable column header mapping
        const headerLabel = (col: string) =>
            col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        const csvLines: string[] = [];
        // Header row with pretty names
        csvLines.push(csvColumns.map(headerLabel).map(escapeCSV).join(","));

        // Data rows
        formattedData.forEach((row) => {
            const line = csvColumns.map((col) => escapeCSV(row[col])).join(",");
            csvLines.push(line);
        });

        const csvContent = csvLines.join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${type}-leads-${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });

    } catch (error: any) {
        console.error("Export API error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
