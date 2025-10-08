import { useState } from 'react';
import './App.css';
import Editor from './components/CodeEditor';
import RoomSelector from './components/RoomSelector';

export default function App() {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  if (!currentRoom) {
    return <RoomSelector onJoinRoom={setCurrentRoom} />;
  }

  return (
    <div className="Monaco-Editor">
      <div className="room-header">
        <h3>Room: {currentRoom}</h3>
        <button onClick={() => setCurrentRoom(null)}>Leave Room</button>
      </div>
      <Editor 
        roomId={currentRoom}
        defaultLanguage="javascript"
        defaultValue="// Start coding together!"
      />
    </div>
  );
}