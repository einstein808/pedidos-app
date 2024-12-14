import React, { useEffect, useState } from "react";

const UpdateOrder = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Pendente");
  const [webSocket, setWebSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://backend.gamaro.me/orders/latest");
        if (!response.ok) {
          throw new Error("Erro ao buscar pedidos");
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os pedidos. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const connectWebSocket = () => {
      if (webSocket || isConnected) return;

      const ws = new WebSocket("wss://backend.gamaro.me");

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
        console.log("Conexão WebSocket fechada.");
        setWebSocket(null);
        setIsConnected(false);
      };

      ws.onerror = (err) => {
        console.error("Erro no WebSocket:", err);
      };
    };

    if (!isConnected && !webSocket) {
      connectWebSocket();
    }

    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [webSocket, isConnected]);

  const sendWhatsappMessage = async (number, name, message) => {
    // Adiciona o nome do cliente se disponível
    const customizedMessage = name ? `Olá ${name}, ${message}` : message;

    const whatsappBody = {
      number: `55${number}`,
      text: customizedMessage,
    };

    try {
      const response = await fetch(
        "https://api.gamaro.me/message/sendText/barmanjf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": "Suapikeyaqui", // Certifique-se de que sua API key está correta
          },
          body: JSON.stringify(whatsappBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem para WhatsApp: ${response.statusText}`);
      }
      console.log("Mensagem enviada com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar mensagem para WhatsApp:", error);
    }
  };

  const updateOrderStatus = async (id, status, whatsapp, name) => {
    try {
      const response = await fetch(`https://backend.gamaro.me/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        console.log("Status do pedido atualizado com sucesso.");
        const updatedOrder = await response.json(); // Supondo que você receba o pedido atualizado como resposta
        // Se o pedido for marcado como "Pronto", envia a mensagem
        if (status === "Pronto" && whatsapp) {
          // Criação da mensagem com detalhes dos drinks e quantidades
          let message = `Seu pedido está pronto! Aguardamos você!\n\nDetalhes do Pedido:\n`;
          message += "--------------------------------\n";

          // Verificar se o pedido tem bebidas
          if (updatedOrder.drinks && Array.isArray(updatedOrder.drinks)) {
            updatedOrder.drinks.forEach((drink) => {
              message += `${drink.quantity}x ${drink.name}\n`;
            });
          } else {
            message += "Sem bebidas no pedido.\n";
          }

          message += "--------------------------------";
          // Enviar a mensagem com o nome (se disponível)
          await sendWhatsappMessage(whatsapp, name, message);
        }
      } else {
        const errorResponse = await response.json();
        console.error("Erro ao atualizar o status do pedido:", errorResponse);
      }
    } catch (err) {
      console.error("Erro na requisição de atualização:", err);
    }
  };

  const filteredOrders = orders.filter((order) => order.status === selectedStatus);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Atualizar Pedidos</h2>
      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      {/* Navbar de status */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setSelectedStatus("Pendente")}
          style={{
            padding: "10px 20px",
            backgroundColor: selectedStatus === "Pendente" ? "#5bc0de" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        >
          Pendente
        </button>
        <button
          onClick={() => setSelectedStatus("Pronto")}
          style={{
            padding: "10px 20px",
            backgroundColor: selectedStatus === "Pronto" ? "#5bc0de" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        >
          Pronto
        </button>
        <button
          onClick={() => setSelectedStatus("Cancelado")}
          style={{
            padding: "10px 20px",
            backgroundColor: selectedStatus === "Cancelado" ? "#d9534f" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cancelado
        </button>
      </div>

      {loading ? (
        <p>Carregando pedidos...</p>
      ) : (
        <>
          {filteredOrders.length === 0 ? (
            <p>Nenhum pedido encontrado no status "{selectedStatus}".</p>
          ) : (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {filteredOrders.map((order) => (
                <li
                  key={order.id}
                  style={{
                    marginBottom: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {/* Exibe a foto se disponível, senão exibe o nome */}
                    {order.photo ? (
                      <img
                        src={order.photo}
                        alt="Foto do cliente"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginRight: "15px",
                        }}
                      />
                    ) : order.name ? (
                      <div
                        style={{
                          backgroundColor: "white",
                          padding: "15px 20px", // Aumenta o tamanho do quadrado
                          borderRadius: "8px",
                          boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)", // Sombra opcional
                          marginRight: "15px",
                        }}
                      >
                        <strong>{order.name}</strong>
                      </div>
                    ) : (
                      <div>Sem nome ou foto</div> // Caso não tenha nem nome nem foto
                    )}
                    <div>
                      <div style={{ marginBottom: "10px" }}>
                        <strong>ID:</strong> {order.id}
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <strong>Status:</strong> {order.status}
                      </div>
                      <div
                        style={{
                          marginBottom: "10px",
                          padding: "10px",
                          backgroundColor: "#f0f8ff",
                          borderRadius: "5px",
                        }}
                      >
                        <strong>Bebidas:</strong>{" "}
                        {order.drinks.map((drink) => (
                          <span key={drink.id} style={{ display: "block", marginBottom: "5px" }}>
                            <span style={{ fontWeight: "bold" }}>{drink.quantity}x</span> {drink.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ marginBottom: "10px" }}>
                      <button
                        onClick={() => updateOrderStatus(order.id, "Pendente", order.whatsapp, order.name)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#f0ad4e",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          marginBottom: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Pendente
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "Pronto", order.whatsapp, order.name)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#5bc0de",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          marginBottom: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Pronto
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "Cancelado", order.whatsapp, order.name)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#d9534f",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Cancelado
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default UpdateOrder;
