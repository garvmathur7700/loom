import { useState } from 'react';
import '../App.css';

interface RoomSelectorProps {
  onJoinRoom: (roomId: string) => void;
}

export default function RoomSelector({ onJoinRoom }: RoomSelectorProps) {
  const [roomId, setRoomId] = useState('');

  const handleJoin = () => {
    if (roomId.trim()) {
      onJoinRoom(roomId.trim());
    }
  };

  const handleCreateNew = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10);
    onJoinRoom(newRoomId);
  };

  return (
    <div className="room-selector">
      <div className="room-card">
        <div className="room-header">
          <h1 className="room-title">🧶 Loom</h1>
          <p className="room-subtitle">Real-time Collaborative Code Editor</p>
        </div>
        
        <div className="room-content">
          <div className="input-group">
            <label className="input-label">Join Existing Room</label>
            <input
              type="text"
              className="room-input"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            />
            <button className="join-btn" onClick={handleJoin}>
              Join Room
            </button>
          </div>
          
          <div className="divider">
            <span className="divider-text">OR</span>
          </div>
          
          <button className="create-btn" onClick={handleCreateNew}>
            Create New Room
          </button>
        </div>
      </div>
    </div>
  );
}