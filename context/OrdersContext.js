import React, { createContext, useState, useEffect } from "react";

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:4001");

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "ORDERS") {
                setOrders(data.orders);
            } else if (data.type === "NEW_ORDER") {
                setOrders((prev) => [...prev, data.order]);
            }
        };

        return () => socket.close();
    }, []);

    return (
        <OrdersContext.Provider value={{ orders, setOrders }}>
            {children}
        </OrdersContext.Provider>
    );
};
