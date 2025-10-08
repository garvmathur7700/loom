import { useState } from 'react';
import './App.css';
import Editor from './components/CodeEditor';
import Header from './components/header';
import Footer from './components/Footer';
import RoomSelector from './components/RoomSelector';

export default function App() {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [language, setLanguage] = useState('javascript');

  if (!currentRoom) {
    return <RoomSelector onJoinRoom={setCurrentRoom} />;
  }

  return (
    <div className="app">
      <Header 
        roomId={currentRoom}
        language={language}
        onLanguageChange={setLanguage}
        onLeaveRoom={() => setCurrentRoom(null)}
      />
      
      <main className="editor-main">
        <Editor 
          roomId={currentRoom}
          defaultLanguage={language}
          defaultValue="// Start coding together!"
          language={language}
          onLanguageChange={setLanguage}
        />
      </main>
      
      <Footer />
    </div>
  );
}