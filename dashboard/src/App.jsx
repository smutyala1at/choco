import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DeliveryTracker from './components/DeliveryTracker';
import HomePage from './components/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order/:orderId" element={<DeliveryTracker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App