# Customization Guide

Before deploying BudgetFlow, you may want to customize certain aspects of the application.

## Required Changes Before Deployment

### 1. Admin Email Configuration

The application automatically grants admin privileges to a specific email address. You should change this before deploying.

**File**: `server/routes.ts`

**Lines 26 and 48**: Change the admin email

```typescript
// Current (line 26)
const isAdminEmail = data.email === "gabe.rappold@gmail.com";

// Change to your email
const isAdminEmail = data.email === "your-email@example.com";

// Also update line 48
if (user.email === "gabe.rappold@gmail.com" && !user.isAdmin) {
// Change to
if (user.email === "your-email@example.com" && !user.isAdmin) {
```

### 2. Application Branding

#### Site Name and Description
**File**: `client/index.html`

```html
<!-- Line 6: Page title -->
<title>BudgetFlow - Smart Personal Finance Management</title>

<!-- Line 7: Meta description -->
<meta name="description" content="Your custom description here" />
```

#### Favicon
Replace `client/public/favicon.png` with your own favicon.

### 3. Color Scheme

**File**: `client/src/index.css`

The application uses CSS variables for theming. Customize colors in the `:root` and `.dark` sections:

```css
:root {
  /* Primary color - main brand color */
  --primary: 142 86% 28%;
  
  /* Accent color - secondary highlights */
  --accent: 142 76% 36%;
  
  /* Background colors */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  
  /* ... other colors ... */
}
```

### 4. Default Categories

When a new user signs up, they receive default categories.

**File**: `server/routes.ts` (lines 33-41)

```typescript
const defaultCategories = [
  { name: "Groceries", type: "expense" as const, icon: "ShoppingCart", color: "#ef4444", isDefault: true },
  { name: "Rent", type: "expense" as const, icon: "Home", color: "#f59e0b", isDefault: true },
  // Add or modify categories as needed
];
```

Available icons from Lucide React:
- ShoppingCart, Home, Car, Utensils, Smartphone
- DollarSign, Briefcase, Heart, BookOpen, Coffee
- And many more at [lucide.dev](https://lucide.dev)

### 5. Firebase Authentication Providers

**Enable/Disable Google Sign-In**

**File**: `client/src/pages/auth-page.tsx`

Comment out the Google sign-in button to disable it:

```typescript
{/* <Button
  type="button"
  variant="outline"
  onClick={handleGoogleSignIn}
  className="w-full"
  data-testid="button-google-signin"
>
  <SiGoogle className="mr-2 h-4 w-4" />
  Continue with Google
</Button> */}
```

Remember to also disable it in Firebase Console:
- Authentication → Sign-in method → Google → Disable

## Optional Customizations

### Currency Symbol

**File**: Multiple files use currency formatting

Search for `Intl.NumberFormat` usage and modify the currency:

```typescript
// Current (USD)
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

// Example: Change to EUR
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR'
})
```

### Date Format

**Files**: Various components use `date-fns` for formatting

```typescript
import { format } from 'date-fns';

// Current format
format(date, 'MMM d, yyyy')

// Change to your preferred format
format(date, 'dd/MM/yyyy')  // European format
```

### Navigation Items

**File**: `client/src/components/app-sidebar.tsx`

Modify the sidebar navigation:

```typescript
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  // Add, remove, or modify items
];
```

### Budget Period

The application uses monthly budgets by default. To change to weekly or yearly budgets, you'll need to modify:

1. **Database schema** (`shared/schema.ts`) - Add period field
2. **Budget components** - Update calculations
3. **API routes** - Filter by period

### Analytics Charts

**File**: `client/src/pages/analytics.tsx`

Customize chart colors, types, and data:

```typescript
// Change chart colors
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

// Modify chart types (Line, Bar, Area, Pie)
<LineChart data={data}>
// Change to
<BarChart data={data}>
```

### Email Templates (Password Reset)

Firebase handles password reset emails. Customize them in:
- Firebase Console → Authentication → Templates

### Session Duration

**File**: `server/index.ts` (if using sessions)

Modify session configuration for different timeout periods.

## Advanced Customizations

### Multi-Currency Support

To add support for multiple currencies:

1. Add `currency` field to user schema
2. Update transaction schema to store currency
3. Add currency selector in settings
4. Modify all currency displays to use user's selected currency

### Recurring Transactions

The schema supports recurring transactions (`isRecurring`, `recurringFrequency`). To enable:

1. Add UI in transaction form
2. Create background job to generate recurring transactions
3. Add notification system for created transactions

### Budget Alerts

Add notifications when approaching budget limits:

1. Check spending vs budget in API
2. Return alert status with budget data
3. Display notification badges in UI
4. Optional: Email notifications (requires email service)

### Export Data

Add CSV/Excel export functionality:

1. Install export library (`xlsx` or `papaparse`)
2. Add export button to pages
3. Format data for export
4. Trigger download

### Multi-Language Support

Implement internationalization (i18n):

1. Install `react-i18next`
2. Create translation files
3. Wrap text in translation function
4. Add language selector

## Testing Customizations

After making changes:

1. Run type check: `npm run check`
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Test all user flows
5. Verify mobile responsiveness
6. Test in both light and dark modes

## Deployment After Customization

1. Commit changes to git
2. Push to GitHub
3. Netlify will automatically rebuild
4. Or manually trigger deploy in Netlify dashboard

Remember to update environment variables if you've added new configuration options.
