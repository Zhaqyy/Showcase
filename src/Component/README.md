# Reusable Components Documentation

This document provides comprehensive documentation for all reusable components in the project. These components are designed to be easily portable to other projects.

## Table of Contents

- [Drawer](#drawer)
- [Accordion](#accordion)
- [Icon](#icon)
- [QuickNav](#quicknav)
- [Logo](#logo)
- [Header](#header)
- [Filter](#filter)

---

## Drawer

A reusable drawer component with smooth GSAP animations and gesture support.

### Features
- ✅ Smooth GSAP animations
- ✅ Gesture-based dragging (bottom position)
- ✅ Touch-friendly interactions with proper scroll handling
- ✅ Backdrop blur and overlay
- ✅ Staggered content animations
- ✅ Inertia and momentum
- ✅ Threshold-based closing
- ✅ Accessibility support
- ✅ Multiple positions (bottom, left, right)
- ✅ Customizable header and handle

### Props

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

### Usage

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
```

### Dependencies
- `gsap` - For animations
- `gsap/Draggable` - For drag functionality

---

## Accordion

A flexible accordion component with multiple variants and GSAP animations.

### Features
- ✅ Multiple variants (default, sidebar, minimal)
- ✅ GSAP-powered smooth animations
- ✅ Keyboard navigation support
- ✅ Customizable styling
- ✅ Responsive design
- ✅ Accessibility features

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Array of accordion items |
| `variant` | `'default' \| 'sidebar' \| 'minimal'` | `'default'` | Visual variant |
| `className` | `string` | `''` | Additional CSS classes |
| `onItemToggle` | `function` | - | Callback when item toggles |

### Usage

```jsx
import Accordion from './Component/Accordion'

const items = [
  {
    heading: 'Section 1',
    description: 'Content for section 1'
  },
  {
    heading: 'Section 2', 
    description: 'Content for section 2'
  }
]

<Accordion 
  items={items}
  variant="sidebar"
  onItemToggle={(index, isOpen) => console.log(`Item ${index} is ${isOpen ? 'open' : 'closed'}`)}
/>
```

### Dependencies
- `gsap` - For animations

---

## Icon

A reusable icon component that renders SVG icons.

### Features
- ✅ SVG-based icons
- ✅ Customizable size and color
- ✅ Consistent styling
- ✅ Accessibility support

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Name of the icon to render |
| `size` | `number` | `24` | Size in pixels |
| `color` | `string` | `'currentColor'` | Color of the icon |
| `className` | `string` | `''` | Additional CSS classes |

### Usage

```jsx
import Icon from './Component/icon'

<Icon name="menu" size={24} color="#333" />
<Icon name="close" size={20} />
```

---

## QuickNav

A quick navigation component for showcase projects.

### Features
- ✅ Keyboard navigation
- ✅ Touch/swipe support
- ✅ Smooth transitions
- ✅ Responsive design

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Navigation items |
| `currentIndex` | `number` | - | Currently active item |
| `onNavigate` | `function` | - | Navigation callback |
| `className` | `string` | `''` | Additional CSS classes |

### Usage

```jsx
import QuickNav from './Component/QuickNav'

const items = [
  { id: 1, title: 'Project 1' },
  { id: 2, title: 'Project 2' }
]

<QuickNav 
  items={items}
  currentIndex={0}
  onNavigate={(index) => setCurrentIndex(index)}
/>
```

---

## Logo

A logo component with animation support.

### Features
- ✅ SVG-based logo
- ✅ Animation support
- ✅ Responsive sizing
- ✅ Customizable colors

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes |
| `animated` | `boolean` | `false` | Whether to enable animations |

### Usage

```jsx
import Logo from './Component/Logo'

<Logo animated={true} />
<Logo className="header-logo" />
```

---

## Header

A header component with menu functionality.

### Features
- ✅ Responsive design
- ✅ Menu toggle functionality
- ✅ Logo integration
- ✅ Customizable content

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onMenuToggle` | `function` | - | Menu toggle callback |
| `isMenuOpen` | `boolean` | `false` | Menu open state |
| `children` | `React.ReactNode` | - | Header content |

### Usage

```jsx
import Header from './Component/Header'

<Header 
  onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
  isMenuOpen={isMenuOpen}
>
  <Logo />
</Header>
```

---

## Filter

A filter component for showcase projects.

### Features
- ✅ Multiple filter types
- ✅ Search functionality
- ✅ Tag-based filtering
- ✅ Responsive design

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filters` | `Array` | - | Available filters |
| `activeFilters` | `Array` | `[]` | Currently active filters |
| `onFilterChange` | `function` | - | Filter change callback |
| `searchQuery` | `string` | `''` | Search query |
| `onSearchChange` | `function` | - | Search change callback |

### Usage

```jsx
import Filter from './Component/Filter'

const filters = [
  { id: 'tech', label: 'Technology', options: ['React', 'Vue', 'Angular'] },
  { id: 'type', label: 'Type', options: ['Web', 'Mobile', 'Desktop'] }
]

<Filter 
  filters={filters}
  activeFilters={activeFilters}
  onFilterChange={setActiveFilters}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
/>
```

---

## Styling

All components use CSS custom properties for theming:

```css
:root {
  --bg-color: #162114;
  --accent-color: #f1ccba;
  --light-green: #294122;
  --border: rgba(255, 255, 255, 0.1);
}
```

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Touch devices with gesture support
- Reduced motion support for accessibility
- Dark mode support via `prefers-color-scheme`

## Installation

To use these components in another project:

1. Copy the component files from `src/Component/`
2. Copy the relevant styles from `src/Style/Component.scss`
3. Install required dependencies:
   ```bash
   npm install gsap
   ```
4. Update CSS custom properties to match your design system

## Contributing

When adding new reusable components:

1. Add comprehensive JSDoc documentation
2. Include usage examples
3. Add to this README
4. Ensure accessibility compliance
5. Test across different devices and browsers 