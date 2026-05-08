"use strict";

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase environment variables missing. Profiles will not be saved.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Check if a profile exists and is fresh (< 30 days)
 * Returns { isFresh, profile } or null
 */
async function getCachedProfile(url, type) {
    const table = type === "personal" ? "linkedin_profiles" : "company_profiles";
    const urlField = type === "personal" ? "linkedin_url" : "url";

    const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq(urlField, url)
        .single();

    if (error || !data) return null;

    const ageInDays = (Date.now() - new Date(data.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return { 
        isFresh: ageInDays < 30, 
        profile: type === "personal" ? data : null,
        company: type === "company" ? data : null
    };
}

/**
 * Upsert a personal LinkedIn profile
 */
async function upsertPersonalProfile(profileData) {
    const { data, error } = await supabase
        .from("linkedin_profiles")
        .upsert({
            linkedin_url: profileData.linkedinUrl,
            public_identifier: profileData.publicIdentifier,
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            full_name: profileData.fullName,
            headline: profileData.headline,
            email: profileData.email,
            connections: profileData.connections,
            followers: profileData.followers,
            company_name: profileData.companyName,
            job_title: profileData.jobTitle,
            location: profileData.location,
            city: profileData.city,
            country: profileData.country,
            postal_code: profileData.postalCode,
            is_premium: profileData.isPremium,
            is_influencer: profileData.isInfluencer,
            open_to_work: profileData.openToWork,
            is_verified: profileData.isVerified,
            profile_pic: profileData.profilePic,
            about: profileData.about,
            updated_at: new Date().toISOString()
        }, { onConflict: 'linkedin_url' })
        .select()
        .single();

    if (error) {
        console.error("❌ Supabase upsert error:", error.message);
        throw error;
    }
    return data.id;
}

/**
 * Upsert multiple personal profiles
 */
async function upsertPersonalProfilesBulk(profiles) {
    const items = profiles.map(p => ({
        linkedin_url: p.linkedinUrl,
        public_identifier: p.publicIdentifier,
        first_name: p.firstName,
        last_name: p.lastName,
        full_name: p.fullName,
        headline: p.headline,
        email: p.email,
        connections: p.connections,
        followers: p.followers,
        company_name: p.companyName,
        job_title: p.jobTitle,
        location: p.location,
        city: p.city,
        country: p.country,
        postal_code: p.postalCode,
        is_premium: p.isPremium,
        is_influencer: p.isInfluencer,
        open_to_work: p.openToWork,
        is_verified: p.isVerified,
        profile_pic: p.profilePic,
        about: p.about,
        extra_data: p.extraData || {},
        updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
        .from("linkedin_profiles")
        .upsert(items, { onConflict: 'linkedin_url' })
        .select("id, linkedin_url");

    if (error) {
        console.error("❌ Supabase bulk upsert error:", error.message);
        throw error;
    }
    return data;
}

/**
 * Upsert a company profile
 */
async function upsertCompanyProfile(companyData) {
    const { data, error } = await supabase
        .from("company_profiles")
        .upsert({
            url: companyData.url,
            company_name: companyData.companyName,
            linkedin_url: companyData.linkedinUrl,
            website_url: companyData.websiteUrl,
            logo_url: companyData.logoUrl,
            description: companyData.description,
            employee_count: companyData.employeeCount,
            employee_count_range: companyData.employeeCountRange,
            follower_count: companyData.followerCount,
            city: companyData.city,
            country: companyData.country,
            postal_code: companyData.postalCode,
            is_verified: companyData.isVerified,
            updated_at: new Date().toISOString()
        }, { onConflict: 'url' })
        .select()
        .single();

    if (error) {
        console.error("❌ Supabase company upsert error:", error.message);
        throw error;
    }
    return data.id;
}

/**
 * Upsert multiple company profiles
 */
async function upsertCompanyProfilesBulk(companies) {
    const items = companies.map(c => ({
        url: c.url,
        company_name: c.companyName,
        linkedin_url: c.linkedinUrl,
        website_url: c.websiteUrl,
        logo_url: c.logoUrl,
        description: c.description,
        employee_count: c.employeeCount,
        employee_count_range: c.employeeCountRange,
        follower_count: c.followerCount,
        city: c.city,
        country: c.country,
        postal_code: c.postalCode,
        is_verified: c.isVerified,
        extra_data: c.extraData || {},
        updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
        .from("company_profiles")
        .upsert(items, { onConflict: 'url' })
        .select("id, url");

    if (error) {
        console.error("❌ Supabase company bulk upsert error:", error.message);
        throw error;
    }
    return data;
}

/**
 * Upsert multiple Google Maps leads
 */
async function upsertGoogleMapsLeadsBulk(leads) {
    const items = leads.map(l => ({
        url: l.url,
        title: l.title,
        total_score: l.totalScore,
        reviews_count: l.reviewsCount,
        address: l.address,
        phone: l.phone,
        emails: l.emails || [],
        website: l.website,
        city: l.city,
        image_url: l.imageUrl,
        socials: l.socials || {},
        place_id: l.placeId,
        extra_data: l.extraData || {},
        updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
        .from("google_maps_leads")
        .upsert(items, { onConflict: 'url' })
        .select("id, url");

    if (error) {
        console.error("❌ Supabase Google Maps bulk upsert error:", error.message);
        throw error;
    }
    return data;
}

/**
 * Link a user to multiple leads in Supabase (Junction Table)
 * Appends tags if lead already linked to user
 */
async function linkUserToLeadsBulk(userId, leadIds, type, tags = []) {
    const idField = type === "google_maps" ? "lead_id" : 
                    type === "company" ? "company_id" : 
                    "linkedin_id";

    // 1. Fetch existing tags for these leads for this user to allow merging
    const { data: existingLeads } = await supabase
        .from("user_leads")
        .select(`id, ${idField}, tags`)
        .eq("user_id", userId)
        .in(idField, leadIds);

    const existingMap = new Map();
    if (existingLeads) {
        existingLeads.forEach(l => {
            existingMap.set(l[idField], l.tags || []);
        });
    }

    const items = leadIds.map(id => {
        const existingTags = existingMap.get(id) || [];
        // Merge tags and remove duplicates
        const mergedTags = Array.from(new Set([...existingTags, ...tags])).filter(Boolean);

        const item = {
            user_id: userId,
            profile_type: type,
            tags: mergedTags,
            created_at: new Date().toISOString()
        };
        item[idField] = id;
        return item;
    });

    const { data, error } = await supabase
        .from("user_leads")
        .upsert(items, { 
            onConflict: `user_id, ${idField}`
        });

    if (error) {
        console.error("❌ Supabase linking error:", error.message);
        throw error;
    }
    return data;
}

/**
 * Remove a lead link from a user in Supabase
 */
async function removeUserLead(junctionId) {
    const { error } = await supabase
        .from("user_leads")
        .delete()
        .eq("id", junctionId);

    if (error) throw error;
    return true;
}

/**
 * Get API keys for a user from Supabase
 */
async function getUserApiKeys(userId, provider) {
    let query = supabase
        .from("user_api_keys")
        .select("*")
        .eq("user_id", userId);
    
    if (provider) {
        query = query.eq("provider", provider);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

/**
 * Update API key status in Supabase
 */
async function updateUserApiKeyStatus(keyId, status) {
    const { error } = await supabase
        .from("user_api_keys")
        .update({ status, last_used_at: new Date().toISOString() })
        .eq("id", keyId);

    if (error) throw error;
}

/**
 * Increment API key usage count in Supabase
 */
async function incrementApiKeyUsage(keyId) {
    const { data: current } = await supabase
        .from("user_api_keys")
        .select("usage_count")
        .eq("id", keyId)
        .single();
    
    const { error } = await supabase
        .from("user_api_keys")
        .update({ 
            usage_count: (current?.usage_count || 0) + 1,
            last_used_at: new Date().toISOString() 
        })
        .eq("id", keyId);

    if (error) throw error;
}

/**
 * Create a new scrape job for progress tracking
 */
async function createScrapeJob(userId, type, inputData, totalLeads = 0) {
    const { data, error } = await supabase
        .from("scrape_jobs")
        .insert([{
            user_id: userId,
            type,
            input_data: inputData,
            total_leads: totalLeads,
            status: "processing"
        }])
        .select()
        .single();
    
    if (error) throw error;
    return data.id;
}

/**
 * Update job progress
 */
async function updateJobProgress(jobId, progress, resultsCount) {
    const updateData = { progress, updated_at: new Date().toISOString() };
    if (resultsCount !== undefined) updateData.results_count = resultsCount;
    
    await supabase
        .from("scrape_jobs")
        .update(updateData)
        .eq("id", jobId);
}

/**
 * Mark job as completed
 */
async function completeJob(jobId, resultsCount) {
    const updateData = { 
        status: "completed", 
        progress: 100, 
        updated_at: new Date().toISOString() 
    };
    if (resultsCount !== undefined) updateData.results_count = resultsCount;
    
    await supabase
        .from("scrape_jobs")
        .update(updateData)
        .eq("id", jobId);
}

/**
 * Mark job as failed
 */
async function failJob(jobId, error) {
    await supabase
        .from("scrape_jobs")
        .update({ 
            status: "failed", 
            error_message: error,
            updated_at: new Date().toISOString()
        })
        .eq("id", jobId);
}

/**
 * Get trackers that are due for execution
 */
async function getDueTrackers() {
    const { data, error } = await supabase
        .from("trackers")
        .select("*")
        .eq("is_active", true)
        .lte("next_run_at", new Date().toISOString());
    
    if (error) throw error;
    return data;
}

/**
 * Mark tracker as executed and schedule next run
 */
async function markTrackerExecuted(trackerId, schedule) {
    let delay = 24 * 60 * 60 * 1000; // default daily
    if (schedule === "weekly") delay = 7 * 24 * 60 * 60 * 1000;
    if (schedule === "monthly") delay = 30 * 24 * 60 * 60 * 1000;

    const nextRun = new Date(Date.now() + delay).toISOString();

    await supabase
        .from("trackers")
        .update({ 
            last_run_at: new Date().toISOString(),
            next_run_at: nextRun
        })
        .eq("id", trackerId);
}

/**
 * Get lead count for the current month in Supabase
 */
async function getMonthlyLeadCount(userId) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { count, error } = await supabase
        .from("user_leads")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", firstDayOfMonth);
    
    if (error) {
        console.error("❌ Error fetching monthly lead count:", error);
        return 0;
    }
    return count || 0;
}

/**
 * Get active tracker count in Supabase
 */
async function getActiveTrackerCount(userId) {
    const { count, error } = await supabase
        .from("trackers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_active", true);
    
    if (error) {
        console.error("❌ Error fetching active tracker count:", error);
        return 0;
    }
    return count || 0;
}


/**
 * Validate an internal webhook API key in Supabase
 */
async function validateWebhookKey(key) {
    const { data, error } = await supabase
        .from('webhook_api_keys')
        .select('user_id, is_active')
        .eq('key', key)
        .single();
    
    if (error || !data || !data.is_active) {
        return null;
    }
    return { userId: data.user_id, isValid: true };
}

/**
 * Get or create an internal webhook API key in Supabase
 */
async function getOrCreateWebhookKey(userId) {
    const { data, error } = await supabase
        .from('webhook_api_keys')
        .select('key')
        .eq('user_id', userId)
        .maybeSingle();
    
    if (data) return { key: data.key };

    const newKey = require('crypto').randomBytes(16).toString('hex');
    const { data: inserted, error: insertError } = await supabase
        .from('webhook_api_keys')
        .insert({ user_id: userId, key: newKey })
        .select('key')
        .single();
    
    if (insertError) {
        console.error('? Error creating webhook key:', insertError);
        return null;
    }
    return { key: inserted.key };
}

/**
 * Get user subscription details from Supabase
 */
async function getUserSubscription(userId) {
    const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
    
    if (error) {
        console.error("❌ Error fetching subscription:", error);
        return { plan_slug: "free" };
    }

    // Default to free if no record found
    if (!data) return { plan_slug: "free" };

    return data;
}

module.exports = {
    getCachedProfile,
    upsertPersonalProfile,
    upsertPersonalProfilesBulk,
    upsertCompanyProfile,
    upsertCompanyProfilesBulk,
    upsertGoogleMapsLeadsBulk,
    linkUserToLeadsBulk,
    removeUserLead,
    getUserApiKeys,
    updateUserApiKeyStatus,
    incrementApiKeyUsage,
    createScrapeJob,
    updateJobProgress,
    completeJob,
    failJob,
    getDueTrackers,
    markTrackerExecuted,
    getMonthlyLeadCount,
    getActiveTrackerCount,
    validateWebhookKey,
    getOrCreateWebhookKey,
    getUserSubscription,
    supabase
};
