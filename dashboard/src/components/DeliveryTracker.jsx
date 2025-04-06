import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const DeliveryTracker = () => {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const apiUrl = `https://choco-barl.onrender.com/api/orders/${orderId}`;
        console.log('Fetching from:', apiUrl);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Order not found');
        }
        
        const data = await response.json();
        setOrderData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  if (loading) return <div className="p-4 max-w-3xl mx-auto">Loading order information...</div>;
  if (error) return <div className="p-4 text-red-500 max-w-3xl mx-auto">Error: {error}</div>;
  if (!orderData) return <div className="p-4 max-w-3xl mx-auto">No order found</div>;

  // Format dates
  const orderDate = new Date(orderData.order_date);
  const deliveryDate = new Date(orderData.delivery_date);
  const formattedOrderDate = orderDate.toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  // Determine order status
  const statusMapping = {
    'received': {
      step: 1,
      label: 'Order Created'
    },
    'processing': {
      step: 1,
      label: 'Order Created'
    },
    'in_transit': {
      step: 2,
      label: 'In Delivery'
    },
    'delivered': {
      step: 3,
      label: 'Delivered'
    }
  };

  const currentStatus = statusMapping[orderData.progress.status] || statusMapping.received;

  return (
    <div className="bg-gray-50 min-h-screen p-4 flex justify-center">
      <div className="max-w-3xl w-full">
        {/* Delivery Progress Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-green-600 mb-4">Delivery Progress</h2>
          
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-6">
            {/* Step 1: Order Created */}
            <div className="flex flex-col items-center relative">
              <div className={`w-10 h-10 rounded-full ${currentStatus.step >= 1 ? 'bg-green-600' : 'bg-gray-200'} flex items-center justify-center mb-2`}>
                {currentStatus.step >= 1 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                )}
              </div>
              <span className={`${currentStatus.step >= 1 ? 'text-green-600' : 'text-gray-500'} font-medium text-xs md:text-sm`}>Order Created</span>
              <span className="text-xs text-gray-500">{formattedOrderDate}</span>
            </div>
            
            {/* Connecting Line 1 */}
            <div className="h-1 bg-gray-200 flex-1 mx-2 self-start mt-5">
              <div className={`h-full bg-green-600 ${currentStatus.step >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            {/* Step 2: In Delivery */}
            <div className="flex flex-col items-center relative">
              <div className={`w-10 h-10 rounded-full ${currentStatus.step >= 2 ? 'bg-green-600' : 'bg-gray-200'} flex items-center justify-center mb-2`}>
                {currentStatus.step >= 2 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                )}
              </div>
              <span className={`${currentStatus.step >= 2 ? 'text-green-600' : 'text-gray-500'} font-medium text-xs md:text-sm`}>In Delivery</span>
              <span className="text-xs text-gray-500">Est. {formattedDeliveryDate}</span>
            </div>
            
            {/* Connecting Line 2 */}
            <div className="h-1 bg-gray-200 flex-1 mx-2 self-start mt-5">
              <div className={`h-full bg-green-600 ${currentStatus.step >= 3 ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            {/* Step 3: Delivered */}
            <div className="flex flex-col items-center relative">
              <div className={`w-10 h-10 rounded-full ${currentStatus.step >= 3 ? 'bg-green-600' : 'bg-gray-200'} flex items-center justify-center mb-2`}>
                {currentStatus.step >= 3 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                )}
              </div>
              <span className={`${currentStatus.step >= 3 ? 'text-green-600' : 'text-gray-500'} font-medium text-xs md:text-sm`}>Delivered</span>
              <span className="text-xs text-gray-500">Est. {formattedDeliveryDate}</span>
            </div>
          </div>
          
          {/* Estimated Delivery */}
          <div className="text-center">
            <p className="text-gray-700 font-medium mb-1">
              Estimated Delivery: {formattedDeliveryDate} {orderData.delivery_window}
            </p>
            <p className="text-xs text-green-600">Fresh produce is delivered in temperature-controlled vehicle for maximum freshness.</p>
          </div>
        </div>
        
        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <div className="mb-4 md:mb-0">
              <div className="mb-2">
                <div className="bg-green-100 inline-block px-3 py-1 rounded-md">
                  <span className="text-green-600 font-medium">{currentStatus.label}</span>
                </div>
              </div>
              <h2 className="text-lg font-medium text-gray-800 mb-1">Order #{orderId}</h2>
              <p className="text-sm text-gray-500 mb-1">Placed on {formattedOrderDate}</p>
              <p className="text-sm text-gray-500 mb-2">Order ID: {orderData._id}</p>
              <p className="text-sm text-green-600">Reach out to us if you need to make adjustments to your order.</p>
            </div>
            
            <div className="md:ml-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Shipping Address:</h3>
              <p className="text-sm text-gray-600">{orderData.customer.name}</p>
              <p className="text-sm text-gray-600">{orderData.customer.address.street}</p>
              <p className="text-sm text-gray-600">{orderData.customer.address.postal_code} {orderData.customer.address.city}</p>
              <p className="text-sm text-gray-600">{orderData.customer.address.country}</p>
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
                {orderData.items.map(item => (
                  <div key={item._id} className="grid grid-cols-2 p-3">
                    <span className="text-sm text-gray-600">{item.product_name}</span>
                    <span className="text-sm text-gray-600 text-right">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-green-800 text-white p-4 rounded-md flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-2 sm:mb-0">
            <p className="font-medium">Fresh Farm Produce Supply Co.</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-green-200">Legal Notice</a>
            <a href="#" className="text-white hover:text-green-200">Imprint</a>
            <a href="#" className="text-white hover:text-green-200">Contact Us</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DeliveryTracker;