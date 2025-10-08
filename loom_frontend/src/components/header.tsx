import '../App.css';

interface HeaderProps {
  roomId: string;
  language: string;
  onLanguageChange: (language: string) => void;
  onLeaveRoom: () => void;
}

export default function Header({ roomId, language, onLanguageChange, onLeaveRoom }: HeaderProps) {
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">🧶 Loom</h1>
        <div className="room-badge">
          <span className="room-label">Room:</span>
          <span className="room-id">{roomId}</span>
          <button className="copy-btn" onClick={copyRoomId} title="Copy Room ID">
            📋
          </button>
        </div>
      </div>
      
      <div className="header-right">
        <div className="online-indicator">
          <span className="status-dot"></span>
          <span className="status-text">Connected</span>
        </div>
        
        <select 
          className="language-select" 
          value={language} 
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
        
        <button className="leave-btn" onClick={onLeaveRoom}>
          Leave Room
        </button>
      </div>
    </header>
  );

}