import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";

const OrderForm = () => {
  const [drinks, setDrinks] = useState([]); // Estado para armazenar a lista de drinks
  const [selectedDrink, setSelectedDrink] = useState(""); // Estado para o drink selecionado
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false); // Estado para exibir carregamento
  const webcamRef = useRef(null);

  // Função para capturar a foto
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
  };

  // Função para carregar os drinks do backend
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

  // Função para enviar o pedido
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photo || !selectedDrink) {
      alert("Por favor, selecione um drink e tire uma foto.");
      return;
    }

    const newOrder = { drink: selectedDrink, photo };

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
        alert("Pedido criado com sucesso!");
        setSelectedDrink("");
        setPhoto(null);
      } else {
        const errorData = await response.json();
        alert(`Erro ao criar pedido: ${errorData.message || "Erro desconhecido"}`);
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

      {photo && (
        <div>
          <h3>Foto do Cliente:</h3>
          <img src={photo} alt="Foto do cliente" width="100" />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Selecione o Drink:
            <select
              value={selectedDrink}
              onChange={(e) => setSelectedDrink(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Selecione um Drink --
              </option>
              {drinks.map((drink) => (
                <option key={drink.id} value={drink.name}>
                  {drink.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Criar Pedido"}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
