import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import "./Orderform.css";

const OrderForm = () => {
  const [drinks, setDrinks] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedDrinks, setSelectedDrinks] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [orderType, setOrderType] = useState("nome");
  const [showFinalizeButton, setShowFinalizeButton] = useState(true);
  const webcamRef = useRef(null);

  // Carregar drinks e eventos
  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const response = await fetch("http://localhost:4000/drinks/ativos");
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

    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:4000/events/ativos");
        if (response.ok) {
          const data = await response.json();
          setEvents(data);

          if (data.length > 0) {
            setSelectedEvent(data[0]);
          }
        } else {
          console.error("Erro ao carregar eventos:", response.statusText);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };

    fetchDrinks();
    fetchEvents();
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

  const removeDrink = (drinkId) => {
    setSelectedDrinks((prev) => prev.filter((d) => d.id !== drinkId));
  };

  const updateDrinkQuantity = (drinkId, quantity) => {
    setSelectedDrinks((prev) =>
      prev.map((d) =>
        d.id === drinkId ? { ...d, quantity: Math.max(1, quantity) } : d
      )
    );
  };

  const capture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPhoto(imageSrc);
      setCameraVisible(false);
      setShowFinalizeButton(false);
      await submitOrder(imageSrc);
    }
  };

  const submitOrder = async (capturedPhoto) => {
    if (orderType === "nome" && !name) {
      alert("Por favor, preencha o nome do cliente.");
      return;
    }

    if (!selectedDrinks.length) {
      alert("Por favor, selecione pelo menos um drink.");
      return;
    }

    const newOrder = {
      name: orderType === "nome" ? name : null,
      drinks: selectedDrinks.map((d) => ({
        drink_id: d.id, // Use o id correto
        quantity: d.quantity,
      })),
      photo: capturedPhoto || photo || null,
      whatsapp: whatsapp || null,
      eventId: selectedEvent ? selectedEvent.id : null,
    };

    console.log("Pedido enviado para o backend:", newOrder); // Log para verificar os dados antes de enviar

    try {
      const response = await fetch("http://localhost:4000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.statusText}`);
      }

      alert("Pedido enviado com sucesso!");

      setSelectedDrinks([]);
      setPhoto(null);
      setName("");
      setWhatsapp("");
      setSelectedEvent(null);
      setShowFinalizeButton(true);
    } catch (error) {
      console.error("Erro ao enviar o pedido:", error);
      alert("Erro ao enviar o pedido.");
    }
  };

  return (
    <div className="order-form">
      <h1>Criar Pedido</h1>
      <div className="order-type">
        <button
          className={orderType === "nome" ? "active" : ""}
          onClick={() => setOrderType("nome")}
        >
          Pedido por Nome
        </button>
        <button
          className={orderType === "foto" ? "active" : ""}
          onClick={() => setOrderType("foto")}
        >
          Pedido por Foto
        </button>
      </div>

      {orderType === "nome" && (
        <div className="client-name">
          <label>Nome do Cliente:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}

      <div className="whatsapp-number">
        <label>WhatsApp (Opcional):</label>
        <input
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="Ex: 3298374982"
        />
      </div>

      {orderType === "foto" && cameraVisible && (
        <div className="camera">
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
          <button onClick={capture} className="capture-button">
            Capturar Foto
          </button>
        </div>
      )}

      {photo && !cameraVisible && (
        <div className="photo-preview">
          <img src={photo} alt="Preview da Foto" className="photo-image" />
        </div>
      )}

      {!cameraVisible && (
        <div className="drink-list">
          {drinks.map((drink) => (
            <div key={drink.id} className="drink-item">
              <img
                src={drink.photo || "placeholder.png"}
                alt={drink.name}
                className="drink-image"
              />
              <h3 className="drink-name">{drink.name}</h3>
              <p className="drink-ingredients">{drink.ingredients}</p>
              <button onClick={() => addDrink(drink.id)} className="add-drink-button">
                Adicionar
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="selected-drinks">
        <h3>Drinks Selecionados</h3>
        <div className="selected-drinks-card">
          {selectedDrinks.map((drink) => (
            <div key={drink.id} className="selected-drink-item">
              <div className="selected-drink-info">
                <span className="selected-drink-name">{drink.name}</span>
                <div className="quantity-controls">
                  <button
                    onClick={() => updateDrinkQuantity(drink.id, drink.quantity - 1)}
                    className="quantity-button"
                  >
                    -
                  </button>
                  <span className="quantity-number">{drink.quantity}</span>
                  <button
                    onClick={() => updateDrinkQuantity(drink.id, drink.quantity + 1)}
                    className="quantity-button"
                  >
                    +
                  </button>
                </div>
              </div>
              <button onClick={() => removeDrink(drink.id)} className="remove-button">
                Remover
              </button>
            </div>
          ))}
          {showFinalizeButton && (
            <button
              onClick={() => {
                if (orderType === "foto") {
                  setCameraVisible(true);
                } else {
                  submitOrder();
                }
              }}
              className="finalize-order-button"
              disabled={!selectedDrinks.length}
            >
              Finalizar Pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
