# Navratri Planner

A free, static Navratri/Garba discovery and planning website designed for GitHub Pages.

## Features

- Mobile-first Navratri event atlas
- Search and filters
- City, date, budget and vibe filtering
- Leaflet + OpenStreetMap map
- Personalized "Plan My Night" recommendation
- Parking and food-nearby indicators
- Directions links
- Native/WhatsApp-friendly sharing
- No backend required
- JSON-based event data
- GitHub Pages compatible

## Files

- `index.html` — page structure
- `style.css` — visual design
- `script.js` — app logic
- `data/navratri-events.json` — event data
- `README.md` — deployment notes

## Publish on GitHub Pages

1. Create a GitHub account at https://github.com/
2. Create a new public repository, for example `navratri-planner`.
3. Upload all files and folders from this project.
4. Open repository **Settings → Pages**.
5. Under **Build and deployment**, select:
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
6. Save.
7. GitHub will provide your public website URL.

## Important before launch

The included event data is intentionally DEMO/ILLUSTRATIVE data. Do not publish it as factual information.

Replace `data/navratri-events.json` with verified:
- event name
- exact venue/address
- date and timing
- ticket price
- organizer/contact
- official ticket URL
- parking information
- safety/accessibility information
- coordinates

Also replace the placeholder organizer email in `index.html`.

## Adding a real event

Copy an existing object in `data/navratri-events.json` and change its fields.

Example:

```json
{
  "id": "unique-event-id",
  "name": "Verified Event Name",
  "city": "Surat",
  "area": "Vesu",
  "venue": "Exact Venue",
  "date": "2026-10-11",
  "startTime": "8:00 PM",
  "endTime": "12:00 AM",
  "price": 499,
  "vibes": ["Traditional", "Family"],
  "parking": true,
  "foodNearby": true,
  "lat": 21.14,
  "lng": 72.77,
  "organizer": "Organizer Name",
  "description": "Verified description."
}
```

## Monetization later

This static architecture can later support:
- Google AdSense, subject to Google's approval and policies
- Featured event placements
- Sponsored local businesses
- Organizer listing packages
- Affiliate ticket links

Do not add misleading ads or encourage users to click ads.

## Data and map notes

The site uses Leaflet and OpenStreetMap tiles. Follow OpenStreetMap tile usage policies and attribution requirements. For larger traffic, consider a suitable tile provider.

## SEO

For a production launch, customize:
- title and meta description
- Open Graph tags
- favicon
- canonical URL
- sitemap.xml
- robots.txt
- real city/event landing pages
- Privacy Policy and Terms pages
