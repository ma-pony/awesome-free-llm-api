import { readFile } from "node:fs/promises";

const allowedTypes = new Set([
  "text-generation",
  "multimodal",
  "embedding",
  "reranking",
  "retrieval",
  "ocr",
  "document-parsing",
  "safety-moderation",
  "translation",
  "speech-recognition",
  "speech-synthesis",
  "audio-enhancement",
  "image-generation",
  "image-editing",
  "video-generation",
  "video-understanding",
  "object-detection",
]);

const catalog = JSON.parse(await readFile(new URL("../data/catalog.json", import.meta.url), "utf8"));
if (!Array.isArray(catalog) || catalog.length === 0) {
  throw new Error("catalog must be a non-empty array");
}

const required = [
  "modelSlug",
  "modelDisplayName",
  "providerSlug",
  "providerName",
  "providerWebsite",
  "freeType",
  "applyUrl",
  "sourceUrl",
  "lastDocCheckAt",
];
const errors = [];

catalog.forEach((record, index) => {
  for (const key of required) {
    if (!record[key]) errors.push(`${index}: missing ${key}`);
  }
  if (!["ongoing_free", "trial", "qualified"].includes(record.freeType)) {
    errors.push(`${index}: unsupported freeType ${record.freeType}`);
  }
  if (!Array.isArray(record.modelTypes) || record.modelTypes.length === 0) {
    errors.push(`${index}: modelTypes must contain at least one canonical type`);
  } else {
    for (const type of record.modelTypes) {
      if (!allowedTypes.has(type)) errors.push(`${index}: unsupported model type ${type}`);
    }
  }
  if (record.lastDocCheckAt && Number.isNaN(Date.parse(record.lastDocCheckAt))) {
    errors.push(`${index}: invalid lastDocCheckAt`);
  }
});

if (errors.length > 0) {
  throw new Error(errors.join("\n"));
}

console.log(`validated ${catalog.length} catalog routes`);
