import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importando seus componentes
import OrderForm from './components/OrderForm';
import OrderStatus from './components/OrderStatus';
import UpdateOrder from './components/UpdateOrder';
import CreateDrink from './components/CreateDrink';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/make-order" element={<OrderForm />} />
        <Route path="/order-status" element={<OrderStatus />} />
        <Route path="/update-order" element={<UpdateOrder />} />
        <Route path="/create-drink" element={<CreateDrink/>} />
      </Routes>
    </Router>
  );
}

export default App;
