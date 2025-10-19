import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const FirebaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔥 Starting Firebase connection test...');
      
      // Test 1: Check if db is available
      addResult(`📊 Database object: ${db ? 'Available' : 'Not available'}`);
      
      // Test 2: Try to access a collection
      addResult('📁 Testing collection access...');
      const propertiesRef = collection(db, 'properties');
      addResult(`📁 Collection reference created: ${propertiesRef ? 'Success' : 'Failed'}`);
      
      // Test 3: Try to get documents
      addResult('📄 Testing document fetch...');
      const snapshot = await getDocs(propertiesRef);
      addResult(`📄 Query executed: ${snapshot ? 'Success' : 'Failed'}`);
      addResult(`📄 Document count: ${snapshot.size}`);
      addResult(`📄 Empty: ${snapshot.empty}`);
      
      if (snapshot.empty) {
        addResult('⚠️ Collection is empty - this might be expected if no data is added yet');
      } else {
        addResult(`✅ Found ${snapshot.size} documents in collection`);
        
        // Test 4: Try to read first document
        const firstDoc = snapshot.docs[0];
        addResult(`📄 First document ID: ${firstDoc.id}`);
        addResult(`📄 First document data keys: ${Object.keys(firstDoc.data()).join(', ')}`);
      }
      
      addResult('✅ Firebase connection test completed successfully!');
      
    } catch (error) {
      addResult(`❌ Firebase test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addResult(`❌ Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
      if (error instanceof Error && error.stack) {
        addResult(`❌ Stack trace: ${error.stack}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Firebase Connection Test</h2>
      
      <button
        onClick={testFirebaseConnection}
        disabled={isLoading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Firebase Connection'}
      </button>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <div className="space-y-1 text-sm font-mono">
          {testResults.map((result, index) => (
            <div key={index} className={result.includes('❌') ? 'text-red-600' : result.includes('✅') ? 'text-green-600' : 'text-gray-700'}>
              {result}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
