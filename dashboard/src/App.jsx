import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DeliveryTracker from './components/DeliveryTracker';
import HomePage from './components/HomePage';
import OrderTrackingDashboard from './components/OrderTrackingDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order/:orderId" element={<DeliveryTracker />} />
        <Route path="/orders" element={<OrderTrackingDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;