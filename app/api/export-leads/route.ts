import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const type = url.searchParams.get("type");

        if (!type) {
            return NextResponse.json({ error: "Missing type parameter" }, { status: 400 });
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

        // Fetch all leads for this user and type
        const { data: leads, error } = await supabase
            .from("user_leads")
            .select("*")
            .eq("user_id", user.id)
            .eq("profile_type", type);

        if (error) {
            console.error("Supabase error fetching leads for export:", error);
            return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
        }

        if (!leads || leads.length === 0) {
            return NextResponse.json({ error: "No leads found for export" }, { status: 404 });
        }

        // Format data based on type
        let formattedData = leads.map((lead) => {
            const details = lead.profile_details || {};
            // Base properties
            const base: Record<string, any> = {
                "Platform": type,
                "Saved At": lead.created_at,
            };

            // Common dynamic properties we want to put at the top level
            if (details.name) base["Name"] = details.name;
            if (details.full_name) base["Name"] = details.full_name;
            if (details.title) base["Title"] = details.title;
            if (details.company_name) base["Company"] = details.company_name;
            if (details.domain) base["Domain"] = details.domain;
            if (details.username) base["Username"] = details.username;
            if (details.page_name) base["Page Name"] = details.page_name;
            if (details.email || details.public_email) base["Email"] = details.email || details.public_email;
            if (details.phone || details.public_phone_number) base["Phone"] = details.phone || details.public_phone_number;
            
            // Add all other properties from details as raw columns
            const rawDetails = { ...details };
            // Remove properties we already pulled out
            delete rawDetails.name;
            delete rawDetails.full_name;
            delete rawDetails.title;
            delete rawDetails.company_name;
            delete rawDetails.domain;
            delete rawDetails.username;
            delete rawDetails.page_name;
            delete rawDetails.email;
            delete rawDetails.public_email;
            delete rawDetails.phone;
            delete rawDetails.public_phone_number;

            return { ...base, ...rawDetails };
        });

        // Simple CSV Stringifier
        if (formattedData.length === 0) {
            return NextResponse.json({ error: "No data to export" }, { status: 400 });
        }

        // Get all unique headers across all objects
        const headersSet = new Set<string>();
        formattedData.forEach(row => {
            Object.keys(row).forEach(key => headersSet.add(key));
        });
        const headers = Array.from(headersSet);

        // Escape helper for CSV
        const escapeCSV = (val: any) => {
            if (val === null || val === undefined) return '""';
            let str = "";
            if (typeof val === 'object') {
                if (Array.isArray(val)) str = val.join("; ");
                else str = JSON.stringify(val);
            } else {
                str = String(val);
            }
            str = str.replace(/"/g, '""');
            return `"${str}"`;
        };

        const csvLines = [];
        // Add header line
        csvLines.push(headers.map(h => escapeCSV(h)).join(","));

        // Add data lines
        formattedData.forEach(row => {
            const line = headers.map(h => escapeCSV(row[h])).join(",");
            csvLines.push(line);
        });

        const csvContent = csvLines.join("\n");

        // Return as a streaming file download response
        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${type}-leads-${new Date().toISOString().split('T')[0]}.csv"`,
            }
        });

    } catch (error: any) {
        console.error("Export API error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
