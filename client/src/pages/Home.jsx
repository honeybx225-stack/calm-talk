import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiBase}/rooms`, { method: 'POST' });
      const data = await res.json();
      navigate(`/room/${data.roomId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <h1>Calm Talk</h1>
      <p>一個有 AI 調解員在場的對話空間，幫助兩人好好溝通。</p>
      <button onClick={createRoom} disabled={loading}>
        {loading ? '建立中...' : '建立新對話'}
      </button>
    </div>
  );
}
