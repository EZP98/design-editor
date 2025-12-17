# @objects/editable-runtime

Runtime library for visual editing in Objects Design Editor.

## Overview

This package provides React components that enable visual editing capabilities:
- **Click to select** elements in the preview
- **Live props editing** via the parent editor
- **Two-way communication** between editor and preview

## Installation

```bash
npm install @objects/editable-runtime
```

## Usage

### In Generated Projects

Wrap your app with `EditableProvider` and use `Editable` to wrap components:

```tsx
import { EditableProvider, Editable } from '@objects/editable-runtime'
import { Hero } from './components/Hero'
import { Features } from './components/Features'

function App() {
  return (
    <EditableProvider>
      <Editable
        id="hero-section"
        component={Hero}
        props={{
          title: "Welcome",
          subtitle: "Build faster with visual editing"
        }}
      />

      <Editable
        id="features-section"
        component={Features}
        props={{
          items: [...]
        }}
      />
    </EditableProvider>
  )
}
```

### In the Editor (Parent)

Listen for messages from the preview iframe:

```tsx
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    const { type, ...data } = event.data

    switch (type) {
      case 'objects:ready':
        // Runtime is ready, enable edit mode
        iframe.contentWindow.postMessage({ type: 'objects:enable-edit-mode' }, '*')
        break

      case 'objects:selected':
        // User selected an element
        console.log('Selected:', data.id, data.props)
        break

      case 'objects:hover':
        // User hovering over element
        break
    }
  }

  window.addEventListener('message', handleMessage)
  return () => window.removeEventListener('message', handleMessage)
}, [])
```

## Message Protocol

### Parent → Iframe

| Message Type | Data | Description |
|-------------|------|-------------|
| `objects:enable-edit-mode` | - | Enable visual editing |
| `objects:disable-edit-mode` | - | Disable visual editing |
| `objects:select` | `{ id: string }` | Select an element |
| `objects:update-props` | `{ id: string, props: object }` | Update element props |
| `objects:update-style` | `{ id: string, style: object }` | Update element inline style |
| `objects:highlight` | `{ id: string \| null }` | Highlight an element |
| `objects:ping` | - | Check if runtime is ready |

### Iframe → Parent

| Message Type | Data | Description |
|-------------|------|-------------|
| `objects:ready` | `{ version: string }` | Runtime is ready |
| `objects:pong` | - | Response to ping |
| `objects:selected` | `{ id, componentName, props, rect }` | Element was selected |
| `objects:deselected` | - | Element was deselected |
| `objects:hover` | `{ id, rect }` | Hovering over element |
| `objects:props-changed` | `{ id, props }` | Props were updated |
| `objects:element-tree` | `{ tree: [] }` | Full element tree |

## Components

### `EditableProvider`

Context provider that manages edit mode and element state.

```tsx
<EditableProvider defaultEditMode={false}>
  {children}
</EditableProvider>
```

### `Editable`

Wrapper that makes a component editable.

```tsx
<Editable
  id="unique-id"
  component={MyComponent}
  props={{ title: "Hello" }}
  displayName="MyComponent" // Optional
>
  {children}
</Editable>
```

### `EditableText`

Inline editable text component.

```tsx
<EditableText
  id="heading-1"
  value="Hello World"
  as="h1"
  onChange={(newValue) => console.log(newValue)}
/>
```

### `withEditable` HOC

Higher-order component for wrapping existing components.

```tsx
const EditableButton = withEditable(Button, 'Button')

<EditableButton __editableId="btn-1" variant="primary">
  Click me
</EditableButton>
```

## How It Works

1. **Code Generation**: The editor generates React code with `Editable` wrappers
2. **Runtime Loading**: When the preview loads, `EditableProvider` initializes
3. **Ready Signal**: Runtime sends `objects:ready` to parent
4. **Edit Mode**: Parent sends `objects:enable-edit-mode`
5. **Interaction**: Clicks/hovers are captured and sent to parent
6. **Props Updates**: Parent sends new props, runtime updates components
7. **Live Preview**: Components re-render immediately with new props

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

## License

MIT
