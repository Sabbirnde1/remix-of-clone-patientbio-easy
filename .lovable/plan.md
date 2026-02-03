

# Hospital Dashboard Tier 2 Features Implementation Plan

## Overview

This plan implements two important "Should Have" features for the Hospital Dashboard:

1. **Billing & Invoicing** - Generate bills for consultations/services, track payment status, view payment history
2. **In-Patient Management** - Manage admissions, allocate beds/wards, track patient stays, handle discharge

---

## Database Schema

### New Tables

#### 1. `wards` - Hospital wards/departments with bed capacity

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| hospital_id | UUID | References hospitals(id) |
| name | TEXT | Ward name (e.g., "General Ward A", "ICU") |
| type | TEXT | Ward type: general, icu, emergency, maternity, pediatric, private |
| floor | TEXT | Floor/building location |
| total_beds | INTEGER | Total number of beds |
| description | TEXT | Optional description |
| is_active | BOOLEAN | Whether ward is operational |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### 2. `beds` - Individual beds within wards

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ward_id | UUID | References wards(id) |
| hospital_id | UUID | References hospitals(id) |
| bed_number | TEXT | Bed identifier (e.g., "A-101") |
| bed_type | TEXT | standard, electric, icu, pediatric |
| daily_rate | DECIMAL | Daily charge for this bed |
| status | TEXT | available, occupied, maintenance, reserved |
| notes | TEXT | Optional notes |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### 3. `admissions` - Patient admission records

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| hospital_id | UUID | References hospitals(id) |
| patient_id | UUID | Patient user ID |
| bed_id | UUID | References beds(id) |
| admitting_doctor_id | UUID | Doctor who admitted |
| admission_date | TIMESTAMP | When patient was admitted |
| expected_discharge | DATE | Estimated discharge date |
| actual_discharge | TIMESTAMP | When actually discharged |
| admission_reason | TEXT | Reason for admission |
| diagnosis | TEXT | Initial diagnosis |
| status | TEXT | admitted, discharged, transferred |
| discharge_notes | TEXT | Discharge summary |
| discharged_by | UUID | Staff who discharged |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### 4. `invoices` - Patient billing invoices

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| hospital_id | UUID | References hospitals(id) |
| patient_id | UUID | Patient user ID |
| admission_id | UUID | References admissions(id) - nullable for OPD |
| appointment_id | UUID | References appointments(id) - nullable |
| invoice_number | TEXT | Unique invoice number (auto-generated) |
| invoice_date | DATE | Invoice creation date |
| due_date | DATE | Payment due date |
| subtotal | DECIMAL | Sum of all items before tax |
| tax_amount | DECIMAL | Tax amount |
| discount_amount | DECIMAL | Any discounts applied |
| total_amount | DECIMAL | Final amount |
| amount_paid | DECIMAL | Amount already paid |
| status | TEXT | draft, pending, partial, paid, cancelled |
| notes | TEXT | Invoice notes |
| created_by | UUID | Staff who created |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### 5. `invoice_items` - Line items on invoices

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| invoice_id | UUID | References invoices(id) |
| description | TEXT | Item description |
| category | TEXT | consultation, bed_charge, medication, procedure, lab_test, other |
| quantity | INTEGER | Number of units |
| unit_price | DECIMAL | Price per unit |
| total_price | DECIMAL | quantity * unit_price |
| service_date | DATE | When service was provided |
| created_at | TIMESTAMP | |

#### 6. `payments` - Payment transactions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| invoice_id | UUID | References invoices(id) |
| hospital_id | UUID | References hospitals(id) |
| amount | DECIMAL | Payment amount |
| payment_method | TEXT | cash, card, upi, bank_transfer, insurance |
| payment_date | TIMESTAMP | When payment was made |
| transaction_ref | TEXT | External transaction reference |
| notes | TEXT | Payment notes |
| received_by | UUID | Staff who received payment |
| created_at | TIMESTAMP | |

---

## User Interface Components

### 1. Billing & Invoicing Section

#### Invoices Page (`/hospital/:hospitalId/billing`)

```text
+-------------------------------------------------------+
|  Billing & Invoices                    [+ New Invoice] |
+-------------------------------------------------------+
|  [All] [Pending] [Paid] [Overdue]    [Search...] |
+-------------------------------------------------------+
|  Invoice List:                                         |
|  +---------------------------------------------------+ |
|  | INV-2026-001 | John Doe | Rs. 5,000 | Paid | ✓    | |
|  | INV-2026-002 | Jane Roe | Rs. 12,500 | Pending    | |
|  | INV-2026-003 | Bob Lee  | Rs. 3,200 | Partial    | |
|  +---------------------------------------------------+ |
+-------------------------------------------------------+
```

#### Create Invoice Dialog

- Select patient (from hospital's patients or search)
- Link to admission/appointment (optional)
- Add line items (services, bed charges, medications)
- Apply discounts/tax
- Preview and save

#### Invoice Detail View

- Full invoice with patient details
- Item breakdown
- Payment history
- Actions: Record payment, Print, Send, Cancel

### 2. In-Patient Management Section

#### Ward & Bed Management Page (`/hospital/:hospitalId/wards`)

```text
+-------------------------------------------------------+
|  Wards & Beds                              [+ Add Ward] |
+-------------------------------------------------------+
|  Ward Overview:                                         |
|  +---------------------------------------------------+ |
|  | General Ward A  | 20 beds | 15 occupied | 5 avail | |
|  | ICU             | 8 beds  | 6 occupied  | 2 avail | |
|  | Private Rooms   | 10 beds | 8 occupied  | 2 avail | |
|  +---------------------------------------------------+ |
+-------------------------------------------------------+
|  Bed Map (click ward to expand):                       |
|  +---------------------------------------------------+ |
|  | [A1 ✓] [A2 ●] [A3 ●] [A4 ✓] [A5 🔧] [A6 ●]       | |
|  | ✓ Available  ● Occupied  🔧 Maintenance           | |
|  +---------------------------------------------------+ |
+-------------------------------------------------------+
```

#### Admissions Page (`/hospital/:hospitalId/admissions`)

```text
+-------------------------------------------------------+
|  In-Patient Admissions                   [+ New Admit] |
+-------------------------------------------------------+
|  [Current] [Discharged Today] [All]     [Search...]   |
+-------------------------------------------------------+
|  Current Admissions:                                   |
|  +---------------------------------------------------+ |
|  | John Doe | Ward A, Bed 3 | Dr. Smith | Day 3      | |
|  |   Diagnosis: Pneumonia | Expected: Feb 10         | |
|  |   [View] [Transfer Bed] [Discharge]               | |
|  +---------------------------------------------------+ |
|  | Jane Roe | ICU, Bed 2 | Dr. Jones | Day 1         | |
|  |   Diagnosis: Post-surgery | Expected: Feb 12      | |
|  |   [View] [Transfer Bed] [Discharge]               | |
|  +---------------------------------------------------+ |
+-------------------------------------------------------+
```

#### Admission Dialog

- Select patient
- Select available bed
- Assign doctor
- Enter admission reason/diagnosis
- Set expected discharge date

#### Discharge Dialog

- Discharge summary
- Final diagnosis
- Auto-generate invoice for bed charges
- Print discharge summary

---

## File Structure

### New Files to Create

```text
src/
├── hooks/
│   ├── useWards.ts              # Ward & bed management
│   ├── useAdmissions.ts         # In-patient admissions
│   ├── useInvoices.ts           # Billing & invoices
│   └── usePayments.ts           # Payment tracking
├── pages/hospital/
│   ├── HospitalBillingPage.tsx  # Invoices list & management
│   ├── HospitalWardsPage.tsx    # Ward & bed management
│   └── HospitalAdmissionsPage.tsx # In-patient admissions
├── components/hospital/
│   ├── CreateInvoiceDialog.tsx  # Create/edit invoice
│   ├── InvoiceCard.tsx          # Invoice list item
│   ├── InvoiceDetailDialog.tsx  # Full invoice view
│   ├── RecordPaymentDialog.tsx  # Record payment
│   ├── WardCard.tsx             # Ward overview card
│   ├── BedGrid.tsx              # Visual bed map
│   ├── AddWardDialog.tsx        # Create/edit ward
│   ├── AddBedDialog.tsx         # Create/edit bed
│   ├── AdmissionCard.tsx        # Admission list item
│   ├── AdmitPatientDialog.tsx   # New admission
│   ├── DischargeDialog.tsx      # Discharge patient
│   └── TransferBedDialog.tsx    # Transfer to different bed
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes for billing, wards, admissions |
| `src/components/hospital/HospitalSidebar.tsx` | Add "Billing", "Wards", "Admissions" links |
| `src/types/hospital.ts` | Add new type definitions |

---

## Implementation Phases

### Phase 1: Database Setup
1. Create all 6 new tables with appropriate columns
2. Add RLS policies for each table
3. Create indexes for performance
4. Add invoice number auto-generation function

### Phase 2: Ward & Bed Management
1. Create `useWards` hook with CRUD operations
2. Build ward and bed UI components
3. Create `HospitalWardsPage`
4. Add sidebar navigation

### Phase 3: In-Patient Admissions
1. Create `useAdmissions` hook
2. Build admission UI components
3. Create `HospitalAdmissionsPage`
4. Implement admission workflow (admit, transfer, discharge)
5. Auto-update bed status on admission/discharge

### Phase 4: Billing & Invoicing
1. Create `useInvoices` and `usePayments` hooks
2. Build invoice creation and viewing components
3. Create `HospitalBillingPage`
4. Implement invoice generation from admissions
5. Add payment recording functionality

---

## Technical Details

### RLS Policies Summary

#### wards, beds
- Hospital admins can manage (full CRUD)
- Hospital staff can view

#### admissions
- Doctors can create/update admissions
- Hospital staff can view all admissions at their hospital
- Hospital admins can manage all

#### invoices, invoice_items, payments
- Hospital admins and designated billing staff can manage
- Hospital staff can view
- Patients can view their own invoices (future enhancement)

### Invoice Number Generation

```sql
CREATE OR REPLACE FUNCTION generate_invoice_number(hospital_id UUID)
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  invoice_num TEXT;
BEGIN
  year_part := to_char(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM invoices
  WHERE invoices.hospital_id = generate_invoice_number.hospital_id
    AND invoice_number LIKE 'INV-' || year_part || '-%';
  
  invoice_num := 'INV-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;
```

### Bed Status Auto-Update Trigger

```sql
CREATE OR REPLACE FUNCTION update_bed_status_on_admission()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'admitted' THEN
    UPDATE beds SET status = 'occupied' WHERE id = NEW.bed_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'admitted' AND NEW.status = 'discharged' THEN
      UPDATE beds SET status = 'available' WHERE id = OLD.bed_id;
    ELSIF OLD.bed_id != NEW.bed_id THEN
      UPDATE beds SET status = 'available' WHERE id = OLD.bed_id;
      UPDATE beds SET status = 'occupied' WHERE id = NEW.bed_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Database Migration SQL Preview

```sql
-- Ward types enum
CREATE TYPE ward_type AS ENUM (
  'general', 'icu', 'emergency', 'maternity', 'pediatric', 'private'
);

-- Bed status enum
CREATE TYPE bed_status AS ENUM (
  'available', 'occupied', 'maintenance', 'reserved'
);

-- Admission status enum
CREATE TYPE admission_status AS ENUM (
  'admitted', 'discharged', 'transferred'
);

-- Invoice status enum
CREATE TYPE invoice_status AS ENUM (
  'draft', 'pending', 'partial', 'paid', 'cancelled'
);

-- Invoice item categories
CREATE TYPE invoice_item_category AS ENUM (
  'consultation', 'bed_charge', 'medication', 'procedure', 'lab_test', 'other'
);

-- Payment methods
CREATE TYPE payment_method AS ENUM (
  'cash', 'card', 'upi', 'bank_transfer', 'insurance'
);

-- Create tables (wards, beds, admissions, invoices, invoice_items, payments)
-- with appropriate foreign keys and constraints...
```

---

## Security Considerations

1. **Invoice Tampering**: Paid invoices should be immutable
2. **Bed Allocation Race Conditions**: Use database transactions for admission
3. **Financial Data Access**: Restrict billing data to authorized staff only
4. **Audit Trail**: Log all payment and invoice modifications

---

## Estimated Effort

| Phase | Time Estimate |
|-------|---------------|
| Phase 1: Database Setup | 2-3 hours |
| Phase 2: Ward & Bed Management | 4-5 hours |
| Phase 3: In-Patient Admissions | 5-6 hours |
| Phase 4: Billing & Invoicing | 6-7 hours |
| **Total** | **17-21 hours** |

