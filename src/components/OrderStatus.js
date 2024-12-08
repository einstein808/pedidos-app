import React, { useEffect, useState } from "react";
import "./OrderStatus.css";

const OrderStatus = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch("https://backend.gamaro.me/orders");
      if (!response.ok) throw new Error("Erro ao carregar pedidos");

      const data = await response.json();
      const sortedData = data.sort((a, b) => b.id - a.id);

      setPendingOrders(
        sortedData
          .filter((order) => order.status !== "Pronto" && order.status !== "Cancelado")
          .slice(0, 5)
      );
      setReadyOrders(
        sortedData
          .filter((order) => order.status === "Pronto")
          .slice(0, 5)
      );
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderLists = (order) => {
    if (!order || !order.id || !order.status) {
      console.error("Pedido inválido recebido:", order);
      return;
    }

    setPendingOrders((prev) => {
      if (order.status !== "Pronto" && order.status !== "Cancelado") {
        return [order, ...prev.filter((o) => o.id !== order.id)].slice(0, 5);
      }
      return prev.filter((o) => o.id !== order.id);
    });

    setReadyOrders((prev) => {
      if (order.status === "Pronto") {
        setHighlightedOrderId(order.id); // Destaca o pedido pronto
        return [order, ...prev.filter((o) => o.id !== order.id)].slice(0, 5);
      }
      return prev.filter((o) => o.id !== order.id);
    });

    // Remove destaque após 5 segundos
    setTimeout(() => setHighlightedOrderId(null), 5000);
  };

  useEffect(() => {
    fetchOrders();

    const socket = new WebSocket("wss://backend.gamaro.me");

    socket.onopen = () => console.log("Conectado ao WebSocket");
    socket.onmessage = ({ data }) => {
      try {
        const parsedData = JSON.parse(data);
        const { event, data: order } = parsedData;

        if (!event || !order) return;

        if (event === "orderCreated") {
          setPendingOrders((prev) => [order, ...prev].slice(0, 5));
        } else if (event === "orderUpdated") {
          updateOrderLists(order);
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
    <div
      key={order.id}
      className={`order-card ${highlightedOrderId === order.id ? "highlight" : order.status.toLowerCase()}`}
    >
      <div className="order-content">
        {order.photo && (
          <div className="order-photo">
            <img src={order.photo} alt="Foto do pedido" />
          </div>
        )}
        <div className="order-details">
          <strong>Bebidas:</strong>
          <div>{order.drinks.map((d) => `${d.quantity}x ${d.name}`).join(", ")}</div>
          <strong>Status:</strong>
          <span className={`order-status ${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <p>Carregando pedidos...</p>;
  }

  return (
    <div className="order-container">
      <div className="order-column">
        <h2>Pedidos Pendentes</h2>
        {pendingOrders.map(renderOrder)}
      </div>
      <div className="order-column">
        <h2>Pedidos Prontos</h2>
        {readyOrders.map(renderOrder)}
      </div>
    </div>
  );
};

export default OrderStatus;
