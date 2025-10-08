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
    
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('monaco');
    
    providerRef.current = new WebsocketProvider(
      'ws://localhost:1234',
      roomId,
      ydoc
    );

    // Add user info to awareness
    const awareness = providerRef.current.awareness;
    const userName = `User-${Math.floor(Math.random() * 1000)}`;
    const userColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    awareness.setLocalStateField('user', {
      name: userName,
      color: userColor
    });
    
    bindingRef.current = new MonacoBinding(
      ytext,
      editor.getModel()!,
      new Set([editor]),
      awareness
    );
    
    console.log('Editor mounted for room:', roomId, 'as', userName);
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