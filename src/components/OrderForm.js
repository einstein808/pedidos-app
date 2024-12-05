import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";

const OrderForm = () => {
  const [drinks, setDrinks] = useState([]);
  const [selectedDrinks, setSelectedDrinks] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [photo, setPhoto] = useState(null);
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const response = await fetch("http://localhost:4000/drinks");
        if (response.ok) {
          const data = await response.json();
          setDrinks(data);
        } else {
          console.error("Erro ao carregar drinks:", response.statusText);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };
    fetchDrinks();
  }, []);

  const addDrink = (drinkId) => {
    const drink = drinks.find((d) => d.id === drinkId);
    if (drink) {
      setSelectedDrinks((prev) => {
        const existingDrink = prev.find((d) => d.id === drinkId);
        if (existingDrink) {
          return prev.map((d) =>
            d.id === drinkId ? { ...d, quantity: d.quantity + 1 } : d
          );
        } else {
          return [...prev, { ...drink, quantity: 1 }];
        }
      });
    }
  };

  const removeDrinkQuantity = (drinkId) => {
    setSelectedDrinks((prev) =>
      prev
        .map((d) =>
          d.id === drinkId ? { ...d, quantity: d.quantity - 1 } : d
        )
        .filter((d) => d.quantity > 0)
    );
  };

  const removeDrink = (drinkId) => {
    setSelectedDrinks((prev) => prev.filter((d) => d.id !== drinkId));
  };

  const capture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPhoto(imageSrc);

      // Automatiza o envio do pedido
      await handleSubmit(imageSrc);
    } else {
      alert("Câmera não está disponível.");
    }
  };

  const handleSubmit = async (capturedPhoto) => {
    if (!selectedDrinks.length || !capturedPhoto) {
      alert("Por favor, selecione drinks e capture uma foto.");
      return;
    }

    const newOrder = {
      drinks: selectedDrinks.map((d) => ({
        id: d.id,
        name: d.name,
        quantity: d.quantity,
      })),
      photo: capturedPhoto,
    };

    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        alert("Pedido enviado com sucesso!");
        setSelectedDrinks([]);
        setPhoto(null);
        setCameraVisible(false);
      } else {
        const errorData = await response.json();
        alert(`Erro ao enviar pedido: ${errorData.message || "Erro desconhecido"}`);
      }
    } catch (error) {
      alert("Erro na requisição: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h2 style={{ color: "#007BFF", textAlign: "center" }}>Criar Pedido</h2>

      {/* Seleção de Drinks */}
      {!cameraVisible && (
        <div>
          <h3>Escolha seus Drinks</h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            {drinks.map((drink) => (
              <div
                key={drink.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "10px",
                  width: "200px",
                  textAlign: "center",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <img
                  src={drink.photo}
                  alt={drink.name}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
                <h4>{drink.name}</h4>
                <p>{drink.ingredients}</p>
                <button
                  onClick={() => addDrink(drink.id)}
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumo no canto inferior direito */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "20px",
          width: "300px",
        }}
      >
        <h3 style={{ color: "#007BFF" }}>Resumo do Pedido</h3>
        <ul style={{ listStyleType: "none", padding: "0" }}>
          {selectedDrinks.map((drink) => (
            <li key={drink.id} style={{ marginBottom: "10px" }}>
              {drink.quantity}x {drink.name}
              <button
                onClick={() => removeDrinkQuantity(drink.id)}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#ffc107",
                  color: "black",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                -
              </button>
              <button
                onClick={() => addDrink(drink.id)}
                style={{
                  marginLeft: "5px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                +
              </button>
              <button
                onClick={() => removeDrink(drink.id)}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setCameraVisible(true)}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Finalizar Pedido
        </button>
      </div>

      {/* Câmera */}
      {cameraVisible && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{
              width: "300px",
              height: "300px",
              borderRadius: "10px",
              border: "2px solid #ccc",
            }}
            videoConstraints={{
              facingMode: "user",
            }}
          />
          <button
            onClick={capture}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Tirar Foto
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
