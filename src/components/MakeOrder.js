import React, { useState } from "react";
import axios from "axios";

const MakeOrder = () => {
  const [photo, setPhoto] = useState(null);
  const [drink, setDrink] = useState("");

  // Função para redimensionar a imagem
  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        img.src = reader.result;
      };
      
      reader.readAsDataURL(file);
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calcula a nova largura e altura da imagem
        let width = img.width;
        let height = img.height;

        // Ajusta a imagem mantendo a proporção
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Redimensiona a imagem
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Converte para base64
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.7); // Compressão de 70%
        resolve(resizedDataUrl);
      };

      img.onerror = reject;
    });
  };

  // Função para capturar a foto
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const resizedPhoto = await resizeImage(file, 800, 600); // Ajusta o tamanho máximo (800x600)
        setPhoto(resizedPhoto); // Converte para base64 e armazena no estado
      } catch (error) {
        console.error("Erro ao redimensionar a imagem:", error);
        alert("Erro ao processar a imagem.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica se a foto e o drink foram selecionados
    if (!photo || !drink) return alert("Por favor, preencha todos os campos.");

    try {
      // Envia os dados para o backend
      await axios.post("http://localhost:4000/orders", { photo, drink });
      setPhoto(null);
      setDrink("");
      alert("Pedido realizado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      alert("Ocorreu um erro ao fazer o pedido.");
    }
  };

  return (
    <div>
      <h2>Faça seu Pedido</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          required
        />
        <select
          value={drink}
          onChange={(e) => setDrink(e.target.value)}
          required
        >
          <option value="">Escolha um drink</option>
          <option value="Mojito">Mojito</option>
          <option value="Margarita">Margarita</option>
          <option value="Caipirinha">Caipirinha</option>
        </select>
        <button type="submit">Fazer Pedido</button>
      </form>
    </div>
  );
};

export default MakeOrder;
