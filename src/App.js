import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importando seus componentes
import OrderForm from './components/OrderForm';
import OrderStatus from './components/OrderStatus';
import UpdateOrder from './components/UpdateOrder';
import DrinkForm from './components/DrinkForm';
import ManageDrinks from './components/ManageDrinks';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/make-order" element={<OrderForm />} />
        <Route path="/order-status" element={<OrderStatus />} />
        <Route path="/update-order" element={<UpdateOrder />} />
        <Route path="/drinks" element={<ManageDrinks/>} />
        <Route path="/" element={<DrinkForm/>} />
      </Routes>
    </Router>
  );
}

export default App;
