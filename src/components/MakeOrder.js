import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const MakeOrder = () => {
  const [drinks, setDrinks] = useState([]);
  const [selectedDrink, setSelectedDrink] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [orders, setOrders] = useState([]);
  
  // Conectar ao WebSocket
  useEffect(() => {
    const socket = io('http://localhost:4000');
    
    // Escutar o evento 'newOrder' para atualizar a lista de pedidos em tempo real
    socket.on('newOrder', (order) => {
      setOrders((prevOrders) => [...prevOrders, order]);
    });

    return () => {
      socket.disconnect(); // Desconectar o WebSocket quando o componente for desmontado
    };
  }, []);

  // Buscar drinks ativos do backend
  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const response = await axios.get('http://localhost:4000/drinks/active');
        setDrinks(response.data);
      } catch (error) {
        console.error('Erro ao buscar drinks', error);
      }
    };

    fetchDrinks();
  }, []);

  // Função para fazer o pedido
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !selectedDrink || !photo) {
      return alert('Por favor, preencha todos os campos.');
    }

    try {
      const response = await axios.post('http://localhost:4000/orders', {
        name,
        drink: selectedDrink,
        photo,
      });

      alert('Pedido feito com sucesso!');
      setName('');
      setSelectedDrink('');
      setPhoto('');
    } catch (error) {
      console.error('Erro ao cadastrar pedido', error);
      alert('Erro ao cadastrar pedido');
    }
  };

  return (
    <div>
      <h2>Faça seu Pedido</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Seu nome:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Digite seu nome" 
          />
        </div>

        <div>
          <label>Selecione o drink:</label>
          <select 
            value={selectedDrink} 
            onChange={(e) => setSelectedDrink(e.target.value)}
          >
            <option value="">Selecione um drink</option>
            {drinks.map((drink) => (
              <option key={drink.id} value={drink.name}>
                {drink.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Foto do drink:</label>
          <input 
            type="text" 
            value={photo} 
            onChange={(e) => setPhoto(e.target.value)} 
            placeholder="URL da foto do drink" 
          />
        </div>

        <button type="submit">Fazer Pedido</button>
      </form>

      <h3>Pedidos Recentes</h3>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <strong>{order.name}</strong> pediu <em>{order.drink}</em> - Status: {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MakeOrder;
