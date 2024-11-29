import React, { useState } from "react";
import axios from "axios";

const MakeOrder = () => {
    const [name, setName] = useState("");
    const [drink, setDrink] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !drink) return alert("Por favor, preencha todos os campos.");

        try {
            await axios.post("http://localhost:4000/orders", { name, drink });
            setName("");
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
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <select value={drink} onChange={(e) => setDrink(e.target.value)} required>
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
