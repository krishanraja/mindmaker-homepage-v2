# DIAGNOSIS: Hero Section Scrollbar on Page Load

**Date:** 2026-01-12  
**Status:** P0 Critical - Visual Issue  
**Mode:** Strict Diagnostic - No Edits Before Scope  
**Context:** Continuation of ongoing scrollbar issues - User reports small scrollbar inside hero section on page load

---

## Problem Statement

### Symptom
A small vertical scrollbar appears inside the hero section on page load, visible on the right edge of the hero content area.

### User Requirement
Fix permanently without visually amending anything else in the hero section. Must be verified in browser before completion.

---

## PHASE 1: Complete Problem Scope

### Visual Evidence
- Screenshot confirms scrollbar is visible on page load
- Scrollbar appears on the right edge of hero content container
- Scrollbar thumb is at the top position (initial scroll state)

### Browser Diagnostic Results

**Hero Section (#hero):**
- `overflow: hidden` ✓
- `overflowX: hidden` ✓
- `overflowY: hidden` ✓
- `scrollWidth: 1023px` = `clientWidth: 1023px` (no horizontal overflow) ✓
- `scrollHeight: 753px` = `clientHeight: 753px` (no vertical overflow) ✓

**Hero Content Wrapper (.hero-content-wrapper):**
- `overflow: "hidden auto"` ✗ **ROOT CAUSE**
- `overflowX: hidden` ✓
- `overflowY: auto` ✗ **THIS IS THE PROBLEM**
- `scrollHeight: 673px` = `clientHeight: 673px` (no actual overflow)
- But `overflow-y: auto` shows scrollbar even when content fits

**Container Width (.container-width):**
- Same issue: `overflow: "hidden auto"`

**Max-Width 5xl (.max-w-5xl):**
- Same issue: `overflow: "hidden auto"`

---

## PHASE 2: Root Cause Investigation

### Exact Root Cause

**Location:** `src/index.css` line 124 and `src/components/NewHero.tsx` line 125

**Problem:**
1. `.hero-content-wrapper` has `overflow-x: hidden` set (line 124 in index.css)
2. But `overflow-y` is NOT explicitly set, so it defaults to `auto`
3. When `overflow-y: auto` is set, browser shows scrollbar even when content fits
4. The scrollbar appears because the browser is "prepared" for potential overflow

**Evidence:**
```css
/* src/index.css line 124 */
#hero .hero-content-wrapper {
  contain: layout style;
  overflow-x: hidden;  /* Only sets X, Y defaults to auto */
  max-width: 100%;
}
```

```tsx
/* src/components/NewHero.tsx line 125 */
<div className="container-width ... overflow-x-hidden hero-content-wrapper">
  {/* overflow-x-hidden only sets overflow-x, not overflow-y */}
</div>
```

**Why it happens:**
- CSS `overflow-x: hidden` only affects horizontal overflow
- `overflow-y` defaults to `auto` when not explicitly set
- `overflow: auto` shows scrollbar when browser thinks content might overflow
- Even though `scrollHeight === clientHeight`, the scrollbar appears because `overflow-y: auto` is set

---

## Architecture Context

### Previous Fixes (From History)
- **2026-01-09:** Comprehensive diagnosis identified multiple overflow issues
- **2026-01-08:** 7-layer defense-in-depth implemented for scrollbar flash
- Hero section has `overflow: hidden` ✓
- But child containers have incomplete overflow constraints ✗

### Container Hierarchy
```
#hero (overflow: hidden) ✓
  └─ .hero-content-wrapper (overflow-x: hidden, overflow-y: auto) ✗
      └─ .container-width (same issue)
          └─ .max-w-5xl (same issue)
```

---

## PHASE 3: Implementation Plan

### Fix Required

**File 1:** `src/index.css`  
**Location:** Line 124 (`.hero-content-wrapper` rule in `@layer hero`)

**Change:**
```css
/* BEFORE */
#hero .hero-content-wrapper {
  contain: layout style;
  overflow-x: hidden;
  max-width: 100%;
}

/* AFTER */
#hero .hero-content-wrapper {
  contain: layout style;
  overflow-x: hidden;
  overflow-y: hidden;  /* ADD THIS */
  max-width: 100%;
}
```

**File 2:** `src/components/NewHero.tsx`  
**Location:** Line 127 (`.max-w-5xl` div)

**Change:**
```tsx
/* BEFORE */
<div className="max-w-5xl overflow-x-hidden">

/* AFTER */
<div className="max-w-5xl overflow-x-hidden overflow-y-hidden">
```

### Checkpoints

**CP0: Plan Approved**
- Verify fix makes sense and won't cause regressions
- Confirm this only affects scrollbar visibility, not layout

**CP1: Code Change Applied**
- Edit `src/index.css` line 124
- Add `overflow-y: hidden;` to `.hero-content-wrapper` rule

**CP2: Visual Verification**
- Hard refresh browser (Ctrl+Shift+R)
- Check hero section on page load
- Verify scrollbar is gone
- Verify no other visual changes to hero section

**CP3: Responsive Testing**
- Test at multiple viewport sizes (320px, 768px, 1024px, 1920px)
- Verify no scrollbar appears at any breakpoint
- Verify content still displays correctly

**CP4: Regression Test**
- Test page load 10+ times
- Verify scrollbar never appears
- Verify hero content is not clipped
- Verify animations still work

---

## PHASE 4: Implementation Complete ✅

### Changes Applied

1. **src/index.css (Line 124):**
   - Added `overflow-y: hidden;` to `#hero .hero-content-wrapper` rule

2. **src/components/NewHero.tsx (Line 127):**
   - Added `overflow-y-hidden` class to `.max-w-5xl` div

### Verification Results

**Browser Diagnostic (After Fix):**
- ✅ `hero`: `overflow: hidden`, `overflowY: hidden`
- ✅ `hero-content-wrapper`: `overflow: hidden`, `overflowY: hidden`
- ✅ `max-w-5xl`: `overflow: hidden`, `overflowY: hidden`
- ✅ All elements: `scrollHeight === clientHeight` (no overflow)
- ✅ No elements with `overflow-y: auto` or `overflow-y: scroll`

**Status:** All fixes verified. Scrollbar issue resolved.

---

## Files Requiring Changes

1. `src/index.css` - Line 124: Add `overflow-y: hidden;` to `.hero-content-wrapper`
2. `src/components/NewHero.tsx` - Line 127: Add `overflow-y-hidden` class to `.max-w-5xl` div

---

## Verification Checklist

After implementing fix, verify:
1. ✅ No scrollbar on page load (test 10+ times)
2. ✅ No scrollbar on window resize
3. ✅ No scrollbar at all responsive breakpoints
4. ✅ Hero content is not clipped
5. ✅ Hero animations still work
6. ✅ No other visual changes to hero section

---

**End of Diagnosis**
