# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**mg-tools** is a client-side web application toolbox for media conversion. Built with React 19 and Vite 7, it currently features an image format converter with plans to expand to other media manipulation tools.

All processing happens entirely in the browser using Canvas API - no server uploads or external services.

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

This is a single-page application with a sidebar navigation pattern:

- **Main container** (`ImageConverter.jsx`): Contains both the sidebar menu and the main content area
- **Sidebar menu**: Lists all available tools (only "图片格式转换" is active, others marked as "即将推出"/coming soon)
- **Content area**: Renders the currently active tool

The app is designed to grow with additional tools, but currently everything lives in `ImageConverter.jsx`.

### Image Conversion Flow

1. **File input**: Drag-drop or file picker → validates image type
2. **Preview display**: Reads file via FileReader → displays as base64 Data URL
3. **Format selection**: User chooses PNG/JPEG/WebP + quality (for lossy formats)
4. **Conversion**:
   - Draws image to canvas
   - For JPEG: fills white background first (no transparency support)
   - Exports via `canvas.toDataURL()` as base64 Data URL
5. **Download**: Creates temporary `<a>` element with Data URL and triggers download

**Important**: Uses Data URLs instead of Blob URLs to avoid CSP (Content Security Policy) restrictions. File size is calculated from base64 string length.

### Component Organization

- `src/main.jsx` - React app entry point with StrictMode
- `src/App.jsx` - Root component that renders `ImageConverter`
- `src/ImageConverter.jsx` - Entire UI and business logic (754 lines)
  - Menu system with feature flags (lines 3-10)
  - File handling with drag-drop support
  - Canvas-based image conversion
  - Preview comparison (original vs converted)
  - All styling is inline (CSS-in-JS pattern)

### State Management

All state is local React state using `useState` hooks in `ImageConverter.jsx`:
- `activeMenu` - currently selected tool
- `image/preview` - original image data
- `outputFormat/quality` - conversion settings
- `convertedBlob/convertedPreview` - result data
- `originalInfo/convertedSize` - file metadata
- `isDragging/isConverting` - UI states

### Styling Approach

The app uses **inline styles exclusively** with a dark theme:
- CSS-in-JS pattern (style objects in JSX)
- Gradient backgrounds (purple/indigo color scheme)
- Custom CSS animations via `<style>` tag for spinner and range slider
- No external CSS files except `index.css` and `App.css`

## ESLint Configuration

Uses ESLint 9 flat config (`eslint.config.js`):
- Recommended rules for React Hooks and React Refresh
- Ignores `dist/` directory
- Custom rule: allows unused vars starting with uppercase (common React pattern)

## Browser APIs Used

- **Canvas API**: Image format conversion and rendering
- **FileReader API**: Reading uploaded files as Data URLs
- **Drag and Drop API**: File upload via drag-drop
- **Blob/Data URL**: File download mechanism

## Language Notes

The UI is in **Chinese** (Simplified). When adding features:
- Menu labels use Chinese with emoji icons
- Button text and messages are Chinese
- Keep naming consistent with existing pattern
