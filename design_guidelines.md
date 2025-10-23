# Design Guidelines: Budget Management Platform

## Design Approach

**Hybrid Strategy: Financial Dashboard Reference + Material Design System**

Drawing inspiration from modern financial applications (Mint, YNAB, Personal Capital) combined with Material Design principles for consistency and scalability. This approach prioritizes data clarity, trust, and efficient information processing while maintaining visual appeal.

**Core Design Principles:**
- Clarity over decoration - financial data must be immediately scannable
- Consistent information hierarchy across all views
- Professional trust signals throughout
- Efficient use of screen real estate for data-dense interfaces
- Stable, predictable interactions (minimal decorative animation)

---

## Typography System

**Font Selection:**
- Primary: Inter or DM Sans (excellent for numbers and data)
- Monospace: JetBrains Mono (for currency values and numerical data)

**Type Scale:**
- Dashboard Headers: text-3xl font-bold (36px)
- Section Titles: text-xl font-semibold (20px)
- Card Headers: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Data Labels: text-sm font-medium (14px)
- Numerical Values: text-2xl font-bold tracking-tight (24px, for key metrics)
- Currency Display: text-4xl font-bold tabular-nums (36px, for hero numbers)
- Table Data: text-sm tabular-nums (14px, monospace for alignment)
- Helper Text: text-xs (12px)

**Special Typography Rules:**
- All currency and numerical data: Use tabular-nums for proper alignment
- Income values: font-semibold
- Expense values: font-medium
- Budget limits: text-sm uppercase tracking-wide for labels

---

## Layout System

**Spacing Primitives:**
Primary spacing units: **2, 3, 4, 6, 8, 12, 16**
- Component padding: p-4, p-6
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Dashboard margins: m-6, m-8
- Form fields: space-y-4

**Grid Structure:**
- Dashboard: 12-column grid (grid-cols-12)
- Main content: 2-column responsive (lg:grid-cols-3 for stats, lg:grid-cols-2 for detailed views)
- Transaction lists: Single column with full-width tables
- Analytics: Flexible 1-2 column based on chart complexity

**Container Strategy:**
- App Shell: Fixed sidebar (w-64) + main content area (flex-1)
- Content max-width: max-w-7xl for dashboard, max-w-4xl for forms
- Card containers: rounded-lg with consistent padding (p-6)

---

## Component Library

### Navigation & Shell

**Sidebar Navigation (Desktop):**
- Fixed left sidebar (w-64, h-screen)
- Logo/branding at top (h-16, p-4)
- Navigation items with icons (h-12, px-4, flex items-center gap-3)
- Active state: Background treatment with border-l-4 indicator
- User profile at bottom with avatar and dropdown
- Collapsible sections for Budget Categories, Goals, Reports

**Mobile Navigation:**
- Bottom tab bar (fixed bottom, h-16)
- Hamburger menu for secondary navigation
- Slide-out drawer for full menu access

**Top Bar:**
- Search bar (max-w-md) for transactions
- Date range selector (compact dropdown)
- Notification bell with badge
- Theme toggle (dark/light mode)
- User avatar with dropdown menu

### Dashboard Components

**Metric Cards (Key Stats):**
- Compact card design (min-h-32, p-6)
- Large numerical display (text-3xl font-bold)
- Icon indicator (24px) top-left
- Label below (text-sm)
- Percentage change badge (text-xs, rounded-full px-2 py-1)
- Trend micro-chart (h-12) at bottom

**Budget Progress Bars:**
- Category label with icon (text-sm font-medium)
- Dual progress bar showing spent/remaining
- Numerical indicators on both ends (spent/total)
- Warning states for overspending (different bar treatment)
- Height: h-3 for bars, h-8 for full component

**Transaction List Item:**
- Row height: h-16
- Icon/category badge (w-10 h-10, rounded-lg)
- Transaction description (text-base font-medium)
- Category/tags (text-xs) below description
- Date (text-sm) on right
- Amount (text-lg font-semibold tabular-nums) aligned right
- Hover: Background treatment, no transform

### Data Visualization

**Chart Containers:**
- Card wrapper (rounded-lg, p-6)
- Chart title (text-lg font-semibold, mb-4)
- Chart area: min-h-64 for line/bar charts, min-h-80 for detailed views
- Legend below chart (flex gap-4)
- Time period selector (tabs or dropdown) in top-right

**Chart Types:**
- Pie charts: 300px diameter, stroke-width-2 for segments
- Line graphs: 2px line weight, 4px dot markers
- Bar charts: Minimum bar width 24px, gap-2 between bars
- Area charts: opacity-20 for fill, 2px stroke for line

### Forms & Input

**Form Layout:**
- Single column forms (max-w-xl)
- Label above input (text-sm font-medium, mb-2)
- Input height: h-12
- Multi-column for compact data entry (grid-cols-2 gap-4)
- Category selector: Grid of clickable cards (grid-cols-3 gap-3)

**Transaction Entry Form:**
- Amount input: Large centered input (text-2xl text-center, h-16)
- Quick category icons (grid-cols-4 gap-2, icon buttons w-16 h-16)
- Date picker: Calendar dropdown
- Notes field: Expandable textarea (min-h-24)
- Receipt upload: Drag-drop zone (h-32, border-2 border-dashed)

**Budget Creation:**
- Category rows (h-16 each)
- Inline editing for limits
- Slider for quick adjustments (with numerical input)
- Preset buttons (50/30/20, Zero-based, etc.)

### Data Tables

**Transaction Table:**
- Row height: h-12
- Sticky header (position-sticky top-0)
- Columns: Icon (w-10), Date (w-24), Description (flex-1), Category (w-32), Amount (w-28)
- Zebra striping for readability
- Sort indicators in headers
- Infinite scroll or pagination (20 items/page)

**Budget Table:**
- Similar structure to transactions
- Progress bar column (w-48)
- Visual indicators for budget status
- Expandable rows for sub-categories

### Modals & Overlays

**Transaction Detail Modal:**
- max-w-2xl width
- Header with close button (h-16)
- Scrollable content area
- Category badge and amount prominent (text-3xl)
- Receipt image preview
- Edit/delete actions at bottom

**Quick Add Overlay:**
- Bottom sheet on mobile (rounded-t-2xl)
- Centered modal on desktop (max-w-md)
- Minimal fields for fast entry
- Auto-dismiss after save

### Goal Tracking

**Goal Card:**
- Horizontal layout (p-6)
- Goal icon and title (left)
- Large progress indicator (center, circular or linear)
- Target amount and deadline (right)
- "Add funds" quick action button
- Projected completion date (text-sm)

### Settings & Profile

**Settings Page:**
- Two-column layout (lg:grid-cols-5)
- Sidebar navigation (col-span-1)
- Content area (col-span-4)
- Section headers (text-xl font-semibold, mb-6)
- Toggle switches (h-6 w-11)
- Action buttons at section bottoms

---

## Images

**Hero Section (Landing/Marketing Page):**
- Large hero image showing dashboard mockup or person managing finances on laptop
- Image placement: Right side on desktop (lg:grid-cols-2), full-width on mobile
- Overlay: Gradient from left for text readability
- Call-to-action buttons with blur background (backdrop-blur-sm) if over image

**Dashboard Empty States:**
- Illustrations for no transactions, no budgets set, no goals
- Size: max-w-xs, centered
- Friendly, minimal illustration style
- Accompanied by helpful text and action button

**Feature Showcase:**
- Screenshots of key features (charts, budget planning, goal tracking)
- Display in grid (grid-cols-1 md:grid-cols-2 gap-8)
- Border treatment (rounded-lg, border shadow-xl)
- Each with caption (text-sm text-center mt-3)

---

## Animations

**Minimal, Purposeful Motion:**
- Chart data entry: 400ms ease-out transitions
- Card hover: No transform, subtle background transition (200ms)
- Progress bars: 800ms ease-in-out on value changes
- Modal/drawer entry: 300ms slide and fade
- Number counter: Animate to new values on dashboard (600ms)
- Page transitions: Simple 200ms fade
- NO decorative animations, NO floating elements, NO parallax

---

## Special Considerations

**Dark/Light Mode:**
- Toggle in top-right of navigation
- Preserve all spacing, layout, and component structure
- Chart colors must maintain accessibility in both modes
- Tables: Adjust zebra striping for mode

**Data Density:**
- Compact view toggle for tables (reduces row height from h-12 to h-10)
- Dashboard can show 6-8 metric cards above fold
- Charts should be scannable at a glance
- Avoid excessive whitespace in data-heavy views

**Trust Signals:**
- Lock icons for security features
- Encryption badges in footer
- "Last synced" timestamps on data
- Bank-level security messaging

**Responsive Strategy:**
- Mobile-first: Stack all multi-column layouts
- Tablet: 2-column grids, maintain sidebar
- Desktop: Full multi-column dashboard, fixed sidebar
- Transaction entry: Always optimize for quick mobile input