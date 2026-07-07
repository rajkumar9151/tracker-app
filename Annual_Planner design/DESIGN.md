---
name: Pristine Logic
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  success: '#10B981'
  warning: '#F59E0B'
  danger: '#EF4444'
  info: '#3B82F6'
  border-subtle: '#E2E8F0'
  text-main: '#1E293B'
  text-muted: '#64748B'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system is built on a foundation of clarity, precision, and executive professionalism. It is designed for high-density task management where cognitive load must be minimized. The brand personality is dependable, efficient, and transparent.

The aesthetic follows a **Modern Minimalist** approach. It rejects the use of heavy shadows and skeuomorphism in favor of structural integrity. Depth is communicated through subtle tonal shifts in background surfaces and crisp, low-contrast borders. The interface prioritizes "negative space" as a functional element to group related tasks and reduce visual noise, ensuring the user's focus remains entirely on the data and actionable items.

## Colors

This color palette is anchored by a "Pure White" (#FFFFFF) workspace to maximize brightness and perceived cleanliness.

- **Primary Blue:** Used exclusively for primary actions, active states, and critical focal points.
- **Surface Tones:** #F8FAFC is utilized for large layout containers (like sidebars or background canvases) to provide a soft contrast against white cards and tables.
- **Functional Accents:** Success, Warning, and Info colors are used with high-saturation for small-scale elements like status pips and badges, ensuring they draw attention without disrupting the overall minimalist harmony.
- **Borders:** Instead of shadows, a consistent neutral border (#E2E8F0) defines the architecture of the UI.

## Typography

The design system uses **Inter** for all roles to maintain a systematic, utilitarian aesthetic that excels in legibility. 

The type hierarchy is strictly defined to help users scan complex dashboards. **Display** and **Headline** styles use tighter letter spacing and heavier weights to create strong visual anchors. **Body** text is optimized for long-form readability with generous line heights. **Labels** are often used in all-caps for metadata or status indicators to provide a distinct visual texture compared to standard body text.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for desktop dashboards to ensure data columns remain predictable and readable. 

- **Grid:** A 12-column system with a 24px (1.5rem) gutter.
- **Rhythm:** Spacing follows a strict 4px / 8px linear scale. Large components (like sections or cards) should be separated by `stack-lg`, while internal elements use `stack-sm` or `stack-md`.
- **Responsive Behavior:** On mobile devices, the grid collapses to a single column with 16px side margins. Elements that are side-by-side on desktop (like "Status" and "Assignee" in a table) reflow into a vertical stack or a horizontally scrollable list.

## Elevation & Depth

Depth is achieved through **Tonal Layering** rather than physical light simulation. 

- **Level 0 (Background):** #F8FAFC used for the main application background.
- **Level 1 (Surface):** #FFFFFF used for cards, table rows, and primary content areas. 
- **Definition:** Layers are separated by a 1px solid border (#E2E8F0). 
- **Interactions:** Hover states on interactive surfaces (like table rows) should shift the background color slightly to #F1F5F9. Shadows are only permitted for floating elements like dropdown menus or modals, where they should be "Ambient Shadows"—ultra-diffused (20px-40px blur) with very low opacity (5-10%).

## Shapes

The shape language is "Rounded" to soften the clinical feel of a data-heavy dashboard. 

- **Standard Elements:** Buttons, input fields, and small cards use a 0.5rem (8px) radius.
- **Large Containers:** Dashboard widgets or main content sections use a 1rem (16px) radius to create a distinct frame.
- **Interactive Indicators:** Status badges and tags utilize the "Pill" shape (full rounding) to differentiate them from functional UI components like buttons.

## Components

- **Buttons:** Primary buttons use the Brand Blue (#2563EB) with white text. Secondary buttons use a white background with a #E2E8F0 border and #1E293B text.
- **Table Rows:** Should have a height of at least 56px. On hover, the background changes to #F1F5F9. Borders should only exist between rows (horizontal rules), not between columns.
- **Status Badges:** Use a "Soft" style—a low-opacity tint of the accent color as the background (e.g., 10% Success Green) with high-contrast text of the same hue.
- **Input Fields:** Use #FFFFFF background with a 1px #E2E8F0 border. Focus states must use a 2px Brand Blue border or a subtle blue outer ring.
- **Cards:** White background, 1px border, 16px-24px internal padding. Headers within cards should have a subtle bottom border to separate them from the card body.
- **Empty States:** Use simplified line icons and centered "body-md" text in #64748B (text-muted) to provide guidance when no tasks are present.