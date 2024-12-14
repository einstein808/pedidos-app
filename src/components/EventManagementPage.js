import React, { useState, useEffect } from "react";

const EventManagementPage = () => {
  const [events, setEvents] = useState([]);
  const [newEventName, setNewEventName] = useState("");

  // Buscar todos os eventos
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:4000/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error("Erro ao carregar eventos:", response.statusText);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };
    fetchEvents();
  }, []);

  // Função para criar um novo evento
  const createEvent = async () => {
    if (!newEventName) {
      alert("Por favor, insira o nome do evento.");
      return;
    }

    const newEvent = { name: newEventName, isActive: 0 }; // "0" para inativo inicialmente

    try {
      const response = await fetch("http://localhost:4000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar evento: ${response.statusText}`);
      }

      const eventData = await response.json();
      setEvents((prevEvents) => [...prevEvents, eventData]);
      setNewEventName(""); // Limpar o campo após a criação
    } catch (error) {
      console.error("Erro ao criar evento:", error);
    }
  };

  // Função para ativar ou desativar o evento
  const toggleEventStatus = async (eventId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1; // Alterna entre 0 e 1

    try {
      const response = await fetch(`http://localhost:4000/events/${eventId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao alterar o status do evento: ${response.statusText}`);
      }

      // Atualizar o status do evento localmente
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, isActive: newStatus } : event
        )
      );
    } catch (error) {
      console.error("Erro ao alterar o status do evento:", error);
    }
  };

  // Função para excluir o evento
  const deleteEvent = async (eventId) => {
    const confirmation = window.confirm("Tem certeza que deseja excluir este evento?");
    if (!confirmation) return;

    try {
      const response = await fetch(`http://localhost:4000/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir evento: ${response.statusText}`);
      }

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
    }
  };

  return (
    <div className="event-management">
      <h2>Gerenciar Eventos</h2>

      <div className="create-event">
        <h3>Criar Novo Evento</h3>
        <input
          type="text"
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          placeholder="Nome do Evento"
        />
        <button onClick={createEvent}>Criar Evento</button>
      </div>

      <h3>Eventos Ativos/Inativos</h3>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <span>{event.name}</span>
            <button
              onClick={() => toggleEventStatus(event.id, event.isActive)}
              style={{
                backgroundColor: event.isActive === 1 ? "#5bc0de" : "#d9534f",
                color: "white",
                padding: "5px 10px",
                border: "none",
              }}
            >
              {event.isActive === 1 ? "Desativar" : "Ativar"}
            </button>
            <button
              onClick={() => deleteEvent(event.id)}
              style={{
                backgroundColor: "#d9534f",
                color: "white",
                padding: "5px 10px",
                border: "none",
                marginLeft: "10px",
              }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventManagementPage;
