import { readFile, writeFile } from "node:fs/promises";

const catalogPath = new URL("../data/catalog.json", import.meta.url);
const records = JSON.parse(await readFile(catalogPath, "utf8"));
const generatedAt = new Date().toISOString().slice(0, 10);

const labels = {
  "audio-enhancement": "Audio enhancement",
  coding: "Coding",
  embedding: "Embeddings",
  general: "General chat",
  "image-generation": "Image generation",
  multimodal: "Multimodal",
  "object-detection": "Object detection",
  reasoning: "Reasoning",
  reranking: "Reranking",
  retrieval: "Retrieval",
  "safety-moderation": "Safety & moderation",
  "speech-recognition": "Speech recognition",
  "speech-synthesis": "Speech synthesis",
  "text-generation": "Text generation",
  translation: "Translation",
  "video-generation": "Video generation",
  "video-understanding": "Video understanding",
  vision: "Vision",
};

const typeLabel = (type) => labels[type] ?? type;
const unique = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b));
const providers = new Map();

for (const record of records) {
  const provider = providers.get(record.providerSlug) ?? {
    name: record.providerName,
    website: record.providerWebsite,
    records: [],
  };
  provider.records.push(record);
  providers.set(record.providerSlug, provider);
}

const modelSlugs = unique(records.map((record) => record.modelSlug));
const modelTypes = unique(records.flatMap((record) => record.modelTypes ?? []));
const typeCounts = new Map(
  modelTypes.map((type) => [
    type,
    new Set(
      records
        .filter((record) => (record.modelTypes ?? []).includes(type))
        .map((record) => record.modelSlug),
    ).size,
  ]),
);

const tableCell = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const link = (label, url) => (url ? `[${tableCell(label)}](${url})` : tableCell(label));
const freeTypeLabel = (value) => value === "ongoing_free" ? "Ongoing free tier" : "Trial / credits";

const providerRows = [...providers.entries()]
  .sort(([, left], [, right]) => left.name.localeCompare(right.name))
  .map(([slug, provider]) => {
    const modelCount = new Set(provider.records.map((record) => record.modelSlug)).size;
    const types = unique(provider.records.flatMap((record) => record.modelTypes ?? []))
      .map(typeLabel)
      .join(", ");
    return `| ${link(provider.name, provider.website)} | ${modelCount} | ${tableCell(types)} | [Browse models](https://freellmapi.io/en/providers/${slug}) |`;
  })
  .join("\n");

const modelRows = [...records]
  .sort((left, right) =>
    left.providerName.localeCompare(right.providerName) ||
    left.modelDisplayName.localeCompare(right.modelDisplayName) ||
    left.modelSlug.localeCompare(right.modelSlug),
  )
  .map((record) => {
    const types = (record.modelTypes ?? []).map(typeLabel).join(", ");
    const access = [
      record.applyUrl ? link("Get access", record.applyUrl) : "",
      record.sourceUrl ? link("Docs", record.sourceUrl) : "",
    ].filter(Boolean).join(" · ");
    return `| ${tableCell(record.modelDisplayName)} | ${link(record.providerName, record.providerWebsite)} | ${tableCell(types)} | ${freeTypeLabel(record.freeType)} | ${tableCell(record.quotaNote)} | ${access} |`;
  })
  .join("\n");

const typeRows = [...typeCounts.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([type, count]) => `| ${typeLabel(type)} | ${count} unique models |`)
  .join("\n");

const generatedSection = `<!-- BEGIN GENERATED CATALOG -->
## Catalog snapshot

This snapshot is generated from the [FreeLLMAPI catalog](https://freellmapi.io/en) on **${generatedAt}**. It contains **${records.length} provider routes**, **${modelSlugs.length} unique models**, and **${providers.size} providers**. Each record keeps its own model type, access link, quota note, and documentation source.

### Model types

| Type | Unique models |
| --- | ---: |
${typeRows}

### Providers

| Provider | Models | Model types | Directory |
| --- | ---: | --- | --- |
${providerRows}

### Complete model catalog

| Model | Provider | Model types | Free access | Quota / eligibility | Links |
| --- | --- | --- | --- | --- | --- |
${modelRows}

<!-- END GENERATED CATALOG -->`;

const staticSection = `# Awesome Free LLM API

> A maintained, source-linked directory of free and trial LLM APIs, multimodal models, embeddings, speech, translation, safety, and other inference endpoints.

[![FreeLLMAPI directory](https://img.shields.io/badge/directory-freellmapi.io-5b4ce6)](https://freellmapi.io/en)
[![Catalog snapshot](https://img.shields.io/badge/catalog-${records.length}%20routes-111827)](https://freellmapi.io/en)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)

This repository is the transparent, contribution-friendly companion to [freellmapi.io](https://freellmapi.io/en). The website is the searchable directory; this repository keeps a reviewable JSON snapshot and a generated README that can be diffed, forked, and updated by pull request.

## What “free” means

- **Ongoing free tier**: the provider documents a recurring quota or free allocation.
- **Trial / credits**: signup credits or a limited promotion. These are included, but clearly labeled and must not be confused with a permanent free tier.
- **Provider routes**: one model can appear more than once when different providers expose it with different limits or access requirements.

Quotas, regional availability, account requirements, and model availability change. Always open the provider documentation before building a production dependency. We do not store API keys.

## Use the directory

- [Browse all models](https://freellmapi.io/en)
- [Filter by model type](https://freellmapi.io/en?modelType=text-generation)
- [Browse providers](https://freellmapi.io/en/providers)
- [Read the Chinese README](README.zh-CN.md)
- [Open an issue](https://github.com/ma-pony/awesome-free-llm-api/issues) when a quota, model, or link is stale

## Keep the snapshot reproducible

The generated catalog is intentionally boring: source data lives in [data/catalog.json](data/catalog.json), and [scripts/generate-readme.mjs](scripts/generate-readme.mjs) renders this README and the Chinese companion. Run:

\`\`\`bash
node scripts/generate-readme.mjs
\`\`\`

The script writes both language files from the same source data, so a catalog change cannot silently update only one language.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. A useful contribution includes a first-party source URL, the exact free-tier semantics, model type, quota details, and the date the documentation was checked.

${generatedSection}
`;

const chineseSection = `# 免费 LLM API 清单

> 一个可审阅、可追溯的免费与试用 LLM API 目录，覆盖文本、多模态、Embedding、语音、翻译、安全审核等类型。

[![FreeLLMAPI 目录](https://img.shields.io/badge/目录-freellmapi.io-5b4ce6)](https://freellmapi.io/zh)
[![目录快照](https://img.shields.io/badge/目录-${records.length}%20条路由-111827)](https://freellmapi.io/zh)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)

本仓库是 [freellmapi.io](https://freellmapi.io/zh) 的开源、可贡献配套仓库。网站负责搜索和筛选；本仓库保留可审阅的 JSON 快照以及由脚本生成的双语文档，方便通过 Pull Request 追踪变更。

## “免费”的含义

- **持续免费额度**：服务商公开承诺持续提供的免费配额。
- **试用 / 赠送额度**：注册赠送或限时活动，单独标注，不能当作永久免费。
- **Provider 路由**：同一个模型由不同服务商提供时，会按不同额度和申请条件分别收录。

额度、地区、账号要求和模型可用性都会变化。接入生产环境前，请打开服务商文档复核。仓库不会保存 API Key。

## 入口

- [浏览全部模型](https://freellmapi.io/zh)
- [按模型类型筛选](https://freellmapi.io/zh?modelType=text-generation)
- [浏览服务商](https://freellmapi.io/zh/providers)
- [English README](README.md)
- [提交失效信息](https://github.com/ma-pony/awesome-free-llm-api/issues)

## 参与贡献

请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。新增条目需要提供第一方来源、免费额度语义、模型类型、配额说明和文档核验日期。

${generatedSection}
`;

await writeFile(new URL("../README.md", import.meta.url), `${staticSection.trimEnd()}\n`, "utf8");
await writeFile(new URL("../README.zh-CN.md", import.meta.url), `${chineseSection.trimEnd()}\n`, "utf8");
