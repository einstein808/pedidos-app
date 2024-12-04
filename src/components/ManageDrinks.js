import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageDrinks = () => {
  const [drinks, setDrinks] = useState([]);
  const [activeDrinks, setActiveDrinks] = useState([]);
  const [inactiveDrinks, setInactiveDrinks] = useState([]);

  // Buscar drinks do backend
  const fetchDrinks = async () => {
    try {
      const response = await axios.get('http://localhost:4000/drinks');
      const allDrinks = response.data;
      setDrinks(allDrinks);
      setActiveDrinks(allDrinks.filter((drink) => drink.is_active));
      setInactiveDrinks(allDrinks.filter((drink) => !drink.is_active));
    } catch (error) {
      console.error('Erro ao buscar drinks:', error);
    }
  };

  // Alterar status de ativo/inativo
  const toggleActiveStatus = async (id, isActive) => {
    try {
      await axios.put(`http://localhost:4000/drinks/${id}`, { is_active: isActive });
      fetchDrinks(); // Atualizar lista de drinks
    } catch (error) {
      console.error('Erro ao atualizar drink:', error);
      alert('Erro ao atualizar drink.');
    }
  };

  useEffect(() => {
    fetchDrinks();
  }, []);

  return (
    <div>
      <h2>Gerenciar Drinks</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Tabela de Drinks Ativos */}
        <div>
          <h3>Drinks Ativos</h3>
          <ul>
            {activeDrinks.map((drink) => (
              <li key={drink.id}>
                <img src={drink.photo} alt={drink.name} width="50" />
                <strong>{drink.name}</strong>
                <p>Ingredientes: {drink.ingredients}</p>
                <button onClick={() => toggleActiveStatus(drink.id, 0)}>
                  Tornar Inativo
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tabela de Drinks Inativos */}
        <div>
          <h3>Drinks Inativos</h3>
          <ul>
            {inactiveDrinks.map((drink) => (
              <li key={drink.id}>
                <img src={drink.photo} alt={drink.name} width="50" />
                <strong>{drink.name}</strong>
                <p>Ingredientes: {drink.ingredients}</p>
                <button onClick={() => toggleActiveStatus(drink.id, 1)}>
                  Tornar Ativo
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageDrinks;
