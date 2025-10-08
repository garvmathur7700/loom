import './App.css'
import Editor from './components/CodeEditor'

export default function App() {
  return (
    <div className="Monaco-Editor">
      <Editor 
        roomId="default-room"
        defaultLanguage="javascript"
        defaultValue="// Start coding together!"
      />
    </div>
  );
}