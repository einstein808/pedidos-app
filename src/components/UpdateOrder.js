import React, { useState, useEffect } from "react";

const UpdateOrder = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    // Função para carregar os pedidos inicialmente
    const fetchOrders = async () => {
      const response = await fetch("http://localhost:4000/orders");
      const data = await response.json();
      setOrders(data);
    };

    fetchOrders();

    // Conectando ao WebSocket
    const ws = new WebSocket("ws://localhost:4000");

    ws.onmessage = (event) => {
      const { event: eventType, order } = JSON.parse(event.data);

      // Atualizando a lista de pedidos em tempo real
      if (eventType === "orderCreated") {
        setOrders((prevOrders) => [order, ...prevOrders]);
      } else if (eventType === "orderUpdated") {
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.id === order.id ? order : o))
        );
      }
    };

    // Limpar conexão do WebSocket quando o componente desmontar
    return () => ws.close();
  }, []);

  // Atualizar status do pedido
  const handleUpdate = async (orderId) => {
    if (!selectedStatus) {
      return alert("Por favor, selecione um status.");
    }

    const response = await fetch(`http://localhost:4000/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: selectedStatus }),
    });

    if (response.ok) {
      setUpdatingOrderId(null);
      setSelectedStatus("");
    } else {
      alert("Erro ao atualizar o status do pedido");
    }
  };

  const handleStatusChange = (orderId) => {
    setUpdatingOrderId(orderId);
  };

  return (
    <div>
      <h2>Atualizar Status dos Pedidos</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <strong>Bebida:</strong> {order.drink} - <strong>Status:</strong> {order.status}
            {updatingOrderId === order.id ? (
              <>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Selecione o status</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Pronto">Pronto</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
                <button onClick={() => handleUpdate(order.id)}>Atualizar</button>
              </>
            ) : (
              <button onClick={() => handleStatusChange(order.id)}>Alterar Status</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpdateOrder;
