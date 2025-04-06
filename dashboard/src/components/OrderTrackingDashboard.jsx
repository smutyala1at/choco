import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Search, ChevronDown, Bell, User, Clock } from 'lucide-react';

const OrderTrackingDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://choco-barl.onrender.com/api/orders/');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching data from backend:', error);
      
      // Fallback to use the data from the paste.txt for demo purposes
      try {
        const fallbackResponse = await window.fs.readFile('paste.txt', { encoding: 'utf8' });
        const fallbackData = JSON.parse(fallbackResponse);
        setOrders(fallbackData);
        console.log('Using fallback data for demonstration');
      } catch (fallbackError) {
        console.error('Error loading fallback data:', fallbackError);
      }
    }
  };

  const formatDate = (dateString, format = 'time') => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.setHours(0,0,0,0) === today.setHours(0,0,0,0);
    const isYesterday = date.setHours(0,0,0,0) === yesterday.setHours(0,0,0,0);
    
    if (format === 'time') {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      
      if (isToday) {
        return `Today, ${formattedHours}:${formattedMinutes} ${ampm}`;
      } else if (isYesterday) {
        return `Yesterday, ${formattedHours}:${formattedMinutes} ${ampm}`;
      }
    }
    
    return dateString;
  };

  const toggleOrderExpansion = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    
    try {
      // Find the full order and its details before updating
      const orderToUpdate = orders.find(order => order._id.slice(-5) === orderId);
      
      if (!orderToUpdate) {
        console.error('Could not find order to update');
        setIsUpdating(false);
        return;
      }
      
      const orderIdFull = orderToUpdate._id;
      
      // Make API call to update the order status using the specific endpoint
      const response = await fetch(`https://choco-barl.onrender.com/api/orders/${orderIdFull}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }
      
      const updatedOrder = await response.json();
      
      // Ensure customer data is preserved if missing from the response
      if (!updatedOrder.customer || !updatedOrder.customer.name) {
        updatedOrder.customer = orderToUpdate.customer;
      }
      
      // Update the orders state with the updated order
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderIdFull ? updatedOrder : order
        )
      );
      
      // Show success feedback
      alert(`Order #${orderId} marked as "${newStatus}"`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(`Failed to update order status: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'received') {
      return <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-md">Order created</span>;
    } else if (status === 'processing') {
      return <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-md">Processing</span>;
    } else if (status === 'shipping') {
      return <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-md">In Shipping</span>;
    } else if (status === 'delivered') {
      return <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-md">Delivered</span>;
    } else if (status === 'cancelled') {
      return <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-md">Cancelled</span>;
    }
    return null;
  };

  const getActionButton = (order) => {
    const { id, status } = order;
    
    // Define the next status based on current status
    const getNextStatus = (currentStatus) => {
      const statusFlow = {
        'received': 'processing',
        'processing': 'shipping',
        'shipping': 'delivered'
      };
      return statusFlow[currentStatus] || null;
    };
    
    // Get button text based on next status
    const getButtonText = (nextStatus) => {
      const statusLabels = {
        'processing': 'Mark as "Processing"',
        'shipping': 'Mark as "Shipping"',
        'delivered': 'Mark as "Delivered"'
      };
      return statusLabels[nextStatus] || null;
    };
    
    // Get button style based on next status
    const getButtonStyle = (nextStatus) => {
      const buttonStyles = {
        'processing': 'text-orange-600 border-orange-600 hover:bg-orange-50',
        'shipping': 'text-yellow-600 border-yellow-600 hover:bg-yellow-50',
        'delivered': 'text-green-600 border-green-600 hover:bg-green-50'
      };
      return buttonStyles[nextStatus] || '';
    };
    
    const nextStatus = getNextStatus(status);
    
    // Only show button if there's a next status in the flow
    if (nextStatus) {
      return (
        <button 
          onClick={() => updateOrderStatus(id, nextStatus)}
          disabled={isUpdating}
          className={`border rounded-md px-3 py-1 text-sm
                      transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                      ${getButtonStyle(nextStatus)}`}
        >
          {getButtonText(nextStatus)}
        </button>
      );
    }
    
    return null;
  };

  // Process orders for display, preserving customer info
  const displayOrders = orders.map(order => {
    // Find customer name with fallback
    const customerName = order.customer?.name || 'Unknown';
    
    return {
      id: order._id.slice(-5),
      fullId: order._id,
      customer: customerName,
      date: order.order_date,
      status: order.progress?.status || 'received',
      items: order.items || [],
      total: order.total_price || 0
    };
  });

  // Sort orders by date (newest first)
  displayOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-white min-h-screen flex justify-center">
      <div className="max-w-3xl w-full px-4 sm:px-6">
        {/* Header */}
        <header className="py-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xl font-semibold text-green-600">Ordermato</div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <div className="text-gray-500 text-sm sm:text-base">Dashboard</div>
            <div className="text-gray-500 text-sm sm:text-base">Orders</div>
            <div className="text-gray-500 text-sm sm:text-base">Products</div>
            <div className="text-gray-500 text-sm sm:text-base">Customers</div>
            <div className="text-gray-500 text-sm sm:text-base">Reports</div>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="text-gray-500" size={18} />
            <User className="text-gray-500" size={18} />
          </div>
        </header>

        {/* Page title */}
        <div className="py-6">
          <h1 className="text-2xl font-semibold text-gray-800">Fresh Farm Produce Supply Co. Orders</h1>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-wrap gap-3 justify-between sm:justify-end">
            <div className="flex items-center">
              <button className="border rounded-l-md px-2 py-1 text-gray-500">
                <ChevronLeft size={16} />
              </button>
              <button className="border-t border-b border-r rounded-r-md px-2 py-1 text-gray-500">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="relative">
              <button className="flex items-center space-x-1 border rounded-md px-3 py-1 text-sm text-gray-700">
                <Filter size={14} />
                <span>All Orders</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {displayOrders.map((order) => (
            <div key={order.id} className="border rounded-md overflow-hidden">
              <div className="px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-sm sm:text-base">Order #{order.id}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{order.customer}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between">
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                    <Clock size={14} className="mr-1 sm:mr-2" />
                    <span>{formatDate(order.date)}</span>
                  </div>
                  {getActionButton(order)}
                  <button 
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="text-gray-500"
                  >
                    <ChevronDown size={18} className={expandedOrder === order.id ? "transform rotate-180" : ""} />
                  </button>
                </div>
              </div>
              
              {/* Expanded order details */}
              {expandedOrder === order.id && (
                <div className="px-4 py-3 sm:px-5 sm:py-4 bg-gray-50 border-t">
                  <p className="font-medium text-sm mb-2">Order items</p>
                  
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full px-4 sm:px-0">
                      {/* Header row */}
                      <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-2 text-xs sm:text-sm font-medium text-gray-500">
                        <div>Product</div>
                        <div className="text-right">Quantity</div>
                        <div className="text-right">Unit</div>
                        <div className="text-right">Unit Price</div>
                      </div>
                      
                      <div className="space-y-1 sm:space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <span className="truncate">{item.product_name}</span>
                            <span className="text-right">{item.quantity}</span>
                            <span className="text-right">{item.unit}</span>
                            <span className="text-right">${item.unit_price?.toFixed(2) || "N/A"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between mt-4 pt-3 border-t font-medium text-sm sm:text-base">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingDashboard;