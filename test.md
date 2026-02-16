# Test Plan

## Scope
- Unit tests: validation and UI components
- Integration tests: database queries against a local libSQL file
- E2E tests: core user flows in a browser

## Tooling
- Unit + Integration: Vitest + Testing Library
- E2E: Playwright

## Test Cases

### Unit
- Validate login schema accepts correct input.
- Validate auction schema rejects invalid input.
- Auction card renders title and price text.

### Integration
- Create auction and place bid updates current price and bid history.

### E2E
- Home page renders Live auctions section and product cards.
- Switching header status to `Pending` shows pending auctions.
- Switching header status to `Closed` shows closed auctions.
- Search respects selected status (active/pending/closed).
- Category click preserves selected status.

## How To Run
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`

### Preconditions
- For E2E, ensure sample data exists: `npm run db:seed`

## Results
- Unit: Passed (3 tests) via `npm run test:unit` on 2026-02-16
- Integration: Last known passed (1 test) on 2026-02-10
- E2E: Last known passed (1 test) on 2026-02-10

Last run: 2026-02-16 (unit)
