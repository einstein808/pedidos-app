import React, { useState, useEffect } from "react";

const EventManagementPage = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    name: "",
    location: "Juiz de Fora", // Padrão para a primeira cidade
    customLocation: "",
    guestCount: "",
    date: "",
    isActive: 0,
  });

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
    const { name, location, customLocation, guestCount, date } = newEvent;

    if (!name || !guestCount || !date) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const finalLocation = location === "Outra" ? customLocation : location;

    if (!finalLocation) {
      alert("Por favor, preencha a localização.");
      return;
    }

    const eventToCreate = {
      name,
      location: finalLocation,
      guestCount: parseInt(guestCount, 10),
      date,
      isActive: 0, // Evento começa inativo
    };

    try {
      const response = await fetch("http://localhost:4000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventToCreate),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar evento: ${response.statusText}`);
      }

      const eventData = await response.json();
      setEvents((prevEvents) => [...prevEvents, eventData]);
      setNewEvent({
        name: "",
        location: "Juiz de Fora",
        customLocation: "",
        guestCount: "",
        date: "",
        isActive: 0,
      }); // Resetar campos após criação
    } catch (error) {
      console.error("Erro ao criar evento:", error);
    }
  };

  // Função para alternar o status do evento
  const toggleEventStatus = async (eventId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;

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
    <div className="event-management" style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#4CAF50" }}>Gerenciar Eventos</h2>

      <div className="create-event" style={{ marginBottom: "20px" }}>
        <h3>Criar Novo Evento</h3>
        <input
          type="text"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          placeholder="Nome do Evento"
          style={{ marginBottom: "10px", padding: "8px", width: "100%" }}
        />
        <select
          value={newEvent.location}
          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value, customLocation: "" })}
          style={{ marginBottom: "10px", padding: "8px", width: "100%" }}
        >
          <option value="Juiz de Fora">Juiz de Fora</option>
          <option value="Matias Simão">Matias Simão</option>
          <option value="Outra">Outra</option>
        </select>
        {newEvent.location === "Outra" && (
          <input
            type="text"
            value={newEvent.customLocation}
            onChange={(e) => setNewEvent({ ...newEvent, customLocation: e.target.value })}
            placeholder="Digite a localização personalizada"
            style={{ marginBottom: "10px", padding: "8px", width: "100%" }}
          />
        )}
        <input
          type="number"
          value={newEvent.guestCount}
          onChange={(e) => setNewEvent({ ...newEvent, guestCount: e.target.value })}
          placeholder="Número de Convidados"
          style={{ marginBottom: "10px", padding: "8px", width: "100%" }}
        />
        <input
          type="date"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          style={{ marginBottom: "10px", padding: "8px", width: "100%" }}
        />
        <button
          onClick={createEvent}
          style={{
            padding: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Criar Evento
        </button>
      </div>

      <h3>Eventos Ativos/Inativos</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {events.map((event) => (
          <li
            key={event.id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            <strong>Nome:</strong> {event.name} <br />
            <strong>Localização:</strong> {event.location} <br />
            <strong>Convidados:</strong> {event.guestCount} <br />
            <strong>Data:</strong> {event.date} <br />
            <button
              onClick={() => toggleEventStatus(event.id, event.isActive)}
              style={{
                backgroundColor: event.isActive === 1 ? "#5bc0de" : "#d9534f",
                color: "white",
                padding: "5px 10px",
                border: "none",
                marginRight: "10px",
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
