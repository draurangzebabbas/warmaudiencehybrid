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
        category: l.category,
        address: l.address,
        phone: l.phone,
        emails: l.emails || [],
        website: l.website,
        city: l.city,
        image_url: l.imageUrl,
        socials: l.socials || {},
        place_id: l.placeId,
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

module.exports = {
    getCachedProfile,
    upsertPersonalProfile,
    upsertPersonalProfilesBulk,
    upsertCompanyProfile,
    upsertCompanyProfilesBulk,
    upsertGoogleMapsLeadsBulk,
    supabase
};
