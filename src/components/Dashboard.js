import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [eventDrinkCounts, setEventDrinkCounts] = useState([]);
  const [topDrinks, setTopDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentNumber, setCurrentNumber] = useState("");

  useEffect(() => {
    // Função para buscar os dados do dashboard
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("http://localhost:4000/events/dashboard");
        setEventDrinkCounts(response.data.eventDrinkCounts);
        setTopDrinks(response.data.topDrinks);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Função para buscar números de WhatsApp de um evento
  const fetchWhatsAppNumbers = async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:4000/events/whatsapp/${eventId}`);
      return response.data.map((row) => `55${row.whatsapp}`); // Adiciona o código do país
    } catch (error) {
      console.error("Erro ao buscar números de WhatsApp:", error);
      alert("Erro ao buscar números de WhatsApp.");
      return [];
    }
  };

  // Função para enviar mensagem via API
  const sendWhatsappMessage = async (number, message) => {
    const whatsappBody = {
      number: number,
      text: message,
    };

    try {
      const response = await fetch("https://api.gamaro.me/message/sendText/barmanjf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "Suapikeyaqui", // Substitua pela sua API key
        },
        body: JSON.stringify(whatsappBody),
      });

      if (!response.ok) {
        console.error(`Erro ao enviar mensagem para ${number}: ${response.statusText}`);
        return false;
      }

      console.log(`Mensagem enviada com sucesso para ${number}`);
      return true;
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${number}:`, error);
      return false;
    }
  };

  // Função para enviar mensagens em looping
  const handleSendMessagesInLoop = async (eventId) => {
    const confirmation = window.confirm(
      "Tem certeza que deseja enviar as mensagens para todos os números deste evento?"
    );
    if (!confirmation) return;

    try {
      setSending(true);

      const numbers = await fetchWhatsAppNumbers(eventId);
      if (numbers.length === 0) {
        alert("Nenhum número de WhatsApp encontrado.");
        setSending(false);
        return;
      }

      // Mensagem fixa
      const message = "Olá! Gostaríamos de saber a sua opinião sobre nossos drinks!";

      for (let i = 0; i < numbers.length; i++) {
        const number = numbers[i];
        setCurrentNumber(number); // Atualiza o número atual no estado
        await sendWhatsappMessage(number, message);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Pausa de 1 segundo entre os envios
      }

      alert("Mensagens enviadas com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar mensagens:", error);
      alert("Erro ao enviar mensagens.");
    } finally {
      setSending(false);
      setCurrentNumber("");
    }
  };

  if (loading) {
    return <p>Carregando dados...</p>;
  }

  return (
    <div>
      <h2>Dashboard de Eventos</h2>

      {/* Exibição do número total de drinks por evento */}
      <section>
        <h3>Número Total de Drinks por Evento</h3>
        <table>
          <thead>
            <tr>
              <th>Evento</th>
              <th>Quantidade de Drinks</th>
              <th>Localidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {eventDrinkCounts.map((event) => (
              <tr key={event.eventId}>
                <td>{event.eventName}</td>
                <td>{event.drinkCount}</td>
                <td>{event.location}</td>
                <td>
                  <button
                    onClick={() => handleSendMessagesInLoop(event.eventId)}
                    disabled={sending}
                  >
                    {sending ? "Enviando..." : "Enviar Mensagens"}
                  </button>
                </td>
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
              <th>Quantidade de Drinks Vendidos</th>
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

      {/* Feedback de envio */}
      {sending && currentNumber && (
        <p style={{ color: "blue", marginTop: "20px" }}>
          Enviando para: {currentNumber}...
        </p>
      )}
    </div>
  );
};

export default Dashboard;
