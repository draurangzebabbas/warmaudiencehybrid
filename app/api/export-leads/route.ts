import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Maps profile_type -> { table, idField (in user_leads), columns to export }
const TYPE_CONFIG: Record<string, { table: string; idField: string; columns: string[] }> = {
    google_maps: {
        table: "google_maps_leads",
        idField: "lead_id",
        columns: [
            "title", "total_score", "reviews_count", "address", "phone",
            "emails", "website", "city", "image_url", "place_id", "url"
        ],
    },
    personal: {
        table: "linkedin_profiles",
        idField: "linkedin_id",
        columns: [
            "full_name", "first_name", "last_name", "headline", "email",
            "connections", "followers", "company_name", "job_title",
            "location", "city", "country", "is_premium", "open_to_work",
            "is_verified", "about", "linkedin_url",
        ],
    },
    company: {
        table: "company_profiles",
        idField: "company_id",
        columns: [
            "company_name", "linkedin_url", "website_url", "description",
            "employee_count", "employee_count_range", "follower_count",
            "city", "country", "is_verified",
        ],
    },
    instagram: {
        table: "instagram_leads",
        idField: "instagram_id",
        columns: [
            "username", "full_name", "biography", "external_url", "email",
            "public_phone_number", "followers_count", "following_count",
            "posts_count", "category", "is_professional_account",
            "is_verified", "profile_pic_url",
        ],
    },
    x: {
        table: "x_leads",
        idField: "x_id",
        columns: [
            "username", "full_name", "biography", "email", "phone",
            "location", "followers_count", "following_count", "tweets_count",
            "is_verified", "is_blue_verified", "verified_type",
            "external_url", "url", "account_created_at",
        ],
    },
    facebook: {
        table: "facebook_leads",
        idField: "facebook_id",
        columns: [
            "page_name", "title", "category", "email", "phone",
            "website", "address", "facebook_url", "intro",
            "likes_count", "followers_count", "creation_date",
        ],
    },
    website_contact: {
        table: "website_contacts",
        idField: "website_contact_id",
        columns: [
            "domain", "emails", "phones", "linkedin", "twitter",
            "instagram", "facebook", "youtube", "tiktok", "pinterest"
        ],
    },
    facebook_group: {
        table: "facebook_groups",
        idField: "facebook_group_id",
        columns: [
            "name", "url", "member_count", "visibility", "post_frequency",
            "viewer_join_state", "member_info", "search_keyword"
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
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Step 1: Get the user's lead IDs + tags from the junction table
        const userLeadsResult = await (supabase
            .from("user_leads")
            .select(`${config.idField}, tags`)
            .eq("user_id", user.id)
            .eq("profile_type", type)
            .not(config.idField, "is", null) as unknown as Promise<{
                data: Record<string, unknown>[] | null;
                error: { message: string } | null;
            }>);

        const { data: userLeads, error: userLeadsError } = userLeadsResult;

        if (userLeadsError) {
            console.error("Error fetching user_leads:", userLeadsError);
            return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
        }

        if (!userLeads || userLeads.length === 0) {
            return NextResponse.json({ error: "No leads found for export" }, { status: 404 });
        }

        // Build a tags map: leadId -> tags[]
        const tagsMap = new Map<string, string[]>();
        const leadIds: string[] = [];
        for (const ul of userLeads) {
            const id = ul[config.idField];
            if (id && typeof id === "string") {
                leadIds.push(id);
                tagsMap.set(id, ul.tags as string[] || []);
            }
        }

        // Step 2: Fetch the actual lead details from the real table
        // leadIds contains values of config.idField (e.g. lead_id, linkedin_id)
        // which are foreign keys referencing the leads table's `id` column
        const selectColumns = ["id", ...config.columns].join(",");
        const { data: leadDetails, error: detailsError } = await supabase
            .from(config.table)
            .select(selectColumns)
            .in("id", leadIds);

        if (detailsError) {
            console.error("Error fetching lead details:", JSON.stringify(detailsError));
            return NextResponse.json({ error: "Failed to fetch lead details", detail: detailsError.message }, { status: 500 });
        }

        if (!leadDetails || leadDetails.length === 0) {
            return NextResponse.json({ error: "No lead details found" }, { status: 404 });
        }

        // Step 3: Merge lead details with tags
        // tagsMap is keyed by the idField value (which equals the lead's `id`)
        const formattedData = (leadDetails as Record<string, any>[]).map((lead) => {
            const row: Record<string, any> = {};
            for (const col of config.columns) {
                row[col] = lead[col] ?? "";
            }
            // The idField values stored in user_leads reference the lead's `id`
            const tags = tagsMap.get(String(lead.id)) || [];
            row["tags"] = tags.length > 0 ? tags.join("; ") : "";
            return row;
        });

        // Build CSV columns = defined columns + Tags
        const csvColumns = [...config.columns, "tags"];

        // Human-readable header labels
        const headerLabel = (col: string) =>
            col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        // CSV escape helper
        const escapeCSV = (val: any): string => {
            if (val === null || val === undefined || val === "") return '""';
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

        const csvLines: string[] = [];
        csvLines.push(csvColumns.map(headerLabel).map(escapeCSV).join(","));
        formattedData.forEach((row) => {
            csvLines.push(csvColumns.map((col) => escapeCSV(row[col])).join(","));
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
