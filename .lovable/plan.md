

# Change Currency from Indian Rupee to Bangladeshi Taka

This plan changes all currency displays from Indian Rupee (₹) to Bangladeshi Taka (৳) throughout the hospital management system.

---

## Summary of Changes

The application currently displays currency in Indian Rupees (₹). We'll update all instances to use Bangladeshi Taka (৳ or "BDT").

---

## Files to Modify

### 1. Hospital Billing Page (`src/pages/hospital/HospitalBillingPage.tsx`)

**Changes:**
- Replace `IndianRupee` icon import with `Banknote` (lucide-react doesn't have a Taka icon)
- Replace all `₹` symbols with `৳`
- Update label text from "₹" to "৳"

**Locations (approximately 15 occurrences):**
- Line 18: Icon import
- Line 314: Discount label
- Line 344: Subtotal display
- Line 348: Tax display
- Line 352: Discount display
- Line 356: Total display
- Line 392: Pending amount summary card
- Line 395: Icon in summary card
- Line 405: Total collected summary card
- Line 454-455: Table cells (amount/paid)
- Line 539-540: View dialog item prices
- Line 550-570: View dialog totals section
- Line 596: Payment dialog balance
- Line 599: Amount label

---

### 2. Invoice Print View (`src/components/hospital/InvoicePrintView.tsx`)

**Changes:**
- Replace all `₹` symbols with `৳`

**Locations (9 occurrences):**
- Line 115: Unit price column
- Line 116: Total price column
- Line 127: Subtotal
- Line 132: Tax
- Line 138: Discount
- Line 143: Total amount
- Line 149: Amount paid
- Line 154: Balance due

---

### 3. Hospital Analytics Page (`src/pages/hospital/HospitalAnalyticsPage.tsx`)

**Changes:**
- Replace `IndianRupee` icon import with `Banknote`
- Replace all `₹` symbols with `৳`

**Locations (4 occurrences):**
- Line 12: Icon import
- Line 207: Revenue collected display
- Line 209: Pending revenue display
- Line 213: Icon in card
- Line 281: Chart card title icon
- Line 292: Y-axis tick formatter
- Line 299: Tooltip formatter

---

## Technical Details

### Currency Symbol
- **Current:** ₹ (U+20B9 - Indian Rupee Sign)
- **New:** ৳ (U+09F3 - Bengali Rupee Sign / Taka)

### Icon Replacement
Since `lucide-react` doesn't have a dedicated Taka icon, we'll use `Banknote` as a generic currency icon. This is commonly used for financial/billing contexts.

### Changes Summary Table

| File | ₹ Replacements | Icon Changes |
|------|----------------|--------------|
| HospitalBillingPage.tsx | ~15 | IndianRupee -> Banknote |
| InvoicePrintView.tsx | 9 | None |
| HospitalAnalyticsPage.tsx | ~5 | IndianRupee -> Banknote |

---

## No Database Changes Required

This is a display-only change. All monetary values are stored as numbers in the database without currency symbols, so no database migrations are needed.

