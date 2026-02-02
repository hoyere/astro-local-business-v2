# Accessibility Checklist

> WCAG 2.1 AA compliance checklist for Astro Local Business Templates
> Based on Phase 5 research findings (January 2026)

---

## Pre-Launch Checklist

### Keyboard Navigation

- [ ] All interactive elements accessible via Tab key
- [ ] Focus order follows logical reading order
- [ ] Focus never gets trapped (except in modals)
- [ ] Skip-to-content link present and functional
- [ ] Modal dialogs trap focus correctly
- [ ] Escape key closes modals/dropdowns

### Focus Indicators

- [ ] All focusable elements have visible focus state
- [ ] Focus ring has sufficient contrast (3:1 minimum)
- [ ] Focus-visible used (not just :focus)
- [ ] Focus indicator is at least 2px wide

### Touch Targets

- [ ] All interactive elements at least 44x44px
- [ ] Adequate spacing between touch targets
- [ ] No overlapping clickable areas

### Images

- [ ] All images have alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Complex images have extended descriptions
- [ ] No text in images (unless logo)
- [ ] Icons have accessible names or are hidden

### Color & Contrast

- [ ] Text contrast at least 4.5:1 (normal text)
- [ ] Text contrast at least 3:1 (large text, 18px+)
- [ ] UI element contrast at least 3:1
- [ ] Information not conveyed by color alone
- [ ] Links distinguishable from text (not just color)

### Forms

- [ ] All inputs have associated labels
- [ ] Required fields indicated (not just with *)
- [ ] Error messages are descriptive
- [ ] Errors associated with inputs (aria-describedby)
- [ ] Form validation is accessible
- [ ] Submit buttons have clear text

### Navigation

- [ ] Landmark regions used (header, main, nav, footer)
- [ ] Current page indicated in navigation
- [ ] Skip navigation link present
- [ ] Mobile menu accessible via keyboard
- [ ] Dropdowns work with keyboard

### Content

- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] Only one h1 per page
- [ ] Lists use proper markup (ul, ol)
- [ ] Tables have proper headers
- [ ] Language attribute set on html element

### Motion & Animation

- [ ] Respects prefers-reduced-motion
- [ ] No auto-playing videos with sound
- [ ] Carousels can be paused
- [ ] Animations don't cause seizures (no rapid flashing)

### Screen Readers

- [ ] Page title is descriptive and unique
- [ ] ARIA labels used appropriately
- [ ] Live regions for dynamic content
- [ ] Hidden content properly hidden (aria-hidden)
- [ ] Decorative elements hidden from AT

---

## Component Patterns

### Buttons

```html
<!-- Standard button -->
<button type="button">Click me</button>

<!-- Icon-only button -->
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Loading state -->
<button type="button" aria-busy="true" disabled>
  <span class="sr-only">Loading, please wait</span>
  <svg aria-hidden="true" class="spinner">...</svg>
</button>
```

### Links

```html
<!-- External link -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  Example Site
  <span class="sr-only">(opens in new tab)</span>
</a>

<!-- Link vs button: links navigate, buttons perform actions -->
```

### Forms

```html
<form>
  <div class="form-group">
    <label for="email">Email address</label>
    <input
      type="email"
      id="email"
      name="email"
      required
      aria-required="true"
      aria-describedby="email-hint email-error"
    />
    <span id="email-hint" class="hint">We'll never share your email</span>
    <span id="email-error" role="alert" class="error" hidden>
      Please enter a valid email
    </span>
  </div>

  <button type="submit">Subscribe</button>
</form>
```

### Navigation

```html
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

### Mobile Menu

```html
<button
  type="button"
  aria-expanded="false"
  aria-controls="mobile-menu"
  aria-label="Open menu"
>
  <svg aria-hidden="true">...</svg>
</button>

<nav id="mobile-menu" aria-hidden="true" hidden>
  <!-- Navigation links -->
</nav>
```

### Modal Dialog

```html
<dialog
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Dialog Title</h2>
  <p>Dialog content...</p>
  <button type="button" aria-label="Close dialog">Close</button>
</dialog>
```

### Cards

```html
<article class="card">
  <img src="..." alt="Description of image" />
  <h3>Card Title</h3>
  <p>Card description...</p>
  <a href="/details" aria-label="Read more about Card Title">
    Read more
  </a>
</article>
```

### Tabs

```html
<div role="tablist" aria-label="Content tabs">
  <button
    role="tab"
    id="tab-1"
    aria-selected="true"
    aria-controls="panel-1"
  >Tab 1</button>
  <button
    role="tab"
    id="tab-2"
    aria-selected="false"
    aria-controls="panel-2"
    tabindex="-1"
  >Tab 2</button>
</div>

<div
  role="tabpanel"
  id="panel-1"
  aria-labelledby="tab-1"
>Panel 1 content</div>

<div
  role="tabpanel"
  id="panel-2"
  aria-labelledby="tab-2"
  hidden
>Panel 2 content</div>
```

---

## CSS Patterns

### Focus Styles

```css
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}
```

### Skip Link

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  z-index: 100;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border-radius: 0.25rem;
}

.skip-link:focus {
  top: 1rem;
}
```

### Screen Reader Only

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Touch Targets

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

## Testing Tools

### Automated Testing

- **Lighthouse** - Chrome DevTools accessibility audit
- **axe DevTools** - Browser extension for accessibility testing
- **WAVE** - Web accessibility evaluation tool
- **Pa11y** - Command-line accessibility testing

### Manual Testing

- **Keyboard-only navigation** - Unplug your mouse
- **Screen reader** - NVDA (Windows), VoiceOver (Mac), JAWS
- **Browser zoom** - Test at 200% zoom
- **Color contrast** - WebAIM Contrast Checker
- **Heading structure** - HeadingsMap extension

### Testing Checklist

1. [ ] Run Lighthouse accessibility audit (score 90+)
2. [ ] Run axe DevTools scan (0 issues)
3. [ ] Navigate entire site with keyboard only
4. [ ] Test with screen reader (at least one)
5. [ ] Check color contrast ratios
6. [ ] Test at 200% browser zoom
7. [ ] Test on mobile device
8. [ ] Verify reduced motion support

---

## Common Issues & Fixes

### Missing Form Labels

```html
<!-- Bad -->
<input type="email" placeholder="Email" />

<!-- Good -->
<label for="email">Email</label>
<input type="email" id="email" placeholder="you@example.com" />

<!-- Also acceptable (visually hidden label) -->
<label for="email" class="sr-only">Email</label>
<input type="email" id="email" placeholder="Email" />
```

### Low Contrast

```css
/* Bad - 2.5:1 ratio */
color: #767676;
background: #ffffff;

/* Good - 4.6:1 ratio */
color: #595959;
background: #ffffff;
```

### Missing Alt Text

```html
<!-- Bad -->
<img src="team.jpg" />

<!-- Good - descriptive -->
<img src="team.jpg" alt="Our team of 5 technicians standing in front of service van" />

<!-- Good - decorative -->
<img src="decorative-line.svg" alt="" />
```

### Button vs Link

```html
<!-- Bad - link styled as button for action -->
<a href="#" onclick="doSomething()">Submit</a>

<!-- Good - button for action -->
<button type="button" onclick="doSomething()">Submit</button>

<!-- Good - link for navigation -->
<a href="/about">About Us</a>
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM](https://webaim.org/)
- [Inclusive Components](https://inclusive-components.design/)

---

*Accessibility Checklist Version: 1.0*
*Created: January 2026*
