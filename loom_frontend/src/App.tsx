import './App.css'
import Editor from '@monaco-editor/react';

export default function App() {
  return (
    <Editor 
      className="Monaco-Editor"
      height="90vh" 
      defaultLanguage="java" 
      defaultValue="// some comment" 
      theme='vs-dark'
    />
  );
}