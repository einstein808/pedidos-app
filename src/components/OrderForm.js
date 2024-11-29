import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

const OrderForm = () => {
  const [drink, setDrink] = useState('');
  const [photo, setPhoto] = useState(null);
  const webcamRef = useRef(null);

  // Função para capturar a foto
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
  };

  // Função para enviar o pedido
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Se a foto não foi tirada ou o drink não foi preenchido, avise o usuário
    if (!photo || !drink) {
      alert('Por favor, tire uma foto e selecione uma bebida.');
      return;
    }

    const newOrder = { 
      photo: photo, // Certifique-se de que a imagem está em base64
      drink: drink 
    };

    try {
      // Enviar para o backend
      const response = await fetch('http://localhost:4000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });

      // Verifica se a resposta foi bem-sucedida
      if (response.ok) {
        alert('Pedido criado com sucesso!');
        setDrink('');  // Limpa o campo do drink
        setPhoto(null);  // Limpa a foto após o envio
      } else {
        // Exibe o erro detalhado, se houver
        const errorData = await response.json();
        alert(`Erro ao criar pedido: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      // Captura qualquer erro de rede ou falha na requisição
      alert('Erro na requisição: ' + error.message);
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
            facingMode: "user"
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

      <div>
        <label>
          Bebida:
          <input
            type="text"
            value={drink}
            onChange={(e) => setDrink(e.target.value)}
            placeholder="Digite a bebida"
          />
        </label>
      </div>

      <button onClick={handleSubmit}>Criar Pedido</button>
    </div>
  );
};

export default OrderForm;
