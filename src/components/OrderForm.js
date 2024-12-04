import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";

const OrderForm = () => {
  const [drinks, setDrinks] = useState([]);
  const [selectedDrinks, setSelectedDrinks] = useState([]);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false); // Controle da câmera
  const [photo, setPhoto] = useState(null);
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Carregar a lista de drinks
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

  // Adicionar drink à seleção
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

  // Remover drink da seleção
  const removeDrink = (drinkId) => {
    setSelectedDrinks((prev) =>
      prev
        .map((d) =>
          d.id === drinkId ? { ...d, quantity: d.quantity - 1 } : d
        )
        .filter((d) => d.quantity > 0)
    );
  };

  // Capturar foto
  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPhoto(imageSrc);
      setCameraVisible(false); // Fecha a câmera após capturar
    } else {
      alert("Câmera não está disponível.");
    }
  };

  // Enviar pedido
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photo) {
      alert("Por favor, tire uma foto antes de enviar o pedido.");
      return;
    }

    const newOrder = {
      drinks: selectedDrinks.map((d) => ({
        id: d.id,
        name: d.name,
        quantity: d.quantity,
      })),
      photo,
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
        setSummaryVisible(false);
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
    <div>
      <h2>Criar Pedido</h2>

      {/* Etapa 1: Seleção de Drinks */}
      {!summaryVisible && (
        <div>
          <h3>Escolha seus Drinks</h3>
          <ul>
            {drinks.map((drink) => (
              <li key={drink.id}>
                {drink.name} - {drink.ingredients}
                <button onClick={() => addDrink(drink.id)}>Adicionar</button>
                <button onClick={() => removeDrink(drink.id)}>Remover</button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setSummaryVisible(true)}
            disabled={selectedDrinks.length === 0}
          >
            Finalizar Escolha
          </button>
        </div>
      )}

      {/* Etapa 2: Resumo */}
      {summaryVisible && !cameraVisible && !photo && (
        <div>
          <h3>Resumo do Pedido</h3>
          <ul>
            {selectedDrinks.map((drink) => (
              <li key={drink.id}>
                {drink.quantity}x {drink.name}
              </li>
            ))}
          </ul>
          <button onClick={() => setSummaryVisible(false)}>Voltar</button>
          <button onClick={() => setCameraVisible(true)}>Abrir Câmera</button>
        </div>
      )}

      {/* Etapa 3: Câmera */}
      {cameraVisible && (
        <div>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{
              facingMode: "user",
            }}
          />
          <button onClick={capture}>Tirar Foto</button>
        </div>
      )}

      {/* Etapa 4: Envio */}
      {photo && (
        <div>
          <h3>Foto do Cliente</h3>
          <img src={photo} alt="Foto do cliente" width="100" />
          <form onSubmit={handleSubmit}>
            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Pedido"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
