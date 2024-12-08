import React, { useEffect, useState } from "react";

const OrderStatus = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
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
        return [order, ...prev.filter((o) => o.id !== order.id)].slice(0, 5);
      }
      return prev.filter((o) => o.id !== order.id);
    });
  };

  useEffect(() => {
    fetchOrders();

    const socket = new WebSocket("wss://backend.gamaro.me");

    socket.onopen = () => console.log("Conectado ao WebSocket");
    socket.onmessage = ({ data }) => {
      try {
        const parsedData = JSON.parse(data);
        console.log("Dados recebidos:", parsedData);

        const { event, data: order } = parsedData;

        if (!event || !order) {
          console.error("Evento ou pedido inválido recebido:", parsedData);
          return;
        }

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

  const renderDrinks = (drinks) => {
    return drinks.map((drink, index) => (
      <div key={index} style={styles.drinkItem}>
        <strong>{drink.quantity}x</strong> {drink.name}
      </div>
    ));
  };

  const renderOrder = (order) => (
    <div
      key={order.id}
      style={{
        ...styles.card,
        backgroundColor: getBackgroundColor(order.status), // Cor de fundo baseada no status
      }}
    >
      <div style={styles.cardContent}>
        {/* Foto à esquerda */}
        {order.photo && (
          <div style={styles.photoContainer}>
            <img
              src={order.photo}
              alt="Foto do cliente"
              style={styles.photo}
            />
          </div>
        )}
  
        {/* Detalhes do pedido à direita */}
        <div style={styles.orderDetails}>
          <div>
            <strong>Bebidas:</strong>
            {renderDrinks(order.drinks)}
          </div>
          <div style={{ marginTop: "10px" }}>
            <strong>Status:</strong>
            <span style={{ ...styles.status, backgroundColor: getStatusColor(order.status) }}>
              {order.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  const getBackgroundColor = (status) => {
    switch (status) {
      case "Pronto":
        return "#d4f8d4"; // Verde claro
      case "Cancelado":
        return "#f8d4d4"; // Vermelho claro (opcional, pode ser mantido sem cor especial)
      default:
        return "#f0f0f0"; // Cinza claro para pendentes
    }
  };
  

  const getStatusColor = (status) => {
    switch (status) {
      case "Pronto":
        return "green";
      case "Cancelado":
        return "red";
      default:
        return "gray";
    }
  };

  if (loading) {
    return <p>Carregando pedidos...</p>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.column}>
        <h2>Fila de Pedidos Pendentes</h2>
        {pendingOrders.length === 0 ? (
          <p>Sem pedidos pendentes no momento.</p>
        ) : (
          <div>{pendingOrders.map(renderOrder)}</div>
        )}
      </div>
      <div style={styles.column}>
        <h2>Pedidos Prontos</h2>
        {readyOrders.length === 0 ? (
          <p>Sem pedidos prontos no momento.</p>
        ) : (
          <div>{readyOrders.map(renderOrder)}</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px",
    flexWrap: "wrap",
  },
  column: {
    flex: 1,
    marginRight: "20px",
    marginBottom: "20px",
  },
  card: {
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginBottom: "15px",
    transition: "transform 0.3s",
  },
  cardContent: {
    display: "flex",
    alignItems: "center",
  },
  photoContainer: {
    marginRight: "20px",
  },
  photo: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "2px solid #ccc",
  },
  orderDetails: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  drinkItem: {
    marginBottom: "5px",
    fontSize: "14px",
  },
  status: {
    padding: "5px 10px",
    borderRadius: "5px",
    color: "#fff",
    fontWeight: "bold",
  },
};

export default OrderStatus;
