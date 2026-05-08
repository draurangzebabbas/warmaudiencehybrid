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

---

#### 4 Google Maps Email Extractor

**Actor ID**: `WnMxbsRLNbPeYL6ge`

**Input**:
```json
{
    "includeWebResults": false,
    "language": "en",
    "locationQuery": "Paris",
    "maxCrawledPlacesPerSearch": 5,
    "maximumLeadsEnrichmentRecords": 0,
    "scrapeContacts": true,
    "scrapeDirectories": false,
    "scrapePlaceDetailPage": false,
    "scrapeSocialMediaProfiles": {
        "facebooks": false,
        "instagrams": false,
        "tiktoks": false,
        "twitters": true,
        "youtubes": false
    },
    "scrapeTableReservationProvider": false,
    "searchStringsArray": [
        "car wash"
    ],
    "skipClosedPlaces": false,
    "verifyLeadsEnrichmentEmails": false
}
```

**Output Structure**:
```json
[
  {
    "imageUrl": "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEq-hLmGpklnc6oX-4GUww0OvKfYjjWIj2UsmSSHMPt9jJF6o3BbyMO_Cg48fgXOBXpzNuU4w6WTes7mGooxVKkLcX2F_vvvQtFMXwIWygK2ZQMZD7IL3FjOKiZ3EIgUu5rdm89=w581-h240-k-no",
    "title": "Ghost Cleaner",
    "totalScore": 4.6,
    "reviewsCount": 66,
    "instagrams": [
      "https://www.instagram.com/ghost_cleaner"
    ],
    "facebooks": [
      "https://www.facebook.com/ghostcleanerparis"
    ],
    "linkedIns": [],
    "youtubes": [],
    "tiktoks": [],
    "twitters": [],
    "phone": "+33 9 72 63 06 23",
    "emails": [
      "contact@ghostcleaner.com"
    ],
    "city": "Paris",
    "website": "https://www.ghostcleaner.com/contact/",
    "url": "https://www.google.com/maps/search/?api=1&query=Ghost%20Cleaner&query_place_id=ChIJ__-vf7Nv5kcRTphMl0h1H5M"
  },
  {
    "imageUrl": "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHI2dR54RA7wSNi9s4MtYE71cAHyBttIeWdbe6uAa6iIQ-EnBSoAS-LnmKdacswGdosVHTsmRUuXbufUOLKJj0rum2pAkpVjyq8-QGHa1kJiMTrDCG_vPPNno4WlBKo8xwZABZ-=w408-h544-k-no",
    "title": "Best Clean Car",
    "totalScore": 4.3,
    "reviewsCount": 18,
    "instagrams": [],
    "facebooks": [],
    "linkedIns": [],
    "youtubes": [],
    "tiktoks": [],
    "twitters": [],
    "phone": "+33 9 81 29 14 13",
    "emails": [],
    "city": "Paris",
    "website": "https://sites.google.com/view/bestcleancar/home",
    "url": "https://www.google.com/maps/search/?api=1&query=Best%20Clean%20Car&query_place_id=ChIJY_x4h8Fv5kcR0PrGSwGP3AU"
  },
  {
    "imageUrl": "https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=YKdIdRmF9mqKpFlzwnaOfg&cb_client=search.gws-prod.gps&w=408&h=240&yaw=199.18263&pitch=0&thumbfov=100",
    "title": "Wash",
    "totalScore": 5,
    "reviewsCount": 1,
    "instagrams": [],
    "facebooks": [],
    "linkedIns": [],
    "youtubes": [],
    "tiktoks": [],
    "twitters": [],
    "phone": "+33 1 40 70 96 31",
    "emails": [
      "rgpd@wash.totalenergies.com"
    ],
    "city": "Paris",
    "website": "https://wash-totalenergies.fr/centre-de-lavage/ile-de-france/paris/paris-8/parking-indigo-champs-elysees-niv-2/",
    "url": "https://www.google.com/maps/search/?api=1&query=Wash&query_place_id=ChIJea_qocxv5kcREO9hl31BZFg"
  },
  {
    "imageUrl": "https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=M3yUIzuo4uSrg-Hr5rv_Rg&cb_client=search.gws-prod.gps&w=408&h=240&yaw=33.93647&pitch=0&thumbfov=100",
    "title": "Wash",
    "totalScore": 4.5,
    "reviewsCount": 22,
    "instagrams": [],
    "facebooks": [],
    "linkedIns": [],
    "youtubes": [],
    "tiktoks": [],
    "twitters": [],
    "phone": "+33 1 47 10 93 90",
    "emails": [
      "rgpd@wash.totalenergies.com"
    ],
    "city": "Paris",
    "website": "https://wash-totalenergies.fr/centre-de-lavage/ile-de-france/paris/paris-1/parking-indigo-marche-saint-honore-niv-2/",
    "url": "https://www.google.com/maps/search/?api=1&query=Wash&query_place_id=ChIJrYs6LRFv5kcRvV_-Y-TJYWs"
  },
  {
    "imageUrl": "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGyDEf02Bqaz2lJm3c-vP2_1RjOVYjz_KP7gpUfuLyG2tZNhR-DMu8SxqoPlSQgRjj8hny2TDRcwba3I_K20KU3ASDXqLWsOkf5WOmBrB1ptrvjrHPETXVLDxwHE6RXZA1VFVvw=w408-h306-k-no",
    "title": "Lavage à la main Paris 16",
    "totalScore": 4.7,
    "reviewsCount": 105,
    "instagrams": [
      "https://www.instagram.com/washlib"
    ],
    "facebooks": [
      "https://www.facebook.com/washlib"
    ],
    "linkedIns": [
      "https://linkedin.com/company/washlib",
      "https://www.linkedin.com/company/washlib"
    ],
    "youtubes": [
      "https://www.youtube.com/@washlib",
      "https://youtube.com/washlib"
    ],
    "tiktoks": [],
    "twitters": [
      "https://www.twitter.com/washlib"
    ],
    "phone": "+33 6 98 42 40 09",
    "emails": [
      "support@washlib.com"
    ],
    "city": "Paris",
    "website": "http://www.washlib.com/",
    "url": "https://www.google.com/maps/search/?api=1&query=Lavage%20%C3%A0%20la%20main%20Paris%2016&query_place_id=ChIJS5079Plv5kcRaOg58h8dR8I"
  }
]
```

