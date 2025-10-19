# Google Maps API Migration Note

## Current Status: Functional with Deprecation Warning

### Background
As of February 21st, 2024, Google has deprecated `google.maps.Marker` in favor of `google.maps.marker.AdvancedMarkerElement`.

### Current Implementation
We are currently using the deprecated `google.maps.Marker` API because:

1. **Stable and Functional**: The deprecated API continues to work perfectly
2. **No Discontinuation Planned**: Google has committed to:
   - Continue bug fixes for major regressions
   - Provide at least 12 months notice before any discontinuation
   - No current discontinuation date set

3. **Complex Migration**: Moving to AdvancedMarkerElement requires:
   - Complete rewrite of marker creation (DOM-based instead of icon-based)
   - Updates to MarkerClusterer integration
   - Different event handling patterns
   - Testing all interactions (hover, click, highlighting)

### Map Features Currently Working
✅ Custom colored markers based on community value score (448 properties)
✅ Hover tooltips with property information
✅ Click to view property details
✅ "See on map" highlighting with bounce animation
✅ Smooth performance with all markers visible
✅ 12 filter options for targeted property discovery

Note: Marker clustering is currently disabled due to compatibility issues with the deprecated Marker API.
It will be re-implemented when migrating to AdvancedMarkerElement.

### Future Migration Path
When Google provides more information about discontinuation (if ever), we can migrate:

```typescript
// Current approach (deprecated but functional)
const marker = new google.maps.Marker({
  position: { lat, lng },
  icon: { path, scale, fillColor, ... }
});

// Future approach (AdvancedMarkerElement)
const content = document.createElement('div');
content.className = 'custom-marker';
const marker = new google.maps.marker.AdvancedMarkerElement({
  position: { lat, lng },
  content: content
});
```

### Required Changes for Migration
1. **Add mapId to map initialization** (and migrate styles to Cloud Console)
   - mapId is required for AdvancedMarkerElement
   - Inline styles cannot be used with mapId
   - Styles must be configured in Google Cloud Console
2. Replace all `new google.maps.Marker()` with `new AdvancedMarkerElement()`
3. Create DOM elements for custom marker styling
4. Update MarkerClusterer to work with Advanced Markers
5. Test all interactions and animations
6. Update CSS for marker styling

### Why We're NOT Using mapId Currently
- mapId requires styles to be set in Google Cloud Console (not inline)
- We have custom inline styles for the map appearance
- Classic Markers work perfectly without mapId
- When we migrate to AdvancedMarkerElement, we'll need to:
  - Add mapId
  - Move styles to Cloud Console OR remove inline styles

### Resources
- [Google Maps Deprecations](https://developers.google.com/maps/deprecations)
- [Advanced Markers Migration Guide](https://developers.google.com/maps/documentation/javascript/advanced-markers/migration)
- [MarkerClusterer Documentation](https://github.com/googlemaps/js-markerclusterer)

### Recommendation
**Action**: Monitor Google's announcements. Migrate when:
- Google sets a discontinuation date, OR
- We need features only available in AdvancedMarkerElement, OR
- The deprecation warning becomes disruptive

Until then, the current implementation is the most stable and maintainable approach.

