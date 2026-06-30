import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../api/socket.js';
import MessageBubble from '../components/MessageBubble.jsx';

export default function Room() {
  const { roomId } = useParams();
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('system-message', (msg) => {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-sys`, role: 'system', text: msg.text },
      ]);
    });
    return () => {
      socket.off('new-message');
      socket.off('system-message');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    socket.emit('join-room', { roomId, name: name.trim() }, (res) => {
      if (res?.ok) {
        setMessages(res.messages || []);
        setJoined(true);
      } else {
        alert(res?.error || '加入失敗');
      }
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit('send-message', { roomId, name, text: input.trim() });
    setInput('');
  };

  const inviteLink = `${window.location.origin}/room/${roomId}`;

  if (!joined) {
    return (
      <div className="join">
        <h2>加入對話</h2>
        <p>
          邀請連結：<code>{inviteLink}</code>
        </p>
        <form onSubmit={handleJoin}>
          <input
            placeholder="你的名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">加入</button>
        </form>
      </div>
    );
  }

  return (
    <div className="room">
      <header>
        <h2>Calm Talk</h2>
        <p>
          邀請對方：<code>{inviteLink}</code>
        </p>
      </header>
      <div className="messages">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} currentUser={name} />
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="composer" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="輸入訊息..."
        />
        <button type="submit">送出</button>
      </form>
    </div>
  );
}
