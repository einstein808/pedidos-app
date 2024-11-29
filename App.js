import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { OrdersProvider } from "./context/OrdersContext";
import MakeOrder from "./components/MakeOrder";
import ManageOrders from "./components/ManageOrders";
import OrderStatus from "./components/OrderStatus";

const App = () => (
    <OrdersProvider>
        <Router>
            <Routes>
                <Route path="/make-order" element={<MakeOrder />} />
                <Route path="/manage-orders" element={<ManageOrders />} />
                <Route path="/order-status" element={<OrderStatus />} />
            </Routes>
        </Router>
    </OrdersProvider>
);

export default App;
