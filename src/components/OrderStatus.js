import React, { useEffect, useState } from "react";

const OrderStatus = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);

  // Função para carregar os pedidos do backend
  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:4000/orders");
      const data = await response.json();

      // Ordena por ID (assumindo que IDs maiores foram criados mais recentemente)
      const sortedData = data.sort((a, b) => b.id - a.id);

      // Preenche listas de pendentes e prontos
      const pending = sortedData
        .filter((order) => order.status !== "Pronto")
        .slice(0, 5); // Últimos 5 pedidos pendentes
      const ready = sortedData
        .filter((order) => order.status === "Pronto")
        .slice(0, 5); // Últimos 5 pedidos prontos

      setPendingOrders(pending);
      setReadyOrders(ready);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Configura o WebSocket para atualizações em tempo real
    const socket = new WebSocket("ws://localhost:4000");

    socket.onopen = () => {
      console.log("Conectado ao WebSocket");
    };

    socket.onmessage = (message) => {
      const { event, order } = JSON.parse(message.data);

      if (event === "orderCreated") {
        setPendingOrders((prev) =>
          [...prev, order].slice(-5) // Adiciona ao final e mantém no máximo 5
        );
      } else if (event === "orderUpdated") {
        if (order.status === "Pronto") {
          // Move para lista de prontos
          setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
          setReadyOrders((prev) => [order, ...prev].slice(0, 5)); // Adiciona no topo
        } else {
          // Atualiza apenas o pedido alterado nos pendentes
          setPendingOrders((prev) =>
            prev.map((o) => (o.id === order.id ? order : o))
          );
        }
      }
    };

    socket.onclose = () => {
      console.log("Conexão WebSocket encerrada");
    };

    return () => socket.close();
  }, []);

  const renderOrder = (order) => (
    <li key={order.id} style={{ marginBottom: "15px" }}>
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
  );

  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "20px" }}>
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h2>Fila de Pedidos Pendentes</h2>
        {pendingOrders.length === 0 ? (
          <p>Sem pedidos pendentes no momento.</p>
        ) : (
          <ul>{pendingOrders.map(renderOrder)}</ul>
        )}
      </div>
      <div style={{ flex: 1, marginLeft: "20px" }}>
        <h2>Pedidos Prontos</h2>
        {readyOrders.length === 0 ? (
          <p>Sem pedidos prontos no momento.</p>
        ) : (
          <ul>{readyOrders.map(renderOrder)}</ul>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
