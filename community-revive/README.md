# Community Revive

A web application that maps derelict properties and evaluates their potential value to the community if refurbished. Built for the Google Hackathon 2025.

## Features

- **Interactive Map**: Mapbox-powered map showing properties with color-coded community value scores
- **Property Discovery**: Filter and explore properties by various community impact criteria
- **Detailed Property Views**: Comprehensive property details with impact analysis and community voice
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Modern UI**: Built with Radix UI components and Tailwind CSS

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS
- **Mapping**: Google Maps JavaScript API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Google Cloud Platform account and Maps API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd community-revive
```

2. Install dependencies:
```bash
npm install
```

3. Set up Google Maps:
   - Create a Google Cloud Platform account at https://cloud.google.com
   - Enable the Maps JavaScript API
   - Create an API key in the Google Cloud Console
   - Create a `.env.local` file in the root directory:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Dashboard.tsx   # Main dashboard view
│   ├── GoogleMap.tsx   # Google Maps integration
│   ├── PropertyCard.tsx # Property list item
│   ├── PropertyDetails.tsx # Property detail view
│   └── MobileDrawer.tsx # Mobile navigation
├── data/               # Mock data and utilities
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## Key Features

### Dashboard (Opportunity Map)
- Split-screen layout with Google Maps and property list
- Color-coded markers based on community value score
- Interactive property selection with hover effects
- Filtering by community impact criteria
- Mobile-responsive drawer interface

### Property Details (Impact Story)
- Comprehensive property information
- Community impact analysis with progress bars
- Neighborhood metrics visualization
- Community voice testimonials
- Call-to-action for impact reports

### Community Value Scoring
Properties are scored based on:
- Neighborhood renewal potential
- Proximity to schools, parks, and transit
- Historic district designation
- Youth impact potential
- Green space opportunities

## Mock Data

The application includes comprehensive mock data for 5 properties in Detroit, MI, each with:
- Detailed property information
- Community impact metrics
- Potential use cases
- Community testimonials
- Impact stories

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Customization

- **Colors**: Modify the color palette in `tailwind.config.js`
- **Mock Data**: Update `src/data/mockData.ts` with your own property data
- **Map Style**: Change the Google Maps style in `src/components/GoogleMap.tsx`
- **Components**: All components are modular and can be easily customized

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is created for the Google Hackathon 2025.