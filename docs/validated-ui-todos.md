# Validated UI TODOs

Last validated: 2026-03-30

This list was validated against the current implementation before being added here. Items are phrased to match the repo's actual state so we can separate missing features from partially implemented ones.

## TODOs

- [ ] Add a directory or folder feature to the Saved tab.
  - Validation: the Saved screen is currently a flat filtered list built from `recipes.filter((r) => r.isSaved)`, with no grouping, folder, or category model.
  - Clarification needed: define whether "directory" means folders, categories, collections, or sorting/grouping only.
  - Relevant files: `src/apps/recipes/recipes-home.container.tsx`, `prisma/schema.prisma`

- [x] Add a saved-state bookmark icon to each recipe card on the Library view.
  - Completed: Library cards now render a bookmark overlay so saved state is visible alongside the existing source badge.
  - Relevant file: `src/apps/recipes/recipes-home.container.tsx`

- [x] Make English the default app language.
  - Completed: the app now defaults to English in the root document, the client language state, and the server fallback used for URL-only saves.
  - Relevant files: `src/app/layout.tsx`, `src/apps/recipes/recipes-home.container.tsx`, `src/lib/server/recipes/recipes-save-url.service.ts`

- [x] Add loading skeletons for initial recipe loading instead of showing empty-state copy too early.
  - Completed: Library and Saved now show recipe-card skeletons during the initial recipes fetch instead of flashing empty-state copy.
  - Relevant file: `src/apps/recipes/recipes-home.container.tsx`

- [ ] Finish search bar functionality end-to-end.
  - Validation: search is partially implemented.
  - Current behavior:
    - the Library search input filters the already-loaded in-memory list by title
    - the backend already supports `q` via `GET /api/recipes`
    - the current screen load does not call the API with `q`
  - Recommendation: decide whether search should stay client-side for small lists or be wired to the API for scalable, persistent search behavior.
  - Relevant files: `src/apps/recipes/recipes-home.container.tsx`, `src/app/api/recipes/route.ts`, `src/lib/server/recipes/recipes.repository.ts`, `src/apis/recipes.ts`

- [ ] Make "Recipe Tip of the Day" functional.
  - Validation: this section is currently static copy with a CTA button that has no action.
  - Current gap: there is no handler, link target, or rotating/fetched tip source.
  - Relevant file: `src/apps/recipes/recipes-home.container.tsx`

- [x] Remove the non-functional settings icon button from the Add view.
  - Completed: the Add screen no longer renders the unused settings button, and the unused icon definition was removed too.
  - Relevant file: `src/apps/recipes/recipes-home.container.tsx`

- [ ] Add a light/dark theme toggle.
  - Validation: dark mode is effectively forced right now.
  - Current behavior: `src/app/layout.tsx` hardcodes the `dark` class on the root `<html>` element, and there is no theme state or toggle in the UI.

- [ ] Show the user's name and avatar in Profile.
  - Validation: Profile currently shows a generic user icon and `session?.user.email`.
  - Current gap: there is no display-name or avatar lookup/rendering yet.
  - Clarification needed: choose whether the source of truth should be Supabase `user_metadata`, a profile table, or a fallback initials avatar.
  - Relevant file: `src/apps/recipes/recipes-home.container.tsx`

- [x] Validate that AI generation URLs are actual YouTube Shorts URLs.
  - Completed: AI generation now accepts only real `youtube.com/shorts/...` URLs, including optional trailing slashes.
  - Implementation notes:
    - client-side source detection no longer treats `youtu.be/...` as `youtube_shorts`
    - the summarize API now rejects non-Shorts URLs explicitly
  - Relevant files: `src/apps/recipes/recipes.schemas.ts`, `src/apps/recipes/recipes-home.container.tsx`, `src/app/api/recipes/summarize/route.ts`, `src/lib/server/recipes/recipes.utils.ts`

## Summary

- Remaining: Saved directories, search completion, functional tip CTA, theme toggle, name/avatar support
- Completed in this pass: English default, library saved-state icon, initial loading skeletons, Add-view settings cleanup, stricter Shorts validation
