import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { PropertyDetails } from './components/PropertyDetails';

function App() {
  return (

      <div className="App">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
        </Routes>
      </div>
  );
}

export default App;
