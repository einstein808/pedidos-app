import React, { useEffect, useState } from "react";

const OrderStatus = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:4000/orders");
      if (!response.ok) throw new Error("Erro ao carregar pedidos");

      const data = await response.json();
      const sortedData = data.sort((a, b) => b.id - a.id);

      setPendingOrders(sortedData.filter((order) => order.status !== "Pronto").slice(0, 5));
      setReadyOrders(sortedData.filter((order) => order.status === "Pronto").slice(0, 5));
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = new WebSocket("ws://localhost:4000");

    socket.onopen = () => console.log("Conectado ao WebSocket");
    socket.onmessage = ({ data }) => {
      try {
        const { event, order } = JSON.parse(data);

        if (event === "orderCreated") {
          setPendingOrders((prev) => [...prev, order].slice(-5));
        } else if (event === "orderUpdated") {
          if (order.status === "Pronto") {
            setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
            setReadyOrders((prev) => [order, ...prev].slice(0, 5));
          } else {
            setPendingOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
          }
        }
      } catch (err) {
        console.error("Erro ao processar mensagem do WebSocket:", err);
      }
    };
    socket.onerror = (err) => console.error("Erro no WebSocket:", err);
    socket.onclose = () => console.log("Conexão WebSocket encerrada");

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

  if (loading) {
    return <p>Carregando pedidos...</p>;
  }

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
