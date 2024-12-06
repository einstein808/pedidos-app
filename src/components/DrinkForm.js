import React, { useState } from "react";

const DrinkForm = () => {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState("Ativo"); // Padrão para "Ativo"

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações básicas
    if (!name || !ingredients) {
      alert("Nome e ingredientes são obrigatórios!");
      return;
    }

    // Monta o objeto do drink
    const newDrink = {
      name,
      ingredients,
      photo: photo || null, // Photo pode ser null se não tiver imagem
      status,
    };

    try {
      // Envia o drink para o backend
      const response = await fetch("http://gamaro.me:4000/drinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDrink),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Drink "${data.name}" cadastrado com sucesso!`);
        // Limpar campos após o cadastro
        setName("");
        setIngredients("");
        setPhoto(null);
        setStatus("Ativo");
      } else {
        const errorData = await response.json();
        alert(`Erro ao cadastrar drink: ${errorData.message || "Erro desconhecido"}`);
      }
    } catch (error) {
      alert(`Erro ao realizar a requisição: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Cadastrar Drink</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Nome do Drink:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              required
            ></textarea>
          </label>
        </div>
        <div>
          <label>
            Foto (opcional):
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPhoto(reader.result); // Converte para Base64
                  };
                  reader.readAsDataURL(file);
                }
              }}
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
        <button type="submit">Cadastrar Drink</button>
      </form>
    </div>
  );
};

export default DrinkForm;
