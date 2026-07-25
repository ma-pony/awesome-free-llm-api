# Contributing

Thanks for helping keep the free LLM API directory accurate.

## What belongs here

Add a provider route when it has a documented free allocation or a clearly labeled signup/trial credit. Do not submit scraped API keys, unofficial proxies, or claims based only on a temporary social-media post.

Each catalog record should include:

- provider name and first-party website;
- model slug and display name;
- one or more canonical model types;
- `freeType`: `ongoing_free` or `trial`;
- quota and eligibility notes;
- an access URL and a documentation/source URL;
- `lastDocCheckAt` in ISO 8601 format.

Use the existing shape in [`data/catalog.json`](data/catalog.json). Keep model types specific: use `embedding`, `speech-recognition`, `speech-synthesis`, `translation`, `safety-moderation`, and other supported values instead of putting every model under “general”.

## Validation

After editing the JSON, regenerate both README files and check the diff:

```bash
node scripts/generate-readme.mjs
node scripts/validate-catalog.mjs
git diff --check
```

Prefer one focused provider or model change per pull request. Explain what changed, link the first-party source, and state whether the free allocation is ongoing or trial-only.

## Review standard

We may remove entries when a provider ends a free tier, changes the API URL, or no longer documents the stated quota. A link that works is not enough: the description must match the provider's current terms.
