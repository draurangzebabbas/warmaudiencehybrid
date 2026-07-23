export function getSelectString(profileType: string) {
    switch (profileType) {
        case "personal": return `id, tags, created_at, updated_at, personal: linkedin_profiles!inner(*)`;
        case "company": return `id, tags, created_at, updated_at, company: company_profiles!inner(*)`;
        case "google_maps": return `id, tags, created_at, updated_at, google_maps: google_maps_leads!inner(*)`;
        case "website_contact": return `id, tags, created_at, updated_at, website_contact: website_contacts!inner(*)`;
        case "instagram": return `id, tags, created_at, updated_at, instagram: instagram_leads!inner(*)`;
        case "x": return `id, tags, created_at, updated_at, x: x_leads!inner(*)`;
        case "facebook": return `id, tags, created_at, updated_at, facebook: facebook_leads!inner(*)`;
        case "facebook_group": return `id, tags, created_at, updated_at, facebook_group: facebook_groups!inner(*)`;
        default: return `id, tags, created_at, updated_at`;
    }
}

export function applyFilters(query: any, profileType: string, filters: any) {
    if (!filters || Object.keys(filters).length === 0) return query;

    if (profileType === "personal") {
        if (filters.hasEmail === "yes") query = query.not("personal.email", "is", null);
        if (filters.hasEmail === "no") query = query.is("personal.email", null);
        if (filters.hasAbout === "yes") query = query.not("personal.about", "is", null);
        if (filters.hasAbout === "no") query = query.is("personal.about", null);
        if (filters.hasHeadline === "yes") query = query.not("personal.headline", "is", null);
        if (filters.hasHeadline === "no") query = query.is("personal.headline", null);
        if (filters.hasProfilePic === "yes") query = query.not("personal.profile_pic_url", "is", null);
        if (filters.hasProfilePic === "no") query = query.is("personal.profile_pic_url", null);

        if (filters.minConnections > 0) query = query.gte("personal.connections", filters.minConnections);
        if (filters.maxConnections > 0 && filters.maxConnections < 1000000) query = query.lte("personal.connections", filters.maxConnections);

        if (filters.minFollowers > 0) query = query.gte("personal.followers", filters.minFollowers);
        if (filters.maxFollowers > 0 && filters.maxFollowers < 10000000) query = query.lte("personal.followers", filters.maxFollowers);

        if (filters.location) {
            query = query.or(`country.ilike.%${filters.location}%,city.ilike.%${filters.location}%`, { foreignTable: "personal" });
        }

        if (filters.tags) {
            query = query.ilike("tags_text", `%${filters.tags}%`);
        }

        if (filters.isPremium === "yes") query = query.eq("personal.is_premium", true);
        if (filters.isPremium === "no") query = query.eq("personal.is_premium", false);
        
        if (filters.isOpenToWork === "yes") query = query.eq("personal.open_to_work", true);
        if (filters.isOpenToWork === "no") query = query.eq("personal.open_to_work", false);

        if (filters.isVerified === "yes") query = query.eq("personal.is_verified", true);
        if (filters.isVerified === "no") query = query.eq("personal.is_verified", false);
    }
    
    else if (profileType === "company") {
        if (filters.hasWebsite === "yes") query = query.not("company.website_url", "is", null);
        if (filters.hasWebsite === "no") query = query.is("company.website_url", null);
        if (filters.hasLogo === "yes") query = query.not("company.logo_url", "is", null);
        if (filters.hasLogo === "no") query = query.is("company.logo_url", null);
        if (filters.hasDescription === "yes") query = query.not("company.description", "is", null);
        if (filters.hasDescription === "no") query = query.is("company.description", null);

        if (filters.minEmployees > 0) query = query.gte("company.employee_count", filters.minEmployees);
        if (filters.maxEmployees > 0 && filters.maxEmployees < 1000000) query = query.lte("company.employee_count", filters.maxEmployees);

        if (filters.minFollowers > 0) query = query.gte("company.follower_count", filters.minFollowers);
        if (filters.maxFollowers > 0 && filters.maxFollowers < 10000000) query = query.lte("company.follower_count", filters.maxFollowers);

        if (filters.location) {
            query = query.or(`country.ilike.%${filters.location}%,city.ilike.%${filters.location}%`, { foreignTable: "company" });
        }

        if (filters.tags) query = query.ilike("tags_text", `%${filters.tags}%`);

        if (filters.isVerified === "yes") query = query.eq("company.is_verified", true);
        if (filters.isVerified === "no") query = query.eq("company.is_verified", false);
    }

    else if (profileType === "google_maps") {
        if (filters.hasEmail === "yes") query = query.not("google_maps.emails", "is", null).neq("google_maps.emails", "{}");
        if (filters.hasEmail === "no") query = query.or("emails.is.null,emails.eq.{}", { foreignTable: "google_maps" });
        
        if (filters.hasPhone === "yes") query = query.not("google_maps.phone", "is", null).neq("google_maps.phone", "").neq("google_maps.phone", "-");
        if (filters.hasPhone === "no") query = query.or("phone.is.null,phone.eq.,phone.eq.-", { foreignTable: "google_maps" });
        
        if (filters.hasWebsite === "yes") query = query.not("google_maps.website", "is", null).neq("google_maps.website", "").neq("google_maps.website", "-");
        if (filters.hasWebsite === "no") query = query.or("website.is.null,website.eq.,website.eq.-", { foreignTable: "google_maps" });

        if (filters.minScore > 0) query = query.gte("google_maps.total_score", filters.minScore);
        if (filters.maxScore > 0) query = query.lte("google_maps.total_score", filters.maxScore);
        if (filters.minReviews > 0) query = query.gte("google_maps.reviews_count", filters.minReviews);
        if (filters.maxReviews > 0) query = query.lte("google_maps.reviews_count", filters.maxReviews);
        
        if (filters.location) query = query.ilike("google_maps.city", `%${filters.location}%`);
        if (filters.tags) query = query.ilike("tags_text", `%${filters.tags}%`);

        if (filters.hasInstagram === "yes") query = query.not("google_maps.socials->>instagram", "is", null);
        if (filters.hasInstagram === "no") query = query.is("google_maps.socials->>instagram", null);
        if (filters.hasTikTok === "yes") query = query.not("google_maps.socials->>tiktok", "is", null);
        if (filters.hasTikTok === "no") query = query.is("google_maps.socials->>tiktok", null);
        if (filters.hasFacebook === "yes") query = query.not("google_maps.socials->>facebook", "is", null);
        if (filters.hasFacebook === "no") query = query.is("google_maps.socials->>facebook", null);
        if (filters.hasTwitter === "yes") query = query.not("google_maps.socials->>twitter", "is", null);
        if (filters.hasTwitter === "no") query = query.is("google_maps.socials->>twitter", null);
        if (filters.hasLinkedIn === "yes") query = query.not("google_maps.socials->>linkedin", "is", null);
        if (filters.hasLinkedIn === "no") query = query.is("google_maps.socials->>linkedin", null);
    }

    else if (profileType === "website_contact") {
        if (filters.hasEmail === "yes") query = query.not("website_contact.emails", "is", null).neq("website_contact.emails", "{}");
        if (filters.hasEmail === "no") query = query.or("emails.is.null,emails.eq.{}", { foreignTable: "website_contact" });
        
        if (filters.hasPhone === "yes") query = query.not("website_contact.phones", "is", null).neq("website_contact.phones", "{}");
        if (filters.hasPhone === "no") query = query.or("phones.is.null,phones.eq.{}", { foreignTable: "website_contact" });

        if (filters.hasInstagram === "yes") query = query.not("website_contact.instagram", "is", null);
        if (filters.hasInstagram === "no") query = query.is("website_contact.instagram", null);
        if (filters.hasTikTok === "yes") query = query.not("website_contact.tiktok", "is", null);
        if (filters.hasTikTok === "no") query = query.is("website_contact.tiktok", null);
        if (filters.hasFacebook === "yes") query = query.not("website_contact.facebook", "is", null);
        if (filters.hasFacebook === "no") query = query.is("website_contact.facebook", null);
        if (filters.hasTwitter === "yes") query = query.not("website_contact.twitter", "is", null);
        if (filters.hasTwitter === "no") query = query.is("website_contact.twitter", null);
        if (filters.hasLinkedIn === "yes") query = query.not("website_contact.linkedin", "is", null);
        if (filters.hasLinkedIn === "no") query = query.is("website_contact.linkedin", null);

        if (filters.tags) query = query.ilike("tags_text", `%${filters.tags}%`);
    }

    else if (profileType === "instagram") {
        if (filters.hasEmail === "yes") query = query.not("instagram.email", "is", null);
        if (filters.hasEmail === "no") query = query.is("instagram.email", null);
        if (filters.hasPhone === "yes") query = query.not("instagram.public_phone_number", "is", null);
        if (filters.hasPhone === "no") query = query.is("instagram.public_phone_number", null);
        
        if (filters.minFollowers > 0) query = query.gte("instagram.followers_count", filters.minFollowers);
        if (filters.maxFollowers > 0 && filters.maxFollowers < 10000000) query = query.lte("instagram.followers_count", filters.maxFollowers);
        if (filters.minFollowing > 0) query = query.gte("instagram.following_count", filters.minFollowing);
        if (filters.maxFollowing > 0 && filters.maxFollowing < 10000000) query = query.lte("instagram.following_count", filters.maxFollowing);
        
        if (filters.minPosts > 0) query = query.gte("instagram.posts_count", filters.minPosts);

        if (filters.isVerified === "yes") query = query.eq("instagram.is_verified", true);
        if (filters.isVerified === "no") query = query.eq("instagram.is_verified", false);
        
        if (filters.isBusinessAccount === "yes") query = query.eq("instagram.is_business_account", true);
        if (filters.isBusinessAccount === "no") query = query.eq("instagram.is_business_account", false);
        
        if (filters.isProfessionalAccount === "yes") query = query.eq("instagram.is_professional_account", true);
        if (filters.isProfessionalAccount === "no") query = query.eq("instagram.is_professional_account", false);

        if (filters.isPrivate === "yes") query = query.eq("instagram.is_private", true);
        if (filters.isPrivate === "no") query = query.eq("instagram.is_private", false);

        if (filters.hasExternalUrl === "yes") query = query.not("instagram.external_url", "is", null);
        if (filters.hasExternalUrl === "no") query = query.is("instagram.external_url", null);

        if (filters.tags) query = query.ilike("tags_text", `%${filters.tags}%`);
    }

    else if (profileType === "x") {
        if (filters.hasEmail === "yes") query = query.not("x.email", "is", null);
        if (filters.hasEmail === "no") query = query.is("x.email", null);
        if (filters.hasPhone === "yes") query = query.not("x.phone", "is", null);
        if (filters.hasPhone === "no") query = query.is("x.phone", null);
        if (filters.hasWebsite === "yes") query = query.not("x.external_url", "is", null);
        if (filters.hasWebsite === "no") query = query.is("x.external_url", null);
        
        if (filters.isVerified === "yes") query = query.eq("x.is_verified", true);
        if (filters.isVerified === "no") query = query.eq("x.is_verified", false);
        
        if (filters.minFollowers > 0) query = query.gte("x.followers_count", filters.minFollowers);
        if (filters.maxFollowers > 0 && filters.maxFollowers < 10000000) query = query.lte("x.followers_count", filters.maxFollowers);
        if (filters.minFollowing > 0) query = query.gte("x.following_count", filters.minFollowing);
        if (filters.maxFollowing > 0 && filters.maxFollowing < 10000000) query = query.lte("x.following_count", filters.maxFollowing);
        
        if (filters.minTweets > 0) query = query.gte("x.tweets_count", filters.minTweets);
        if (filters.maxTweets > 0 && filters.maxTweets < 10000000) query = query.lte("x.tweets_count", filters.maxTweets);

        if (filters.location) query = query.ilike("x.location", `%${filters.location}%`);
        if (filters.tags) query = query.ilike("tags_text", `%${filters.tags}%`);
    }

    else if (profileType === "facebook") {
        if (filters.hasEmail === "yes") query = query.not("facebook.email", "is", null);
        if (filters.hasEmail === "no") query = query.is("facebook.email", null);
        if (filters.hasPhone === "yes") query = query.not("facebook.phone", "is", null);
        if (filters.hasPhone === "no") query = query.is("facebook.phone", null);
        if (filters.hasWebsite === "yes") query = query.not("facebook.website", "is", null);
        if (filters.hasWebsite === "no") query = query.is("facebook.website", null);

        if (filters.minFollowers > 0) query = query.gte("facebook.followers_count", filters.minFollowers);
        if (filters.maxFollowers > 0 && filters.maxFollowers < 10000000) query = query.lte("facebook.followers_count", filters.maxFollowers);
        
        if (filters.minLikes > 0) query = query.gte("facebook.likes_count", filters.minLikes);
        
        if (filters.category) query = query.ilike("facebook.category", `%${filters.category}%`);
        if (filters.tags) query = query.ilike("tags_text", `%${filters.tags}%`);
    }

    else if (profileType === "facebook_group") {
        if (filters.tags) query = query.ilike("tags_text", `%${filters.tags}%`);
    }

    return query;
}
