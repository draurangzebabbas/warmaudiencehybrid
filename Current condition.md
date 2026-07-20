````markdown
# WarmAudience - Complete Product & Technical Documentation
 
> Version: 1.0
> Purpose: This document is written for AI assistants (Claude, ChatGPT, Cursor, Windsurf, etc.) so they can fully understand the architecture, purpose, workflows, and business logic of the WarmAudience application.
 
---
 
# Product Overview
 
## What is WarmAudience?
 
WarmAudience is a lead generation web application that allows users to scrape publicly available leads from multiple social platforms and business sources.
 
The application is built for marketers, agencies, founders, recruiters, sales teams, and businesses that need targeted leads.
 
Instead of manually collecting prospects from different websites, WarmAudience automates the process by using Apify Actors as the scraping engine.
 
The application itself does **not scrape websites directly**.
 
Instead:
 
User Request
↓
 
WarmAudience
↓
 
Backend (Render)
↓
 
Apify Actor
↓
 
Collected Data
↓
 
Stored in Database
↓
 
Shown inside User Dashboard
 
---
 
# Core Purpose
 
WarmAudience helps users discover warm leads instead of cold leads.
 
Examples:
 
- People engaging with a LinkedIn post
- Instagram followers of competitors
- X (Twitter) followers
- Facebook group members
- Businesses from Google Maps
- Public website emails
- Company profiles
- Social media profiles
 
These leads become searchable and downloadable inside the user's account.
 
---
 
# High Level Architecture
 
```
                 Frontend
                    │
                    │
          Better Auth Authentication
                    │
            Convex (Users & Plans)
                    │
                    ▼
          Backend (Render Server)
                    │
            Business Logic Layer
                    │
              Apify Actors
                    │
          Scraped Raw Information
                    │
              Data Processing
                    │
            Supabase Database
                    │
                    ▼
          My Profiles Dashboard
```
 
---
 
# Technology Stack
 
## Frontend
 
The application is a web application.
 
Responsibilities:
 
- User dashboard
- Authentication
- Launch scraping jobs
- Display extracted leads
- Filters
- Downloads
- Account settings
- Billing
 
---
 
## Authentication
 
Technology:
 
- Better Auth
- Convex
 
Responsibilities:
 
- Signup
- Login
- Sessions
- User identity
- User plan
- User metadata
 
Convex stores:
 
- User
- Subscription Plan
- Authentication Information
 
Convex is **NOT** used for storing scraped leads.
 
---
 
## Database
 
Technology:
 
Supabase
 
Purpose:
 
Stores every scraped lead.
 
Every lead belongs to a specific user.
 
Relationship:
 
```
User
   │
   ├─────────────► Lead 1
   ├─────────────► Lead 2
   ├─────────────► Lead 3
   ├─────────────► Lead 4
```
 
Each lead is linked to the user that extracted it.
 
Users can only access their own leads.
 
---
 
## Backend
 
Technology:
 
Render
 
Responsibilities:
 
- API
- Business logic
- Trigger Apify actors
- Wait for scraping completion
- Process raw data
- Normalize data
- Save into Supabase
 
The backend acts as the middle layer between the frontend and Apify.
 
---
 
## Scraping Engine
 
Technology:
 
Apify
 
WarmAudience uses various Apify Actors.
 
WarmAudience itself does not scrape websites.
 
Every extraction request is delegated to an Apify Actor.
 
Backend responsibilities:
 
- Start actor
- Pass user inputs
- Monitor execution
- Receive dataset
- Clean data
- Save data
 
---
 
## Payments
 
Technology:
 
Polar
 
Responsibilities:
 
- Checkout
- Subscription management
- Billing
- Plan upgrades
- Plan downgrades
 
---
 
# Plans
 
## Free
 
Basic access.
 
Limited usage.
 
---
 
## Growth
 
Price:
 
$29/month
 
Provides increased extraction limits and more features.
 
---
 
## Scale
 
Price:
 
$59/month
 
Highest limits with full functionality.
 
---
 
# Main Features
 
---
 
# LinkedIn
 
Supports multiple extraction methods.
 
## 1. Profile Extraction
 
Input:
 
LinkedIn profile URL
 
Output:
 
- Name
- Headline
- Company
- Position
- Experience
- Education
- Skills
- Profile URL
- Location
- Connections (when available)
- Public information
 
---
 
## 2. Company Extraction
 
Input:
 
Company URL
 
Output:
 
- Company name
- Website
- Industry
- Employees
- Description
- Headquarters
- LinkedIn URL
 
---
 
## 3. Post Engagers
 
Input:
 
LinkedIn Post URL
 
Output:
 
Users who:
 
- Liked
- Reacted
- Commented
- Engaged
 
These people are considered warm leads.
 
---
 
## 4. Keyword Post Search
 
Search posts by keyword.
 
Example:
 
AI Marketing
 
Output:
 
Recent posts matching keyword.
 
---
 
## 5. Posts By Profile
 
Input:
 
LinkedIn Profile
 
Example:
 
Company Founder
 
Retrieve:
 
Latest posts
 
Filters:
 
- Last day
- Last week
- Time period
 
---
 
# Instagram
 
Supports:
 
---
 
## Profile Extraction
 
Input:
 
Instagram username
 
Output:
 
- Bio
- Followers
- Following
- Profile URL
- Category
- Website
- Public info
 
---
 
## Followers
 
Input:
 
Profile
 
Output:
 
Follower list
 
---
 
## Following
 
Input:
 
Profile
 
Output:
 
Following list
 
---
 
## Post Commenters
 
Input:
 
Post URL
 
Output:
 
People commenting
 
---
 
## Reel Commenters
 
Input:
 
Reel URL
 
Output:
 
People commenting
 
---
 
# X (Twitter)
 
Supports:
 
---
 
## Profile Extraction
 
Input:
 
Profile URL
 
---
 
## Followers
 
Input:
 
Account
 
---
 
## Following
 
Input:
 
Account
 
---
 
## Tweet Commenters
 
Input:
 
Tweet URL
 
Output:
 
Replies / Engagers
 
---
 
# Facebook
 
Supports:
 
---
 
## Post Commenters
 
Input:
 
Post URL
 
---
 
## Followers
 
Input:
 
Profile
 
---
 
## Following
 
Input:
 
Profile
 
---
 
## Group Search
 
Input:
 
Keyword
 
Output:
 
Matching groups
 
---
 
# Google Maps
 
Input:
 
Keyword
 
Location
 
Example:
 
Dentists
 
Dubai
 
Output:
 
Business leads.
 
Includes:
 
- Business Name
- Phone
- Website
- Address
- Rating
- Reviews
- Category
- Maps URL
 
Ideal for local lead generation.
 
---
 
# Website Contact Extraction
 
Input:
 
Website URL
 
Backend uses an Apify Actor.
 
The actor attempts to find publicly available:
 
- Email
- Phone
- Contact Page
- Social Links
 
The extracted information is stored in the database.
 
---
 
# Data Flow
 
Example:
 
User enters LinkedIn Post URL.
 
↓
 
Frontend sends request.
 
↓
 
Backend validates request.
 
↓
 
Backend starts Apify Actor.
 
↓
 
Actor scrapes data.
 
↓
 
Backend receives results.
 
↓
 
Backend cleans data.
 
↓
 
Backend stores leads in Supabase.
 
↓
 
Every stored lead is linked with the current authenticated user.
 
↓
 
User opens "My Profiles".
 
↓
 
Leads appear.
 
---
 
# My Profiles
 
Every extraction made by a user is stored permanently.
 
Users have a dashboard called:
 
My Profiles
 
This is their lead database.
 
Capabilities:
 
- View leads
- Search
- Filter
- Download
- Delete
- Browse extracted profiles
 
Each user only sees their own leads.
 
---
 
# Filters
 
Depending on data type:
 
Examples:
 
- Platform
- Date
- Company
- Country
- Industry
- Keyword
- Source
- Location
 
---
 
# Downloads
 
Users can export their collected leads.
 
Downloads are generated from the leads stored inside Supabase.
 
---
 
# User Lifecycle
 
## Signup
 
User creates account.
 
↓
 
Authenticated via Better Auth.
 
↓
 
Stored in Convex.
 
↓
 
Assigned default plan.
 
↓
 
Dashboard created.
 
---
 
## Extraction
 
User launches extraction.
 
↓
 
Backend calls Apify.
 
↓
 
Results saved in Supabase.
 
↓
 
Linked to user.
 
---
 
## Dashboard
 
User sees collected leads.
 
---
 
## Subscription
 
Handled by Polar.
 
When user upgrades:
 
Convex updates plan.
 
Application unlocks premium functionality.
 
---
 
# Data Ownership
 
Important rule:
 
Every scraped lead belongs to exactly one user.
 
Leads are never shared across users.
 
Authorization must always verify ownership before:
 
- Viewing
- Downloading
- Deleting
 
---
 
# Responsibilities by Service
 
## Convex
 
Stores:
 
- Users
- Authentication
- Subscription Plan
- User Metadata
 
Does NOT store scraped leads.
 
---
 
## Better Auth
 
Handles:
 
- Signup
- Login
- Sessions
- Authentication
 
---
 
## Supabase
 
Stores:
 
- Scraped Profiles
- Businesses
- Social Accounts
- Contact Information
- Extracted Leads
 
Everything users collect is stored here.
 
---
 
## Render
 
Runs:
 
Backend API
 
Business Logic
 
Queue
 
Processing
 
Apify integration
 
Database writes
 
Validation
 
---
 
## Apify
 
Responsible only for scraping.
 
Returns raw datasets.
 
No user management.
 
No subscriptions.
 
No authentication.
 
---
 
## Polar
 
Handles:
 
- Payments
- Billing
- Subscriptions
 
---
 
# Supported Platforms
 
- LinkedIn
- Instagram
- X (Twitter)
- Facebook
- Google Maps
- Websites
 
---
 
# Typical User Journey
 
1. User signs up.
2. User selects a scraping tool.
3. User enters required input (URL, keyword, location, etc.).
4. Backend launches the appropriate Apify Actor.
5. Actor returns structured data.
6. Backend validates and cleans data.
7. Data is stored in Supabase.
8. Records are linked to the authenticated user.
9. User manages collected leads inside "My Profiles."
10. User filters, searches, downloads, or deletes their data.
 
---
 
# Design Philosophy
 
WarmAudience is **not** a scraping framework.
 
WarmAudience is a lead generation platform.
 
Apify performs the scraping.
 
WarmAudience focuses on:
 
- User experience
- Lead management
- Data organization
- Subscription management
- Multi-platform prospecting
- Centralized lead storage
 
---
 
# AI Assistant Instructions
 
When reasoning about this application, always assume the following:
 
- WarmAudience is a SaaS lead generation platform.
- Apify is responsible for all scraping.
- The backend never manually scrapes websites.
- Convex stores users, authentication data, and subscription plans.
- Better Auth manages login and signup.
- Supabase stores all extracted leads.
- Render hosts the backend APIs and business logic.
- Polar manages subscriptions and payments.
- Every lead is stored to  a central lead table for each platform we have different table and we link each lead from there to all the users who scraped them so each user see that in his my profiles tab.
- Users can only access their own extracted data.
- The "My Profiles" page is the user's private lead database.
- Every extraction originates from an Apify Actor selected based on the requested platform and extraction type.
- New scraping features should follow the same architecture: Frontend → Render Backend → Apify Actor → Data Processing → Supabase → My Profiles.
- The application should be modular, making it easy to add new scraping sources in the future.
 
--