import React, { useContext } from "react";
import { OrdersContext } from "../context/OrdersContext";

const ManageOrders = () => {
    const { orders, setOrders } = useContext(OrdersContext);

    const updateStatus = (id, newStatus) => {
        // Atualizar o status localmente
        setOrders((prev) =>
            prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
        );
    };

    return (
        <div>
            <h2>Gerenciar Pedidos</h2>
            {orders.filter((order) => order.status !== "Pronto").map((order) => (
                <div key={order.id}>
                    <p>
                        {order.name} pediu {order.drink}
                    </p>
                    <button onClick={() => updateStatus(order.id, "Em preparo")}>
                        Em Preparo
                    </button>
                    <button onClick={() => updateStatus(order.id, "Pronto")}>
                        Pronto
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ManageOrders;
