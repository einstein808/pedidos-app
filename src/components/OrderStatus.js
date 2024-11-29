import React, { useEffect, useState } from "react";

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);

  // Função para conectar ao WebSocket
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:4000");

    socket.onopen = () => {
      console.log("Conectado ao WebSocket");
    };

    socket.onmessage = (message) => {
      const { event, order } = JSON.parse(message.data);

      if (event === "orderCreated") {
        // Adiciona o novo pedido à lista
        setOrders((prevOrders) => [order, ...prevOrders]);
      } else if (event === "orderUpdated") {
        // Atualiza o pedido na lista
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.id === order.id ? order : o))
        );
      }
    };

    socket.onclose = () => {
      console.log("Conexão WebSocket encerrada");
    };

    return () => socket.close(); // Fecha o WebSocket ao desmontar o componente
  }, []);

  return (
    <div>
      <h2>Status dos Pedidos</h2>
      {orders.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} style={{ marginBottom: "20px" }}>
              <div>
                <strong>Bebida:</strong> {order.drink}
              </div>
              <div>
                <strong>Status:</strong> {order.status}
              </div>
              {order.photo && (
                <div>
                  <strong>Foto:</strong>
                  <br />
                  <img
                    src={order.photo}
                    alt="Foto do cliente"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderStatus;
