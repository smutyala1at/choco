import React from 'react';

const DeliveryTracker = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Delivery Progress Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-green-600 mb-4">Delivery Progress</h2>
        
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-6">
          {/* Step 1: Order Created */}
          <div className="flex flex-col items-center relative">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-green-600 font-medium">Order Created</span>
            <span className="text-xs text-gray-500">April 6, 2025</span>
          </div>
          
          {/* Connecting Line 1 */}
          <div className="h-1 bg-gray-200 flex-1 mx-2 self-start mt-5">
            <div className="h-full bg-green-600 w-0"></div>
          </div>
          
          {/* Step 2: In Delivery */}
          <div className="flex flex-col items-center relative">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            </div>
            <span className="text-gray-500 font-medium">In Delivery</span>
            <span className="text-xs text-gray-500">Est. April 8, 2025 6 - 8 AM</span>
          </div>
          
          {/* Connecting Line 2 */}
          <div className="h-1 bg-gray-200 flex-1 mx-2 self-start mt-5"></div>
          
          {/* Step 3: Delivered */}
          <div className="flex flex-col items-center relative">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            </div>
            <span className="text-gray-500 font-medium">Delivered</span>
            <span className="text-xs text-gray-500">Est. April 8, 2025 by 8 AM</span>
          </div>
        </div>
        
        {/* Estimated Delivery */}
        <div className="text-center">
          <p className="text-gray-700 font-medium mb-1">Estimated Delivery: April 8, 2025 by 8:00 AM</p>
          <p className="text-xs text-green-600">Fresh produce is delivered in temperature-controlled vehicle for maximum freshness.</p>
        </div>
      </div>
      
      {/* Order Details Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="mb-2">
              <div className="bg-green-100 inline-block px-3 py-1 rounded-md">
                <span className="text-green-600 font-medium">Order Created</span>
              </div>
            </div>
            <h2 className="text-lg font-medium text-gray-800 mb-1">Order #42787</h2>
            <p className="text-sm text-gray-500 mb-1">Placed on April 6, 2025</p>
            <p className="text-sm text-gray-500 mb-2">Tracking Number: UF5-2Y9-789</p>
            <p className="text-sm text-green-600">Reach out to us if you need to make adjustments to your order.</p>
          </div>
          
          <div className="ml-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Shipping Address:</h3>
            <p className="text-sm text-gray-600">Bistro Verde</p>
            <p className="text-sm text-gray-600">Heuptstraße 23</p>
            <p className="text-sm text-gray-600">10248 Berlin</p>
            <p className="text-sm text-gray-600">Germany</p>
          </div>
        </div>
        
        {/* Items Table */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-2">Items</h3>
          <div className="border rounded-md">
            <div className="grid grid-cols-2 bg-gray-50 p-3 border-b">
              <span className="text-sm font-medium text-gray-700">Item</span>
              <span className="text-sm font-medium text-gray-700 text-right">Quantity</span>
            </div>
            
            <div className="divide-y">
              <div className="grid grid-cols-2 p-3">
                <span className="text-sm text-gray-600">Roma Tomatoes</span>
                <span className="text-sm text-gray-600 text-right">5 kg</span>
              </div>
              
              <div className="grid grid-cols-2 p-3">
                <span className="text-sm text-gray-600">Baby Spinach</span>
                <span className="text-sm text-gray-600 text-right">3 kg</span>
              </div>
              
              <div className="grid grid-cols-2 p-3">
                <span className="text-sm text-gray-600">Fresh Basil</span>
                <span className="text-sm text-gray-600 text-right">5 bunches</span>
              </div>
              
              <div className="grid grid-cols-2 p-3">
                <span className="text-sm text-gray-600">Thai Basil</span>
                <span className="text-sm text-gray-600 text-right">3 bunches</span>
              </div>
              
              <div className="grid grid-cols-2 p-3">
                <span className="text-sm text-gray-600">Yukon Gold Potatoes</span>
                <span className="text-sm text-gray-600 text-right">10 kg</span>
              </div>
              
              <div className="grid grid-cols-2 p-3">
                <span className="text-sm text-gray-600">Zucchini</span>
                <span className="text-sm text-gray-600 text-right">4 kg</span>
              </div>
              
              <div className="grid grid-cols-2 p-3">
                <span className="text-sm text-gray-600">Red Bell Peppers</span>
                <span className="text-sm text-gray-600 text-right">2 kg</span>
              </div>
              
              <div className="grid grid-cols-2 p-3">
                <span className="text-sm text-gray-600">Avocados</span>
                <span className="text-sm text-gray-600 text-right">3 kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-green-800 text-white p-4 rounded-md flex justify-between items-center">
        <div>
          <p className="font-medium">Fresh Farm Produce Supply Co.</p>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="text-white hover:text-green-200">Legal Notice</a>
          <a href="#" className="text-white hover:text-green-200">Imprint</a>
          <a href="#" className="text-white hover:text-green-200">Contact Us</a>
        </div>
      </footer>
    </div>
  );
};

export default DeliveryTracker;