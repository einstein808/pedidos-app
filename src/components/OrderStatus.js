import React, { useState, useEffect } from "react";

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [isWebSocketOpen, setIsWebSocketOpen] = useState(false);

  useEffect(() => {
    // Conectar ao WebSocket
    const socket = new WebSocket("ws://localhost:4001");

    // Quando a conexão WebSocket for estabelecida
    socket.onopen = () => {
      console.log("Conexão WebSocket estabelecida");
      setIsWebSocketOpen(true);
    };

    // Quando uma mensagem for recebida do servidor WebSocket
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "ORDERS") {
        const ordersData = message.orders;

        // Separar pedidos pendentes e prontos
        const pending = ordersData.filter((order) => order.status !== "Pronto");
        const ready = ordersData.filter((order) => order.status === "Pronto");

        setOrders(ordersData);
        setPendingOrders(pending);
        setReadyOrders(ready);
      }
    };

    // Limpar a conexão WebSocket quando o componente for desmontado
    return () => {
      socket.close();
    };
  }, []);

  // Função para atualizar o status do pedido
  const updateOrderStatus = (orderId, newStatus) => {
    const socket = new WebSocket("ws://localhost:4001");

    socket.onopen = () => {
      // Enviar a atualização do status para o servidor WebSocket
      socket.send(
        JSON.stringify({
          type: "UPDATE_ORDER",
          orderId: orderId,
          newStatus: newStatus,
        })
      );
    };
  };

  return (
    <div>
      <h2>Status dos Pedidos</h2>
      
      {/* Últimos 3 pedidos prontos */}
      <div style={{ textAlign: "center", margin: "20px" }}>
        <h3>Últimos Pedidos Prontos</h3>
        {readyOrders.slice(0, 3).map((order) => (
          <div key={order.id} style={{ marginBottom: "10px" }}>
            <img
              src={order.photo}
              alt={`Foto de ${order.name}`}
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
            />
            <div>{order.drink} - {order.status}</div>
          </div>
        ))}
      </div>

      {/* Lista de Pedidos Pendentes */}
      <div style={{ float: "left", width: "45%" }}>
        <h3>Pedidos Pendentes</h3>
        {pendingOrders.map((order) => (
          <div key={order.id}>
            <img
              src={order.photo}
              alt={`Foto de ${order.name}`}
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
            />
            <strong>{order.name}</strong>: {order.drink} - Status: {order.status}
            <button onClick={() => updateOrderStatus(order.id, "Pronto")}>
              Marcar como Pronto
            </button>
          </div>
        ))}
      </div>

      {/* Lista de Pedidos Prontos à Direita */}
      <div style={{ float: "right", width: "45%" }}>
        <h3>Pedidos Prontos</h3>
        {readyOrders.map((order) => (
          <div key={order.id}>
            <img
              src={order.photo}
              alt={`Foto de ${order.name}`}
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
            />
            <strong>{order.name}</strong>: {order.drink} - Status: {order.status}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatus;
