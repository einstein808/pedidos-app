import React from "react";
import ReactDOM from "react-dom/client"; // Importar de 'react-dom/client'
import App from "./App";

// Usando a nova API de React 18 com createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
