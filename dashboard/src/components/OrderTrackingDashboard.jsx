import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Search, ChevronDown, Bell, User, Clock } from 'lucide-react';

const OrderTrackingDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

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
    console.log('Formatting date string:', dateString);
    
    // First create a date object from the string
    const date = new Date(dateString);
    console.log('Date object created:', date);
    console.log('Date hours:', date.getHours());
    console.log('Date minutes:', date.getMinutes());
    
    // Clone today's date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Clone the date to avoid modifying the original when checking if same day
    const dateClone = new Date(date);
    const todayClone = new Date(today);
    
    // Reset time parts to 0 for date comparison only
    const isToday = dateClone.setHours(0,0,0,0) === todayClone.setHours(0,0,0,0);
    const isYesterday = dateClone.setHours(0,0,0,0) === yesterday.setHours(0,0,0,0);
    
    console.log('Is today?', isToday);
    
    if (format === 'time') {
      // Use the original date object (not the clone) to get the real time
      const hours = date.getHours();
      const minutes = date.getMinutes();
      console.log('Using hours:', hours, 'and minutes:', minutes);
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      
      console.log('Formatted time parts:', formattedHours, formattedMinutes, ampm);
      
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
      
      // Get the API response
      const apiResponse = await response.json();
      
      // Direct debugging
      console.log('Before update - Original order date:', orderToUpdate.order_date);
      
      // Create an explicit new Date object to use current time
      const now = new Date();
      console.log('Current date object:', now);
      console.log('Current date ISO:', now.toISOString());
      console.log('Current hours:', now.getHours());
      console.log('Current minutes:', now.getMinutes());
      
      // Manually create an updated order object
      const updatedOrder = {
        ...apiResponse
      };
      
      // Force update date for delivered orders - completely override it
      if (newStatus === 'delivered') {
        // Use the explicit date we created above
        updatedOrder.order_date = now.toISOString();
        console.log('Updated order date to:', updatedOrder.order_date);
      }
      
      // Ensure customer data is preserved
      if (!updatedOrder.customer || !updatedOrder.customer.name) {
        updatedOrder.customer = orderToUpdate.customer;
      }
      
      // Update the orders state with our modified order object
      setOrders(prevOrders => {
        const newOrders = prevOrders.map(order => {
          if (order._id === orderIdFull) {
            console.log('Updated order in state with date:', updatedOrder.order_date);
            return updatedOrder;
          }
          return order;
        });
        return newOrders;
      });
      
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
          className={`border rounded-md px-3 py-1 text-sm cursor-pointer
                      transition-colors disabled:opacity-50 disabled:cursor-not-allowed
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

  // Filter orders based on active tab
  const filteredOrders = displayOrders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  // Count orders by status for the tab badges
  const orderCounts = {
    all: displayOrders.length,
    received: displayOrders.filter(order => order.status === 'received').length,
    processing: displayOrders.filter(order => order.status === 'processing').length,
    shipping: displayOrders.filter(order => order.status === 'shipping').length,
    delivered: displayOrders.filter(order => order.status === 'delivered').length,
    cancelled: displayOrders.filter(order => order.status === 'cancelled').length
  };

  return (
    <div className="bg-white min-h-screen flex justify-center">
      <div className="max-w-3xl w-full px-4 sm:px-6">
        {/* Header */}
        <header className="py-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xl font-semibold text-green-600">Ordermato</div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <div className="text-gray-500 text-sm sm:text-base cursor-pointer hover:text-green-600">Dashboard</div>
            <div className="text-gray-500 text-sm sm:text-base cursor-pointer hover:text-green-600">Orders</div>
            <div className="text-gray-500 text-sm sm:text-base cursor-pointer hover:text-green-600">Products</div>
            <div className="text-gray-500 text-sm sm:text-base cursor-pointer hover:text-green-600">Customers</div>
            <div className="text-gray-500 text-sm sm:text-base cursor-pointer hover:text-green-600">Reports</div>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="text-gray-500 cursor-pointer hover:text-green-600" size={18} />
            <User className="text-gray-500 cursor-pointer hover:text-green-600" size={18} />
          </div>
        </header>

        {/* Page title */}
        <div className="py-6">
          <h1 className="text-2xl font-semibold text-gray-800">Fresh Farm Produce Supply Co. Orders</h1>
        </div>

        {/* Status tabs */}
        <div className="border-b mb-6">
          <nav className="flex flex-wrap -mb-px">
            <button 
              onClick={() => setActiveTab('all')} 
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer
                ${activeTab === 'all' 
                  ? 'border-green-600 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              All Orders
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {orderCounts.all}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('received')} 
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer
                ${activeTab === 'received' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Created
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                {orderCounts.received}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('processing')} 
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer
                ${activeTab === 'processing' 
                  ? 'border-orange-600 text-orange-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Processing
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                {orderCounts.processing}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('shipping')} 
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer
                ${activeTab === 'shipping' 
                  ? 'border-yellow-600 text-yellow-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Shipping
              <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-0.5 rounded-full">
                {orderCounts.shipping}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('delivered')} 
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer
                ${activeTab === 'delivered' 
                  ? 'border-green-600 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Delivered
              <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                {orderCounts.delivered}
              </span>
            </button>
            
            {orderCounts.cancelled > 0 && (
              <button 
                onClick={() => setActiveTab('cancelled')} 
                className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 cursor-pointer
                  ${activeTab === 'cancelled' 
                    ? 'border-red-600 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Cancelled
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  {orderCounts.cancelled}
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded overflow-hidden">
              <button className="px-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-50">
                <ChevronLeft size={16} />
              </button>
              <button className="border-l px-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="relative">
              <button className="flex items-center space-x-2 bg-white border rounded-md px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                <Filter size={14} />
                <span>Sort By</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-4 mb-16">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
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
                      className="text-gray-500 cursor-pointer hover:text-gray-700"
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
            ))
          ) : (
            <div className="text-center py-8 border rounded-md">
              <p className="text-gray-500">No {activeTab !== 'all' ? activeTab : ''} orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingDashboard;