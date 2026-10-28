# SubScope

SubScope is an offline educational analyzer for Certificate Transparency (CT) records supplied by a user. It helps learners see which names in an authorized assessment relate to a target domain. SubScope does not discover hostnames, contact CT services, check DNS, or send data anywhere.

## Objectives

- Make the boundary between user-provided evidence and tool activity obvious.
- Demonstrate exact-domain matching and safe handling of imported records.
- Keep analysis local to the browser, with DNS verification explicitly out of scope.
- Encourage authorized, responsible learning and assessment.

## Features

- Import JSON or text from a local file, or paste records directly.
- Extract names from crt.sh-style `name_value` records and JSON `dns_names` / `common_name` fields.
- Filter for the target apex and exact subdomain suffix, normalize case and trailing dots, and deduplicate.
- Search results and export findings as escaped CSV.
- Show the source as “User-provided CT data” and DNS status as “Not checked.”
- Distinguish an empty valid result from malformed or invalid input.
- Enforce a 2 MB file limit and a 1 MB pasted-text limit.

## Stack

- React and TypeScript
- Vite
- Wouter (single `/` route)
- Tailwind CSS 4 and custom CSS
- Lucide icons
- Node's built-in test runner for analyzer unit tests

## Project structure

```text
src/
  App.tsx                 Single route and not-found fallback
  index.css               Theme, typography, layout details, and motion
  pages/home.tsx          Import, results, search, and CSV workflow
  lib/analyzer.ts         Local domain validation, parsing, and filtering
  lib/analyzer.test.ts    Unit tests for analyzer behavior
```

## Local setup

From the workspace root:

```sh
pnpm install
pnpm --filter @workspace/subscope run dev
```

For a production build, run `pnpm --filter @workspace/subscope run build`. Run `pnpm --filter @workspace/subscope run typecheck` to check TypeScript and `pnpm --filter @workspace/subscope test` for the analyzer tests.

## Import formats

Accepted input:

1. A crt.sh-style JSON array with string `name_value` properties. Multiline values are split into individual names.
2. JSON records with `dns_names` (a string or string array) and/or `common_name` (a string).
3. Plain text with one hostname per line.

JSON must be valid and include at least one supported field. The target is a hostname domain such as `example.org`, not a URL or IP address. Empty input, unsupported JSON shapes, malformed JSON, oversized input, and invalid target domains are reported as errors. A valid import with no matching names instead displays “No subdomains found.”

## How filtering works

The target and imported names are lowercased, trailing dots are removed, and a leading wildcard marker is removed from imported certificate names. A name is included only when it is exactly the target apex or ends with `.` followed by the complete target domain. For example, `api.example.org` matches `example.org`; `notexample.org` and `example.org.attacker.test` do not. Results are deduplicated without regard to case and sorted by hostname.

Names with invalid hostname syntax are ignored. The analyzer does not assert that a name resolves, is currently active, belongs to a particular organization, or is safe to access.

## API behavior

There is no backend or API behavior. Parsing, validation, filtering, search, and CSV generation run locally in the browser. SubScope makes no network requests, external API calls, DNS calls, or hidden telemetry requests. CSV export is generated from the current in-memory results.

## Errors and limitations

- JSON syntax and missing supported fields produce parse errors.
- Invalid targets, empty input, and size-limit violations produce validation errors.
- DNS status is always “Not checked”; the verified counter remains zero.
- CT records can be stale, incomplete, or contain names unrelated to the current state of a system.
- This is a learning aid, not a scanner, resolver, asset inventory, or source of authorization.
- Results exist only in the current page session and are not persisted.

## Ethical use

Only import and analyze data you are authorized to handle. CT records are public transparency data but may reveal sensitive infrastructure naming. Do not use this interface as a reason to probe, access, enumerate, or test systems. Respect assessment scope, data-handling policies, privacy obligations, and applicable law.
