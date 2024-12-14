import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageDrinks = () => {
  const [activeDrinks, setActiveDrinks] = useState([]);
  const [inactiveDrinks, setInactiveDrinks] = useState([]);

  // Buscar drinks ativos
  const fetchActiveDrinks = async () => {
    try {
      const response = await axios.get("http://localhost:4000/drinks/ativos");
      setActiveDrinks(response.data);
    } catch (error) {
      console.error("Erro ao buscar drinks ativos:", error);
    }
  };

  // Buscar drinks inativos
  const fetchInactiveDrinks = async () => {
    try {
      const response = await axios.get("http://localhost:4000/drinks/inativos");
      setInactiveDrinks(response.data);
    } catch (error) {
      console.error("Erro ao buscar drinks inativos:", error);
    }
  };

  // Alterar status de ativo/inativo
  const toggleActiveStatus = async (id, status) => {
    try {
      await axios.put(`https://backend.gamaro.me/drinks/${id}/status`, { status });
      fetchActiveDrinks();
      fetchInactiveDrinks();
    } catch (error) {
      console.error("Erro ao atualizar drink:", error);
      alert("Erro ao atualizar drink.");
    }
  };

  // Excluir um drink
  const deleteDrink = async (id) => {
    try {
      await axios.delete(`https://backend.gamaro.me/drinks/${id}`);
      fetchActiveDrinks();
      fetchInactiveDrinks();
    } catch (error) {
      console.error("Erro ao excluir drink:", error);
      alert("Erro ao excluir drink.");
    }
  };

  useEffect(() => {
    fetchActiveDrinks();
    fetchInactiveDrinks();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Gerenciar Drinks</h2>

      <div style={styles.columns}>
        {/* Tabela de Drinks Ativos */}
        <div style={styles.column}>
          <h3 style={styles.subHeader}>Drinks Ativos</h3>
          <ul style={styles.list}>
            {activeDrinks.map((drink) => (
              <li key={drink.id} style={styles.card}>
                <img src={drink.photo} alt={drink.name} style={styles.image} />
                <div style={styles.cardContent}>
                  <h4 style={styles.cardTitle}>{drink.name}</h4>
                  <p style={styles.cardText}>Ingredientes: {drink.ingredients}</p>
                  <div style={styles.actions}>
                    <button
                      style={styles.inactiveButton}
                      onClick={() => toggleActiveStatus(drink.id, "Inativo")}
                    >
                      Tornar Inativo
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => deleteDrink(drink.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Tabela de Drinks Inativos */}
        <div style={styles.column}>
          <h3 style={styles.subHeader}>Drinks Inativos</h3>
          <ul style={styles.list}>
            {inactiveDrinks.map((drink) => (
              <li key={drink.id} style={styles.card}>
                <img src={drink.photo} alt={drink.name} style={styles.image} />
                <div style={styles.cardContent}>
                  <h4 style={styles.cardTitle}>{drink.name}</h4>
                  <p style={styles.cardText}>Ingredientes: {drink.ingredients}</p>
                  <div style={styles.actions}>
                    <button
                      style={styles.activeButton}
                      onClick={() => toggleActiveStatus(drink.id, "Ativo")}
                    >
                      Tornar Ativo
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => deleteDrink(drink.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    color: "#333",
    fontSize: "24px",
  },
  columns: {
    display: "flex",
    justifyContent: "space-around",
    gap: "20px",
  },
  column: {
    width: "45%",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "15px",
  },
  subHeader: {
    textAlign: "center",
    color: "#555",
    fontSize: "18px",
    marginBottom: "10px",
  },
  list: {
    listStyleType: "none",
    padding: "0",
  },
  card: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    borderRadius: "6px",
    marginBottom: "10px",
    padding: "10px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  },
  image: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    marginRight: "10px",
  },
  cardContent: {
    flex: "1",
  },
  cardTitle: {
    fontSize: "16px",
    color: "#333",
    marginBottom: "5px",
  },
  cardText: {
    fontSize: "14px",
    color: "#666",
  },
  actions: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },
  activeButton: {
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  inactiveButton: {
    backgroundColor: "#f57c00",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#e53935",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ManageDrinks;
