# Release Accessibility Checklist

Per compliance spec §8.2, this manual verification checklist must be completed before each release.

## Keyboard-Only Walkthrough

- [ ] **Home page**: All interactive elements reachable and usable via keyboard
- [ ] **Navigation**: Can open/close dropdowns with Enter/Space, close with Escape
- [ ] **Content pages**: Can navigate all content, headings, links
- [ ] **Forms**: Can complete and submit forms without mouse
- [ ] **Dialogs/Modals**: Focus trap works, Escape closes, focus returns to trigger

## Screen Reader Testing

### macOS VoiceOver (Safari)
- [ ] Page title announced on load
- [ ] Skip link works and announces target
- [ ] Landmarks announced correctly
- [ ] Headings navigation works (VO + Cmd + H)
- [ ] Forms: labels read correctly, errors announced
- [ ] Images: alt text or decorative status announced correctly

### Windows NVDA (Firefox or Chrome)
- [ ] Page title announced on load  
- [ ] Skip link works and announces target
- [ ] Landmarks announced correctly (D to navigate)
- [ ] Headings navigation works (H key)
- [ ] Forms: labels read correctly, errors announced
- [ ] Images: alt text or decorative status announced correctly

## Visual Testing

### 200% Zoom Test
- [ ] Content remains readable at 200% zoom
- [ ] No horizontal scrolling required for main content
- [ ] No text overlap or clipping
- [ ] Interactive elements remain usable

### 320px Width Reflow Test
- [ ] Content reflows to single column
- [ ] No loss of information or functionality
- [ ] Navigation accessible (hamburger menu if applicable)
- [ ] Forms remain usable

### Reduced Motion Test
- [ ] Enable "Reduce motion" in OS settings
- [ ] Verify no animations or transitions play
- [ ] Page remains fully functional

## Brand Compliance

- [ ] Brand Bar present on all pages with correct gold (#FFCD00) background
- [ ] Block IOWA logo links to uiowa.edu with correct alt text
- [ ] Unit name is formal name only (no taglines, acronyms)
- [ ] Brand Footer present with black background, white text, gold links
- [ ] Required links present: Privacy, Nondiscrimination, Accessibility
- [ ] Accessibility help link present
- [ ] Copyright with current year

## Media Accessibility (if applicable)

- [ ] Videos have synchronized captions
- [ ] Transcript link visible adjacent to media player
- [ ] Audio-only content has transcript
- [ ] Captions are accurate and properly timed

---

## Sign-off

**Tested by:** ________________________

**Date:** ________________________

**Release version:** ________________________

**Notes:**
