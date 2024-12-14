import React, { useEffect, useState } from "react";
import axios from "axios"; // Para facilitar as requisições HTTP
import './Dashboard.css'

const Dashboard = () => {
  const [eventDrinkCounts, setEventDrinkCounts] = useState([]);
  const [topDrinks, setTopDrinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar os dados do dashboard
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/events/dashboard");
        setEventDrinkCounts(response.data.eventDrinkCounts);
        setTopDrinks(response.data.topDrinks);
        setLoading(false); // Dados carregados
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <p>Carregando dados...</p>;
  }

  return (
    <div>
      <h2>Dashboard de Eventos</h2>
      
      {/* Exibição do número de drinks por evento, quantidade de pessoas e localidade */}
      <section>
        <h3>Número de Drinks por Evento</h3>
        <table>
          <thead>
            <tr>
              <th>Evento</th>
              <th>Quantidade de Drinks</th>
              <th>Quantidade de Pessoas</th>
              <th>Localidade</th>
            </tr>
          </thead>
          <tbody>
            {eventDrinkCounts.map((event) => (
              <tr key={event.eventId}>
                <td>{event.eventName}</td>
                <td>{event.drinkCount}</td>
                <td>{event.guestCount}</td> {/* Exibindo a quantidade de pessoas */}
                <td>{event.location}</td>  {/* Exibindo a localidade */}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
      {/* Exibição dos drinks mais vendidos */}
      <section>
        <h3>Drinks Mais Vendidos</h3>
        <table>
          <thead>
            <tr>
              <th>Drink</th>
              <th>Quantidade de Pedidos</th>
            </tr>
          </thead>
          <tbody>
            {topDrinks.map((drink) => (
              <tr key={drink.drinkName}>
                <td>{drink.drinkName}</td>
                <td>{drink.drinkOrders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;
