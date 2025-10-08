import { useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

interface EditorProps {
  roomId: string
  defaultLanguage?: string
  defaultValue?: string
}

function Editor({ roomId, defaultLanguage = 'javascript', defaultValue = '' }: EditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    
    // Create Yjs document
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('monaco');
    
    // Connect to WebSocket server
    providerRef.current = new WebsocketProvider(
      'ws://localhost:1234',
      roomId,
      ydoc
    );
    
    // Bind Monaco editor to Yjs
    bindingRef.current = new MonacoBinding(
      ytext,
      editor.getModel()!,
      new Set([editor]),
      providerRef.current.awareness
    );
    
    console.log('Editor mounted for room:', roomId);
  }

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      providerRef.current?.destroy();
    };
  }, []);

  return (
    <MonacoEditor
      height="90vh"
      defaultLanguage={defaultLanguage}
      defaultValue={defaultValue}
      theme="vs-dark"
      onMount={handleEditorDidMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
      }}
    />
  );
}

export default Editor;