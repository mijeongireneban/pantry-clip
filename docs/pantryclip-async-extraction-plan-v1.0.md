# PantryClip Async Extraction Plan v1.0

Status: Superseded.

This document was the first async extraction exploration. It no longer reflects the current product decision or the observed production constraints.

Use this document instead:

- [pantryclip-url-to-draft-ingestion-implementation-v2.0.md](./pantryclip-url-to-draft-ingestion-implementation-v2.0.md)

Why this doc is superseded:

- URL-to-draft is now treated as a signature feature, not a best-effort helper
- Pass 2A on the current Vercel path exposed real provider blocking (`429`) during YouTube media access
- the recommended next step is now a dedicated ingestion worker, not further iteration inside the current web runtime

Keep this file only as historical planning context.
