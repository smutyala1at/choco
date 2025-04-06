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

  if (loading) return <div className="p-4">Loading order information...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!orderData) return <div className="p-4">No order found</div>;

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
    <div>Hello World</div>
  );
};

export default DeliveryTracker;