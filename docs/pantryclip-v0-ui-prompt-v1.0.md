# PantryClip v0 UI Prompt v1.0

Use this as a direct prompt in v0 to generate a mobile-first web app UI for PantryClip.

---

Design and generate a **mobile-first responsive web app UI** called **PantryClip**.

## Product Context
PantryClip helps users turn short-form recipe links (YouTube Shorts / Instagram Reels) into structured, searchable cooking notes.
MVP flow: paste URL -> generate editable draft -> review/edit -> save -> search/reopen recipe.
AI output is only a draft. User confirmation/edit is required before save.

## UX Direction
- Keep the interface clean, practical, and fast.
- Prioritize readability while cooking.
- One clear primary action per screen.
- Minimize cognitive load and typing friction.
- Avoid decorative complexity.

## Visual Style
- Tone: warm, minimal, kitchen-friendly, modern.
- Use `tweakcn` theme: **Soft Pop**.
- Use a light theme.
- Use soft neutral background and one accent color for primary CTA.
- Large readable typography for recipe content.
- Comfortable spacing and touch targets (mobile-first).
- Components should feel production-ready, not wireframe-like.

## Technical Constraints
- Generate using React + Tailwind + shadcn-style component patterns.
- Apply `tweakcn` **Soft Pop** tokens/styles consistently across all screens and components.
- Build responsive layouts with mobile as default and desktop as enhanced.
- Include realistic empty/loading/error states.
- No backend logic required; focus on UI structure and interactions.

## Required Screens
Create these screens and include navigation between them:

1. **Auth Screen**
- Minimal sign-in layout
- App name + one-line value proposition
- Email + password inputs
- Primary CTA: Sign in
- Secondary CTA: Create account

2. **Recipe Home / List Screen**
- Top bar with app name and Add Recipe button
- Search input (placeholder: "Search recipes by title")
- Recipe list cards (title, source type badge, updated date)
- Empty state with CTA to add first recipe

3. **Add Recipe Screen**
- URL input field (YouTube Shorts / Instagram Reels)
- Helper text with valid URL examples
- Primary CTA: Generate with AI
- Secondary action: Continue manually (skip AI)
- Inline validation for invalid URL format

4. **AI Draft Loading State**
- Full-screen or centered loading state
- Message: "Analyzing video and drafting recipe..."
- Subtext that user can edit everything before saving
- Optional cancel/back action

5. **Review & Edit Draft Screen**
- Editable fields:
  - Title (single line)
  - Ingredients (multiline)
  - Steps (multiline)
- Badge: "AI Draft"
- Actions:
  - Primary: Save Recipe
  - Secondary: Regenerate Draft
  - Tertiary: Back
- Show inline validation if required fields are empty

6. **Recipe Detail Screen**
- Title
- Source link + source type badge
- Ingredients section
- Steps section
- Actions: Edit, Delete
- Delete uses confirmation modal

7. **Edit Recipe Screen**
- Same form layout as Review screen
- Primary CTA: Save Changes
- Secondary action: Cancel

## State Requirements
Include UI for these states:
- Empty recipe list
- Search no results
- AI generation error with actions:
  - Retry generation
  - Continue manual editing
- Form validation errors
- Delete confirmation modal
- Success feedback (toast/snackbar) after save/update/delete

## Information Architecture
Use a simple app shell. Bottom nav is optional.
If bottom nav is used, keep to:
- Home
- Add
- Optional Settings placeholder

## Interaction Rules
- User can always continue manually if AI fails.
- AI draft is never final until user taps Save.
- Preserve user input when navigating back from validation errors.
- Keep primary CTA sticky at bottom on mobile for long forms.
- Search is title-based only in MVP.
- Ensure edit and delete are available from detail screen.

## Content and Copy
Use realistic sample content in recipe cards and draft fields.
Use concise, friendly microcopy.

Suggested sample recipe titles:
- "Spicy Tuna Mayo Rice Bowl"
- "10-Minute Soy Butter Udon"
- "Crispy Tofu Gochujang Stir-fry"

## Accessibility Baseline
- Proper labels for all inputs
- Visible focus states
- High contrast text/buttons
- Tap targets >= 44px height on mobile

## Output Request
Generate all screens in a cohesive design system with reusable components.
Prefer a single-page preview that can switch between screens using tabs/segments for quick review.
Also provide a multi-page structure option if practical.
