"use strict";

const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config();

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// ─────────────────────────────────────────
// Auth  /  API Keys
// ─────────────────────────────────────────

/**
 * Validate a bearer token and return the userId
 */
async function getUserIdFromToken(token) {
    const result = await convex.query("apikeys:validateApiKey", { key: token });
    if (!result || !result.isValid) {
        throw new Error("Invalid API Key");
    }
    return result.userId;
}

/**
 * Get all Apify (or other provider) API keys for a user from Convex
 */
async function getApiKeys(userId, provider) {
    return convex.query("userApiKeys:listKeys", { userId, provider });
}

/**
 * Update a key's status and usage count
 */
async function updateApiKeyStatus(userId, provider, keyString, status, incrementUsage) {
    return convex.mutation("userApiKeys:updateKeyStatus", {
        userId,
        provider,
        key: keyString,
        status,
        incrementUsage: !!incrementUsage,
    });
}

// ─────────────────────────────────────────
// Profile Caching + Saving
// ─────────────────────────────────────────

/**
 * Check if we have a cached profile — returns { isFresh, profile, company }
 * isFresh = scraped within 30 days
 */
async function getCachedProfile(url, type) {
    return convex.query("profiles:checkCache", { url, type });
}

/**
 * Save a personal LinkedIn profile to the global DB and link it to the user
 */
async function savePersonalProfile(userId, profileData, tags = []) {
    return convex.mutation("profiles:savePersonalProfile", {
        userId,
        profile: profileData,
        tags,
    });
}

/**
 * Save multiple personal LinkedIn profiles bulk
 */
async function savePersonalProfilesBulk(userId, profiles, tags = []) {
    return convex.mutation("profiles:savePersonalProfilesBulk", {
        userId,
        profiles,
        tags,
    });
}

/**
 * Save a company LinkedIn profile to the global DB and link it to the user
 */
async function saveCompanyProfile(userId, companyData, tags = []) {
    return convex.mutation("profiles:saveCompanyProfile", {
        userId,
        company: companyData,
        tags,
    });
}

/**
 * Save multiple company LinkedIn profiles bulk
 */
async function saveCompanyProfilesBulk(userId, companies, tags = []) {
    return convex.mutation("profiles:saveCompanyProfilesBulk", {
        userId,
        companies,
        tags,
    });
}

// ─────────────────────────────────────────
// Tracker Scheduling
// ─────────────────────────────────────────

/**
 * Returns all trackers that are due for execution (isActive=true, nextExecutionAt < now)
 */
async function getTrackersToExecute() {
    return convex.query("competitorTracking:getTrackersToExecute");
}

/**
 * Mark a tracker as executed and schedule its next run
 */
async function markTrackerExecuted(trackerId) {
    return convex.mutation("competitorTracking:markExecuted", { trackerId });
}

/**
 * Create a new tracker
 */
async function createTracker(userId, targetType, targetValue, schedule, targets) {
    return convex.mutation("competitorTracking:createTracker", {
        userId,
        targetType,
        targetValue,
        schedule,
        targets
    });
}

/**
 * Update tracker status
 */
async function updateTrackerStatus(userId, trackerId, isActive) {
    return convex.mutation("competitorTracking:toggleStatus", {
        userId,
        trackerId,
        isActive
    });
}

/**
 * Get use usage stats
 */
async function getUsage(userId) {
    return convex.query("usage:getUsageInternal", { userId });
}

/**
 * Link a Supabase profile to the user
 */
async function linkSupabaseProfile(userId, supabaseId, type, tags = []) {
    return convex.mutation("profiles:linkSupabaseProfile", {
        userId,
        supabaseId,
        type,
        tags,
    });
}

module.exports = {
    getUsage,
    getUserIdFromToken,
    getApiKeys,
    updateApiKeyStatus,
    getCachedProfile,
    savePersonalProfile,
    savePersonalProfilesBulk,
    saveCompanyProfile,
    saveCompanyProfilesBulk,
    getTrackersToExecute,
    markTrackerExecuted,
    createTracker,
    updateTrackerStatus,
    linkSupabaseProfile, // Added
};
