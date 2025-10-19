import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { PropertyDetails } from './components/PropertyDetails';
import { FirebaseTest } from './components/FirebaseTest';
import { PriceDebug } from './components/PriceDebug';
import { Property } from './types';

function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [showPriceDebug, setShowPriceDebug] = useState(false);

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
      ) : showPriceDebug ? (
        <div>
          <button 
            onClick={() => setShowPriceDebug(false)}
            className="m-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to App
          </button>
          <PriceDebug />
        </div>
      ) : (
        <div>
          <div className="flex gap-2 m-4">
            <button 
              onClick={() => setShowTest(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              🔥 Test Firebase Connection
            </button>
            <button 
              onClick={() => setShowPriceDebug(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              💰 Debug Prices
            </button>
          </div>
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
