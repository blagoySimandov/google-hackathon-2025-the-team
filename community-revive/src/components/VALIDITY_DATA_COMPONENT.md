# ValidityDataDisplay Component

A comprehensive UI component for displaying detailed property validity data including scores, investment analysis, renovation details, and amenities.

## Features

### 📊 Comprehensive Data Display
- **Property Information**: Address, rank, location coordinates, and original listing link
- **Price Analysis**: Listed price vs market average with visual comparison
- **Property Details**: Floor area, BER rating, and air quality information
- **Image Gallery**: Interactive photo carousel with thumbnails
- **Scores Dashboard**: Visual representation of all property scores with color coding
- **Nearby Amenities**: Categorized list of nearby facilities with distances
- **Investment Analysis**: Detailed financial breakdown including ROI, grants, and costs
- **Renovation Details**: Itemized renovation requirements with costs and materials

### 🎨 Modern UI Design
- Clean, professional interface using Tailwind CSS
- Responsive grid layouts for all screen sizes
- Color-coded metrics for quick visual assessment
- Expandable/collapsible sections for better organization
- Loading and error states with clear messaging
- Interactive image gallery with thumbnail navigation

### 🔧 Component Architecture

#### Main Component: `ValidityDataDisplay`
```tsx
import { ValidityDataDisplay } from './components/ValidityDataDisplay';

function MyComponent() {
  return <ValidityDataDisplay propertyId="12345" />;
}
```

**Props:**
- `propertyId` (string, required): The ID of the property to fetch and display

**States:**
- Loading: Shows animated spinner with message
- Error: Displays error message with icon
- No Data: Shows friendly "no data found" message
- Success: Renders full validity data UI

## Usage Examples

### Basic Usage
```tsx
import { ValidityDataDisplay } from '@/components/ValidityDataDisplay';

function PropertyPage() {
  const propertyId = "12345";
  return <ValidityDataDisplay propertyId={propertyId} />;
}
```

### With Router Params
```tsx
import { useParams } from 'react-router-dom';
import { ValidityDataDisplay } from '@/components/ValidityDataDisplay';

function PropertyDetailsRoute() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) return <div>Property ID required</div>;
  
  return <ValidityDataDisplay propertyId={id} />;
}
```

### Conditional Rendering
```tsx
import { ValidityDataDisplay } from '@/components/ValidityDataDisplay';

function ConditionalDisplay({ showData, propertyId }: Props) {
  if (!showData || !propertyId) {
    return <div>Data not available</div>;
  }
  
  return <ValidityDataDisplay propertyId={propertyId} />;
}
```

## Data Sections

### 1. Header Section
- Property rank badge
- Link to original listing
- Address and coordinates
- Three key metric cards:
  - Listed Price
  - Market Average Price
  - Price Difference (color-coded)

### 2. Property Details Card
Displays:
- Floor area (m²) with ruler icon
- BER energy rating with lightning icon
- Air quality index and category with wind icon

### 3. Image Gallery
- Large main image display
- Image counter overlay
- Thumbnail grid for quick navigation
- Error handling for broken images

### 4. Property Scores Card
Displays all scores from the `PropertyScores` interface:
- Overall Score
- Viability Score
- Validity Score
- Price Attractiveness Score
- Renovation Cost Score
- Sustainability Score
- Amenity Score
- Community Score
- Community Value Score
- Community Access Score
- Community Cluster Score

Each score is color-coded:
- 🟢 Green (80+): Excellent
- 🟡 Yellow (60-79): Good
- 🟠 Orange (40-59): Fair
- 🔴 Red (0-39): Poor

### 5. Nearby Amenities (Expandable)
- Smart icon assignment based on amenity type
- Distance in kilometers
- Organized in responsive grid
- Categories: Parks, Shops, Schools, Hospitals, Gyms, etc.

### 6. Investment Analysis (Expandable)
Comprehensive financial breakdown:
- Total Project Cost
- Net Project Cost (after grants)
- Estimated After Repair Value (ARV)
- Potential Profit
- Return on Investment (ROI %)
- Estimated Labour Cost

**Potential Grants Section:**
- Grant name and amount
- Eligibility reason
- Green-themed styling for easy identification

### 7. Renovation Details (Expandable)
- Total renovation cost banner
- Itemized list of renovation items:
  - Item name and description
  - Reason for renovation
  - Cost breakdown
  - Material specifications
  - Amount/quantity

## Color Scheme

The component uses a consistent color palette:
- **Primary Blue**: Key information, links
- **Green**: Positive indicators, grants, good scores
- **Red**: Negative indicators, poor scores
- **Purple**: Property details, ARV
- **Amber**: Profit, warnings
- **Orange**: Renovation costs
- **Gray**: Neutral information

## Dependencies

- React
- `@/api`: Custom API hooks (useGetValidityData)
- `@/api/firestore/types`: TypeScript interfaces
- `@/components/ui/Card`: Card component primitives
- `@/utils/scoreUtils`: getScoreColor utility
- `lucide-react`: Icon components
- Tailwind CSS: Styling

## API Integration

The component uses the `useGetValidityData` hook which:
- Fetches data from Firestore
- Returns loading, error, and data states
- Implements caching and retry logic
- Type-safe with TypeScript

## Performance Considerations

- Images are lazy-loaded
- Sections are expandable/collapsible to reduce initial render
- React Query caching prevents unnecessary refetches
- Error boundaries handle broken images gracefully

## Accessibility

- Semantic HTML structure
- ARIA-friendly interactive elements
- Keyboard navigation support
- Screen reader compatible
- High contrast text for readability

## Responsive Design

Breakpoints:
- **Mobile** (< 768px): Single column layout, stacked cards
- **Tablet** (768px - 1024px): 2-column grids
- **Desktop** (> 1024px): 3-4 column grids for optimal space usage

## Future Enhancements

Potential improvements:
1. Export to PDF functionality
2. Share/bookmark feature
3. Comparison with other properties
4. Historical data visualization
5. Interactive map for amenities
6. Print-friendly styling
7. Dark mode support
8. Animation on section expansion

## Troubleshooting

### Component not loading data
- Verify `propertyId` is valid and exists in Firestore
- Check network connectivity
- Ensure Firebase configuration is correct

### Images not displaying
- Check image URLs are valid
- Verify CORS settings for image sources
- Fallback placeholder is provided automatically

### Styling issues
- Ensure Tailwind CSS is properly configured
- Verify all dependencies are installed
- Check for conflicting CSS

## Contributing

When modifying this component:
1. Maintain TypeScript type safety
2. Follow existing naming conventions
3. Update this documentation
4. Test all responsive breakpoints
5. Ensure accessibility standards are met

