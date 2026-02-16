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

## How To Run
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`

### Preconditions
- For E2E, ensure sample data exists: `npm run db:seed`

## Results
- Unit: Passed (3 tests)
- Integration: Passed (1 test)
- E2E: Passed (1 test)

Last run: 2026-02-10
