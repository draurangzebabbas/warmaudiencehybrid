## Apify Actors - Currently Implemented (6 Total)

### 1. PROFILE SCRAPERS (2 Actors)

#### 1.1 Personal Profile Details
**Actor ID**: `GOvL4O4RwFqsdIqXF`


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


#### 1.2 Company Profile Details
**Actor ID**: `ipHw77V2NMJPy8sbS`

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