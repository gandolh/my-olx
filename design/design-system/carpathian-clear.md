# Design System Document: The Editorial Marketplace

## 1. Overview & Creative North Star

**Creative North Star: "The Curated Canvas"**

This design system moves away from the chaotic, high-density "bulletin board" aesthetic of traditional marketplaces. Instead, it treats every listing like a featured editorial entry. We achieve a premium, trustworthy feel not through decoration, but through **intentional restraint**.

The system breaks the "template" look by utilizing wide margins, dramatic shifts in typographic scale, and an "Invisible Architecture." We prioritize the Romanian user experience by ensuring diacritics are treated as first-class citizens in our layouts, never looking like an afterthought or a technical glitch.

---

## 2. Colors: Tonal Depth vs. Structural Lines

Our palette is rooted in a "Deep Sea & Glass" concept, utilizing `primary` (#0040a1) for authority and `secondary` (#006a6a) for an approachable, friendly touch.

### The "No-Line" Rule

**Designers are prohibited from using 1px solid borders for sectioning.**
Traditional borders create visual noise. To define boundaries, use background shifts:

- Place a `surface_container_lowest` card on a `surface_container_low` background.
- Use `surface_bright` to highlight a hero section against the standard `background`.

### Surface Hierarchy & Nesting

Treat the UI as physical layers of fine paper.

- **Base Layer:** `background` (#faf8ff)
- **Secondary Sections:** `surface_container_low` (#f2f3fe)
- **Interactive Containers (Cards):** `surface_container_lowest` (#ffffff)
- **Overlays/Modals:** `surface_bright` with Glassmorphism.

### The "Glass & Gradient" Rule

To add "soul" to the minimalist aesthetic, use subtle linear gradients (Primary to Primary-Container) for large CTAs. For floating headers or filters, apply:

- **Background:** `surface` with 80% opacity.
- **Effect:** 20px Backdrop Blur.
- **Intent:** This lets the vibrant colors of listing photos bleed through the UI, making the app feel alive and integrated.

---

## 3. Typography: The Romanian Editorial Voice

We use a dual-typeface system to create high-end contrast.

- **Display & Headlines (Manrope):** Chosen for its geometric precision and excellent support for Romanian diacritics (_ș, ț, ă_). These should be tracked slightly tighter (-2%) for a modern, authoritative look.
- **Body & Labels (Inter):** The gold standard for functional legibility. It ensures that price points and product descriptions are effortless to scan.

**Hierarchy Strategy:**

- Use `display-lg` for category entry points to create "white space" through size.
- Use `label-md` in all caps with +5% letter spacing for metadata (e.g., "BUCUREȘTI • ACUM 2 MINUTE") to create an archival, premium feel.

---

## 4. Elevation & Depth: Tonal Layering

We do not use "drop shadows" in the traditional sense. We use **Ambient Occlusion.**

- **The Layering Principle:** Depth is achieved by stacking. A `surface_container_highest` element naturally feels "closer" to the user than a `surface_container` element.
- **Ambient Shadows:** When a shadow is required (e.g., a floating "Post Ad" button), use the `on_surface` color at 6% opacity with a 32px blur and 8px Y-offset. It should feel like a glow, not a smudge.
- **The "Ghost Border" Fallback:** If a border is required for accessibility on inputs, use `outline_variant` (#c3c6d6) at 20% opacity. Never use 100% opacity.

---

## 5. Components: Precision & Clarity

### Cards & Listings

- **Rule:** Absolute prohibition of divider lines.
- **Structure:** Use `xl` (1.5rem) vertical spacing between content blocks.
- **Style:** Use `surface_container_lowest` for the card body. Image corners should be rounded to `md` (0.75rem).
- **Interaction:** On hover, the card should transition from `surface_container_lowest` to `surface_bright` with a soft ambient shadow.

### Buttons (High-Contrast)

- **Primary:** `primary` background with `on_primary` text. Use `full` (9999px) roundness for a "friendly" but high-end boutique feel.
- **Secondary:** `secondary_container` background with `on_secondary_container` text. This provides a soft teal alternative for secondary actions like "Add to Favorites."

### Input Fields

- **Background:** `surface_container_high`.
- **States:** On focus, the background shifts to `surface_container_lowest` with a 1px "Ghost Border" using the `primary` color at 30% opacity.
- **Diacritic Support:** Ensure line-height for `body-lg` is at least 1.5 to prevent Romanian diacritics from touching the line above.

### Contextual Chips

- Use `tertiary_container` for "Verified Seller" badges. The warm green (#1c6d24) conveys safety without the "emergency" feel of a standard bright green.

---

## 6. Do’s and Don’ts

### Do:

- **Use "Breathing Room":** If you think there is enough whitespace, add 8px more.
- **Center Romanian Diacritics:** Ensure vertical alignment in buttons accounts for the descenders in "ș" and "ț".
- **Use Tonal Shifts:** Use `surface_dim` for footer areas to ground the application.

### Don't:

- **Don't use OLX Purple:** Or any shade of violet. Stick to the `primary` Blue and `secondary` Teal.
- **Don't use 1px Dividers:** Use `spacing` or background color blocks to separate content.
- **Don't use Hard Corners:** Avoid `none` or `sm` rounding. Stick to the `DEFAULT` (0.5rem) to `xl` (1.5rem) range to maintain the "Friendly" brand pillar.
- **Don't use Pure Black:** Use `on_surface` (#191b23) for text to maintain a softer, editorial contrast.
