## Apify Actors - Currently Implemented (6 Total)

### 1. Linkedin SCRAPERS --------------------------------------------------------------------
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

#### 1.3. Linkedin POST SCRAPERS

##### 1.3.1 Linkedin Personal Profile Posts
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

#### 1.4 Keyword Search / Post Discovery
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


#### 1.5. ENGAGEMENT SCRAPERS 

##### 1.5.1 Post Comments Scraper
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

##### 1.5.2 Post Reactions Scraper
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

### 2. Google Maps Email Extractor

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


### 3. Website Contact Details Scraper


**Actor ID**: `9Sk4JJhEma9vBKqrg`


**Input**:
```json
{
    "considerChildFrames": true,
    "maxDepth": 0,
    "maxRequests": 1,
    "maxRequestsPerStartUrl": 1,
    "mergeContacts": true,
    "sameDomain": true,
    "startUrls": [
        {
            "url": "https://shopify.com"
        }
    ],
    "useBrowser": false,
    "verifyLeadsEnrichmentEmails": true
}
```

**Output Structure**:
```json
[
  {
    "domain": "shopify.com",
    "emails": [],
    "phones": [],
    "linkedIns": [
      "https://www.linkedin.com/company/shopify"
    ],
    "twitters": [
      "https://twitter.com/shopify",
      "https://x.com/Shopify"
    ],
    "instagrams": [
      "https://www.instagram.com/shopify"
    ],
    "facebooks": [
      "https://www.facebook.com/shopify"
    ],
    "youtubes": [
      "https://www.youtube.com/shopify",
      "https://www.youtube.com/user/shopify"
    ],
    "tiktoks": [
      "https://www.tiktok.com/@shopify"
    ],
    "pinterests": [
      "https://www.pinterest.com/shopify"
    ],
    "discords": [],
    "snapchats": [],
    "threads": [],
    "telegrams": [],
    "reddits": [],
    "whatsapps": []
  }
]
```

### 4. Twitter Extractor

#### Twitter (X) Follower/Following Scraper


**Actor ID**: `C2Wk3I6xAqC4Xi63f`

**Input**:
```json
{
    "getFollowers": true,
    "getFollowing": false,
    "maxFollowers": 200, // This field should be >= 200
    "maxFollowings": 200, // This field should be >= 200
    "user_ids": [
        "User Id here"
    ],
    "user_names": [
        "username here"
    ]
}
```

**Output Structure**:
```json
[
  {
    "type": "follower",
    "target_username": "Draurangzebabas",
    "id": 2022262353740415000,
    "id_str": "2022262353740414976",
    "name": "Shamim",
    "screen_name": "ShamimeAzadii",
    "description": "✍️ I explore Web3 ecosystems and share practical frameworks, trends, and lesson |  Trader & Crypto Content Creator | #Web3 #BTC #ETH |",
    "email": null,
    "url": null,
    "profile_image_url_https": "https://pbs.twimg.com/profile_images/2023503626145292289/3RvyuDZi_normal.jpg",
    "profile_banner_url": "https://pbs.twimg.com/profile_banners/2022262353740414976/1771275846",
    "followers_count": 1424,
    "fast_followers_count": 0,
    "normal_followers_count": 1424,
    "friends_count": 6016,
    "listed_count": 0,
    "favourites_count": 62,
    "statuses_count": 64,
    "media_count": 4,
    "created_at": "Fri Feb 13 10:51:47 +0000 2026",
    "verified": false,
    "location": "",
    "protected": false,
    "geo_enabled": false,
    "is_translator": false,
    "has_extended_profile": true,
    "default_profile": true,
    "default_profile_image": false
  },
  {
    "type": "follower",
    "target_username": "Draurangzebabas",
    "id": 1918976112471978000,
    "id_str": "1918976112471977984",
    "name": "Kunal",
    "screen_name": "Its_kunal_919",
    "description": "I’m Kunal, a 15-year-old solopreneur and SaaS founder! 🚀 I created AnimifyLogoAI , My  SaaS startup, which will be launched soon. 💻 .",
    "email": null,
    "url": null,
    "profile_image_url_https": "https://pbs.twimg.com/profile_images/1919273681433341952/EWVOsbV3_normal.jpg",
    "followers_count": 43,
    "fast_followers_count": 0,
    "normal_followers_count": 43,
    "friends_count": 1001,
    "listed_count": 0,
    "favourites_count": 25,
    "statuses_count": 164,
    "media_count": 4,
    "created_at": "Sun May 04 10:29:05 +0000 2025",
    "verified": false,
    "location": "Kota,Rajasthan",
    "protected": false,
    "geo_enabled": false,
    "is_translator": false,
    "has_extended_profile": true,
    "default_profile": true,
    "default_profile_image": false
  },
  {
    "type": "following",
    "target_username": "Draurangzebabas",
    "id": 1573125753213960200,
    "id_str": "1573125753213960194",
    "name": "Samantha Simonhoff",
    "screen_name": "RealProductGirl",
    "description": "Building for Humanity | AI Native PM | ProductGirl \n\nCommunity: https://t.co/PHwhAe8COT \nMerch: https://t.co/bNaL14ZsSH\nKeyboard: https://t.co/5FPIeexESB",
    "email": null,
    "url": "https://t.co/K57wyh1x2x",
    "profile_image_url_https": "https://pbs.twimg.com/profile_images/2033294533618720768/NcvCK-Kb_normal.jpg",
    "profile_banner_url": "https://pbs.twimg.com/profile_banners/1573125753213960194/1774368940",
    "followers_count": 4315,
    "fast_followers_count": 0,
    "normal_followers_count": 4315,
    "friends_count": 778,
    "listed_count": 17,
    "favourites_count": 12363,
    "statuses_count": 11212,
    "media_count": 728,
    "created_at": "Fri Sep 23 01:43:11 +0000 2022",
    "verified": false,
    "location": "World",
    "protected": false,
    "geo_enabled": false,
    "is_translator": false,
    "has_extended_profile": true,
    "default_profile": true,
    "default_profile_image": false
  },
  {
    "type": "following",
    "target_username": "Draurangzebabas",
    "id": 1918976112471978000,
    "id_str": "1918976112471977984",
    "name": "Kunal",
    "screen_name": "Its_kunal_919",
    "description": "I’m Kunal, a 15-year-old solopreneur and SaaS founder! 🚀 I created AnimifyLogoAI , My  SaaS startup, which will be launched soon. 💻 .",
    "email": null,
    "url": null,
    "profile_image_url_https": "https://pbs.twimg.com/profile_images/1919273681433341952/EWVOsbV3_normal.jpg",
    "followers_count": 43,
    "fast_followers_count": 0,
    "normal_followers_count": 43,
    "friends_count": 1001,
    "listed_count": 0,
    "favourites_count": 25,
    "statuses_count": 164,
    "media_count": 4,
    "created_at": "Sun May 04 10:29:05 +0000 2025",
    "verified": false,
    "location": "Kota,Rajasthan",
    "protected": false,
    "geo_enabled": false,
    "is_translator": false,
    "has_extended_profile": true,
    "default_profile": true,
    "default_profile_image": false
  }
]
```

#### X / Twitter Comments Scraper


**Actor ID**: `r0Lto6qhNw7DH2SXr`

**Input**:
```json
{
  "maxCommentsPerPost": 1000,
  "postUrls": [
    "https://x.com/mikefutia/status/2067766615962489258?s=20"
  ],
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": [
      "RESIDENTIAL"
    ]
  }
}
```

**Output Structure**:
```json
[
  {
    "post_url": "https://x.com/romanbuildsaas/status/2050282939897074158?s=20",
    "comment_id": "2050283429401391563",
    "text": "The ethics of this are... questionable at best.",
    "reply_to": [
      "romanbuildsaas"
    ],
    "likes": 0,
    "replies": 1,
    "views": 188,
    "created_at": "Fri May 01 18:37:16 +0000 2026",
    "author_username": "PramodReddy1606",
    "author_name": "Pramod Reddy Pandiri",
    "author_followers": 231,
    "author_verified": true,
    "author_id": "943746134920404992"
  },
  {
    "post_url": "https://x.com/romanbuildsaas/status/2050282939897074158?s=20",
    "comment_id": "2050284605740372006",
    "text": "Scraping people who engage with your competitors is a common practice.If you feel it’s unethical, that’s completely fair, just don’t do it.",
    "reply_to": [
      "PramodReddy1606"
    ],
    "likes": 0,
    "replies": 1,
    "views": 157,
    "created_at": "Fri May 01 18:41:57 +0000 2026",
    "author_username": "romanbuildsaas",
    "author_name": "Romàn",
    "author_followers": 13161,
    "author_verified": true,
    "author_id": "1893653481858433024"
  },
  {
    "post_url": "https://x.com/romanbuildsaas/status/2050282939897074158?s=20",
    "comment_id": "2050575045341114546",
    "text": "Cool strategy! Created step-by-step SOP from your video: https://t.co/WGrjc3sxxP",
    "reply_to": [
      "romanbuildsaas"
    ],
    "likes": 0,
    "replies": 0,
    "views": 64,
    "created_at": "Sat May 02 13:56:03 +0000 2026",
    "author_username": "JureSpeh",
    "author_name": "Jure Špeh",
    "author_followers": 28,
    "author_verified": false,
    "author_id": "1398711914272890881"
  },
  {
    "post_url": "https://x.com/romanbuildsaas/status/2050282939897074158?s=20",
    "comment_id": "2050510807637635332",
    "text": "Kudos for leveraging this 👍👍👍\nLinkedIn privacy is a joke. Has been forever. Once something becomes public information, it's FAIR GAME (within some reasonable ethical limits).",
    "reply_to": [
      "romanbuildsaas",
      "pierreeliottlal"
    ],
    "likes": 0,
    "replies": 0,
    "views": 74,
    "created_at": "Sat May 02 09:40:47 +0000 2026",
    "author_username": "PaulSandersSCP",
    "author_name": "Paul Sanders",
    "author_followers": 829,
    "author_verified": false,
    "author_id": "377010688"
  },
  {
    "post_url": "https://x.com/romanbuildsaas/status/2050282939897074158?s=20",
    "comment_id": "2052444957584327094",
    "text": "You’re going to get banned by LinkedIn. It’s just a matter of time.",
    "reply_to": [
      "romanbuildsaas"
    ],
    "likes": 0,
    "replies": 0,
    "views": 26,
    "created_at": "Thu May 07 17:46:25 +0000 2026",
    "author_username": "abhibavishi",
    "author_name": "Abhi Bavishi",
    "author_followers": 378,
    "author_verified": true,
    "author_id": "144914248"
  },
  {
    "post_url": "https://x.com/romanbuildsaas/status/2050282939897074158?s=20",
    "comment_id": "2050293128599392659",
    "text": "We’re the OG competitor siphoners money makers rump shakers",
    "reply_to": [
      "romanbuildsaas"
    ],
    "likes": 0,
    "replies": 0,
    "views": 112,
    "created_at": "Fri May 01 19:15:49 +0000 2026",
    "author_username": "kai_cabero",
    "author_name": "Kai Cabero",
    "author_followers": 2110,
    "author_verified": true,
    "author_id": "1755729314073526272"
  }
]
```

#### Twitter Email Scraper - X Profile & Lead Extractor


**Actor ID**: `m0LEAhkyKSbmcbPnl`

**Input**:
```json
{
  "onlyWithContact": false,
  "profiles": [
    "Guronnimo",
    "Draurangzebabas",
    "DanielSmidstrup",
    "theaadedewe"
  ],
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": [
      "RESIDENTIAL"
    ]
  },
  "maxConcurrency": 5,
  "maxResults": 0
}
```

**Output Structure**:
```json
[
  {
    "userId": "99704137",
    "username": "Guronnimo",
    "name": "Jeroen van Welsenes",
    "bio": "Building towards financial independence.\nDocumenting my journey\n\nRoad to 10k total revenue\n🟩⬜️⬜️⬜️⬜️ 15%\n\n🚀 https://t.co/iaiMM4dLbh",
    "location": "Amsterdam",
    "website": "https://www.jeroenvanwelsenes.com/",
    "email": null,
    "phone": null,
    "followers": 1354,
    "following": 804,
    "tweetCount": 3653,
    "likeCount": 3414,
    "mediaCount": 261,
    "listedCount": 2,
    "verified": true,
    "verifiedType": null,
    "protected": false,
    "createdAt": "Sun Dec 27 13:02:33 +0000 2009",
    "profileImage": "https://pbs.twimg.com/profile_images/2053062352241590275/PHpKkfkh_normal.jpg",
    "url": "https://x.com/Guronnimo",
    "foundFor": "Guronnimo",
    "scrapedAt": "2026-06-19T12:37:47.828Z"
  },
  {
    "userId": "1420038824",
    "username": "DanielSmidstrup",
    "name": "Daniel Smidstrup",
    "bio": "Solo dev. Ex-CTO ($700k ARR).\n\nGrow on X https://t.co/DgZItQ6Z5B ($696 MRR)\nhttps://t.co/9zALrQHvEi\nhttps://t.co/9iKp9dW5wc\n\nCA - GKiWPpqJDweATtxztxfx4Nq4YaDGfTQq8o8okHR83ory",
    "location": null,
    "website": "https://ClimbX.so",
    "email": null,
    "phone": null,
    "followers": 6608,
    "following": 2229,
    "tweetCount": 23429,
    "likeCount": 33419,
    "mediaCount": 573,
    "listedCount": 18,
    "verified": true,
    "verifiedType": null,
    "protected": false,
    "createdAt": "Sat May 11 07:35:53 +0000 2013",
    "profileImage": "https://pbs.twimg.com/profile_images/2039256958260400128/dy7LAvLn_normal.jpg",
    "url": "https://x.com/DanielSmidstrup",
    "foundFor": "DanielSmidstrup",
    "scrapedAt": "2026-06-19T12:37:47.959Z"
  },
  {
    "userId": "1098821895565258752",
    "username": "theaadedewe",
    "name": "ade",
    "bio": "Founder & CEO of @kredete",
    "location": "Download the Kredete App →",
    "website": "https://onelink.to/kredete",
    "email": null,
    "phone": null,
    "followers": 12640,
    "following": 323,
    "tweetCount": 2370,
    "likeCount": 2237,
    "mediaCount": 224,
    "listedCount": 23,
    "verified": true,
    "verifiedType": null,
    "protected": false,
    "createdAt": "Fri Feb 22 05:48:49 +0000 2019",
    "profileImage": "https://pbs.twimg.com/profile_images/2052268638506242048/VHfom2bV_normal.jpg",
    "url": "https://x.com/theaadedewe",
    "foundFor": "theaadedewe",
    "scrapedAt": "2026-06-19T12:37:47.964Z"
  },
  {
    "userId": "1817817506569945088",
    "username": "Draurangzebabas",
    "name": "Aurangzeb Abbas",
    "bio": "Build solutions for researchers, developers & marketers — to cut costs, save time, grow with AI automation/agents & keep things affordable. DM me for discussion",
    "location": "Pakistan",
    "website": null,
    "email": null,
    "phone": null,
    "followers": 5,
    "following": 39,
    "tweetCount": 128,
    "likeCount": 14,
    "mediaCount": 36,
    "listedCount": 0,
    "verified": false,
    "verifiedType": null,
    "protected": false,
    "createdAt": "Mon Jul 29 07:00:56 +0000 2024",
    "profileImage": "https://pbs.twimg.com/profile_images/2052948400417693696/ehWr9h1D_normal.jpg",
    "url": "https://x.com/Draurangzebabas",
    "foundFor": "Draurangzebabas",
    "scrapedAt": "2026-06-19T12:37:48.340Z"
  }
]
```


### 5. Instagram Extractor

#### Instagram Followers Scraper


**Actor ID**: `vaCTgYFLVBaaYUaBY`

**Input**:
```json
{
    "extractFollowers": true,
    "extractFollowing": true,
    "mustBeVerified": false,
    "usernames": [
        "https://instagram.com/ahtsham2061"
    ]
}
```

**Output Structure**:
```json
[
  {
    "Account": "https://instagram.com/zaeem.charm",
    "Profile Picture": "https://scontent-lax7-1.cdninstagram.com/v/t51.2885-19/171670956_940919189987329_29678336409592604_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lax7-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2gHZbYv07aLbvYR4Uxl459RnQ0S9n1hDb6zduNbWSHeBx5dbTLZt9mFr7CkN-x1bWeA&_nc_ohc=zGWShNhKUYoQ7kNvwGfaWdA&_nc_gid=-Nn75gPuMGe1-qljD9KYZQ&edm=AO4kU9EBAAAA&ccb=7-5&ig_cache_key=GKx9OwoB4BTSwlcDABzjNytKcGkAbkULAAAB1501500j-ccb7-5&oh=00_Af7NG-6WCgUQwsvQqBApx7rla__Pg0nDSo-v_dNnKKEAZg&oe=6A08C87B&_nc_sid=164c1d",
    "Full Name": "Z  ā  ē  Ē  m",
    "Source": "Follower of ahtsham2061",
    "Mutual Follow": "No",
    "Followers Count": 7406,
    "Following Count": 3360,
    "Biography": "☔ \n6'3 100 KG 🇵🇰\n98 Years old 🐺\nKind To Those Who Deserve\nLifetime Natural \nPersonal trainer \nYouTube👇",
    "Detected Language": "English",
    "Reels Count": 12,
    "Median Views": 2444,
    "Views/Followers Ratio": "33.00%",
    "Median ER": "2.04%",
    "Quality": "Good",
    "Last Post Within (Days)": 36,
    "Last Reel (Days Ago)": 282
  },
  {
    "Account": "https://instagram.com/faisal_wattoo773",
    "Profile Picture": "https://scontent-ord5-2.cdninstagram.com/v/t51.82787-19/670415445_17986686362969266_4678197006449294553_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2gH4jIuJ031I9VnPerZ-x_gQO-IQuh5VQlUfNXey0y4Zv1ORZvLph1iax2hUfOxHmhA&_nc_ohc=oZJGAIwMa4sQ7kNvwGu3DRC&_nc_gid=DaUJqcgCAECIYt7dRmTSNw&edm=AO4kU9EBAAAA&ccb=7-5&ig_cache_key=GFW69Sey5FnDy_Y-ANm8tCZkS_xAbmNDAQAB1501500j-ccb7-5&oh=00_Af5pJ1dHGaVq4nS3qsMlSqhugqLqxm-EmV-a0I2jaLBM4A&oe=6A08DFC0&_nc_sid=164c1d",
    "Full Name": "ғᴀɪsᴀʟ",
    "Source": "Follower of ahtsham2061",
    "Mutual Follow": "Yes",
    "Followers Count": 1091,
    "Following Count": 245,
    "Biography": "📍BWN[]\n14 September 🎂@wattoo_773",
    "Detected Language": "N/A",
    "Reels Count": 1,
    "Median Views": 1131,
    "Views/Followers Ratio": "103.67%",
    "Median ER": "18.52%",
    "Quality": "Good",
    "Last Post Within (Days)": 2,
    "Last Reel (Days Ago)": 231
  },
  {
    "Account": "https://instagram.com/babarazam",
    "Profile Picture": "https://scontent-lax7-1.cdninstagram.com/v/t51.2885-19/451106881_383811357648898_4886035207207806743_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lax7-1.cdninstagram.com&_nc_cat=1&_nc_oc=Q6cZ2gHIQy4H5mTeG0nGgePAwz6KkD-kAlZaESNlxMTYwsxKbqRM8R1Ujkt1eR6fJcq2uZs&_nc_ohc=JT1rGV1ZKjMQ7kNvwHEa605&_nc_gid=CUDcQO83KZZ2yrXowW-Azg&edm=AO4kU9EBAAAA&ccb=7-5&ig_cache_key=GEFY4xoCKKILE10BABdnrDUir85DbkULAAAB1501500j-ccb7-5&oh=00_Af4btuESwcp5tDs25v3_bzmUt24jiaC1kfGom35YiBzYnA&oe=6A08DF80&_nc_sid=164c1d",
    "Full Name": "Babar Azam",
    "Source": "Following of ahtsham2061",
    "Mutual Follow": "No",
    "Followers Count": 6509626,
    "Following Count": 38,
    "Biography": "Unity | Faith | Discipline\n#BA56 🏏\n📧 Mentor @TalhaAisham at @sayacorps",
    "Detected Language": "ga",
    "Reels Count": 12,
    "Median Views": 3484124,
    "Views/Followers Ratio": "53.52%",
    "Median ER": "5.02%",
    "Quality": "Good",
    "Last Post Within (Days)": 7,
    "Last Reel (Days Ago)": 17
  },
  {
    "Account": "https://instagram.com/theofficialnusrat",
    "Profile Picture": "https://scontent-iad6-1.cdninstagram.com/v/t51.2885-19/448599324_447135301356801_7424891099360262566_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-iad6-1.cdninstagram.com&_nc_cat=109&_nc_oc=Q6cZ2gEVP_njPQOpq3BajPnSRQixYkqDYfcL6LsKxHTW3OyByRjYwpedsVXr3_A4J5nn7yY&_nc_ohc=tyDLpGFdeKsQ7kNvwEKrsQa&_nc_gid=MVmYgzPRgWG8urlrFoIV4g&edm=AO4kU9EBAAAA&ccb=7-5&ig_cache_key=GBwVvRoBzc3MqpYBAKb5U7kdgwpnbkULAAAB1501500j-ccb7-5&oh=00_Af7IFY_rrAtQvumfkbPDXkRiwtnCn76NQ6XmEu6w3Fafqg&oe=6A08DA69&_nc_sid=164c1d",
    "Full Name": "Nusrat Fateh Ali Khan",
    "Source": "Following of ahtsham2061",
    "Mutual Follow": "No",
    "Followers Count": 812447,
    "Following Count": 53,
    "Biography": "Official account, controlled by Nusrat's estate. Nusrat Fateh Ali Khan is recognised as one of the great voices in musical history.",
    "Detected Language": "English",
    "Reels Count": 12,
    "Median Views": 556695,
    "Views/Followers Ratio": "68.52%",
    "Median ER": "2.90%",
    "Quality": "Good",
    "Last Post Within (Days)": 39,
    "Last Reel (Days Ago)": 331
  }
]
```

#### Instagram Profile Scraper - email, phone, socials


**Actor ID**: `JNb6iSRuMKLF3OA3v`

**Input**:
```json
{
    "usernames": [
        "mraurangzebabbas",
        "ehtsham"
    ]
}
```

**Output Structure**:
```json
[
  {
    "name": "",
    "username": "mraurangzebabbas",
    "id": "73258600633",
    "category": null,
    "businessCategory": null,
    "overallCategory": null,
    "categoryEnum": null,
    "bio": "𝐊𝐈𝐍𝐃 , 𝐋𝐎𝐘𝐀𝐋 &  𝐇𝐔𝐌𝐁𝐋𝐄 \n𝐌𝐚𝐧 with  ♡ of 𝐖𝐨𝐥𝐟\n𓃦🦢",
    "bioLinks": [
      {
        "title": "TikTok",
        "url": "http://tiktok.com/@draurangzebabbas",
        "linkType": "external"
      }
    ],
    "homepage": "http://tiktok.com/@draurangzebabbas",
    "followers": 13,
    "follows": 2,
    "facebookId": "17841473218997325",
    "isPrivate": false,
    "isVerified": false,
    "isBusinessAccount": false,
    "isProfessionalAccount": false,
    "hasClips": false,
    "hasGuides": false,
    "hasChannel": false,
    "highlightReelCount": 11,
    "pinnedChannelsListCount": 0,
    "pronouns": [],
    "businessContactMethod": "UNKNOWN",
    "profileImage": "https://instagram.faep9-2.fna.fbcdn.net/v/t51.82787-19/612503335_17882123190440634_1706533795805669240_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.faep9-2.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2gFAAGv5TBX9H41n2xYH3QP7pElZxsq7Zqnr9p1vssmyMq_EGSrmwJaFTBLJ1nXANjc&_nc_ohc=PeBLFnLbTSIQ7kNvwEPU67x&_nc_gid=jVLHsQX7SBvEp7njWrFq9w&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af6H7pNgO-J3VCwez7YcmEV-_fymnsdLpGplcea7rfHnLw&oe=6A08C7E3&_nc_sid=8b3546",
    "profileImageStandard": "https://instagram.faep9-2.fna.fbcdn.net/v/t51.82787-19/612503335_17882123190440634_1706533795805669240_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.faep9-2.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2gFAAGv5TBX9H41n2xYH3QP7pElZxsq7Zqnr9p1vssmyMq_EGSrmwJaFTBLJ1nXANjc&_nc_ohc=PeBLFnLbTSIQ7kNvwEPU67x&_nc_gid=jVLHsQX7SBvEp7njWrFq9w&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af432OHWXatxnABXHW3KKpLO4jJ-CGqerfm5dxo8zipaHw&oe=6A08C7E3&_nc_sid=8b3546",
    "videoCount": 0,
    "videos": [],
    "imageCount": 0,
    "images": [],
    "savedCount": 0,
    "collectionsCount": 0,
    "relatedProfiles": [],
    "biographyWithEntities": {
      "raw_text": "𝐊𝐈𝐍𝐃 , 𝐋𝐎𝐘𝐀𝐋 &  𝐇𝐔𝐌𝐁𝐋𝐄 \n𝐌𝐚𝐧 with  ♡ of 𝐖𝐨𝐥𝐟\n𓃦🦢",
      "entities": []
    },
    "businessEmail": null,
    "businessPhone": null,
    "allEmails": [],
    "allPhoneNumbers": [],
    "socialLinks": [],
    "websiteLinks": [],
    "hasContacts": false,
    "success": true
  },
  {
    "name": "Ehtsham Ahmad",
    "username": "ehtsham",
    "id": "14498987",
    "category": null,
    "businessCategory": null,
    "overallCategory": null,
    "categoryEnum": null,
    "bio": "",
    "bioLinks": [],
    "homepage": null,
    "followers": 599,
    "follows": 733,
    "facebookId": "17841401049610226",
    "isPrivate": true,
    "isVerified": false,
    "isBusinessAccount": false,
    "isProfessionalAccount": false,
    "hasClips": false,
    "hasGuides": false,
    "hasChannel": false,
    "highlightReelCount": 0,
    "pinnedChannelsListCount": 0,
    "pronouns": [],
    "businessContactMethod": "UNKNOWN",
    "profileImage": "https://instagram.fbsr1-2.fna.fbcdn.net/v/t51.2885-19/422300922_754881013235585_5021841770383815179_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fbsr1-2.fna.fbcdn.net&_nc_cat=105&_nc_oc=Q6cZ2gE3vpJNH5icp488oR7PeExtaXQXswknQcHbxqeGdqJ0RmL5VXiHJ44FmXnFoYdclU4&_nc_ohc=oVkjHpUdgzEQ7kNvwHATUiV&_nc_gid=efxJYEuYuQLbpdUAK4IZNw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af5Gyd7ISO45wk8dOolvLuv0touOSG5qdkW3IDdXL2dDKQ&oe=6A08E778&_nc_sid=8b3546",
    "profileImageStandard": "https://instagram.fbsr1-2.fna.fbcdn.net/v/t51.2885-19/422300922_754881013235585_5021841770383815179_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fbsr1-2.fna.fbcdn.net&_nc_cat=105&_nc_oc=Q6cZ2gE3vpJNH5icp488oR7PeExtaXQXswknQcHbxqeGdqJ0RmL5VXiHJ44FmXnFoYdclU4&_nc_ohc=oVkjHpUdgzEQ7kNvwHATUiV&_nc_gid=efxJYEuYuQLbpdUAK4IZNw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af6aWRmcybakQ804j0p0QnJhN1QX7EWos0ekrbizb7cpCQ&oe=6A08E778&_nc_sid=8b3546",
    "videoCount": 0,
    "videos": [],
    "imageCount": 24,
    "images": [],
    "savedCount": 0,
    "collectionsCount": 0,
    "relatedProfiles": [],
    "biographyWithEntities": {
      "raw_text": "",
      "entities": []
    },
    "businessEmail": null,
    "businessPhone": null,
    "allEmails": [],
    "allPhoneNumbers": [],
    "socialLinks": [],
    "websiteLinks": [],
    "hasContacts": false,
    "success": true
  }
]
```

#### Instagram Likes Scraper (no login needed)


**Actor ID**: `zLHxSG7mqmCcdnX6p`

**Input**:
```json
{
    "postCode": "DXBB07DjAtr"
}
```

**Output Structure**:
```json
[
  {
    "full_name": "Paige🤟🏻🌻💛🐥☀️",
    "id": "289265349",
    "is_new": true,
    "is_private": true,
    "is_verified": false,
    "latest_reel_media": 0,
    "profile_pic_id": "2722458803306073676",
    "profile_pic_url": "https://scontent-cph2-1.cdninstagram.com/v/t51.2885-19/264188709_954047975508389_2970326028280822352_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby45MDAuYzIifQ&_nc_ht=scontent-cph2-1.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2gFQtc1iRaE4qyDEhGPGS7_lvGlnTRhR0tT2INF50bKBZcrFlmAV65fvnEslOxbG_Dk&_nc_ohc=MKWODtnZ76oQ7kNvwHvnA2l&_nc_gid=C02kcnCYSb7FBoOemzKfgg&edm=AHUBisUBAAAA&ccb=7-5&ig_cache_key=GCUzvw_lya2as2MDAFB6xgbJtzgpbkULAAAB1501500j-ccb7-5&oh=00_Af4W6O9uOf9RL2_7ZLhdi9fodMr3bYM2O6DQ7LWMw7bAiw&oe=6A08F44C&_nc_sid=bc52df",
    "username": "muchmangoes"
  },
  {
    "full_name": "K E E L S 🤍",
    "id": "45281759488",
    "is_new": true,
    "is_private": true,
    "is_verified": false,
    "latest_reel_media": 0,
    "profile_pic_id": "3360164029598959609",
    "profile_pic_url": "https://scontent-cph2-1.cdninstagram.com/v/t51.2885-19/441225140_1643168696500244_4904734914505436826_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-cph2-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2gFQtc1iRaE4qyDEhGPGS7_lvGlnTRhR0tT2INF50bKBZcrFlmAV65fvnEslOxbG_Dk&_nc_ohc=aZbqxtzIrcQQ7kNvwHEq_kB&_nc_gid=C02kcnCYSb7FBoOemzKfgg&edm=AHUBisUBAAAA&ccb=7-5&ig_cache_key=GLSPTBoUAHYGdNYFAJpujRhrHhFEbkULAAAB1501500j-ccb7-5&oh=00_Af4twKFIkyU2HiDivMM2y2L6nUFJ_vNgrB-rsKH5d5ZmPg&oe=6A08ECB4&_nc_sid=bc52df",
    "username": "keels.au"
  },
  {
    "full_name": "chuc",
    "id": "67516037209",
    "is_new": true,
    "is_private": false,
    "is_verified": false,
    "latest_reel_media": 0,
    "profile_pic_id": "3739300751491523666",
    "profile_pic_url": "https://scontent-cph2-1.cdninstagram.com/v/t51.82787-19/561860417_17907021288253210_5452518151663489637_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDUwLmMyIn0&_nc_ht=scontent-cph2-1.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2gFQtc1iRaE4qyDEhGPGS7_lvGlnTRhR0tT2INF50bKBZcrFlmAV65fvnEslOxbG_Dk&_nc_ohc=5HhQ2GZMP_wQ7kNvwEEKQRJ&_nc_gid=C02kcnCYSb7FBoOemzKfgg&edm=AHUBisUBAAAA&ccb=7-5&ig_cache_key=GEFPfSEaJ99KV54-AGWSRclePKtLbmNDAQAB1501500j-ccb7-5&oh=00_Af6MS3_TrD3_mx89w7dzPSbBBtzh5qkXkskIAW0jPu5zrQ&oe=6A08CA49&_nc_sid=bc52df",
    "username": "trappxxout.chuc"
  }
]

```

#### Instagram Post Comments Extractor · No Login ($2.50 / 1,000 results)

**Actor ID**: `VCTzrlR4xt1YZP81x`

**Input**:
```json
{
  "maxPages": 100, //100 is maximum pages
  "postCode": "DXBB07DjAtr",
  "sortBy": "recent" // we have two options "recent" or "popular"
}
```

**Output Structure**:
```json
[
  {
    "child_comment_count": 14,
    "comment_index": 0,
    "comment_like_count": 1440,
    "content_type": "comment",
    "created_at": 1775973829,
    "created_at_for_fb_app": 1775973829,
    "created_at_utc": 1775973829,
    "did_report_as_spam": false,
    "has_disliked_comment": false,
    "has_liked": false,
    "has_liked_comment": false,
    "has_more_head_child_comments": true,
    "has_more_tail_child_comments": false,
    "hashtags": [],
    "id": "18080487494419689",
    "inline_composer_display_condition": "never",
    "is_covered": false,
    "is_edited": false,
    "is_photo_comments_enabled_for_comment_author": false,
    "is_pinned": false,
    "is_ranked_comment": true,
    "is_text_editable": false,
    "keywords_data": [],
    "like_count": 1440,
    "liked_by_media_coauthors": [],
    "mentions": [],
    "meta_ai_comment_type": "NONE",
    "other_preview_users": [],
    "preview_child_comments": [],
    "private_reply_status": 0,
    "share_enabled": true,
    "text": "Literally me rn at 2:03 am",
    "type": 0,
    "user": {
      "fbid_v2": "17841401065544738",
      "full_name": "Dan Rutland",
      "id": "303267518",
      "is_mentionable": true,
      "is_private": false,
      "is_verified": false,
      "latest_reel_media": 0,
      "profile_pic_url": "https://scontent-iad3-2.cdninstagram.com/v/t51.2885-19/928605_640716529358720_1851566052_a.jpg?stp=dst-jpg_e0_tt6&_nc_cat=105&ig_cache_key=GF0rDgCAVyJxukYCAOSnXG4AAAAAYUULAAAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xNTAuQzMifQ%3D%3D&_nc_ohc=6sTvOXW2_nkQ7kNvwFhmBZD&_nc_oc=AdpO1tOhjVZmYXpptRvDQwr_SlW-1vagh0T0Z-oJWZ7fxakwv2O5C53G1Xofo51UpbU&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_ss=703ba&oh=00_Af4LBs6uq6smnYEcPsAiXBGfPRqzCV6392GsFqZ0gWKjTQ&oe=6A08D87F",
      "username": "genuinevf"
    },
    "user_id": "303267518"
  },
  {
    "child_comment_count": 0,
    "comment_index": 1,
    "comment_like_count": 2,
    "content_type": "comment",
    "created_at": 1778347801,
    "created_at_for_fb_app": 1778347801,
    "created_at_utc": 1778347801,
    "did_report_as_spam": false,
    "has_disliked_comment": false,
    "has_liked": false,
    "has_liked_comment": false,
    "hashtags": [],
    "id": "17919386121349665",
    "inline_composer_display_condition": "never",
    "is_covered": false,
    "is_edited": false,
    "is_photo_comments_enabled_for_comment_author": false,
    "is_pinned": false,
    "is_ranked_comment": true,
    "is_text_editable": false,
    "keywords_data": [],
    "like_count": 2,
    "liked_by_media_coauthors": [],
    "mentions": [],
    "meta_ai_comment_type": "NONE",
    "other_preview_users": [],
    "preview_child_comments": [],
    "private_reply_status": 0,
    "share_enabled": true,
    "text": "😂😂",
    "type": 0,
    "user": {
      "fbid_v2": "17841404266009435",
      "full_name": "Aaky Ofcl",
      "id": "4155486200",
      "is_mentionable": true,
      "is_private": false,
      "is_verified": false,
      "latest_reel_media": 0,
      "profile_pic_id": "3579597091481953091",
      "profile_pic_url": "https://scontent-iad3-1.cdninstagram.com/v/t51.2885-19/482807778_1340686580583536_7139297005296514361_n.jpg?stp=dst-jpg_e0_s150x150_tt6&_nc_cat=1&ig_cache_key=GOIPxxxwDGTrWMMEADl1tfrM4BNjbkULAAAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=ZLmMpBKiQUIQ7kNvwEvz-Wu&_nc_oc=AdpRV27qpppNP5LgxCbEC0_C-BL28hX1O4TC6kUgyIxcX33AOOsd9noquaiuIVzvQiU&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ss=703ba&oh=00_Af4CxJx7ohyraM9AprVPYbq_gNfGI-YOFgswOKwZq1nUCg&oe=6A08D641",
      "username": "aaky_ofcl"
    },
    "user_id": "4155486200"
  }
]
```

### 6. Facebook Extractor

#### Facebook Followers & Following Scraper

**Actor ID**: `hhgonmMEMGmpbDDAN`

**Input**:
```json
{
    "followType": "follower", // following | or it would be null "" if user select both follower and following
    "resultsLimit": 50, // no max limit user can put the what ever number he wants  default is 50
    "startUrls": [
        {
            "url": "https://web.facebook.com/people/Ryiys-Hacker/61571220357480"
        }
    ]
}
```

**Output Structure**:
```json
[
  {
    "facebookUrl": "https://web.facebook.com/people/Ryiys-Hacker/61571220357480",
    "followType": "follower",
    "id": "61590803549734",
    "image": "https://scontent.frkh1-1.fna.fbcdn.net/v/t39.30808-1/723407955_122100321813360118_2732715999313004607_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx1024x1024&ctp=s80x80&_nc_cat=106&ccb=1-7&_nc_sid=167101&_nc_ohc=aQKQR4Ol1k0Q7kNvwEOKopp&_nc_oc=Adq8mVvRGBi4mksy0g-kJmBXU34cUi7jcsjF7PnfJIKNAJQlOQ7OfEv9BrvKEvXayTw&_nc_zt=24&_nc_ht=scontent.frkh1-1.fna&_nc_gid=B4PxHVDXDLpmi6gvsqyF9Q&_nc_ss=72289&oh=00_Af8KmKN5UTxSmFy3H8pNbqRO74ISTP-snGstuHnc2Bm-ag&oe=6A43D6F1",
    "title": "AI Studio ",
    "subtitle_text": "",
    "url": "https://www.facebook.com/people/AI-Studio/61590803549734/",
    "privacy_scope": null,
    "__typename": "User",
    "__isEntity": "User",
    "facebookId": "61571220357480",
    "navSections": [
      {
        "id": "YXBwX2NvbGxlY3Rpb246cGZiaWQwN2ZMYWRzNFZGWlFiQ3FVeUZrZGZ6ckprYm1jRWdFZ2RyeW5xN2tyM0x6VW96Q2pCNDJwNFJaMW9IdVUyQ0Q0TFBtRFJaUmlOOEFQOEs5azdXRzYybkp6WXd3V1ls",
        "name": "Followers",
        "url": "https://www.facebook.com/people/Ryiys-Hacker/61571220357480/?sk=followers"
      }
    ],
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "549620371548412"
    },
    "followersId": "YXBwX2NvbGxlY3Rpb246cGZiaWQwN2ZMYWRzNFZGWlFiQ3FVeUZrZGZ6ckprYm1jRWdFZ2RyeW5xN2tyM0x6VW96Q2pCNDJwNFJaMW9IdVUyQ0Q0TFBtRFJaUmlOOEFQOEs5azdXRzYybkp6WXd3V1ls",
    "inputUrl": "https://web.facebook.com/people/Ryiys-Hacker/61571220357480"
  },
  {
    "facebookUrl": "https://web.facebook.com/people/Ryiys-Hacker/61571220357480",
    "followType": "follower",
    "id": "100076533009921",
    "image": "https://scontent.frkh1-1.fna.fbcdn.net/v/t39.30808-1/295970060_167419902485776_8152044860385811223_n.png?stp=cp0_dst-png&cstp=mx768x768&ctp=s80x80&_nc_cat=103&ccb=1-7&_nc_sid=167101&_nc_ohc=-K9k8nzBOJkQ7kNvwEU2ycr&_nc_oc=AdrZZpmE4ON8Eci9iZGHAhI9P4Ciay0ykkQeUuL5CwtjyCI2FsxYd6yCrLAckomwcjo&_nc_zt=24&_nc_ht=scontent.frkh1-1.fna&_nc_gid=B4PxHVDXDLpmi6gvsqyF9Q&_nc_ss=72289&oh=00_Af_HzvELpZgIcJ4tKH5uxDnNp1mAubbysxBk33u6M0SMeg&oe=6A43F163",
    "title": "Mera sanghar ki awaz",
    "subtitle_text": "",
    "url": "https://www.facebook.com/people/Mera-sanghar-ki-awaz/100076533009921/",
    "privacy_scope": null,
    "__typename": "User",
    "__isEntity": "User",
    "facebookId": "61571220357480",
    "navSections": [
      {
        "id": "YXBwX2NvbGxlY3Rpb246cGZiaWQwN2ZMYWRzNFZGWlFiQ3FVeUZrZGZ6ckprYm1jRWdFZ2RyeW5xN2tyM0x6VW96Q2pCNDJwNFJaMW9IdVUyQ0Q0TFBtRFJaUmlOOEFQOEs5azdXRzYybkp6WXd3V1ls",
        "name": "Followers",
        "url": "https://www.facebook.com/people/Ryiys-Hacker/61571220357480/?sk=followers"
      }
    ],
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "549620371548412"
    },
    "followersId": "YXBwX2NvbGxlY3Rpb246cGZiaWQwN2ZMYWRzNFZGWlFiQ3FVeUZrZGZ6ckprYm1jRWdFZ2RyeW5xN2tyM0x6VW96Q2pCNDJwNFJaMW9IdVUyQ0Q0TFBtRFJaUmlOOEFQOEs5azdXRzYybkp6WXd3V1ls",
    "inputUrl": "https://web.facebook.com/people/Ryiys-Hacker/61571220357480"
  },
  {
    "facebookUrl": "https://web.facebook.com/people/Ryiys-Hacker/61571220357480",
    "followType": "follower",
    "id": "61588609287025",
    "image": "https://scontent.frkh1-1.fna.fbcdn.net/v/t39.30808-1/705959202_122116945407286976_5300863670970174263_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx1080x1080&ctp=s80x80&_nc_cat=101&ccb=1-7&_nc_sid=167101&_nc_ohc=Oi80ZW08ZIcQ7kNvwGuQoLX&_nc_oc=Adr52vXELDHLvs_8Lb7U_GTAgRSuoto1_PgyCg6ATyJtHVdj4DgHsFCsNM5YhGx8Tus&_nc_zt=24&_nc_ht=scontent.frkh1-1.fna&_nc_gid=B4PxHVDXDLpmi6gvsqyF9Q&_nc_ss=72289&oh=00_Af95mLc1Vq3R4KpiWljmjcFhY5NX3-NClA1hBTLJn-bHPA&oe=6A43E7F3",
    "title": "Hindu Dharma Niti",
    "subtitle_text": "",
    "url": "https://www.facebook.com/people/Hindu-Dharma-Niti/61588609287025/",
    "privacy_scope": null,
    "__typename": "User",
    "__isEntity": "User",
    "facebookId": "61571220357480",
    "navSections": [
      {
        "id": "YXBwX2NvbGxlY3Rpb246cGZiaWQwN2ZMYWRzNFZGWlFiQ3FVeUZrZGZ6ckprYm1jRWdFZ2RyeW5xN2tyM0x6VW96Q2pCNDJwNFJaMW9IdVUyQ0Q0TFBtRFJaUmlOOEFQOEs5azdXRzYybkp6WXd3V1ls",
        "name": "Followers",
        "url": "https://www.facebook.com/people/Ryiys-Hacker/61571220357480/?sk=followers"
      }
    ],
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "549620371548412"
    },
    "followersId": "YXBwX2NvbGxlY3Rpb246cGZiaWQwN2ZMYWRzNFZGWlFiQ3FVeUZrZGZ6ckprYm1jRWdFZ2RyeW5xN2tyM0x6VW96Q2pCNDJwNFJaMW9IdVUyQ0Q0TFBtRFJaUmlOOEFQOEs5azdXRzYybkp6WXd3V1ls",
    "inputUrl": "https://web.facebook.com/people/Ryiys-Hacker/61571220357480"
  },
  {
    "facebookUrl": "https://web.facebook.com/people/Ryiys-Hacker/61571220357480",
    "followType": "follower",
    "id": "61590924301341",
    "image": "https://scontent.frkh1-1.fna.fbcdn.net/v/t39.30808-1/725782010_950070351379720_5659658725347658409_n.jpg?stp=c256.0.1024.1024a_cp0_dst-jpg_tt6&cstp=mx1024x1024&ctp=s80x80&_nc_cat=105&ccb=1-7&_nc_sid=167101&_nc_ohc=M-cwv6AiHwkQ7kNvwET_yQd&_nc_oc=AdrcnMFaRpeU5dBr72fY8BF6tzKZZMgDaguluYWZpKe9CTimzb8dXKIFzba7fOq2uzE&_nc_zt=24&_nc_ht=scontent.frkh1-1.fna&_nc_gid=B4PxHVDXDLpmi6gvsqyF9Q&_nc_ss=72289&oh=00_Af_7tbMGi9XA14_T9_dn2avtT-xEDXTpzcuIq-BwshCBbw&oe=6A440962",
    "title": "Nexify",
    "subtitle_text": "",
    "url": "https://www.facebook.com/people/Nexify/61590924301341/",
    "privacy_scope": null,
    "__typename": "User",
    "__isEntity": "User",
    "facebookId": "61571220357480",
    "navSections": [
      {
        "id": "YXBwX2NvbGxlY3Rpb246cGZiaWQwN2ZMYWRzNFZGWlFiQ3FVeUZrZGZ6ckprYm1jRWdFZ2RyeW5xN2tyM0x6VW96Q2pCNDJwNFJaMW9IdVUyQ0Q0TFBtRFJaUmlOOEFQOEs5azdXRzYybkp6WXd3V1ls",
        "name": "Followers",
        "url": "https://www.facebook.com/people/Ryiys-Hacker/61571220357480/?sk=followers"
      }
    ],
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "549620371548412"
    },
    "followersId": "YXBwX2NvbGxlY3Rpb246cGZiaWQwN2ZMYWRzNFZGWlFiQ3FVeUZrZGZ6ckprYm1jRWdFZ2RyeW5xN2tyM0x6VW96Q2pCNDJwNFJaMW9IdVUyQ0Q0TFBtRFJaUmlOOEFQOEs5azdXRzYybkp6WXd3V1ls",
    "inputUrl": "https://web.facebook.com/people/Ryiys-Hacker/61571220357480"
  }
]
```

#### Facebook page contact info Scraper


**Actor ID**: `oJ48ceKNY7ueGPGL0`

**Input**:
```json
{
  "language": "en-GB",
  "pages": [
    "https://www.facebook.com/skinplusfindon/",
    "buildingaiagents",
    "https://web.facebook.com/aurangzeb.abbas.430665"
  ]
}
```

**Output Structure**:
```json
[
  {
    "facebookUrl": "https://www.facebook.com/skinplusfindon/",
    "categories": [
      "Page",
      "Skin Care Service"
    ],
    "info": [
      "Skinplus Dermatology, Findon. 530 likes",
      "84 were here. We have qualified dermatologists and staff to assess your skin. We will discuss and treat your conce"
    ],
    "likes": 530,
    "messenger": null,
    "title": "Skinplus Dermatology | Findon SA",
    "address": "178 Findon Road, Findon, SA, Australia, 5023 ",
    "pageId": "100063568933834",
    "pageName": "skinplusfindon",
    "pageUrl": "https://www.facebook.com/skinplusfindon/",
    "intro": "We have qualified dermatologists and staff to assess your skin. We will discuss and treat your conce",
    "websites": [
      "https://maps.google.com/maps?q=178+Findon+Road%2C+Findon%2C+SA%2C+Australia%2C+South+Australia&hl=en",
      "http://www.skinplusdermatology.com.au/"
    ],
    "phone": "+61 8 8347 1144",
    "email": "admin@skinplus.com.au",
    "website": "http://www.skinplusdermatology.com.au/",
    "followers": 530,
    "followings": 10,
    "profilePictureUrl": "https://scontent-lga3-1.xx.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png&cstp=mx2048x2048&ctp=s200x200&_nc_cat=1&ccb=1-7&_nc_sid=8f254b&_nc_ohc=COf5-xtMqFAQ7kNvwFhSuFt&_nc_oc=Ado6U86rQhxyix4Y7hdTdnNDDjl-xsE9Q3NHzPG4cAJIx8IifdG6xtIgbIyjGsHiKE4&_nc_zt=24&_nc_ht=scontent-lga3-1.xx&_nc_ss=7c289&oh=00_Af9XI0QpcOC14UDtnEJ56HG76LXX4YwiICEIwAu6wamFHw&oe=6A6592FA",
    "category": "Skin Care Service",
    "addressUrl": "https://www.bing.com/maps/default.aspx?v=2&pc=FACEBK&mid=8100&where1=178+Findon+Road%2C+Findon%2C+SA%2C+Australia%2C+5023+&FORM=FBKPL1&mkt=en-US",
    "business_hours": "Closing Soon",
    "creation_date": "February 28, 2014",
    "ad_status": "This Page isn't currently running ads.",
    "additionalProperties": {
      "messenger": null,
      "address": "178 Findon Road, Findon, SA, Australia, 5023 ",
      "profilePictureUrl": "https://scontent-lga3-1.xx.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png&cstp=mx2048x2048&ctp=s200x200&_nc_cat=1&ccb=1-7&_nc_sid=8f254b&_nc_ohc=COf5-xtMqFAQ7kNvwFhSuFt&_nc_oc=Ado6U86rQhxyix4Y7hdTdnNDDjl-xsE9Q3NHzPG4cAJIx8IifdG6xtIgbIyjGsHiKE4&_nc_zt=24&_nc_ht=scontent-lga3-1.xx&_nc_ss=7c289&oh=00_Af9XI0QpcOC14UDtnEJ56HG76LXX4YwiICEIwAu6wamFHw&oe=6A6592FA",
      "category": "Skin Care Service",
      "addressUrl": "https://www.bing.com/maps/default.aspx?v=2&pc=FACEBK&mid=8100&where1=178+Findon+Road%2C+Findon%2C+SA%2C+Australia%2C+5023+&FORM=FBKPL1&mkt=en-US",
      "business_hours": "Closing Soon",
      "ad_status": "This Page isn't currently running ads."
    },
    "facebookId": "100063568933834",
    "pageAdLibrary": {
      "id": "657426830962249",
      "pamv_comms_data": null
    }
  },
  {
    "facebookUrl": "https://web.facebook.com/aurangzeb.abbas.430665",
    "categories": [],
    "info": [],
    "messenger": null,
    "title": "Aurangzeb Abbas (@aurangzeb.abbas.430665) • Facebook, Connect with friends",
    "pageId": "61551535823607",
    "pageName": "aurangzeb.abbas.430665",
    "pageUrl": "https://web.facebook.com/aurangzeb.abbas.430665",
    "websites": [],
    "personalProfile": {
      "name": "Aurangzeb Abbas",
      "gender": "MALE",
      "profilePhoto": "https://www.facebook.com/photo/?fbid=122170236494051194&set=a.122094901736051194",
      "profilePicLarge": "https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-1/474121875_122170236500051194_644245577295989236_n.jpg?stp=dst-jpg_tt6&cstp=mx288x288&ctp=s200x200&_nc_cat=111&ccb=1-7&_nc_sid=e99d92&_nc_ohc=oUpsg3i1ZJ4Q7kNvwFcdcPK&_nc_oc=Adq06hrlG2VcdLu4Hry_zfBbwytEXSNlekOk8BjyXlUzeXNlm8llXSjEbwc--8F9f3E&_nc_zt=24&_nc_ht=scontent-lax3-2.xx&_nc_gid=dLejItLQcXGG-OizFG7wPQ&_nc_ss=72289&oh=00_Af-75ch799qCxOyLdIyMo6b5FsctGfAVVOm-DNpdGCFTyg&oe=6A43E0EA",
      "profilePicMedium": "https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-1/474121875_122170236500051194_644245577295989236_n.jpg?stp=dst-jpg_tt6&cstp=mx288x288&ctp=s148x148&_nc_cat=111&ccb=1-7&_nc_sid=e99d92&_nc_ohc=oUpsg3i1ZJ4Q7kNvwFcdcPK&_nc_oc=Adq06hrlG2VcdLu4Hry_zfBbwytEXSNlekOk8BjyXlUzeXNlm8llXSjEbwc--8F9f3E&_nc_zt=24&_nc_ht=scontent-lax3-2.xx&_nc_gid=dLejItLQcXGG-OizFG7wPQ&_nc_ss=72289&oh=00_Af-75ch799qCxOyLdIyMo6b5FsctGfAVVOm-DNpdGCFTyg&oe=6A43E0EA",
      "profilePicSmall": "https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-1/474121875_122170236500051194_644245577295989236_n.jpg?stp=dst-jpg_tt6&cstp=mx288x288&ctp=s100x100&_nc_cat=111&ccb=1-7&_nc_sid=e99d92&_nc_ohc=oUpsg3i1ZJ4Q7kNvwFcdcPK&_nc_oc=Adq06hrlG2VcdLu4Hry_zfBbwytEXSNlekOk8BjyXlUzeXNlm8llXSjEbwc--8F9f3E&_nc_zt=24&_nc_ht=scontent-lax3-2.xx&_nc_gid=dLejItLQcXGG-OizFG7wPQ&_nc_ss=72289&oh=00_Af-75ch799qCxOyLdIyMo6b5FsctGfAVVOm-DNpdGCFTyg&oe=6A43E0EA"
    },
    "coverPhotoUrl": "https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-6/476361751_122172217160051194_9003053755581779337_n.png?stp=dst-png&cstp=mx1640x924&ctp=s960x960&_nc_cat=108&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=2cL2S4-2-MoQ7kNvwH5Eb5t&_nc_oc=AdrxWxFLuESEbmuk1K0R0GBfO-cIrD2RZGC68cRQ00G3SEeWcBgOiq5Webu971cFZlg&_nc_zt=23&_nc_ht=scontent-lax3-1.xx&_nc_gid=dLejItLQcXGG-OizFG7wPQ&_nc_ss=72289&oh=00_Af9CfSwqpVHE9HvwkBc1JfTtGbTrOF6r_kz-Mu1VoXi65Q&oe=6A43DEA0",
    "profilePhoto": "https://www.facebook.com/photo/?fbid=122170236494051194&set=a.122094901736051194",
    "additionalProperties": {
      "messenger": null,
      "coverPhotoUrl": "https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-6/476361751_122172217160051194_9003053755581779337_n.png?stp=dst-png&cstp=mx1640x924&ctp=s960x960&_nc_cat=108&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=2cL2S4-2-MoQ7kNvwH5Eb5t&_nc_oc=AdrxWxFLuESEbmuk1K0R0GBfO-cIrD2RZGC68cRQ00G3SEeWcBgOiq5Webu971cFZlg&_nc_zt=23&_nc_ht=scontent-lax3-1.xx&_nc_gid=dLejItLQcXGG-OizFG7wPQ&_nc_ss=72289&oh=00_Af9CfSwqpVHE9HvwkBc1JfTtGbTrOF6r_kz-Mu1VoXi65Q&oe=6A43DEA0"
    },
    "facebookId": "61551535823607"
  },
  {
    "facebookUrl": "https://www.facebook.com/buildingaiagents",
    "categories": [
      "Page",
      "Golf Instructor",
      "Golf Course & Country Club",
      "Sports"
    ],
    "info": [
      "Building Ai Agents. 10 likes. ⛳Welcome to Pro Golfer!\nGuide | Tips | Reviews\nTake Your Swing To Next Level!\nJoin And Be A Part Of Golf Family"
    ],
    "likes": 10,
    "messenger": null,
    "title": "Building Ai Agents",
    "pageId": "61568388660207",
    "pageName": "buildingaiagents",
    "pageUrl": "https://www.facebook.com/buildingaiagents",
    "intro": "⛳Welcome to Pro Golfer!\nGuide | Tips | Reviews\nTake Your Swing To Next Level!\nJoin And Be A Part Of Golf Family",
    "websites": [
      "https://www.progolfer.xyz/"
    ],
    "website": "https://www.progolfer.xyz/",
    "rating": "Not yet rated (0 Reviews)",
    "followers": 10,
    "followings": 1,
    "profilePictureUrl": "https://scontent-det1-1.xx.fbcdn.net/v/t39.30808-1/465737642_122161965044051194_5709823965245971757_n.jpg?stp=dst-jpg_tt6&cstp=mx180x180&ctp=s180x180&_nc_cat=108&ccb=1-7&_nc_sid=f907e8&_nc_ohc=8FZj2cGDjMAQ7kNvwE7sGO6&_nc_oc=AdpkczZsb50raCMa0-DBIL9BNkWVVL6_L68my4IQ_mi9tUE1jx6zmWGWsyhXrN5SB38&_nc_zt=24&_nc_ht=scontent-det1-1.xx&_nc_gid=EH24a7_RMgOhZ3F0BfmS_Q&_nc_ss=7c289&oh=00_Af_wIELcRidcgA54kAQyaVand6KxhSbQEhVGJ2bR-iYIDw&oe=6A43EB4C",
    "profilePhoto": "https://www.facebook.com/photo/?fbid=122097299960612955&set=a.122097299120612955",
    "ratingCount": 0,
    "category": "Golf Instructor",
    "ratings": "Not yet rated (0 Reviews)",
    "creation_date": "November 6, 2024",
    "ad_status": "This Page isn't currently running ads.",
    "additionalProperties": {
      "messenger": null,
      "profilePictureUrl": "https://scontent-det1-1.xx.fbcdn.net/v/t39.30808-1/465737642_122161965044051194_5709823965245971757_n.jpg?stp=dst-jpg_tt6&cstp=mx180x180&ctp=s180x180&_nc_cat=108&ccb=1-7&_nc_sid=f907e8&_nc_ohc=8FZj2cGDjMAQ7kNvwE7sGO6&_nc_oc=AdpkczZsb50raCMa0-DBIL9BNkWVVL6_L68my4IQ_mi9tUE1jx6zmWGWsyhXrN5SB38&_nc_zt=24&_nc_ht=scontent-det1-1.xx&_nc_gid=EH24a7_RMgOhZ3F0BfmS_Q&_nc_ss=7c289&oh=00_Af_wIELcRidcgA54kAQyaVand6KxhSbQEhVGJ2bR-iYIDw&oe=6A43EB4C",
      "category": "Golf Instructor",
      "ratings": "Not yet rated (0 Reviews)",
      "ad_status": "This Page isn't currently running ads."
    },
    "facebookId": "61568388660207",
    "pageAdLibrary": {
      "id": "462612613605348",
      "pamv_comms_data": null
    }
  }
]
```

#### Facebook Comments [$1.5💰] Scraper


**Actor ID**: `boHTyXVlTvG5VM1fe`

**Input**:
```json
{
    "commentsMode": "ALL",
    "includeNestedComments": false,
    "maxItems": 10000,
    "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": [
            "RESIDENTIAL"
        ]
    },
    "startUrls": [
        {
            "url": "https://www.facebook.com/reel/813381761171953"
        },
        {
            "url": "https://www.facebook.com/photo?fbid=1465799148444403"
        },
        {
            "url": "https://www.facebook.com/reel/4364570517119853"
        },
        {
            "url": "https://www.facebook.com/watch?v=1312736054237897"
        },
        {
            "url": "https://www.facebook.com/photo?fbid=1485098743181110"
        },
        {
            "url": "https://www.facebook.com/photo/?fbid=1489500156068574&set=a.800788574939739"
        },
        {
            "url": "https://www.facebook.com/humansofnewyork/posts/pfbid0BbKbkisExKGSKuhee9a7i86RwRuMKFC8NSkKStB7CsM3uXJuAAfZLrkcJMXxhH4Yl"
        },
        {
            "url": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH"
        },
        {
            "url": "https://www.facebook.com/photo.php?fbid=1423151982709120"
        },
        {
            "url": "https://www.facebook.com/share/p/1CfaPmdZLU"
        }
    ]
}
```

**Output Structure**:
```json
[
  {
    "facebookUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "commentUrl": "https://www.facebook.com/groups/183774529022936/posts/2090871251646578/?comment_id=2091677278232642",
    "commentId": "2091677278232642",
    "id": "Y29tbWVudDoyMDkwODcxMjUxNjQ2NTc4XzIwOTE2NzcyNzgyMzI2NDI=",
    "text": "em cực kỳ recommend dòng colosbaby mới này cho mẹ nào có con sinh mổ",
    "comments": [],
    "threadingDepth": 0,
    "facebookId": "2090871251646578",
    "postTitle": "HỘI REVIEW BỈM SỮA CHO BÉ &lt;3",
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "0"
    },
    "inputUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "feedbackId": "ZmVlZGJhY2s6MjA5MDg3MTI1MTY0NjU3OF8yMDkxNjc3Mjc4MjMyNjQy",
    "date": "2026-02-04T08:38:25.000Z",
    "profilePicture": "https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-1/480208753_2647814102070775_2899473982701283894_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx720x733&ctp=p32x32&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_ohc=CRqvNY0N3HsQ7kNvwE1ziXM&_nc_oc=AdqBeGtMMKsAhZEMt8WrdykrRVOP8OcRTMi1EnA8GSwSzb8adoj-F3hjyeDJMb47pO4&_nc_zt=24&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=7L4MNRivS23eBhPVYq6GnA&_nc_ss=7d289&oh=00_Af_BSJPdB_wJ9Sdm8iIg3xfJpwynTS4jJSb4Eow6R-g_SQ&oe=6A43F7F7",
    "profileId": "pfbid0f3qRU7y7Cp4zc759jbTMy6SL1eKrqKqgDVMvCk433HTnN9uHQXeWHiRfmKWaiVgCl",
    "profileName": "Nguyễn Thanh Mỹ",
    "profileUrl": "https://www.facebook.com/marthacecilia.carretesespinoza"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "commentUrl": "https://www.facebook.com/groups/183774529022936/posts/2090871251646578/?comment_id=2093375878062782",
    "commentId": "2093375878062782",
    "id": "Y29tbWVudDoyMDkwODcxMjUxNjQ2NTc4XzIwOTMzNzU4NzgwNjI3ODI=",
    "text": "Lúc trước tiêu hóa của bé nhà mình không tốt nên mình đổi sang cho uống sữa bột pha sẵn IQLac Colostrum của VPMILK nè, sữa có vị nhạt dễ uống lắm và trong thành phần có HMO – chất xơ kép FOS giúp tiêu hóa ổn định hấp thu tốt hơn, ngoài ra còn có L-lysine, canxi, DHA và sữa non giúp phát triển toàn diện về cân nặng, chiều cao, trí não và đề kháng nên mẹ yên tâm dùng lâu dài cho bé",
    "comments": [],
    "threadingDepth": 0,
    "facebookId": "2090871251646578",
    "postTitle": "HỘI REVIEW BỈM SỮA CHO BÉ &lt;3",
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "0"
    },
    "inputUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "feedbackId": "ZmVlZGJhY2s6MjA5MDg3MTI1MTY0NjU3OF8yMDkzMzc1ODc4MDYyNzgy",
    "date": "2026-02-06T03:05:08.000Z",
    "profilePicture": "https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-1/480071913_4223377674613101_2255084689167847811_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx950x960&ctp=s32x32&_nc_cat=100&ccb=1-7&_nc_sid=1d2534&_nc_ohc=iw8xY-i26DsQ7kNvwFynNU_&_nc_oc=AdpGx74E1OR2J05wedkM22wB78B04JCxIpFsnqf2StVMuFHQ--a72xsAuL1GrCvw8pE&_nc_zt=24&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=7L4MNRivS23eBhPVYq6GnA&_nc_ss=7d289&oh=00_Af9pv2iMxHDFvCE6dMiCAcfhwdExXulNgxPYPCD7oChCaA&oe=6A441899",
    "profileId": "100008227299398",
    "profileName": "Phan Hồng Như"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "commentUrl": "https://www.facebook.com/groups/183774529022936/posts/2090871251646578/?comment_id=2092350724831964",
    "commentId": "2092350724831964",
    "id": "Y29tbWVudDoyMDkwODcxMjUxNjQ2NTc4XzIwOTIzNTA3MjQ4MzE5NjQ=",
    "text": "e thấy dòng colosbaby này hơi lạ, có mom nào dùng rồi cho e xin review thực tế với, con e hay ốm vặt quá.",
    "comments": [],
    "threadingDepth": 0,
    "facebookId": "2090871251646578",
    "postTitle": "HỘI REVIEW BỈM SỮA CHO BÉ &lt;3",
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "0"
    },
    "inputUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "feedbackId": "ZmVlZGJhY2s6MjA5MDg3MTI1MTY0NjU3OF8yMDkyMzUwNzI0ODMxOTY0",
    "date": "2026-02-05T01:44:38.000Z",
    "profilePicture": "https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-1/686376288_122212954910372183_3748592845222154115_n.jpg?stp=c14.0.480.480a_cp0_dst-jpg_tt6&cstp=mx480x480&ctp=s32x32&_nc_cat=102&ccb=1-7&_nc_sid=e99d92&_nc_ohc=7H4lSgqT3goQ7kNvwHliK6O&_nc_oc=AdoB7j87xHNdYmDAzWbiAhM0fW9eoriGHrUyysLu7mbcd1nnrCeLRH4QgubsQ2tcfrA&_nc_zt=24&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=7L4MNRivS23eBhPVYq6GnA&_nc_ss=7d289&oh=00_Af9fflL8cQv0lErqGAmRnLH5aoG6SBND74b3101biivW4w&oe=6A43F673",
    "profileId": "pfbid02btMvtR7a7SCUYWeaqUaCJhELGWhBFjF9piqe3jxhK7T6ji3qnYrxTT77xNRb5H82l",
    "profileName": "Hà Linh Nguyễn",
    "profileUrl": "https://www.facebook.com/people/H%C3%A0-Linh-Nguy%E1%BB%85n/pfbid02btMvtR7a7SCUYWeaqUaCJhELGWhBFjF9piqe3jxhK7T6ji3qnYrxTT77xNRb5H82l/"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "commentUrl": "https://www.facebook.com/groups/183774529022936/posts/2090871251646578/?comment_id=2095301601203543",
    "commentId": "2095301601203543",
    "id": "Y29tbWVudDoyMDkwODcxMjUxNjQ2NTc4XzIwOTUzMDE2MDEyMDM1NDM=",
    "text": "🎉🎉 CTKM CUỐI TUẦN – MUA LÀ CÓ QUÀ 🎁🎉\n📍 Kidsplaza – HH4B Linh Đàm\n⏰ 06/02 – 08/02\n🛒 Đơn hàng từ 1tr – 2tr ,..., 5tr – 10tr\n👉 🎁 Nhận quà tương ứng – càng mua càng lời\n🔥 Ưu đãi bỉm sữa cuối năm 🔥\n🥛 Withmom 679k (Giá gốc 799k)\n🥛 Pediasure Úc 669k (Giá gốc 799k)\n🥛 Meiji nội số 0 mua 2 giảm 120k\n🎁 Hikid – AP Úc tặng quà combo 3–6 lon\n🧷 Moony, gooby, hoppi, huggies , bobby tặng quà 🎁\n👕 Quần áo mua 1 tặng 1 🎉\n🥣 Đồ ăn dặm mua 2 tặng 1 🍽️\n👉 Cuối tuần ghé Kidsplaza HH4B Linh Đàm - 02466586640 mua sắm là có quà liền tay ba mẹ ơi! 💙👶🎁",
    "comments": [],
    "threadingDepth": 0,
    "facebookId": "2090871251646578",
    "postTitle": "HỘI REVIEW BỈM SỮA CHO BÉ &lt;3",
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "0"
    },
    "inputUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "feedbackId": "ZmVlZGJhY2s6MjA5MDg3MTI1MTY0NjU3OF8yMDk1MzAxNjAxMjAzNTQz",
    "date": "2026-02-08T04:45:24.000Z",
    "profilePicture": "https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-1/669053844_1626872678643956_8593908392008047111_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx960x960&ctp=s32x32&_nc_cat=104&ccb=1-7&_nc_sid=e99d92&_nc_ohc=7q1dnnG-tVAQ7kNvwHNN11I&_nc_oc=Adr7awkvGxD2lY9fcQ18iYno4B8puMD5OcYtpKJUos87eID5TDzNJsz0ImOAaBKT-Ac&_nc_zt=24&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=7L4MNRivS23eBhPVYq6GnA&_nc_ss=7d289&oh=00_Af8oT9pPQMthpCUlfIddS9de1oeQczi6Es19THJfLcWDPA&oe=6A43E59B",
    "profileId": "pfbid04oQudo6R63gw2erMuLpxvmu8e6Tq24jFP8BhHvkccc7jHhdH9ZBiKaCxQtdKJi5Nl",
    "profileName": "Ngọc Ánh",
    "profileUrl": "https://www.facebook.com/ngoc.anh.553680"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "commentUrl": "https://www.facebook.com/groups/183774529022936/posts/2090871251646578/?comment_id=2092553791478324",
    "commentId": "2092553791478324",
    "id": "Y29tbWVudDoyMDkwODcxMjUxNjQ2NTc4XzIwOTI1NTM3OTE0NzgzMjQ=",
    "text": "Uống ok nha. Mà con tui uống bón",
    "comments": [],
    "threadingDepth": 0,
    "facebookId": "2090871251646578",
    "postTitle": "HỘI REVIEW BỈM SỮA CHO BÉ &lt;3",
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "0"
    },
    "inputUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "feedbackId": "ZmVlZGJhY2s6MjA5MDg3MTI1MTY0NjU3OF8yMDkyNTUzNzkxNDc4MzI0",
    "date": "2026-02-05T06:31:51.000Z",
    "profilePicture": "https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-1/498133537_4042073722781417_3915115452611508495_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx1128x1132&ctp=s32x32&_nc_cat=106&ccb=1-7&_nc_sid=1d2534&_nc_ohc=PSB9x0GUOMQQ7kNvwFGntl8&_nc_oc=Adpkedd1dhOxkCNOktuVCHRQGYm3CsSyqZ7MizwMYceqY5Wi5hmL89fRr4awvvMR4uw&_nc_zt=24&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=7L4MNRivS23eBhPVYq6GnA&_nc_ss=7d289&oh=00_Af-cHEpJ1mVzuXH244A8CrkZzmlG_h5EGU4iodgP9WgcLA&oe=6A43E6A2",
    "profileId": "100009364874442",
    "profileName": "Van Nguyen",
    "profileUrl": "https://www.facebook.com/van.nguyen.273393"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "commentUrl": "https://www.facebook.com/groups/183774529022936/posts/2090871251646578/?comment_id=2091662731567430",
    "commentId": "2091662731567430",
    "id": "Y29tbWVudDoyMDkwODcxMjUxNjQ2NTc4XzIwOTE2NjI3MzE1Njc0MzA=",
    "text": "sữa colos baby lacto mới ra mua concung có ko mn???",
    "comments": [],
    "threadingDepth": 0,
    "facebookId": "2090871251646578",
    "postTitle": "HỘI REVIEW BỈM SỮA CHO BÉ &lt;3",
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "0"
    },
    "inputUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "feedbackId": "ZmVlZGJhY2s6MjA5MDg3MTI1MTY0NjU3OF8yMDkxNjYyNzMxNTY3NDMw",
    "date": "2026-02-04T08:12:56.000Z",
    "profilePicture": "https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-1/584899047_122095978773137546_5015286171172155911_n.jpg?stp=c47.0.583.583a_cp0_dst-jpg_tt6&cstp=mx583x583&ctp=s32x32&_nc_cat=107&ccb=1-7&_nc_sid=e99d92&_nc_ohc=pHa4m92l05wQ7kNvwFPCnb4&_nc_oc=AdqRfU7PD_UxBXLNTs7fF1RLCrsm150UZCt-kjSYHlV0O5Ve0bdefOyv6PVNBntx7ec&_nc_zt=24&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=7L4MNRivS23eBhPVYq6GnA&_nc_ss=7d289&oh=00_Af-hjJlYlgfh-zBH-nHjoGT5iXdx6G7nVzd2PqVMc6NkVg&oe=6A4408D8",
    "profileId": "pfbid0hw337ApxhRBz1dTz4Tr65YKFvSuZSLqAggXHeQkHV6oQUyzgATcZfmyxoYmC3KfZl",
    "profileName": "Di Trung Lý",
    "profileUrl": "https://www.facebook.com/people/Di-Trung-L%C3%BD/pfbid0hw337ApxhRBz1dTz4Tr65YKFvSuZSLqAggXHeQkHV6oQUyzgATcZfmyxoYmC3KfZl/"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "commentUrl": "https://www.facebook.com/groups/183774529022936/posts/2090871251646578/?comment_id=2093596038040766",
    "commentId": "2093596038040766",
    "id": "Y29tbWVudDoyMDkwODcxMjUxNjQ2NTc4XzIwOTM1OTYwMzgwNDA3NjY=",
    "text": "Bé nhà mình dùng VPMilk IQlac Colostrum, nhờ L-Lysine hỗ trợ ăn uống tốt hơn, DHA giúp não bộ phát triển, HMO chăm sóc đường ruột, thêm Sữa non tăng sức đề kháng nên con lớn đều",
    "comments": [],
    "threadingDepth": 0,
    "facebookId": "2090871251646578",
    "postTitle": "HỘI REVIEW BỈM SỮA CHO BÉ &lt;3",
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "0"
    },
    "inputUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "feedbackId": "ZmVlZGJhY2s6MjA5MDg3MTI1MTY0NjU3OF8yMDkzNTk2MDM4MDQwNzY2",
    "date": "2026-02-06T09:21:28.000Z",
    "profilePicture": "https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-1/611005688_917507507276375_1878062109648653394_n.png?stp=cp0_dst-png&cstp=mx800x800&ctp=s32x32&_nc_cat=107&ccb=1-7&_nc_sid=1d2534&_nc_ohc=nWVz65wa6dsQ7kNvwFyAOhy&_nc_oc=AdqD9DzkjJSc-qnwHkcirVTqCQ_gwnLKnJkoBXrZOrivCAeIEiXB6KAq1zy5B3l4LK0&_nc_zt=24&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=7L4MNRivS23eBhPVYq6GnA&_nc_ss=7d289&oh=00_Af8IsjA5xTIecJ4kMZ7RY8AJV5zRd2recfax6ipAgMZIkA&oe=6A43EAF2",
    "profileId": "100070514013100",
    "profileName": "Quỳnh Châu",
    "profileUrl": "https://www.facebook.com/quynh.chau.3425"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "commentUrl": "https://www.facebook.com/groups/183774529022936/posts/2090871251646578/?comment_id=2091663774900659",
    "commentId": "2091663774900659",
    "id": "Y29tbWVudDoyMDkwODcxMjUxNjQ2NTc4XzIwOTE2NjM3NzQ5MDA2NTk=",
    "text": "ủa thấy colosbaby chễm chệ trong top kìa chị nào dùng rồi cho em xin review thật để em mua cho con thử với",
    "comments": [],
    "threadingDepth": 0,
    "facebookId": "2090871251646578",
    "postTitle": "HỘI REVIEW BỈM SỮA CHO BÉ &lt;3",
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "0"
    },
    "inputUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "feedbackId": "ZmVlZGJhY2s6MjA5MDg3MTI1MTY0NjU3OF8yMDkxNjYzNzc0OTAwNjU5",
    "date": "2026-02-04T08:14:36.000Z",
    "profilePicture": "https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-1/591833854_122093556303155177_2533465297542927299_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx877x877&ctp=s32x32&_nc_cat=101&ccb=1-7&_nc_sid=e99d92&_nc_ohc=u8Jitb3aE64Q7kNvwGwUdkz&_nc_oc=Adpk7fpI_csntZwPvkDGr8Wghd4hmsc656uMuIVSGyTRrUTifGIlcjQ47OdvVG9IWMs&_nc_zt=24&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=7L4MNRivS23eBhPVYq6GnA&_nc_ss=7d289&oh=00_Af9VdP4tSB-oD40LAERCw8ta5ybGlbCtYwLBSTMcC5AQ5Q&oe=6A43F57C",
    "profileId": "pfbid02tZCUrdnLy3UoWugji5u5pn5hzvDpS4cCFe2WVyGBUwQ7frnjgku9B8CQwQ2HNJm8l",
    "profileName": "Đặng Bảo Vũ",
    "profileUrl": "https://www.facebook.com/people/%C4%90%E1%BA%B7ng-B%E1%BA%A3o-V%C5%A9/pfbid02tZCUrdnLy3UoWugji5u5pn5hzvDpS4cCFe2WVyGBUwQ7frnjgku9B8CQwQ2HNJm8l/"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "commentUrl": "https://www.facebook.com/groups/183774529022936/posts/2090871251646578/?comment_id=2091678568232513",
    "commentId": "2091678568232513",
    "id": "Y29tbWVudDoyMDkwODcxMjUxNjQ2NTc4XzIwOTE2Nzg1NjgyMzI1MTM=",
    "text": "Bé nhà mình 4 tuổi, cơ địa dễ táo nên mình rất kỹ khi chọn sữa. IQLac Colostrum có HMO và FOS – Inulin giúp đường ruột khoẻ. Bé đi ngoài đều, bụng nhẹ. Thêm sữa non + kẽm giúp tăng đề kháng, bé khoẻ hơn, cân nặng cải thiện từ từ.",
    "comments": [],
    "threadingDepth": 0,
    "facebookId": "2090871251646578",
    "postTitle": "HỘI REVIEW BỈM SỮA CHO BÉ &lt;3",
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "0"
    },
    "inputUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "feedbackId": "ZmVlZGJhY2s6MjA5MDg3MTI1MTY0NjU3OF8yMDkxNjc4NTY4MjMyNTEz",
    "date": "2026-02-04T08:40:32.000Z",
    "profilePicture": "https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-1/609019155_122154983504887054_2950532449399489522_n.jpg?stp=c0.0.736.736a_cp0_dst-jpg_tt6&cstp=mx736x736&ctp=s32x32&_nc_cat=100&ccb=1-7&_nc_sid=e99d92&_nc_ohc=2XBzqdx3MdoQ7kNvwHY9XCx&_nc_oc=Adr5ZR9IOEQeg95-YzrGYSvsBa6_Ic6Szb8mDKkO_aiZ0Hk4q0H61xxAiLNZ0dai0qk&_nc_zt=24&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=7L4MNRivS23eBhPVYq6GnA&_nc_ss=7d289&oh=00_Af8w-ade22cImeqYbl0CIj4VvpdMp_9SzL4OMEmflX5qtA&oe=6A440C29",
    "profileId": "pfbid0hRmVx6CTjVbJXnp61aR7khYvG5mgwWTdT3FaQZBfaH8LT33J7QEW67aBNm33Cg1Pl",
    "profileName": "Hoài An",
    "profileUrl": "https://www.facebook.com/hoaian060125"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "commentUrl": "https://www.facebook.com/groups/183774529022936/posts/2090871251646578/?comment_id=2093595831374120",
    "commentId": "2093595831374120",
    "id": "Y29tbWVudDoyMDkwODcxMjUxNjQ2NTc4XzIwOTM1OTU4MzEzNzQxMjA=",
    "text": "Bé nhà mình đang dùng VPMilk IQlac Colostrum, L,Lysine giúp bé ăn ngon, DHA hỗ trợ phát triển trí não, HMO tốt cho tiêu hóa và Sữa non tăng đề kháng, nên con tiêu hóa tốt, tăng cân và phát triển toàn diện rõ rệt luôn mom ạ.",
    "comments": [],
    "threadingDepth": 0,
    "facebookId": "2090871251646578",
    "postTitle": "HỘI REVIEW BỈM SỮA CHO BÉ &lt;3",
    "pageAdLibrary": {
      "is_business_page_active": false,
      "id": "0"
    },
    "inputUrl": "https://www.facebook.com/groups/183774529022936/permalink/2090871251646578/?rdid=ofrIy5Dr5XISD6GH",
    "feedbackId": "ZmVlZGJhY2s6MjA5MDg3MTI1MTY0NjU3OF8yMDkzNTk1ODMxMzc0MTIw",
    "date": "2026-02-06T09:21:05.000Z",
    "profilePicture": "https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-1/698705417_1388544346508922_8238365221394039543_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1828x1828&ctp=s32x32&_nc_cat=109&ccb=1-7&_nc_sid=1d2534&_nc_ohc=f7bWFI0HbDgQ7kNvwFSrdeL&_nc_oc=Adql3ZxeA2y_bdmLhiAorxlxvHQcR6y5cG77slyCOmLDPqom0a3YSQop0PcvgmWoyOw&_nc_zt=24&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=7L4MNRivS23eBhPVYq6GnA&_nc_ss=7d289&oh=00_Af_XEX3dqjESr1z_VACcwFHWn7LBS8u9Bofy23wrFBrBsQ&oe=6A43E8D7",
    "profileId": "100060601086317",
    "profileName": "Đinh Phượng",
    "profileUrl": "https://www.facebook.com/inhphuong.536311"
  }
]
```

### 7. TikTok Extractor

#### Tiktok Comments Scraper


**Actor ID**: `BDec00yAmCm1QbMEI`

**Input**:
```json
{
  "commentsPerPost": 10000000,
  "excludePinnedPosts": false,
  "maxRepliesPerComment": 0,
  "postURLs": [
    "https://www.tiktok.com/@veggietoonworld0/video/7653680493375835414?is_from_webapp=1&sender_device=pc"
  ],
  "resultsPerPage": 10000,
  "topLevelCommentsPerPost": 100000000,
  "profileScrapeSections": [
    "videos"
  ],
  "profileSorting": "latest"
}
```

**Output Structure**:
```json
[
  {
    "text": "@dthjbffukhv",
    "diggCount": 0,
    "replyCommentTotal": 0,
    "createTimeISO": "2026-06-24T06:37:15.000Z",
    "uniqueId": "user199192597380",
    "videoWebUrl": "https://www.tiktok.com/@veggietoonworld0/video/7654820094102555926",
    "uid": "7627049162249028629",
    "cid": "7654845839777350420",
    "avatarThumbnail": "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-avt-0068/7eba15cf6f6a088342d09499a80cecd6~tplv-tiktokx-cropcenter:100:100.jpg?dr=10399&refresh_token=cfcbcbd2&x-expires=1782370800&x-signature=14695t5I5oDeby2UALsrUGjV%2F%2FU%3D&t=4d5b0474&ps=13740610&shp=30310797&shcp=ff37627b&idc=no1a"
  },
  {
    "text": "💔💔💔",
    "diggCount": 0,
    "replyCommentTotal": 0,
    "createTimeISO": "2026-06-24T07:43:39.000Z",
    "uniqueId": "mazari.mazari26",
    "videoWebUrl": "https://www.tiktok.com/@veggietoonworld0/video/7654820094102555926",
    "uid": "7487644486614385719",
    "cid": "7654864375484367636",
    "avatarThumbnail": "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-avt-0068/2780b260e5a23e8446810ac0071c1b9b~tplv-tiktokx-cropcenter:100:100.jpg?dr=10399&refresh_token=9c10dccd&x-expires=1782370800&x-signature=XIxBAVX0zgIU7gsgJiO26R1Dx5c%3D&t=4d5b0474&ps=13740610&shp=30310797&shcp=ff37627b&idc=no1a"
  },
  {
    "text": "🥰🥰🥰",
    "diggCount": 0,
    "replyCommentTotal": 0,
    "createTimeISO": "2026-06-24T07:16:11.000Z",
    "uniqueId": "bilal.nahra16",
    "videoWebUrl": "https://www.tiktok.com/@veggietoonworld0/video/7654820094102555926",
    "uid": "7610031464129905671",
    "cid": "7654857321449030421",
    "avatarThumbnail": "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-avt-0068/96538b323a71cf6b25d6382974fbd3bd~tplv-tiktokx-cropcenter:100:100.jpg?dr=10399&refresh_token=2521f771&x-expires=1782370800&x-signature=hcwE2FfcBE5QEdpmJC6nUI5ECO0%3D&t=4d5b0474&ps=13740610&shp=30310797&shcp=ff37627b&idc=no1a"
  }
]
```

#### Name Here


**Actor ID**: ``

**Input**:
```json
{
}
```

**Output Structure**:
```json
[

]
```



### Name Here


**Actor ID**: ``

**Input**:
```json
{
}
```

**Output Structure**:
```json
[

]
```

