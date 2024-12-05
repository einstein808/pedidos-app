import React, { useState, useEffect } from "react";
import axios from "axios";

const MakeOrder = () => {
  const [drinks, setDrinks] = useState([]);
  const [selectedDrinks, setSelectedDrinks] = useState({});
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState("");

  // Buscar drinks do backend
  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const response = await axios.get("http://localhost:4000/drinks/active");
        setDrinks(response.data);
      } catch (error) {
        console.error("Erro ao buscar drinks", error);
      }
    };

    fetchDrinks();
  }, []);

  // Adicionar drink à lista de selecionados
  const addDrink = (drink) => {
    setSelectedDrinks((prev) => ({
      ...prev,
      [drink.id]: (prev[drink.id] || 0) + 1,
    }));
  };

  // Remover drink da lista de selecionados
  const removeDrink = (drink) => {
    setSelectedDrinks((prev) => {
      const updated = { ...prev };
      if (updated[drink.id] > 1) {
        updated[drink.id] -= 1;
      } else {
        delete updated[drink.id];
      }
      return updated;
    });
  };

  // Finalizar pedido
  const handleFinalize = () => {
    if (Object.keys(selectedDrinks).length === 0) {
      return alert("Adicione ao menos um drink para continuar!");
    }
    setShowCamera(true);
  };

  // Capturar foto (simulado)
  const takePhoto = () => {
    setPhoto("data:image/jpeg;base64,..."); // Substituir por integração com câmera real
    setShowCamera(false);
    alert("Foto capturada com sucesso!");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Faça seu Pedido</h2>
      <div style={styles.drinkList}>
        {drinks.map((drink) => (
          <div key={drink.id} style={styles.card}>
            <img src={drink.photo} alt={drink.name} style={styles.cardImage} />
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{drink.name}</h3>
              <p style={styles.cardDescription}>
                <strong>Ingredientes:</strong> {drink.ingredients.join(", ")}
              </p>
              <button style={styles.addButton} onClick={() => addDrink(drink)}>
                Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cesta de pedidos */}
      <div style={styles.orderSummary}>
        <h3>Resumo do Pedido</h3>
        <ul style={styles.orderList}>
          {Object.entries(selectedDrinks).map(([id, quantity]) => {
            const drink = drinks.find((d) => d.id === parseInt(id));
            return (
              <li key={id} style={styles.orderItem}>
                <span>
                  {quantity}x {drink.name}
                </span>
                <button
                  style={styles.removeButton}
                  onClick={() => removeDrink(drink)}
                >
                  Remover
                </button>
              </li>
            );
          })}
        </ul>
        {Object.keys(selectedDrinks).length > 0 && (
          <button style={styles.finalizeButton} onClick={handleFinalize}>
            Finalizar Pedido
          </button>
        )}
      </div>

      {/* Simulação da câmera */}
      {showCamera && (
        <div style={styles.cameraOverlay}>
          <p>Ativando a câmera...</p>
          <button style={styles.takePhotoButton} onClick={takePhoto}>
            Tirar Foto
          </button>
          <button style={styles.cancelButton} onClick={() => setShowCamera(false)}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Roboto', sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  drinkList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
  },
  card: {
    width: "250px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  cardImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "10px",
  },
  cardTitle: {
    margin: "0 0 10px",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "10px",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  orderSummary: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "300px",
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  orderList: {
    listStyle: "none",
    padding: "0",
    margin: "0 0 10px",
  },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  removeButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  finalizeButton: {
    width: "100%",
    backgroundColor: "#007BFF",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cameraOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "1000",
  },
  takePhotoButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    margin: "10px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default MakeOrder;
