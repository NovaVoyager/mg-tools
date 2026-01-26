# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**mg-tools** is a client-side web application toolbox providing multiple utilities. Built with React 19 and Vite 7, it includes:
- Image format converter (PNG/JPEG/WebP)
- JSON tools (editor/viewer)
- Timestamp converter
- Base64 encoder/decoder
- URL encoder/decoder
- Calculator with history

All processing happens entirely in the browser - no server uploads or external services.

## Commands

### Development
```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Production build (outputs to dist/)
npm run preview    # Preview production build locally
npm run lint       # Run ESLint on all JS/JSX files
```

## Architecture

### Application Structure

Single-page application with sidebar navigation:

```
main.jsx
  └─ ThemeProvider
      └─ App.jsx
          ├─ Sidebar (menu navigation)
          └─ renderContent() (switch-case routing)
              ├─ ImageConverter
              ├─ JSONTools
              ├─ TimestampConverter
              ├─ Base64Tool
              ├─ URLTool
              ├─ Calculator
              └─ ... (future tools)
```

**Key files:**
- `src/App.jsx` - Root component with routing logic
- `src/menu/menuConfig.js` - Menu items configuration array
- `src/menu/Sidebar.jsx` - Navigation sidebar component
- `src/theme/ThemeContext.jsx` - Theme system (dark/light modes)

### Adding New Tools

Follow this three-step pattern (used consistently across all existing tools):

**Step 1:** Create tool component in `src/contents/[tool-name]/[ToolName].jsx`
```jsx
import { useTheme } from '../../theme/ThemeContext';

export default function MyTool() {
  const { colors } = useTheme();
  // ... component logic
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Tool UI */}
    </div>
  );
}
```

**Step 2:** Add menu item to `src/menu/menuConfig.js`
```javascript
{ id: 'my-tool', icon: '🔧', label: '我的工具', active: true }
```

**Step 3:** Update routing in `src/App.jsx`
```javascript
import MyTool from './contents/my-tool/MyTool';

// In renderContent() switch statement:
case 'my-tool':
  return <MyTool />;
```

### Component Organization

```
src/
├── contents/           # Tool components (one folder per tool)
│   ├── image_converter/
│   ├── json_tools/
│   ├── timestamp/
│   ├── base64/
│   ├── url/
│   └── calculator/
├── menu/
│   ├── menuConfig.js   # Menu items array
│   └── Sidebar.jsx     # Navigation component
├── theme/
│   └── ThemeContext.jsx  # Theme system
├── App.jsx             # Main container + routing
└── main.jsx            # Entry point
```

### State Management

- No global state management library (Redux, Zustand, etc.)
- Each tool manages its own local state via `useState`
- Theme state managed via Context API (`ThemeContext`)
- Persistent data uses localStorage directly (e.g., calculator history, theme preference)

### Styling Approach

**CSS-in-JS exclusively** - all styles are inline style objects:
```jsx
<button style={{
  background: colors.gradientPrimary,
  borderRadius: '10px',
  transition: 'all 0.2s ease',
  // ... more styles
}}>
```

**Theme System:**
- Use `const { colors, isDark, toggleTheme } = useTheme()` in every component
- Colors object provides semantic tokens (textPrimary, cardBg, border, etc.)
- Supports dark (default) and light themes
- Theme preference stored in localStorage

**Common patterns:**
- Container: `maxWidth: '1200px', margin: '0 auto'`
- Cards: `background: colors.cardBg, borderRadius: '16px', border: 1px solid colors.border`
- Transitions: `transition: 'all 0.3s ease'` for theme switching
- Animations: Inline `<style>` tags with `@keyframes` (see Base64Tool for Toast example)

**No CSS files** except base resets in `index.css`

## ESLint Configuration

Uses ESLint 9 flat config (`eslint.config.js`):
- Recommended rules for React Hooks and React Refresh
- Ignores `dist/` directory
- Custom rule: allows unused vars starting with uppercase (common React pattern)

## Key Implementation Patterns

### Browser APIs Used
- **Canvas API**: Image format conversion (see `ImageConverter.jsx`)
- **FileReader API**: Reading uploaded files as Data URLs
- **Drag and Drop API**: File upload via drag-drop
- **localStorage**: Persisting theme preference and calculator history
- **navigator.clipboard**: Copy-to-clipboard functionality (with Toast feedback)

### Security Considerations
- **Calculator**: Uses `Function` constructor instead of `eval()` for expression evaluation (safer, but still validates/sanitizes input)
- **Image conversion**: Uses Data URLs instead of Blob URLs to avoid CSP restrictions
- **No server communication**: All processing happens client-side

### Common UI Patterns
- **Toast notifications**: Fixed position, auto-dismiss after 2s, slideIn animation (see `Base64Tool.jsx:395-426`)
- **Error handling**: Display errors in colored alert boxes with emoji icons
- **Loading states**: Use inline state (`isConverting`, `isProcessing`) with loading indicators
- **Hover effects**: Implement via `onMouseEnter`/`onMouseLeave` inline handlers

### Dependencies
- `dayjs`: Date/time formatting (TimestampConverter)
- `vanilla-jsoneditor`: JSON editor component (JSONTools)
- `react-json-view`: JSON viewer component (JSONTools)

No build-time dependencies beyond Vite and ESLint.

## Language and Conventions

**UI Language:** Simplified Chinese (简体中文)
- Menu labels: Chinese + emoji (e.g., `🔢 计算器`)
- All user-facing text: Chinese
- Code comments: Chinese acceptable but English preferred
- Variable/function names: English

**Naming Conventions:**
- Components: PascalCase (e.g., `Calculator.jsx`)
- Tool IDs: kebab-case (e.g., `'calculator'`, `'image-format'`)
- localStorage keys: Prefix with `'mg-tools-'` (e.g., `'mg-tools-calculator-history'`)

**Code Style:**
- Use functional components with hooks (no class components)
- Prefer `const` over `let`
- Use arrow functions for event handlers
- ESLint config allows unused vars starting with uppercase (React pattern)
