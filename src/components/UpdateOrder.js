import React, { useState, useEffect } from 'react';

const UpdateOrder = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Função para pegar os últimos 30 pedidos
  const fetchOrders = async () => {
    const response = await fetch('http://localhost:4000/orders');
    const data = await response.json();

    // Filtra os pedidos que não estão prontos e limita a 30 pedidos
    const pendingOrders = data.filter((order) => order.status !== 'Pronto').slice(0, 30);
    setOrders(pendingOrders);
  };

  // Atualizar status do pedido
  const handleUpdate = async (orderId) => {
    if (!selectedStatus) {
      return alert('Por favor, selecione um status.');
    }

    const response = await fetch(`http://localhost:4000/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: selectedStatus }),
    });

    if (response.ok) {
      alert('Status do pedido atualizado com sucesso!');
      fetchOrders(); // Atualiza a lista de pedidos
    } else {
      alert('Erro ao atualizar o status do pedido');
    }

    setUpdatingOrderId(null); // Reseta o pedido sendo atualizado
    setSelectedStatus(''); // Reseta o status selecionado
  };

  // Função para alterar o status de um pedido
  const handleStatusChange = (orderId, status) => {
    setUpdatingOrderId(orderId);
    setSelectedStatus(status);
  };

  useEffect(() => {
    // Pegar os pedidos assim que o componente for montado
    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Atualizar Status dos Pedidos</h2>

      <h3>Últimos Pedidos:</h3>
      <ul>
        {orders.length === 0 ? (
          <p>Sem pedidos pendentes no momento.</p>
        ) : (
          orders.map((order) => (
            <li key={order.id}>
              <strong>{order.name}</strong>: {order.drink} - Status: {order.status}

              {/* Seleção do status */}
              {updatingOrderId === order.id ? (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Selecione o status</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Pronto">Pronto</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              ) : (
                <span>{order.status}</span>
              )}

              {/* Botões de Atualizar Status */}
              {updatingOrderId === order.id ? (
                <button onClick={() => handleUpdate(order.id)}>Atualizar Status</button>
              ) : (
                <button onClick={() => handleStatusChange(order.id, order.status)}>Alterar Status</button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UpdateOrder;
