---
name: NutriTag Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#3d4943'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a73'
  outline-variant: '#bccac1'
  surface-tint: '#006c4e'
  primary: '#00694c'
  on-primary: '#ffffff'
  primary-container: '#008560'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dbae'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#0058be'
  on-tertiary: '#ffffff'
  tertiary-container: '#2170e4'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#86f8c9'
  primary-fixed-dim: '#68dbae'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#00513a'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  code-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter-mobile: 16px
  gutter-desktop: 24px
  margin-safe: 24px
---

## Brand & Style

The design system is engineered to provide a sense of calm and structural reliability within the high-pressure environment of disaster relief. It balances two distinct needs: the high-velocity efficiency required by logistics staff and the empathetic, encouraging atmosphere necessary for shelter residents—particularly children.

The visual style is a hybrid of **Modern Corporate** and **Soft Minimalism**. It prioritizes extreme legibility and "scannability" to reduce cognitive load for exhausted staff, while using soft geometry and organic accents to foster a sense of safety and growth for residents. The emotional response is one of "assisted stability"—the interface should feel like a helpful, quiet partner rather than a complex tool.

## Colors

This design system utilizes a palette centered on "Vitality Green" (#1D9E75), a hue chosen for its associations with health, nature, and equilibrium. This is the primary driver for all functional actions and "healthy" states.

*   **Primary (Vitality Green):** Used for affirmative actions, nutritional progress, and primary navigation.
*   **Secondary (Sunlight Amber):** Used for the "Virtual Garden" elements, energy-tracking, and cautionary alerts that require attention without causing panic.
*   **Tertiary (Trust Blue):** Reserved for administrative data, logistics, and technical information to separate "human" needs from "system" data.
*   **Neutral (Slate):** A high-contrast range of grays to ensure text remains accessible in poorly lit shelter environments.

The system defaults to **Light Mode** to ensure maximum readability under the harsh or flickering fluorescent lighting common in emergency facilities.

## Typography

Typography in this design system is split by intent. **Plus Jakarta Sans** is used for headlines and "Virtual Garden" moments to provide a friendly, optimistic, and contemporary feel. Its soft curves make data feel less intimidating for children and families.

For all functional UI, body text, and data tables, **Atkinson Hyperlegible Next** is mandatory. This font was specifically chosen for its focus on character differentiation, ensuring that numbers and letters are unmistakable even for users with visual impairments or those operating under extreme stress and fatigue.

**Key Rules:**
*   Never use a font size smaller than 14px for critical information.
*   Maintain high contrast (minimum 4.5:1) for all body text.
*   Use uppercase labels sparingly, only for short identifiers (e.g., Tag IDs).

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with an 8px base unit. This ensures consistency across mobile devices used by kitchen staff and the large tablets or desktops used by administration committees.

**Breakpoints:**
*   **Mobile (0-599px):** 4-column layout. Focus on single-column stacks for scanning tags.
*   **Tablet (600-1023px):** 8-column layout. Introduction of side-by-side data cards.
*   **Desktop (1024px+):** 12-column layout. Fixed-width content container (max-width 1440px) to prevent line lengths from becoming unreadable.

In high-utility areas (the kitchen scan-view), margins are increased to 32px to prevent accidental "fat-finger" taps on edge-aligned elements.

## Elevation & Depth

This design system uses **Tonal Layers** rather than heavy shadows to indicate depth. This ensures the UI remains performant on low-end mobile devices and maintains clarity in high-glare environments.

*   **Level 0 (Surface):** The base background color.
*   **Level 1 (Card/Container):** A slight shift in tone (off-white) with a subtle 1px stroke.
*   **Level 2 (Active/Floating):** Reserved for modals and active input states. Uses a soft, low-opacity ambient shadow (Blur 8px, Y-offset 4px, 5% Opacity) to provide a "lifted" effect without creating visual clutter.

Background blurs are used exclusively for navigation overlays to maintain context while focusing the user on the task at hand.

## Shapes

The shape language is defined by "Humanist Geometry." By using `roundedness: 2` (0.5rem base), the UI avoids the clinical harshness of sharp corners while maintaining enough structure to feel professional and reliable.

*   **Buttons & Inputs:** 0.5rem (8px) corner radius.
*   **Cards & Containers:** 1rem (16px) corner radius for a softer, more inviting look.
*   **Chips & Progress Bars:** Fully rounded (pill-shaped) to represent organic growth and movement.

## Components

### Buttons
Buttons are large and tactile. The **Primary Action** button uses a solid Vitality Green fill with white text. **Secondary Actions** use a 1.5px stroke of the primary color. In the kitchen UI, buttons should have a minimum height of 56px to accommodate rapid interaction.

### Data Tables
Tables for committees must be "breathable." Use 16px vertical padding for rows. Use alternating row stripes (zebra striping) in very light neutral tones to help eyes track data across wide screens.

### Scan-Focus UI
For the kitchen staff, the "Scanner View" utilizes a high-contrast viewfinder with a semi-transparent dark overlay. Scanned results appear as Level 2 containers that slide from the bottom, ensuring the "Success" state is the most prominent visual element.

### The Virtual Garden (Pohons)
This component is highly illustrative. Unlike the rest of the system, it uses the **Secondary Sunlight Amber** and vibrant greens. Trees (pohons) grow based on nutritional milestones. These elements use 3D-like soft gradients and "squishy" animations to engage children.

### Input Fields
Inputs use a "floating label" pattern to save vertical space. The focus state is a 2px Vitality Green border. Error states must use both a color change (Red) and an icon (Warning) to ensure accessibility for colorblind users.