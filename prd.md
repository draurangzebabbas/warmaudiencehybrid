# WarmAudience Research & Intelligence Platform - Production Application

## Executive Summary

This is a B2B Audience Intelligence Platform that automatically identifies, analyzes, and organizes professional engagement data at scale. The system uses 6 specialized research modules to process professional profiles, posts, and engagement insights, all powered by a smart analytics architecture that reduces computing costs by 80%.

---

## Core Architecture

### Global Intelligence Database

**Global LinkedIn Personal Profiles Table**: Single source of truth for all LinkedIn personal profiles across all users

**Global LinkedIn Company Profiles Table**: Single source of truth for all LinkedIn company profiles across all users

**User Saved Profiles**: Junction table linking users to profiles they've saved with personal notes and tags

**Smart Analytics**: Before researching, check if profile exists in global workspace. If found, return analyzed data instantly. If not found, process via research modules and save to global workspace for future use.

**User-Level Deletion**: Users can only remove profiles from their saved list, not from global database

### Multi-Tenant Data Strategy

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Global User   │    │  Global Company  │    │ User Collections │
│   Profiles DB   │◄───┤   Profiles DB    │    │   (Junction)     │
│                 │    │                  │    │                  │
│ • 100K+ Profiles│    │ • 10K+ Companies │    │ • Personal Notes │
│ • Rich Data     │    │ • Full Details   │    │ • Custom Tags    │
│ • Auto Updates  │    │ • Employee Data  │    │ • Organization   │
└─────────────────┘    └──────────────────┘    └──────────────────┘
          ▲                         ▲                         ▲
          │                         │                         │
┌─────────────────────────────────────────────────────────────────┐
│                   SMART CACHING LAYER                           │
│  • Check Global First → Scrape Only If Missing → Enrich All     │
│  • 80% Cost Reduction via Intelligent Data Reuse                │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits**:
- **Global Read Access**: All users benefit from collective data enrichment
- **User-Write Isolation**: Personal notes/tags never shared between users
- **Cost Optimization**: Single scrape → Multiple beneficiaries
- **Data Freshness**: When any user refreshes a profile, it updates for everyone

---

## Apify Actors - Currently Implemented (6 Total)

### 1. PROFILE SCRAPERS (2 Actors)

#### 1.1 Personal Profile Details
**Actor ID**: `GOvL4O4RwFqsdIqXF`

**How It's Used in App**:
- **Primary Function**: Analyzes complete personal professional profiles
- **Called By**: `/api/process-batch` endpoint in Render backend
- **Triggered When**: 
  - User manually researches profile URLs
  - Audience intelligence discovers new engaged users
  - Batch profile processing
- **Smart Analytics**: Checks `professionalProfiles` table before researching
- **Saves To**: Global `professionalProfiles` table + user's `userSavedProfiles` junction

**Input**:
```json
{
  "includeEmail": true,
  "usernames": [
    "https://www.linkedin.com/in/username1",
    "https://www.linkedin.com/in/username2"
  ]
}
```

**Output Structure** (Key Fields):
```json
{
  "basic_info": {
    "fullname": "John Doe",
    "first_name": "John",
    "last_name": "Doe",
    "headline": "CEO at TechCorp",
    "public_identifier": "johndoe",
    "profile_url": "https://linkedin.com/in/johndoe",
    "profile_picture_url": "https://...",
    "email": "john@example.com",
    "location": {
      "country": "United States",
      "city": "San Francisco",
      "full": "San Francisco, California, United States"
    },
    "follower_count": 5420,
    "connection_count": 500,
    "current_company": "TechCorp",
    "is_premium": true,
    "is_influencer": false,
    "open_to_work": false
  },
  "experience": [
    {
      "title": "CEO",
      "company": "TechCorp",
      "location": "San Francisco",
      "start_date": { "year": 2020, "month": "January" },
      "is_current": true,
      "company_linkedin_url": "https://linkedin.com/company/techcorp"
    }
  ],
  "education": [
    {
      "school": "Stanford University",
      "degree": "MBA",
      "field_of_study": "Business Administration"
    }
  ],
  "certifications": [],
  "languages": [{ "language": "English" }]
}
```

**Database Mapping**:
- Saved to: `linkedinProfiles` table
- Fields mapped: basicInfo → linkedinProfiles fields
- User association: `userSavedProfiles` junction record created

---

#### 1.2 Company Profile Details
**Actor ID**: `ipHw77V2NMJPy8sbS`

**How It's Used in App**:
- **Primary Function**: Scrapes complete company LinkedIn profiles
- **Called By**: `/api/process-batch` endpoint (same as personal profiles)
- **Triggered When**:
  - User scrapes company URLs
  - Competitor tracking targets company pages
  - Bulk company enrichment
- **Smart Analytics**: Checks `companyProfiles` table before researching
- **Saves To**: Global `companyProfiles` table + `userSavedProfiles` junction

**Input**:
```json
{
  "identifier": [
    "https://www.linkedin.com/company/company-name/"
  ]
}
```

**Output Structure** (Key Fields):
```json
{
  "basic_info": {
    "name": "TechCorp Inc",
    "universal_name": "techcorp",
    "description": "Leading technology company...",
    "website": "https://techcorp.com",
    "linkedin_url": "https://linkedin.com/company/techcorp",
    "industries": ["Technology", "Software"],
    "specialties": ["AI", "Cloud Computing"],
    "is_verified": true
  },
  "stats": {
    "employee_count": 5000,
    "follower_count": 125000,
    "employee_count_range": { "start": 1001, "end": 5000 }
  },
  "locations": {
    "headquarters": {
      "city": "San Francisco",
      "country": "US",
      "postal_code": "94102"
    },
    "geo_coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "media": {
    "logo_url": "https://...",
    "cover_url": "https://..."
  },
  "funding": {
    "total_rounds": 5,
    "latest_round": { "type": "Series C", "amount": "$100M" },
    "crunchbase_url": "https://crunchbase.com/..."
  }
}
```

**Database Mapping**:
- Saved to: `companyProfiles` table
- Fields: All nested objects stored as-is
- User association: `userSavedProfiles` with `companyProfileId`

---

### 2. POST SCRAPERS (2 Actors)

#### 2.1 Personal Profile Posts
**Actor ID**: `A3cAPGpwBEG8RJwse`

**How It's Used in App**:
- **Primary Function**: Scrapes recent posts from personal LinkedIn profiles
- **Called By**: `/api/competitor-tracking/run` endpoint
- **Triggered When**:
  - Competitor tracking runs (scheduled: daily/weekly/monthly)
  - User manually triggers competitor post scraping
- **Use Case**: Find new posts from competitors to extract engaged audiences
- **Post-Processing**: Extracts post URLs → passes to Comments/Reactions actors

**Input**:
```json
{
  "targetUrls": ["https://www.linkedin.com/in/competitor-name"],
  "postedLimit": "24h",
  "includeQuotePosts": true,
  "includeReposts": false,
  "scrapeComments": false,
  "scrapeReactions": false
}
```

**Time Filters**:
- `24h` - Last 24 hours (for daily tracking)
- `week` - Last 7 days (for weekly tracking)
- `month` - Last 30 days (for monthly tracking)

**Output Structure**:
```json
[
  {
    "id": "post_123",
    "linkedinUrl": "https://linkedin.com/posts/username_activity-123",
    "content": "Excited to announce our Series B funding...",
    "author": {
      "name": "John Doe",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "headline": "CEO at TechCorp"
    },
    "postedAt": {
      "timestamp": 1735430400000,
      "date": "2025-01-15"
    },
    "engagement": {
      "likes": 247,
      "comments": 38,
      "shares": 15,
      "reactions": [
        { "type": "LIKE", "count": 200 },
        { "type": "CELEBRATE", "count": 47 }
      ]
    }
  }
]
```

**Application Flow**:
1. Cron job triggers competitor tracking
2. Actor scrapes competitor's last 24h posts
3. Returns post URLs
4. Post URLs sent to Post Comments/Reactions actors
5. Engaged users extracted and enriched

---

#### 2.2 Keyword Search / Post Discovery
**Actor ID**: `9o7Ft0fpQTY5FW38E`

**How It's Used in App**:
- **Primary Function**: Searches LinkedIn for posts containing specific keywords
- **Called By**: `/api/competitor-tracking/run` endpoint (for keyword tracking)
- **Triggered When**:
  - Scheduled keyword tracking runs
  - User sets up keyword monitoring (e.g., "AI automation", "SaaS marketing")
- **Use Case**: Discover posts about specific topics, extract engaged audiences
- **Post-Processing**: Similar to profile posts → extract engagers

**Input**:
```json
{
  "keywords": ["AI automation", "enterprise SaaS"],
  "max_posts": 50,
  "date_filter": "past-week",
  "sort_by": "date_posted"
}
```

**Date Filters**:
- `past-24h` - Last 24 hours
- `past-week` - Last 7 days
- `past-month` - Last 30 days

**Sort Options**:
- `date_posted` - Newest first (default for tracking)
- `relevance` - Most relevant to keywords

**Output Structure**:
```json
[
  {
    "owner_name": "Jane Smith",
    "owner_profile_picture": "https://...",
    "post_url": "https://linkedin.com/posts/janesmith_activity-456",
    "text": "Just launched our AI automation platform...",
    "image_url": "https://...",
    "total_reactions": 523,
    "comments": 67,
    "reposts": "23",
    "timestamp": 1735430400000,
    "is_reshare": false
  }
]
```

**Application Flow**:
1. User sets up keyword tracking: "enterprise SaaS"
2. Weekly cron job runs
3. Actor finds 50 posts about "enterprise SaaS"
4. Post URLs extracted
5. Comments/Reactions actors extract engagers
6. Profiles enriched and saved with tag: "Keyword: enterprise SaaS"

---

### 3. ENGAGEMENT SCRAPERS (2 Actors)

#### 3.1 Post Comments Scraper
**Actor ID**: `ZI6ykbLlGS3APaPE8`

**How It's Used in App**:
- **Primary Function**: Extracts all comments and commenters from LinkedIn posts
- **Called By**: `/api/scrape-engagement` endpoint
- **Triggered When**:
  - Competitor tracking finds new posts
  - Keyword tracking finds relevant posts
  - User manually scrapes post engagement
- **Key Feature**: Extracts nested replies for complete conversation threads
- **Post-Processing**: Commenter profiles → Actor 1.1 for full enrichment

**Input**:
```json
{
  "posts": [
    "https://www.linkedin.com/posts/username_activity-123456"
  ]
}
```

**Output Structure**:
```json
[
  {
    "id": "comment_789",
    "linkedinUrl": "https://linkedin.com/in/commenter",
    "commentary": "Great insights! We've been using similar approaches...",
    "actor": {
      "name": "Sarah Johnson",
      "headline": "VP of Sales @ Enterprise Co",
      "linkedinUrl": "https://linkedin.com/in/sarahjohnson",
      "avatar": { "url": "https://..." }
    },
    "createdAt": "2025-01-15T10:30:00Z",
    "createdAtTimestamp": 1735430400000,
    "engagement": {
      "likes": 12,
      "replies": 3
    },
    "replies": [
      {
        "actor": { "name": "Mike Chen", "linkedinUrl": "..." },
        "commentary": "Totally agree!"
      }
    ],
    "postId": "post_123"
  }
]
```

**Application Flow Example**:
```
Competitor posts viral content
    ↓
Actor 2.1 scrapes post
    ↓
Actor 3.1 extracts 127 commenters
    ↓
Actor 1.1 enriches all 127 profiles
    ↓
Saved to user's collection with tag: "Competitor: @username"
```

**Data Extracted Per Commenter**:
- Name, headline, profile URL
- Comment text and timestamp
- Engagement on comment
- Nested replies

---

#### 3.2 Post Reactions Scraper
**Actor ID**: `S6mgSO5lezSZKi0zN`

**How It's Used in App**:
- **Primary Function**: Extracts all users who reacted to LinkedIn posts
- **Called By**: `/api/scrape-engagement` endpoint
- **Triggered When**: Same as Post Comments actor
- **Reaction Types**: LIKE, CELEBRATE, SUPPORT, LOVE, INSIGHTFUL, CURIOUS
- **Post-Processing**: Reactor profiles → Actor 1.1 for enrichment

**Input**:
```json
{
  "posts": [
    "https://www.linkedin.com/posts/username_activity-123456"
  ]
}
```

**Output Structure**:
```json
[
  {
    "id": "reaction_abc",
    "reactionType": "CELEBRATE",
    "postId": "post_123",
    "actor": {
      "name": "David Lee",
      "headline": "Startup Founder | AI Enthusiast",
      "linkedinUrl": "https://linkedin.com/in/davidlee",
      "avatar": { "url": "https://..." }
    }
  }
]
```

**Reaction Types Breakdown**:
- **LIKE**: Standard like (most common)
- **CELEBRATE**: Celebrating achievement
- **SUPPORT**: Supporting statement
- **LOVE**: Love reaction
- **INSIGHTFUL**: Found post insightful
- **CURIOUS**: Curious about topic

**Application Flow Example**:
```
Keyword search finds post about "AI automation"
    ↓
Post has 1,247 reactions
    ↓
Actor 3.2 extracts all 1,247 reactors
    ↓
Filtered: 892 unique (after dedup)
    ↓
Actor 1.1 enriches profiles
    ↓
Saved with tag: "Keyword: AI automation"
```

---

## Complete Application Workflows

### Workflow 1: Manual Profile Scraping

**User Action**: Pastes LinkedIn URLs into app

**Backend Flow**:
```
1. User submits URLs: [url1, url2, url3, ..., url100]
2. Convex action: profiles/scraping.ts → scrapeProfiles()
3. Smart cache check:
   - Check linkedinProfiles/companyProfiles table
   - Found: Return cached (cost: $0)
   - Not found: Add to scraping queue
4. Batch processing:
   - Split into batches of 20
   - Call Render: /api/process-batch
5. Render calls Apify:
   - Personal profiles → Actor 1.1 (GOvL4O4RwFqsdIqXF)
   - Company profiles → Actor 1.2 (ipHw77V2NMJPy8sbS)
6. Save results:
   - To global linkedinProfiles/companyProfiles
   - Create userSavedProfiles junction record
7. Return to user:
   - Success: Enriched profile data
   - Cached: X profiles, Scraped: Y profiles
```

**Cost Example**:
- 100 URLs submitted
- 40 cache hits (free)
- 60 new scrapes ($0.15/profile avg)
- Total cost: $9
- Without caching: $15 (40% savings)

---

### Workflow 2: Competitor Tracking (Automated)

**User Setup**: Track competitor → Schedule: Daily

**Cron Execution** (Runs daily at 2 AM):
```
1. Cron triggers: competitors/monitoring.ts → executeScheduledTracking()
2. Get active trackers WHERE nextExecutionAt <= NOW
3. For each tracker:
   a. Call Render: /api/competitor-tracking/run
   b. Render executes sequence:
   
   Step 1: Get Recent Posts
   - Call Actor 2.1 (A3cAPGpwBEG8RJwse)
   - Input: competitor URL, postedLimit: "24h"
   - Output: 3 new posts from last 24h
   
   Step 2: Extract Commenters
   - Call Actor 3.1 (ZI6ykbLlGS3APaPE8)
   - Input: 3 post URLs
   - Output: 127 unique commenters
   
   Step 3: Extract Reactors
   - Call Actor 3.2 (S6mgSO5lezSZKi0zN)
   - Input: 3 post URLs
   - Output: 892 unique reactors
   
   Step 4: Enrich Profiles
   - Total unique: 1,019 profiles
   - Check cache: 180 found (cached)
   - Scrape new: 839 profiles
   - Call Actor 1.1 (GOvL4O4RwFqsdIqXF)
   
   Step 5: Save & Tag
   - Save to linkedinProfiles (global)
   - Create userSavedProfiles records
   - Auto-tag: "Competitor: @username"
   - Auto-tag: "Discovered: 2025-01-15"

4. Update tracker:
   - lastExecutedAt: NOW
   - nextExecutionAt: NOW + 24 hours

5. User wakes up to 1,019 new leads in dashboard
```

**Daily Stats**:
- Profiles discovered: ~1,000/day
- Cache hit rate: ~18%
- Actual scrapes: ~820/day
- Cost: ~$123/day
- Without caching: ~$150/day (18% savings)

---

### Workflow 3: Keyword Tracking (Automated)

**User Setup**: Track keyword "enterprise SaaS" → Schedule: Weekly

**Weekly Execution**:
```
1. Cron triggers weekly
2. For keyword tracker:
   
   Step 1: Discover Posts
   - Call Actor 2.3 (9o7Ft0fpQTY5FW38E)
   - Input: keywords: ["enterprise SaaS"], max_posts: 50
   - date_filter: "past-week"
   - Output: 42 relevant posts
   
   Step 2: Extract Engagement
   - Comments: Actor 3.1 → 318 commenters
   - Reactions: Actor 3.2 → 1,247 reactors
   - Total unique: 1,421 profiles
   
   Step 3: Smart Enrichment
   - Cache check: 421 found
   - New scrapes: 1,000 profiles
   - Call Actor 1.1 (GOvL4O4RwFqsdIqXF)
   
   Step 4: Save with Context
   - Tag: "Keyword: enterprise SaaS"
   - Tag: "Week: 2025-01-13"
   - Tag: "Engagement: Commenter" or "Reactor"
   
3. Result: 1,421 qualified leads interested in "enterprise SaaS"
```

**Use Case**: Build targeted outreach list of people actively discussing your product category

---

## Technical Implementation Details

### Smart Caching Logic

**Profile Freshness Rules**:
- **< 7 days old**: Use cache (no scraping)
- **7-30 days old**: Use cache, flag for background refresh
- **> 30 days old**: Force refresh (scrape new data)

**Cache Hit Example**:
```typescript
// Check if profile exists in global DB
const existingProfile = await ctx.db
  .query("linkedinProfiles")
  .withIndex("by_linkedin_url", q => q.eq("linkedinUrl", url))
  .first();

if (existingProfile) {
  const ageInDays = (Date.now() - existingProfile.updatedAt) / (1000 * 60 * 60 * 24);
  
  if (ageInDays < 30) {
    // CACHE HIT - Return existing data
    return {
      source: "cache",
      profile: existingProfile,
      cost: 0
    };
  }
}

// CACHE MISS - Scrape via Actor 1.1
const scrapedData = await callApifyActor('GOvL4O4RwFqsdIqXF', {...});
```

---

### Batch Processing Architecture

**Parallel Execution**:
```
Request: 100 URLs
    ↓
Split into 5 batches (20 URLs each)
    ↓
Batch 1: Profiles 1-20   → Actor 1.1 (Key A)
Batch 2: Profiles 21-40  → Actor 1.1 (Key B)
Batch 3: Profiles 41-60  → Actor 1.1 (Key C)
Batch 4: Profiles 61-80  → Actor 1.1 (Key A)
Batch 5: Profiles 81-100 → Actor 1.1 (Key B)
    ↓
All start simultaneously
    ↓
Atomic saves (each profile saved immediately)
    ↓
Auto-retry on failures with fresh API key
```

**Benefits**:
- **Speed**: 100 profiles in ~2 minutes (vs 10+ minutes sequential)
- **Reliability**: Failed profiles auto-retry
- **No Data Loss**: Atomic saves protect against crashes

---

### API Key Rotation

**Round-Robin Selection**:
```typescript
// Get oldest-used ACTIVE key
const activeKeys = await ctx.db
  .query("apiKeys")
  .filter(q => q.eq(q.field("status"), "ACTIVE"))
  .collect();

activeKeys.sort((a, b) => (a.lastUsedAt || 0) - (b.lastUsedAt || 0));
const selectedKey = activeKeys[0]; // Oldest = used longest ago
```

**Automatic Failover**:
```
Key A hits rate limit (429 error)
    ↓
IMMEDIATELY mark Key A as "RATE_LIMITED"
    ↓
Rotate to Key B
    ↓
Retry same request with Key B
    ↓
User sees no error (transparent failover)
```

---

## Database Schema

### linkedinProfiles (Global)
```typescript
{
  _id: Id<"linkedinProfiles">,
  linkedinUrl: string,
  publicIdentifier: string,
  firstName: string,
  lastName: string,
  fullName: string,
  headline: string,
  email?: string,
  connections?: number,
  followers?: number,
  companyName?: string,
  jobTitle?: string,
  location?: object,
  profilePic?: string,
  about?: string,
  experiences: array,
  educations: array,
  skills: array,
  certifications: array,
  languages: array,
  createdAt: number,
  updatedAt: number
}
```

### companyProfiles (Global)
```typescript
{
  _id: Id<"companyProfiles">,
  url: string,
  companyName: string,
  linkedinUrl: string,
  websiteUrl?: string,
  basicInfo?: object,
  stats?: object,
  locations?: object,
  media?: object,
  funding?: object,
  createdAt: number,
  updatedAt: number
}
```

### userSavedProfiles (Junction)
```typescript
{
  _id: Id<"userSavedProfiles">,
  userId: string, // Clerk ID
  profileId?: Id<"linkedinProfiles">,
  companyProfileId?: Id<"companyProfiles">,
  profileType: "personal" | "company",
  personalNotes?: string,
  tags: string[],
  createdAt: number,
  updatedAt: number
}
```

### competitorTracking
```typescript
{
  _id: Id<"competitorTracking">,
  userId: string,
  targetType: "profile" | "keyword",
  targetValue: string, // URL or keyword
  schedule: "daily" | "weekly" | "monthly",
  targets: ("commenters" | "reactors")[],
  isActive: boolean,
  lastExecutedAt?: number,
  nextExecutionAt: number,
  webhookUrl?: string,
  createdAt: number
}
```

---

## Actor Usage Summary

| Actor | ID | Primary Use | Called By | Frequency |
|-------|------|-------------|-----------|-----------|
| **Personal Profile Details** | GOvL4O4RwFqsdIqXF | Enrich profiles | Manual + Auto | High |
| **Company Profile Details** | ipHw77V2NMJPy8sbS | Enrich companies | Manual | Medium |
| **Personal Profile Posts** | A3cAPGpwBEG8RJwse | Find new posts | Competitor cron | Daily |
| **Keyword Search** | 9o7Ft0fpQTY5FW38E | Discover posts | Keyword cron | Weekly |
| **Post Comments** | ZI6ykbLlGS3APaPE8 | Extract commenters | Auto tracking | High |
| **Post Reactions** | S6mgSO5lezSZKi0zN | Extract reactors | Auto tracking | High |

---

## Cost Optimization

### Smart Caching Saves 80%
```
Without Caching:
- User A scrapes Profile X → $0.15
- User B scrapes Profile X → $0.15
- User C scrapes Profile X → $0.15
Total: $0.45 for same profile

With Smart Caching:
- User A scrapes Profile X → $0.15 (saves to global DB)
- User B gets Profile X → $0 (cache hit)
- User C gets Profile X → $0 (cache hit)
Total: $0.15 (67% savings)

At Scale (1000 profiles, 3 users):
- Without: $450
- With caching: $150
- Savings: $300 (67%)
```

---

## Key Features

1. **Global Profile Database**: One profile scraped once, used by everyone
2. **Smart Caching**: Check before scraping, 30-day freshness
3. **Automated Discovery**: Competitor and keyword tracking on schedules
4. **Batch Processing**: Process 1000+ profiles in parallel
5. **API Key Rotation**: Automatic failover across multiple Apify accounts
6. **Real-time Progress**: Live updates during scraping operations
7. **Auto-tagging**: Profiles tagged with discovery source

---

## Success Metrics

**Performance**:
- Cache hit rate: 40-60%
- API cost savings: 50-80%
- Batch processing speed: 50 profiles/minute
- Uptime: 99.9%

**User Value**:
- Profiles discovered daily: 1,000+/user
- Time saved: 20 hours/week
- Lead quality: High (engaged audiences)
- ROI: 10x (saved time + reduced costs)

---

**End of PRD**
