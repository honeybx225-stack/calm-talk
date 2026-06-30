export default function MessageBubble({ message, currentUser }) {
  if (message.role === 'system') {
    return <div className="msg msg-system">{message.text}</div>;
  }

  if (message.role === 'mediator') {
    return (
      <div className="msg msg-mediator">
        <span className="msg-label">🕊 AI 調解員</span>
        <p>{message.text}</p>
      </div>
    );
  }

  const isMine = message.sender === currentUser;
  return (
    <div className={`msg ${isMine ? 'msg-mine' : 'msg-theirs'}`}>
      <span className="msg-label">{message.sender}</span>
      <p>{message.text}</p>
    </div>
  );
}
