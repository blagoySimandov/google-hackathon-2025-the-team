# Image Popup Viewer Guide

## Overview

The `PhotoCarousel` component in PropertyDetails now includes a full-featured popup image viewer powered by PhotoSwipe. Users can view images in fullscreen with zoom, pan, and navigation capabilities.

## Features Added

### 1. **Click to View Fullscreen**
- Click on any main image to open it in a fullscreen popup viewer
- Enhanced visual feedback with:
  - `cursor-zoom-in` cursor on hover
  - Overlay with zoom icon and "Click to view full size" text
  - Smooth scale-up animation on hover
  - Darker overlay (30% opacity) to indicate clickability

### 2. **Double-Click Thumbnails**
- Single click on thumbnail: Preview the image in the main carousel
- Double click on thumbnail: Open that specific image directly in fullscreen
- Mini zoom icons appear on thumbnail hover

### 3. **Fullscreen Viewer Controls**

Once in fullscreen mode, users can:

#### Navigation
- **Arrow Keys**: Navigate between images (← →)
- **Mouse Click**: Navigate using on-screen arrow buttons
- **Swipe**: Swipe on touch devices

#### Zoom & Pan
- **Mouse Wheel**: Zoom in/out
- **Pinch**: Pinch to zoom on touch devices
- **Double Click**: Quick zoom to 2x
- **Drag**: Pan around when zoomed in

#### Exit
- **Escape Key**: Close the viewer
- **Click Close Button**: Top-right X button
- **Vertical Drag**: Drag image down to close (mobile-friendly)
- **Click Outside**: Click on the dark background

### 4. **Visual Enhancements**

#### Main Image
- Larger zoom icon (8x8)
- Clearer "Click to view full size" text label
- Better contrast with bg-opacity-70 on image counter
- Focus ring for keyboard accessibility

#### Thumbnails
- Hover effect with scale and zoom icon
- Clear border states (blue for active, hover for others)
- Tooltip hints: "Click to preview - Double click to view full size"

## Technical Implementation

### PhotoSwipe Configuration
```typescript
{
  dataSource: images,  // Array of image objects
  index: currentIndex, // Start at specific image
  bgOpacity: 0.95,     // Nearly opaque background
  zoom: true,          // Enable zoom functionality
  closeOnScroll: false, // Don't close on scroll (better UX)
  trapFocus: true,     // Better accessibility
}
```

### Keyboard Shortcuts
- `Escape`: Close viewer
- `←` / `→`: Navigate between images
- `+` / `-`: Zoom in/out (PhotoSwipe default)

### Accessibility Features
- Semantic button elements
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Descriptive titles and alt text

## Usage in PropertyDetails

The PropertyDetails component automatically includes this functionality:

```tsx
import { PhotoCarousel } from './PhotoCarousel';

// In PropertyDetails:
<PhotoCarousel images={carouselImages} />
```

No additional configuration needed - the popup viewer is built-in!

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Touch devices (tablets, phones)
- ✅ Keyboard navigation
- ✅ Screen readers

## Image Requirements

For best results, images should:
- Have `width` and `height` properties (defaults to 1440x960)
- Be in a web-friendly format (JPEG, PNG, WebP)
- Have descriptive `alt` text for accessibility
- Be reasonably sized (PhotoSwipe handles large images well)

## Example Image Format

```typescript
{
  src: "https://example.com/property-image.jpg",
  alt: "Living room with fireplace",
  width: 1440,
  height: 960
}
```

## Performance Notes

- PhotoSwipe lazy-loads images for better performance
- Only the current and adjacent images are preloaded
- Smooth animations with hardware acceleration
- Efficient memory management

## Customization Options

If you need to customize the viewer, you can modify these options in `PhotoCarousel.tsx`:

- `bgOpacity`: Background darkness (0-1)
- `closeOnScroll`: Whether scrolling closes the viewer
- `closeOnVerticalDrag`: Enable/disable drag-to-close
- `zoom`: Enable/disable zoom functionality

## Common Issues & Solutions

### Issue: Images not loading in fullscreen
**Solution**: Ensure image URLs are accessible and CORS-enabled

### Issue: Viewer doesn't open
**Solution**: Check browser console for PhotoSwipe errors, ensure library is installed

### Issue: Low quality in fullscreen
**Solution**: Provide higher resolution images (1440x960 or larger recommended)

### Issue: Slow performance
**Solution**: Optimize image file sizes, use WebP format, enable CDN

## Future Enhancements

Potential improvements:
- [ ] Download image button
- [ ] Share functionality  
- [ ] Image info overlay (resolution, size)
- [ ] Slideshow mode with auto-advance
- [ ] Custom zoom levels
- [ ] Image comparison slider
- [ ] Rotation controls

