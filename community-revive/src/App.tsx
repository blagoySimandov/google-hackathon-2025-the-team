import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { PropertyDetails } from './components/PropertyDetails';
import { Property } from './types';

function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleBackToMap = () => {
    setSelectedProperty(null);
  };

  return (
    <div className="App">
      {selectedProperty ? (
        <PropertyDetails
          property={selectedProperty}
          onBack={handleBackToMap}
        />
      ) : (
        <Dashboard onPropertySelect={handlePropertySelect} />
      )}
    </div>
  );
}

export default App;
