# Implementation Plan - b2 Transport Portfolio Website

We will create a premium, high-converting, and fully SEO-optimized portfolio website for **b2 Transport** using Next.js. The website will have an futuristic, AI-like aesthetic (dark mode, glassmorphism, neon blue/cyan/purple gradients, and smooth micro-animations). It will be structured to rank highly on search engines for local transport and house shifting services in Ranchi and other districts of Jharkhand.

## User Review Required

> [!IMPORTANT]
> **Key Decisions & Setup Details:**
> 1. **Local SEO Strategy**: We will create dedicated pages for major districts in Jharkhand (Ranchi, Jamshedpur, Dhanbad, Bokaro, etc.) so that search queries like "house shifting in Ranchi" or "pickup truck in Jamshedpur" will lead search engines directly to your site.
> 2. **Tech Stack & Styling**: We will use Next.js with App Router. To adhere to the styling guidelines, we will use **Vanilla CSS** (via CSS Modules and Global CSS variables) rather than TailwindCSS.
> 3. **AI Aesthetic**: We will design the site with a dark slate background, glowing neon border effects (glassmorphism), clean typography (using Google Fonts like *Outfit* and *Space Grotesk*), and interactive animations to give it a state-of-the-art "AI" look.

## Open Questions

> [!NOTE]
> Please review these questions and provide input in your response if you have specific preferences:
> 1. **Target Locations**: Beyond Ranchi, what other major districts or nearby cities should we create dedicated landing pages for? (We plan to seed Ranchi, Jamshedpur, Dhanbad, Bokaro, and Hazaribagh by default).
> 2. **Vehicle Fleet**: What specific vehicles do you have? (We will display options like Tata Ace/Chota Hathi, Mahindra Pickup, 3-Wheeler Loader, and larger trucks).

## Proposed Changes

We will initialize a new Next.js project in `d:/transport`.

### [Component Name] - Next.js Setup

#### [NEW] [package.json](file:///d:/transport/package.json)
- Standard Next.js config with React, React DOM, and Lucide React (for modern icons).

#### [NEW] [next.config.js](file:///d:/transport/next.config.js)
- Optimizations for performance, SEO-friendly headers.

#### [NEW] [src/app/layout.tsx](file:///d:/transport/src/app/layout.tsx)
- Main root layout with global SEO metadata configuration, viewport setup, dynamic schema markup (JSON-LD LocalBusiness), Google Font link, and global CSS import.

#### [NEW] [src/app/globals.css](file:///d:/transport/src/app/globals.css)
- Theme colors (neon cyan, deep dark backgrounds, violet accents), futuristic animations, glassmorphism style classes, button styling, and layout utilities.

#### [NEW] [src/app/page.tsx](file:///d:/transport/src/app/page.tsx)
- Landing page featuring:
  - Hero Section: Floating gradient title "b2 Transport", AI subtitle, and quick search input.
  - Interactive AI Route & Vehicle Selector: Enter Origin/Destination and select vehicle to see instant estimate and prompt WhatsApp/Call action.
  - Fleet Display: Modern slider/grid of available vehicles (Pickups, Cargo Vans, Trucks) with capacities and best uses.
  - Features: Highlights (24/7 support, expert packing, secure transport).
  - Quick Dial / WhatsApp Contact: Floating sticky CTA to call 7654722708.

#### [NEW] [src/app/locations/[slug]/page.tsx](file:///d:/transport/src/app/locations/[slug]/page.tsx)
- Dynamic route for location-specific landing pages (e.g. `/locations/ranchi`, `/locations/jamshedpur`).
- Pre-generated at build time (`generateStaticParams`) for maximum SEO speed.
- Loaded with tailored local keywords to capture search engine queries.

#### [NEW] [src/app/sitemap.ts](file:///d:/transport/src/app/sitemap.ts)
- Dynamically generated sitemap containing homepage and all location-specific pages for Google Search Console.

#### [NEW] [src/app/robots.txt](file:///d:/transport/src/app/robots.txt)
- Standard search engine crawlers instructions pointing to sitemap.

## Verification Plan

### Automated/Local Tests
- Build verification using `npm run build`.
- Local verification using Next.js development server `npm run dev`.
- Run Lighthouse / SEO audit using Chrome DevTools or CLI scripts.
- Validate sitemap and schema markup structure.

### Manual Verification
- Verify responsiveness on mobile, tablet, and desktop viewports.
- Confirm click-to-call links trigger native phone dialer with `7654722708`.
- Verify vehicle estimator correctly updates based on selected origin/destination locations.
