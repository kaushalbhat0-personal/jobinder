# JOBinder Design System

## Overview

Mobile-first design system built on Tailwind CSS v4 with Radix UI primitives. Maximum content width: 430px.

## Design Tokens

### Colors

| Token                  | Usage                                 |
| ---------------------- | ------------------------------------- |
| `primary-{50-900}`     | Brand actions, links, active states   |
| `secondary-{50-900}`   | Subtle backgrounds, secondary actions |
| `neutral-{0-1000}`     | Text, backgrounds, borders            |
| `success-{50,100,500}` | Positive feedback                     |
| `warning-{50,100,500}` | Caution states                        |
| `danger-{50,100,500}`  | Errors, destructive actions           |
| `info-{50,100,500}`    | Informational states                  |
| `swipe-like`           | Like action (green)                   |
| `swipe-pass`           | Pass action (red)                     |
| `swipe-super`          | Super like action (blue)              |

### Typography

| Token        | Size     | Weight         | Usage                |
| ------------ | -------- | -------------- | -------------------- |
| `display-lg` | 3rem     | 700            | Hero sections        |
| `display-md` | 2.25rem  | 700            | Page titles          |
| `heading-lg` | 1.875rem | 600            | Section headers      |
| `heading-md` | 1.5rem   | 600            | Card titles          |
| `heading-sm` | 1.25rem  | 600            | Subsection titles    |
| `body-lg`    | 1.125rem | 400            | Large body text      |
| `body-md`    | 1rem     | 400            | Default body text    |
| `body-sm`    | 0.875rem | 400            | Small body text      |
| `caption`    | 0.75rem  | 400            | Captions, timestamps |
| `label`      | 0.75rem  | 600, uppercase | Form labels, badges  |

### Spacing

Uses a 4px base unit: `{0:0, 0.5:2px, 1:4px, 2:8px, 3:12px, 4:16px, 5:20px, 6:24px, 8:32px, 10:40px, 12:48px, 16:64px, 20:80px, 24:96px}`

### Radius

| Token  | Value  |
| ------ | ------ |
| `sm`   | 4px    |
| `md`   | 8px    |
| `lg`   | 12px   |
| `xl`   | 16px   |
| `2xl`  | 24px   |
| `full` | 9999px |

### Shadows

Light and dark mode variants. `sm`, `md`, `lg`, `xl`, `2xl`, `inner`, `none`.

### Z-Index

| Layer    | Value |
| -------- | ----- |
| base     | 0     |
| dropdown | 100   |
| sticky   | 200   |
| drawer   | 300   |
| modal    | 400   |
| toast    | 500   |
| tooltip  | 600   |

### Motion

Durations: instant(0ms), fast(150ms), normal(250ms), slow(350ms), slower(500ms). Easing: linear, easeIn, easeOut, easeInOut, spring.

## Theme System

- `ThemeProvider` wraps the app
- Persists selection to localStorage
- Detects system preference via `prefers-color-scheme`
- Toggles `.dark` class on `<html>`
- `useTheme()` hook returns `{ theme, setTheme, toggleTheme, isDark }`

## Components

### Atoms

#### Button

- **Purpose**: Primary call-to-action element
- **Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`
- **Sizes**: `sm`, `md`, `lg`
- **Props**: `loading`, `icon`, `fullWidth`, `asChild` (Radix Slot)
- **Accessibility**: Focus ring, disabled state, role="status" when loading
- **Usage**: `<Button variant="primary" size="md" loading={isLoading}>Submit</Button>`

#### Input

- **Purpose**: Text input field
- **Props**: `hasError`
- **Accessibility**: Associated with Label, focus ring, error border
- **Usage**: `<Input hasError={!!error} placeholder="Email" />`

#### Textarea

- **Purpose**: Multi-line text input
- **Props**: `hasError`
- **Accessibility**: Same pattern as Input, resize-y
- **Usage**: `<Textarea placeholder="Description" rows={4} />`

#### Label

- **Purpose**: Form label with optional required indicator
- **Props**: `required` (shows \*), standard `htmlFor`
- **Usage**: `<Label required>Email</Label>`

#### Badge

- **Purpose**: Status indicator, tag, count
- **Variants**: `default`, `success`, `warning`, `danger`, `info`
- **Sizes**: `sm`, `md`
- **Usage**: `<Badge variant="success">Active</Badge>`

#### Avatar

- **Purpose**: User profile image or initials fallback
- **Sizes**: `sm`, `md`, `lg`, `xl`
- **Props**: `src`, `alt`, `fallback` (initials override)
- **Usage**: `<Avatar src="/photo.jpg" alt="User Name" />`

#### Spinner

- **Purpose**: Loading indicator
- **Sizes**: `sm`, `md`, `lg`
- **Accessibility**: `role="status"`, `aria-label`, sr-only text
- **Usage**: `<Spinner size="lg" />`

#### Text

- **Purpose**: Body text with variant presets
- **Variants**: `body-lg`, `body-md`, `body-sm`, `caption`, `label`
- **Props**: `as` (p/span/div/label)
- **Usage**: `<Text variant="caption">Posted 2h ago</Text>`

#### Heading

- **Purpose**: Section headings with semantic HTML
- **Variants**: `display-lg`, `display-md`, `heading-lg`, `heading-md`, `heading-sm`
- **Props**: `as` (h1-h5)
- **Usage**: `<Heading variant="heading-lg">Dashboard</Heading>`

#### Divider

- **Purpose**: Visual separator
- **Orientation**: `horizontal`, `vertical`
- **Accessibility**: `role="separator"`, `aria-orientation`
- **Usage**: `<Divider />`

### Molecules

#### Card

- **Purpose**: Content container with sections
- **Sections**: `Card`, `CardHeader`, `CardBody`, `CardFooter`
- **Usage**:
  ```
  <Card>
    <CardHeader>Title</CardHeader>
    <CardBody>Content</CardBody>
    <CardFooter>Actions</CardFooter>
  </Card>
  ```

#### FormField

- **Purpose**: Form field wrapper with label, hint, error
- **Props**: `label`, `required`, `error`, `hint`
- **Accessibility**: Error uses `role="alert"`
- **Usage**: `<FormField label="Name" error="Required"><Input /></FormField>`

#### SearchInput

- **Purpose**: Search field with icon and clear button
- **Props**: `onClear`
- **Accessibility**: `type="search"`, clear button has `aria-label`
- **Usage**: `<SearchInput value={q} onChange={handleChange} onClear={handleClear} />`

#### Dialog

- **Purpose**: Modal dialog for confirmations, forms
- **Props**: `open`, `onOpenChange`, `title`, `description`
- **Accessibility**: Radix Dialog (focus trap, ESC to close, aria attributes)
- **Usage**: `<Dialog open={isOpen} onOpenChange={setIsOpen} title="Confirm">...</Dialog>`

#### Drawer

- **Purpose**: Slide-in panel (bottom/left/right)
- **Side**: `bottom` (default), `left`, `right`
- **Accessibility**: Focus trap, ESC to close
- **Usage**: `<Drawer open={isOpen} onOpenChange={setIsOpen} title="Filters" side="bottom">...</Drawer>`

#### Dropdown

- **Purpose**: Context menu, action list
- **Props**: `trigger`, `align`
- **Sub-components**: `DropdownItem` with `onSelect`, `disabled`
- **Accessibility**: Radix DropdownMenu, keyboard navigation
- **Usage**:
  ```
  <Dropdown trigger={<Button>Menu</Button>}>
    <DropdownItem onSelect={handleEdit}>Edit</DropdownItem>
    <DropdownItem onSelect={handleDelete}>Delete</DropdownItem>
  </Dropdown>
  ```

#### Tabs

- **Purpose**: Tabbed content switching
- **Sub-components**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Accessibility**: Radix Tabs, keyboard navigation (arrow keys)
- **Usage**:
  ```
  <Tabs value={tab} onValueChange={setTab}>
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Content 1</TabsContent>
    <TabsContent value="tab2">Content 2</TabsContent>
  </Tabs>
  ```

#### Toast

- **Purpose**: Non-blocking notifications
- **Props**: `title`, `description`, `variant` (default/success/warning/danger)
- **Accessibility**: Radix Toast, `role="status"`
- **Usage**:
  ```
  const { toast } = useToast();
  toast({ title: 'Saved', variant: 'success' });
  ```

### Organisms

#### PageHeader

- **Purpose**: Page title bar with optional action
- **Props**: `title`, `description`, `action`, `backButton`
- **Usage**: `<PageHeader title="Profile" description="Manage your profile" action={<Button>Edit</Button>} />`

#### BottomNavigation

- **Purpose**: Mobile bottom tab bar
- **Props**: `items` (NavItem[]), `onValueChange`
- **Accessibility**: `role="navigation"`, `aria-current="page"`
- **Usage**:
  ```
  <BottomNavigation
    items={[
      { value: 'home', label: 'Home', icon: <HomeIcon />, active: true },
      { value: 'search', label: 'Search', icon: <SearchIcon /> },
    ]}
    onValueChange={(v) => setPage(v)}
  />
  ```

#### EmptyState

- **Purpose**: Placeholder for empty lists
- **Props**: `icon`, `title`, `description`, `action`
- **Usage**: `<EmptyState title="No jobs" description="Try adjusting filters" action={<Button>Reset</Button>} />`

#### LoadingState

- **Purpose**: Full or partial loading indicator
- **Props**: `message`, `fullPage`
- **Usage**: `<LoadingState message="Loading feed..." />`

#### SwipeStack

- **Purpose**: Tinder-style card stack (UI only, no business logic)
- **Props**: `cards` (SwipeCard[]), `onSwipe`, `onEmpty`
- **Accessibility**: Touch + mouse drag, aria labels
- **Usage**:
  ```
  <SwipeStack
    cards={[{ id: '1', content: <JobCard /> }]}
    onSwipe={(id, dir) => handleSwipe(id, dir)}
  />
  ```

## Accessibility

All components:

- Semantic HTML elements
- ARIA attributes where appropriate
- Focus-visible ring for keyboard navigation
- Screen reader support
- Color contrast compliant
- Reduced motion respected

## Mobile First

- All components default to mobile width
- Maximum content width: 430px
- Touch targets minimum 44x44px
- Bottom navigation for mobile patterns
- SwipeStack supports touch + mouse

## Rules

1. No direct Tailwind classes in business components for repeated patterns
2. All new components must answer: "Can this become shared?"
3. Pure presentational → shared/ui. Business logic → domain components.
4. Every component must be typed, tested, and accessible.
