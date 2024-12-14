import React from "react";
import { Link } from "react-router-dom";

const Hub = () => {
  const routes = [
    { path: "/make-order", label: "Criar Pedido" },
    { path: "/order-status", label: "Status dos Pedidos" },
    { path: "/update-order", label: "Atualizar Pedido" },
    { path: "/drinks", label: "Gerenciar Drinks" },
    { path: "/create-drink", label: "Criar Drink" },
    { path: "/events", label: "Eventos" },
    { path: "/dashboard", label: "dashboard" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#007BFF", marginBottom: "20px" }}>Menu Principal</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          width: "80%",
        }}
      >
        {routes.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            style={{
              textDecoration: "none",
              textAlign: "center",
              backgroundColor: "#007BFF",
              color: "white",
              padding: "15px",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            }}
          >
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Hub;
