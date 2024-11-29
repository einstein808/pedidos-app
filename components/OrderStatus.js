import React, { useContext } from "react";
import { OrdersContext } from "../context/OrdersContext";

const OrderStatus = () => {
    const { orders } = useContext(OrdersContext);

    return (
        <div>
            <h2>Pedidos Prontos</h2>
            {orders.filter((order) => order.status === "Pronto").map((order) => (
                <div key={order.id}>
                    <p>
                        Pedido de {order.name}: {order.drink}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default OrderStatus;
