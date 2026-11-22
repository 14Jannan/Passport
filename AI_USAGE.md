# AI usage

## Prompt 3 — Country discovery

AI assistance was used to inspect the existing React Native app, implement the country catalog and controls, write tests, and verify builds. The original REST Countries v3.1 route was checked before implementation. Its live response reported deprecation, and the official v5 public demo returned a sample record instead of a catalog. The implementation uses a verified public v3.1-compatible mirror of the original REST Countries dataset. The README records this decision and the mirror’s limits.

The development checks caught a malformed URL validation expression and a test mock that referenced an undeclared request parameter. Both were corrected before committing the catalog. The existing authentication smoke test was updated to assert the new Explore screen and to mock the auth and country responses separately.

## Prompt 4 ? Country details

AI assistance extended the existing RTK Query API and country normalization. A live endpoint check showed that the unfiltered alpha request returns an array and a field-filtered request returns an object. The adapter handles both shapes and validates the returned country code. Native Share behavior was checked against the React Native documentation before implementing quiet cancellation and explicit error feedback.
