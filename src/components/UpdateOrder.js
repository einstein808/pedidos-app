import React, { useEffect, useState } from "react";

const UpdateOrder = () => {
  const [orders, setOrders] = useState([]);
  const [webSocket, setWebSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:4000/orders");
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };

    fetchOrders();

    const connectWebSocket = () => {
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
        } catch (error) {
          console.error("Erro ao processar a mensagem WebSocket:", error);
        }
      };

      ws.onclose = () => {
        console.log("Conexão WebSocket fechada. Tentando reconectar...");
        setIsConnected(false);
        setTimeout(connectWebSocket, 5000); // Tentando reconectar após 5 segundos
      };

      ws.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
      };
    };

    if (!isConnected) {
      connectWebSocket(); // Inicializa a conexão WebSocket
    }

    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [isConnected, webSocket]);

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
        console.error("Erro ao atualizar o status do pedido:", await response.json());
      }
    } catch (error) {
      console.error("Erro na requisição de atualização:", error);
    }
  };

  return (
    <div>
      <h2>Atualizar Pedidos</h2>
      {orders.length === 0 ? (
        <p>Carregando pedidos...</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
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
                  <p><strong>Foto do cliente:</strong></p>
                  <img src={order.photo} alt="Cliente" width="100" />
                </div>
              )}
              <div>
                <button onClick={() => updateOrderStatus(order.id, "Pendente")}>Pendente</button>
                <button onClick={() => updateOrderStatus(order.id, "Pronto")}>Pronto</button>
                <button onClick={() => updateOrderStatus(order.id, "Cancelado")}>Cancelado</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpdateOrder;
