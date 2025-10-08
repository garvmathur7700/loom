import { useState } from 'react';

interface RoomSelectorProps {
  onJoinRoom: (roomId: string) => void;
}

export default function RoomSelector({ onJoinRoom }: RoomSelectorProps) {
  const [roomId, setRoomId] = useState('');

  const handleJoin = () => {
    if (roomId.trim()) {
      onJoinRoom(roomId);
    }
  };

  const handleCreateNew = () => {
    const newRoomId = Math.random().toString(36).substring(7);
    onJoinRoom(newRoomId);
  };

  return (
    <div className="room-selector">
      <h2>Join a Coding Room</h2>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
      />
      <button onClick={handleJoin}>Join Room</button>
      <button onClick={handleCreateNew}>Create New Room</button>
    </div>
  );
}