# SmartDine BU Test Documentation

## Overview

The project uses Vitest and React Testing Library to check the main authentication, NLP, and pickup-time behavior used in SmartDine BU.

## Test Framework

- Test runner: Vitest
- React testing: React Testing Library
- Browser simulation: jsdom
- Test setup: `src/test/setup.ts`
- Payment scope checked: COD and GCash proof-of-payment checkout behavior

## Running Tests

```bash
npm test -- --run
```

## Test Files

- `src/test/login.test.tsx` checks registration/login-related behavior and BU email validation.
- `src/test/nlp.test.ts` checks tokenization, keyword extraction, allergen responses, healthy recommendations, and context follow-up behavior.
- `src/test/pickup.test.ts` checks ASAP priority fee and pickup-time validation.

## Current Test Coverage

### Authentication

- Rejects hard-coded demo admin credentials in production mode.
- Rejects incorrect admin credentials.
- Accepts valid BU-format local test user credentials in isolated tests.
- Rejects invalid BU email formats.
- Verifies logout clears local auth state.

For production admin access, the user must be a Supabase Auth user with `public.profiles.role` set to `admin`.

### NLP

- Tokenization splits user input into tokens.
- Budget inquiries are classified correctly.
- Allergen exclusion prompts such as `Food without soy` return safe menu options.
- Broad allergen prompts such as `foods with allergens` list allergen-tagged food instead of repeating the previous item.
- Healthy recommendation prompts are classified and answered.
- Follow-up questions such as `Adobo?` then `How much?` use conversation context.

### Pickup Scheduling

- ASAP pickup adds a PHP 20 priority fee.
- ASAP bypasses the 30-minute regular pickup buffer.
- Regular pickup times less than 30 minutes from now are rejected.
- Pickup times that already passed today trigger a tomorrow warning.

## Latest Verification

Latest local verification:

```text
Test Files: 3 passed
Tests: 27 passed
Build: successful
```

## Defense Notes

If asked where the tests are implemented:

- Authentication tests: `src/test/login.test.tsx`
- NLP tests: `src/test/nlp.test.ts`
- Pickup validation tests: `src/test/pickup.test.ts`
