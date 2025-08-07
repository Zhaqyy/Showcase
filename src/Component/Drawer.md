# Drawer Component

> **Note**: This component is also documented in the [central components documentation](./README.md#drawer).

A reusable drawer component with smooth GSAP animations and gesture support, designed to replace your existing drawer and sidebar implementations.

## Features

- ✅ Smooth GSAP animations
- ✅ Gesture-based dragging (bottom position)
- ✅ Touch-friendly interactions
- ✅ Backdrop blur and overlay
- ✅ Staggered content animations
- ✅ Inertia and momentum
- ✅ Threshold-based closing
- ✅ Accessibility support
- ✅ Multiple positions (bottom, left, right)
- ✅ Customizable header and handle
- ✅ CSS custom properties support
- ✅ Dark mode support
- ✅ Reduced motion support

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Whether the drawer is currently open |
| `onClose` | `function` | - | Callback function called when drawer closes |
| `position` | `'left' \| 'right' \| 'bottom'` | `'bottom'` | Position of the drawer |
| `children` | `React.ReactNode` | - | Content to render inside the drawer |
| `title` | `string` | `'Drawer'` | Title displayed in the drawer header |
| `showHandle` | `boolean` | `true` | Whether to show the drag handle (bottom position only) |
| `showHeader` | `boolean` | `true` | Whether to show the header with title and close button |
| `className` | `string` | `''` | Additional CSS classes for the drawer |
| `style` | `object` | `{}` | Additional inline styles for the drawer |

## Basic Usage

```jsx
import Drawer from './Component/Drawer'

// Basic bottom drawer
<Drawer 
  isOpen={isDrawerOpen} 
  onClose={() => setIsDrawerOpen(false)}
  title="Menu"
>
  <div>Your content here</div>
</Drawer>
```

## Advanced Usage

```jsx
// Left sidebar drawer
<Drawer 
  isOpen={isSidebarOpen} 
  onClose={() => setIsSidebarOpen(false)}
  position="left"
  title="Navigation"
  showHandle={false}
>
  <nav>Navigation items</nav>
</Drawer>

// Right drawer without header
<Drawer 
  isOpen={isPanelOpen} 
  onClose={() => setIsPanelOpen(false)}
  position="right"
  showHeader={false}
  className="custom-drawer"
>
  <div>Panel content</div>
</Drawer>
```

## Integration with Existing UI Context

```jsx
import { useUI } from '../Context/UIContext'

const { isMobile, overviewDrawerOpen, closeOverviewDrawer } = useUI()

<Drawer 
  isOpen={isMobile && overviewDrawerOpen}
  onClose={closeOverviewDrawer}
  position="bottom"
  title="Overview"
>
  <OverviewSidebarContent />
</Drawer>
```

## Replacing Existing Drawer Logic

### Before (Complex DOM Manipulation)

```jsx
// ShowcaseSidebar.jsx - OLD APPROACH
useEffect(() => {
  if (!isMobile) return;
  const displayElement = document.querySelector(".fullscreen-showcase");
  // ... complex DOM manipulation
  const trigger = document.createElement("div");
  trigger.className = "FS-drawer-trigger";
  // ... more complex logic
}, [isMobile, showcase]);
```

### After (Simple Component)

```jsx
// ShowcaseSidebar.jsx - NEW APPROACH
<Drawer 
  isOpen={isMobile && showcaseDrawerOpen}
  onClose={closeShowcaseDrawer}
  position="bottom"
  title={showcase.title}
>
  <ShowcaseSidebarContent showcase={showcase} />
</Drawer>
```

### Before (Overview Sidebar)

```jsx
// OverviewSidebar.jsx - OLD APPROACH
<div className={`overview ${isMobile ? "mobile" : ""}`} ref={overviewRef}>
  {/* complex mobile handling */}
</div>
```

### After (Overview Sidebar)

```jsx
// OverviewSidebar.jsx - NEW APPROACH
{isMobile ? (
  <Drawer 
    isOpen={overviewDrawerOpen}
    onClose={closeOverviewDrawer}
    position="bottom"
    title="Overview"
  >
    <IdentitySection />
    <FilterManager />
    <ContactSection />
  </Drawer>
) : (
  <div className="overview" ref={overviewRef}>
    <IdentitySection />
    <FilterManager />
    <ContactSection />
  </div>
)}
```

## Benefits

- **No more manual DOM manipulation** - Everything is handled by the component
- **Consistent animations and behavior** - Same experience across all drawers
- **Better accessibility** - Proper ARIA attributes and keyboard support
- **Easier to maintain** - Single source of truth for drawer logic
- **Reusable across your app** - Use the same component everywhere
- **Works with your existing UI context** - Integrates seamlessly
- **Follows your existing patterns** - Uses your CSS custom properties and styling approach

## Styling

The component uses CSS custom properties that match your existing design system:

- `--bg-color` - Background color
- `--accent-color` - Text and accent colors

All styles are included in `Component.scss` and follow your existing SCSS patterns.

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Touch devices with gesture support
- Reduced motion support for accessibility
- Dark mode support via `prefers-color-scheme` 