# Auction App Requirements

## Project Setup
- Framework: Next.js with App Router
- Language: TypeScript
- Styling: CSS Modules

## Data Layer
- Database: Turso (libSQL)
- Client: @libsql/client
- Include schema and migrations

## Auth
- Email/password authentication

## Core Features (v1)
- List auctions
- Auction detail page
- Bid history
- Place bid
- Create auction
- Image upload
- Search and filter
- Admin moderation

## Search and Filter Behavior
- Default status filter on home is `active` (Live Auctions).
- Users can switch status to `active`, `pending`, or `closed` from the header control (left of search).
- Search must run against the currently selected status (not always `active`).
- Category links should preserve the selected status filter.
- Home section title should reflect the selected status (`Live Auctions`, `Pending`, `Closed`).

## UI/UX
- Clean, easy-to-scan UI (not strictly Amazon design)
- Include: Header, Footer, Product grid cards
- Allow alternative design direction if cleaner and more usable

## Non-Functional
- Clear navigation and readable layout
- Mobile-responsive layout
