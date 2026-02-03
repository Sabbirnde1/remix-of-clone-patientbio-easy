
# QR Code Generation Implementation Plan

This plan adds real QR code generation functionality to the Patient Dashboard, enabling patients to generate, view, download, and share their unique patient QR codes for instant identification by healthcare providers.

## Overview

The implementation will use the `qrcode.react` library to generate actual QR codes encoding the patient's unique ID. Both the **QRCodePage** and **ShareDataPage** will be updated to display real, functional QR codes with download and share capabilities.

```text
+------------------------------------------+
|              My QR Code Page             |
+------------------------------------------+
|                                          |
|    +----------------------------+        |
|    |                            |        |
|    |     [Real QR Code SVG]     |        |
|    |     Encoding Patient ID    |        |
|    |                            |        |
|    +----------------------------+        |
|                                          |
|         Patient ID: A1B2C3D4             |
|         [Copy ID Button]                 |
|                                          |
|    [Download PNG]    [Share]             |
|                                          |
+------------------------------------------+
```

## Features

### 1. QR Code Generation
- Generate QR codes encoding the patient's unique ID
- Use SVG format for crisp rendering at any size
- Customizable colors to match brand (purple/violet theme)

### 2. Download Functionality
- Download QR code as PNG image
- Filename includes patient ID for easy identification
- High-resolution output for printing

### 3. Share Functionality
- Native Web Share API integration (mobile-friendly)
- Fallback to copy-to-clipboard for desktop browsers
- Share patient ID or download link

### 4. Responsive Design
- QR code scales appropriately on all devices
- Touch-friendly buttons for mobile users

---

## Technical Implementation

### Dependencies

**Install qrcode.react library:**

```bash
npm install qrcode.react
```

This is a lightweight, well-maintained library with TypeScript support that provides both SVG and Canvas-based QR code components.

### Files to Modify

**1. `src/pages/dashboard/QRCodePage.tsx`**

Updates:
- Import `QRCodeSVG` from `qrcode.react`
- Replace placeholder QrCode icon with real QR code component
- Implement download functionality using canvas conversion
- Add Web Share API support with fallback
- Enable the Download and Share buttons

**2. `src/pages/dashboard/ShareDataPage.tsx`**

Updates:
- Import `QRCodeSVG` from `qrcode.react`
- Replace placeholder with smaller QR code display
- Link to full QRCodePage for larger view
- Remove "coming soon" messaging

### New Components (Optional Extraction)

**`src/components/dashboard/PatientQRCode.tsx`** (optional)

A reusable QR code component that can be used across pages:
- Props: `patientId`, `size`, `showDownload`, `showShare`
- Encapsulates QR generation and download logic
- Consistent styling across the app

---

## Implementation Details

### QRCodePage.tsx Changes

```typescript
// Key imports to add
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

// QR Code value - encodes patient ID with app context
const qrValue = `patientbio:${patientId}`;

// Download function using canvas
const handleDownload = () => {
  const svg = document.getElementById("patient-qr-code");
  const canvas = document.createElement("canvas");
  // Convert SVG to canvas, then to PNG
  // Trigger download with patient ID in filename
};

// Share function with Web Share API
const handleShare = async () => {
  if (navigator.share) {
    await navigator.share({
      title: "My Patient Bio QR Code",
      text: `My Patient ID: ${patientId}`,
    });
  } else {
    // Fallback to copy
  }
};
```

### QR Code Configuration

- **Value**: `patientbio:${patientId}` - prefixed for app identification
- **Size**: 256x256 pixels (optimal for scanning)
- **Level**: "H" (high error correction for reliable scanning)
- **Colors**: 
  - Foreground: Dark color for contrast
  - Background: White for scanner compatibility

### Download Implementation

The download process:
1. Get the SVG element by ID
2. Create a canvas with appropriate dimensions
3. Draw the SVG onto the canvas using an Image element
4. Convert canvas to PNG data URL
5. Create a temporary download link and trigger click
6. Clean up the temporary elements

### Share Implementation

Using the Web Share API (supported on mobile browsers):
1. Check if `navigator.share` is available
2. If available, trigger native share dialog
3. If not available, fall back to copying patient ID to clipboard
4. Show appropriate toast feedback

---

## Component Structure

### QRCodePage Layout

```text
Card (main container)
├── CardHeader
│   ├── CardTitle: "My QR Code"
│   └── CardDescription
└── CardContent
    ├── QR Code Display Container (white background, shadow)
    │   └── QRCodeSVG component (id="patient-qr-code")
    ├── Patient ID Display with Copy Button
    └── Action Buttons Row
        ├── Download Button (enabled)
        └── Share Button (enabled)

Card (instructions)
└── CardContent
    └── Usage instructions list
```

### ShareDataPage QR Section

```text
QR Code Section (within existing card)
├── Smaller QRCodeSVG (128x128)
├── "Scan to view patient info" text
└── Link to full QR Code page
```

---

## Implementation Order

1. **Install dependency**: Add `qrcode.react` to package.json
2. **Update QRCodePage**: Replace placeholder with real QR code, implement download/share
3. **Update ShareDataPage**: Add smaller QR code preview with link to full page
4. **Test functionality**: Verify QR codes scan correctly and download works

---

## Design Specifications

**QR Code Container:**
- White background (required for QR scanner compatibility)
- Rounded corners with shadow
- Padding around QR code

**Colors:**
- QR foreground: `#1f2937` (dark gray for contrast)
- QR background: `#ffffff` (white)
- Container: White with shadow

**Sizes:**
- QRCodePage: 256x256 pixels
- ShareDataPage preview: 128x128 pixels

---

## Security Considerations

1. **Patient ID only**: QR code encodes only the 8-character patient ID, not sensitive health data
2. **No PII in QR**: Full user details are NOT embedded in the QR code
3. **Provider lookup**: Healthcare providers would need to be authorized to look up patient data using the ID
4. **Client-side generation**: QR codes are generated in the browser, no server round-trip needed

---

## Browser Compatibility

- **QR Generation**: Works in all modern browsers (SVG-based)
- **Download**: Uses canvas API, supported in all modern browsers
- **Share**: Web Share API available on mobile browsers and some desktop browsers
- **Fallback**: Copy-to-clipboard for browsers without Web Share support
