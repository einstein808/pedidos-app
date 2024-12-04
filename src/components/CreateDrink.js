import React, { useState, useRef } from "react";
import Webcam from "react-webcam";

const CreateDrink = () => {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState("Ativo");
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !ingredients || !photo || !status) {
      alert("Todos os campos são obrigatórios.");
      return;
    }

    const newDrink = { name, ingredients, photo, status };

    try {
      const response = await fetch("http://localhost:4000/drinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDrink),
      });

      if (response.ok) {
        alert("Drink criado com sucesso!");
        setName("");
        setIngredients("");
        setPhoto(null);
        setStatus("Ativo");
      } else {
        const errorData = await response.json();
        alert(`Erro ao criar drink: ${errorData.message || "Erro desconhecido"}`);
      }
    } catch (error) {
      alert("Erro na requisição: " + error.message);
    }
  };

  return (
    <div>
      <h2>Criar Novo Drink</h2>

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
          <h3>Foto do Drink:</h3>
          <img src={photo} alt="Foto do drink" width="100" />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Nome do Drink:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do drink"
              required
            />
          </label>
        </div>

        <div>
          <label>
            Ingredientes:
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Digite os ingredientes separados por vírgula"
              required
            />
          </label>
        </div>

        <div>
          <label>
            Status:
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Ativo">Ativo</option>
              <option value="Arquivado">Arquivado</option>
            </select>
          </label>
        </div>

        <button type="submit">Criar Drink</button>
      </form>
    </div>
  );
};

export default CreateDrink;
