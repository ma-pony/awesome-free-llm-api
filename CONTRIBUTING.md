# Contributing

Thanks for helping keep the free LLM API directory accurate.

## What belongs here

Add a provider route when it has a documented free allocation or a clearly labeled signup/trial credit. Do not submit scraped API keys, unofficial proxies, or claims based only on a temporary social-media post.

Each model row should include:

- provider name and first-party website;
- model slug and display name;
- one or more canonical model types;
- whether access is an ongoing free tier or trial credits;
- quota and eligibility notes;
- an access URL and a documentation/source URL;
- the date the documentation was checked.

Edit the relevant table in [`README.md`](README.md), and keep model types specific: use `embedding`, `speech-recognition`, `speech-synthesis`, `translation`, `safety-moderation`, and other precise values instead of putting every model under “general”. Update the Chinese README when the surrounding explanatory text changes.

## Validation

After editing the list, check the diff:

```bash
git diff --check
```

Prefer one focused provider or model change per pull request. Explain what changed, link the first-party source, and state whether the free allocation is ongoing or trial-only.

## Review standard

We may remove entries when a provider ends a free tier, changes the API URL, or no longer documents the stated quota. A link that works is not enough: the description must match the provider's current terms.
