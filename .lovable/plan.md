

# Add "For Doctors" Navigation Item

## Overview

Add a "For Doctors" menu item to the main navigation bar, similar to the existing "For Hospitals" item. This will provide doctors with easy access to the Doctor Portal login page.

---

## Current State

The navigation currently includes:
- Features
- Demo
- **For Hospitals** (links to `/hospitals`)
- About
- Team
- Contact

---

## Proposed Change

Add "For Doctors" item right after "For Hospitals" to keep portal links grouped together:

- Features
- Demo
- For Hospitals
- **For Doctors** (links to `/doctors/login`)
- About
- Team
- Contact

---

## Implementation Details

### File to Modify
`src/components/Navigation.tsx`

### Changes Required

**1. Add Stethoscope icon import (line 3)**
```typescript
import { Sparkles, LogOut, Menu, User, ChevronRight, Shield, LayoutDashboard, Building2, Stethoscope } from "lucide-react";
```

**2. Add "For Doctors" to menuItems array (after line 21)**
```typescript
const menuItems = [
  { name: "Features", href: "/features", sectionId: "features" },
  { name: "Demo", href: "/demo", sectionId: "demo" },
  { name: "For Hospitals", href: "/hospitals", sectionId: "" },
  { name: "For Doctors", href: "/doctors/login", sectionId: "" },  // NEW
  { name: "About", href: "/about", sectionId: "about" },
  { name: "Team", href: "/team", sectionId: "team" },
  { name: "Contact", href: "/contact", sectionId: "contact" },
];
```

**3. Update handleNavClick to handle doctor route (around line 41)**
```typescript
// For Hospitals and Doctors pages, navigate directly
if (item.href === "/hospitals" || item.href === "/doctors/login") {
  return; // Let the default Link behavior handle it
}
```

---

## Visual Result

### Desktop Navigation
```text
[Logo] Features | Demo | For Hospitals | For Doctors | About | Team | Contact   [Sign In] [Get Started]
```

### Mobile Navigation (Sheet Menu)
All items including "For Doctors" will appear in the mobile slide-out menu with the same styling as other navigation items.

---

## Summary

This is a simple change that adds one menu item to the navigation array and updates the click handler to allow direct navigation to the doctor login page. The styling will automatically match the existing "For Hospitals" link.

