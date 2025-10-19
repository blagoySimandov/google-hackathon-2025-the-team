import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { PropertyDetails } from './components/PropertyDetails';
import { FirebaseTest } from './components/FirebaseTest';
import { Property } from './types';

function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showTest, setShowTest] = useState(false);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleBackToMap = () => {
    setSelectedProperty(null);
  };

  return (
    <div className="App">
      {showTest ? (
        <div>
          <button 
            onClick={() => setShowTest(false)}
            className="m-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to App
          </button>
          <FirebaseTest />
        </div>
      ) : (
        <div>
          <button 
            onClick={() => setShowTest(true)}
            className="m-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🔥 Test Firebase Connection
          </button>
          {selectedProperty ? (
            <PropertyDetails
              property={selectedProperty}
              onBack={handleBackToMap}
            />
          ) : (
            <Dashboard onPropertySelect={handlePropertySelect} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
