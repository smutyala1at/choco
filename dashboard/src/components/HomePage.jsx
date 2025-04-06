import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DeliveryTracker from './DeliveryTracker';

// Simple HomePage component defined inline
const HomePage = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-3xl mx-auto mt-10">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Fresh Farm Produce Supply Co.</h1>
        <p className="mb-4">Please use the order tracking link sent to your email to track your delivery.</p>
        <p className="text-sm text-gray-500">
          If you have any questions or need assistance, please contact our customer service.
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order/:orderId" element={<DeliveryTracker />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;