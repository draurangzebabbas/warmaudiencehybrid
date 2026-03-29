# LinkedIn Lead Generation App

## Overview

A self-hosted lead generation tool powered by LinkedIn data.  
Users bring their own Apify API keys to access up to **$10,000 worth of functionality** using free tiers (e.g. $5/month plans)of different accounts created by different gmail accounts user would add these in our app.

---

## Features

### 1. Scrapers

#### LinkedIn Profile Scraper
- Input: One or more LinkedIn company or personal profile URLs
- Output: Scraped profile data saved to **My Profiles** tab
- Extracted fields: email, location, headline, about, followers, connections, badge, name, profile picture, etc.

#### LinkedIn Engagement Extractor
- Input: A LinkedIn post URL
- Output: List of users who **liked or commented** on that post, saved to **My Profiles** tab

---

### 2. Trackers

Automated trackers that run on a **daily or weekly** schedule.

#### Profile Tracker
- Input: A LinkedIn profile URL
- Behavior: Automatically extracts new posts by that user at the set interval, scrapes all engagers, enriches their data, and stores results in **My Profiles**

#### Keyword Tracker
- Input: A keyword or topic
- Behavior: Automatically extracts recent posts matching that keyword at the set interval, scrapes all engagers, enriches their data, and stores results in **My Profiles**

---

## Data Destination

All scraped and enriched leads are stored in the **My Profiles** tab for easy access and management.