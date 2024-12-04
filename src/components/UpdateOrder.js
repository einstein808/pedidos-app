import React, { useEffect, useState } from "react";

const UpdateOrder = () => {
  const [orders, setOrders] = useState([]);
  const [webSocket, setWebSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:4000/orders");
        if (!response.ok) {
          throw new Error("Erro ao buscar pedidos");
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os pedidos. Tente novamente mais tarde.");
      }
    };

    fetchOrders();

    const connectWebSocket = () => {
      if (webSocket) return; // Evita múltiplas conexões

      const ws = new WebSocket("ws://localhost:4000");

      ws.onopen = () => {
        console.log("Conexão WebSocket estabelecida");
        setWebSocket(ws);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const { event: eventType, data } = JSON.parse(event.data);

          if (eventType === "orderCreated") {
            setOrders((prevOrders) => [...prevOrders, data]);
          } else if (eventType === "orderUpdated") {
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.id === data.id ? { ...order, ...data } : order
              )
            );
          }
        } catch (err) {
          console.error("Erro ao processar a mensagem WebSocket:", err);
        }
      };

      ws.onclose = () => {
        console.log("Conexão WebSocket fechada. Tentando reconectar...");
        setWebSocket(null); // Garante que uma nova conexão será criada
        setIsConnected(false);
        setTimeout(connectWebSocket, 5000); // Tentativa de reconexão
      };

      ws.onerror = (err) => {
        console.error("Erro no WebSocket:", err);
      };
    };

    if (!isConnected) {
      connectWebSocket();
    }

    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [isConnected]);

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:4000/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        console.log("Status do pedido atualizado com sucesso.");
      } else {
        const errorResponse = await response.json();
        console.error("Erro ao atualizar o status do pedido:", errorResponse);
      }
    } catch (err) {
      console.error("Erro na requisição de atualização:", err);
    }
  };

  return (
    <div>
      <h2>Atualizar Pedidos</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {orders.length === 0 && !error ? (
        <p>Carregando pedidos...</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li
              key={order.id}
              style={{
                marginBottom: "20px",
                border: "1px solid #ccc",
                padding: "10px",
              }}
            >
              <p>
                <strong>ID:</strong> {order.id}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Bebidas:</strong>{" "}
                {order.drinks.map((drink) => (
                  <span key={drink.id}>
                    {drink.quantity}x {drink.name}{" "}
                  </span>
                ))}
              </p>
              {order.photo && (
                <div>
                  <p>
                    <strong>Foto do cliente:</strong>
                  </p>
                  <img src={order.photo} alt="Cliente" width="100" />
                </div>
              )}
              <div>
                <button onClick={() => updateOrderStatus(order.id, "Pendente")}>
                  Pendente
                </button>
                <button onClick={() => updateOrderStatus(order.id, "Pronto")}>
                  Pronto
                </button>
                <button onClick={() => updateOrderStatus(order.id, "Cancelado")}>
                  Cancelado
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpdateOrder;