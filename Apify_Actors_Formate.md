# LinkedIn Scraper Actors Reference

This document provides a concise reference for the input and output parameters (attribute names) for each of the Apify actors used in the LinkedIn Scraper Tool.

---

## 1. Profile Scrapers

### 1.1 Personal Profile Details
**Actor ID:** `GOvL4O4RwFqsdIqXF`

**Input Parameters:**
- `usernames` (Array: LinkedIn profile URLs)
- `includeEmail` (Boolean)

**Output Attributes:**
- `basic_info`: `fullname`, `first_name`, `last_name`, `headline`, `public_identifier`, `profile_url`, `profile_picture_url`, `about`, `location` (country, city, full, country_code), `creator_hashtags`, `is_creator`, `is_influencer`, `is_premium`, `open_to_work`, `created_timestamp`, `show_follower_count`, `background_picture_url`, `urn`, `follower_count`, `connection_count`, `current_company`, `current_company_urn`, `current_company_url`, `email`
- `experience`: `title`, `company`, `location`, `duration`, `start_date`, `end_date`, `is_current`, `company_linkedin_url`, `company_id`, `description`
- `education`: `school`, `degree`, `field_of_study`, `duration`, `school_id`, `description`
- `certifications`: `name`, `issuer`, `issued_date`
- `languages`: `language`
- `profileUrl` (String)

---

### 1.2 Company Profile Details
**Actor ID:** `ipHw77V2NMJPy8sbS`

**Input Parameters:**
- `identifier` (Array: LinkedIn company profile URLs)

**Output Attributes:**
- `basic_info`: `name`, `universal_name`, `description`, `website`, `linkedin_url`, `specialties`, `industries`, `is_verified`, `founded_info`, `page_type`, `verification`
- `stats`: `employee_count`, `follower_count`, `employee_count_range`, `student_count`
- `locations`: `headquarters`, `offices`, `geo_coordinates`
- `media`: `logo_url`, `cover_url`, `cropped_cover_url`
- `funding`: `total_rounds`, `latest_round`, `crunchbase_url`
- `links`: `website`, `linkedin`, `job_search`, `sales_navigator`, `crunchbase`
- `company_urn`

---

### 1.3 Company Employees Scraper
**Actor ID:** `Vb6LZkh4EqRlR0Ka9`

**Input Parameters:**
- `companies` (Array: Company URLs)
- `jobTitles` (Array)
- `locations` (Array)
- `maxItems` (Number)
- `maxItemsPerCompany` (Number)
- `profileScraperMode` (String)
- `yearsAtCurrentCompanyIds` (Array)
- `companyBatchMode` (String)

**Output Attributes:**
- `id`, `publicIdentifier`, `linkedinUrl`, `firstName`, `lastName`, `emails`, `headline`, `about`, `openToWork`, `hiring`, `photo`, `premium`, `location`, `topSkills`, `connectionsCount`, `followerCount`, `currentPosition`, `experience`, `education`, `certifications`, `projects`, `volunteering`

---

## 2. Post Scrapers

### 2.1 Personal Profile Posts
**Actor ID:** `A3cAPGpwBEG8RJwse`

**Input Parameters:**
- `targetUrls` (Array: Personal profile URLs)
- `postedLimit` (String: week, 24h, month, 3months)
- `includeQuotePosts` (Boolean)
- `includeReposts` (Boolean)
- `scrapeComments` (Boolean)
- `scrapeReactions` (Boolean)

**Output Attributes:**
- `id`, `linkedinUrl`, `content`, `contentAttributes`, `author` (name, profileUrl, avatar), `postedAt` (timestamp, date), `postImages`, `postVideo`, `engagement` (likes, comments, shares, reactions), `socialContent`, `comments`, `reactions`

---

### 2.2 Company Posts
**Actor ID:** `WI0tj4Ieb5Kq458gB`

**Input Parameters:**
- `targetUrls` (Array: Company profile URLs)
- `postedLimit` (String: week, 24h, month, 3months)
- `includeQuotePosts` (Boolean)
- `includeReposts` (Boolean)
- `scrapeComments` (Boolean)
- `scrapeReactions` (Boolean)

**Output Attributes:**
- `id`, `linkedinUrl`, `content`, `author` (name, website, avatar), `postedAt` (timestamp, date), `postImages`, `postVideo`, `engagement` (likes, comments, shares, reactions), `repostId`

---

### 2.3 Keyword Search / Post Discovery
**Actor ID:** `9o7Ft0fpQTY5FW38E`

**Input Parameters:**
- `keywords` (Array)
- `max_posts` (Number)
- `date_filter` (String: past-24h, past-week, past-month)
- `sort_by` (String: date_posted, relevance)

**Output Attributes:**
- `owner_name`, `owner_profile_picture`, `post_url`, `text`, `image_url`, `total_reactions`, `comments`, `reposts`, `timestamp`, `is_reshare`

---

## 3. Engagement Scrapers

### 3.1 Post Comments Scraper
**Actor ID:** `ZI6ykbLlGS3APaPE8`

**Input Parameters:**
- `posts` (Array: LinkedIn post URLs)

**Output Attributes:**
- `id`, `linkedinUrl` (of the commenter), `commentary` (text), `actor` (name, headline, avatar, profileUrl), `createdAt`, `createdAtTimestamp`, `postId`, `replies`

---

### 3.2 Post Reactions Scraper
**Actor ID:** `S6mgSO5lezSZKi0zN`

**Input Parameters:**
- `posts` (Array: LinkedIn post URLs)

**Output Attributes:**
- `id`, `reactionType` (LIKE, CELEBRATE, etc.), `actor` (name, headline, avatar, profileUrl), `postId`

---

### 3.3 Profile Comments Scraper
**Actor ID:** `FiHYLewnJwS6GnRpo`

**Input Parameters:**
- `profiles` (Array: Personal profile URLs)
- `maxItems` (Number)
- `postedLimit` (String)

**Output Attributes:**
- `id`, `linkedinUrl`, `commentary`, `actor` (name, avatar), `post` (content, postUrl), `createdAt`, `postId`
