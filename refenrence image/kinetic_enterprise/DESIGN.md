---
name: Kinetic Enterprise
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for high-velocity CRM automation, prioritizing clarity, efficiency, and industrial-grade reliability. The brand personality is authoritative yet enabling—positioning the software as a sophisticated engine that works silently in the background.

The design style follows **Corporate Modernism** with a heavy emphasis on information density and functional hierarchy. It utilizes a structured "layer-on-layer" approach to organize complex automation logic without overwhelming the user. The interface evokes a sense of "productive calm" through ample white space, precise alignment, and a systematic application of color that guides the eye toward critical action items and status changes.

## Colors

The palette is rooted in a professional Slate scale, providing a neutral foundation that allows functional colors to communicate state effectively.

- **Primary (Indigo):** Reserved for primary calls-to-action, active navigation states, and the logical "pathway" in automation builders.
- **Success (Emerald):** Denotes positive momentum, "Hot" leads, and successfully completed automation steps.
- **Warning (Amber):** Highlights "Warm" leads and steps requiring attention or manual intervention.
- **Critical (Rose):** Signals "Cold" leads, stopped workflows, or integration errors.
- **Neutral (Slate):** Used for typography, borders, and background surfaces to maintain a clean, institutional feel.

## Typography

This design system uses **Inter** for all primary UI interactions to ensure maximum legibility and a neutral, professional tone. A clear hierarchy distinguishes between data (body) and metadata (labels).

- **Headlines:** Use tight letter-spacing and semi-bold weights to anchor page sections.
- **Labels:** Utilize uppercase tracking for section headers within cards to differentiate them from interactive text.
- **Monospaced Accents:** **JetBrains Mono** is introduced sparingly for automation logic IDs, variables, and technical metadata to reinforce the "automation" nature of the platform.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for dashboard views and a **structured node-based layout** for automation builders.

- **Automation Canvas:** Uses a 20px dot-grid background for visual alignment of flow cards.
- **Dashboards:** Elements are grouped into high-level containers with 24px padding.
- **Mobile Reflow:** On mobile devices, sidebars collapse into a bottom navigation bar or a hamburger menu. Flow-based cards stack vertically, maintaining the logical connection via centered vertical connector lines.
- **Rhythm:** All spacing follows a 4px baseline grid to ensure mathematical consistency across all components.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** rather than heavy shadows. The background uses a subtle off-white (`#F8FAFC`), while primary containers use pure white (`#FFFFFF`).

- **Level 0 (Background):** Page substrate.
- **Level 1 (Cards):** 1px border (`Slate-200`) with a very soft, diffused shadow (0px 1px 3px rgba(0,0,0,0.05)).
- **Level 2 (Modals/Popovers):** Higher contrast borders and a more pronounced shadow (0px 10px 15px rgba(0,0,0,0.1)) to indicate focus.
- **Automation Nodes:** Use a thick left-hand border (4px) tinted with the functional state color (Primary, Success, Warning, or Critical) to indicate the logic type at a glance.

## Shapes

The design system utilizes **Soft** roundedness (4px - 8px) to balance professional rigor with modern accessibility.

- **Input Fields & Buttons:** 6px (0.375rem) corner radius.
- **Cards & Logic Nodes:** 8px (0.5rem) corner radius.
- **Status Badges:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.
- **Connectors:** Lines in the automation builder use 12px rounded corners on "elbows" to create a smooth, organic flow.

## Components

- **Automation Nodes:** Large cards containing a title, a brief description of the logic, and "Input/Output" ports. The left edge is color-coded by status.
- **Status Badges:** High-contrast background with dark text. For example, a "Hot" lead badge uses a light Emerald background with deep Emerald text.
- **Primary Buttons:** Solid Indigo background with white text. Use a subtle inner shadow on top to create a "pressed" feel.
- **Progress Indicators:** Linear 4px bars used in dashboards to show lead conversion percentages or automation completion.
- **Input Fields:** Minimalist style with a focus state that adds a 2px Indigo outer ring (halo) for clear accessibility.
- **Data Tables:** High-density rows with 1px Slate-100 dividers. Row hovering triggers a subtle Slate-50 background tint.