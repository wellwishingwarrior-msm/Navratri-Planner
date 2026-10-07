# Plan My Navratri ✨

A free, mobile-first Navratri/Garba event planner for 2026.

## What is upgraded

- 5-question personalized planner
- Recommendation scoring by city, group, budget, style and facilities
- Verified/source-linked 2026 event directory
- Filters for city, budget, parking, food, shopping and photography
- Google Maps directions
- Native share / copy-to-clipboard
- Mobile responsive design
- Clear verification dates and source-of-truth links
- No backend required for the demo: works on GitHub Pages

## Important: what "real-time" means here

GitHub Pages is static hosting, so it cannot itself provide live organizer data. This version uses a curated `data/events.js` file with source links and a `lastVerified` date. Before publishing or advertising an event, confirm its details on the linked organizer/ticketing page.

For true automatic real-time updates, connect this frontend to a backend/database or a maintained events API. Do not scrape ticketing sites without checking their terms.

## Update event data

Edit:

`data/events.js`

Each event has fields for city, dates, price, venue, facilities, source URL and verification date.

## Publish on GitHub Pages

1. Upload all files/folders in this ZIP to the root of your repository.
2. Make sure `index.html` is in the repository root.
3. Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
4. Save and wait for the deployment.

## Current data sources

The included seed data was checked on 7 October 2026 against organizer, Gujarat Tourism and ticketing pages. Source links are included inside the app.

## Disclaimer

Event timings, prices, pass availability, venue arrangements and other details can change. Users should verify the linked source immediately before attending.
