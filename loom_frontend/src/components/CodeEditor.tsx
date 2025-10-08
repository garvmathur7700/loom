import { useRef, useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

interface EditorProps {
  roomId: string
  defaultLanguage?: string
  defaultValue?: string
  language?: string
  onLanguageChange?: (language: string) => void
}

function Editor({ roomId, defaultLanguage = 'javascript', defaultValue = '', language, onLanguageChange }: EditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const yDocRef = useRef<Y.Doc | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (editorRef.current) {
        const code = editorRef.current.getValue();
        const storageKey = `loom-room-${roomId}`;
        
        localStorage.setItem(storageKey, JSON.stringify({
          code,
          language,
          timestamp: new Date().toISOString()
        }));
        
        setLastSaved(new Date());
        console.log('Auto-saved at', new Date().toLocaleTimeString());
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [roomId, language]);

  // Load from localStorage on mount
  useEffect(() => {
    const storageKey = `loom-room-${roomId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved && editorRef.current) {
      try {
        const { code, language: savedLanguage } = JSON.parse(saved);
        if (code && onLanguageChange && savedLanguage) {
          onLanguageChange(savedLanguage);
          // Note: The code will be synced via Yjs, so we don't set it directly
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, [roomId]);

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) {
    editorRef.current = editor;
    
    // ==================== JavaScript/TypeScript Configuration ====================
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
    });

    // ==================== Python Configuration ====================
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        const suggestions = [
          {
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1:message})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Print output to console',
            range: range
          },
          {
            label: 'def',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'def ${1:function_name}(${2:params}):\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a function',
            range: range
          },
          {
            label: 'class',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'class ${1:ClassName}:\n\tdef __init__(self${2:, params}):\n\t\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a class',
            range: range
          },
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'if ${1:condition}:\n\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'If statement',
            range: range
          },
          {
            label: 'for',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'for ${1:item} in ${2:iterable}:\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'For loop',
            range: range
          },
          {
            label: 'while',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'while ${1:condition}:\n\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'While loop',
            range: range
          },
          {
            label: 'import',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'import ${1:module}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Import module',
            range: range
          },
          {
            label: 'from',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'from ${1:module} import ${2:name}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Import from module',
            range: range
          }
        ];
        return { suggestions };
      }
    });

    // ==================== Java Configuration ====================
    monaco.languages.registerCompletionItemProvider('java', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        const suggestions = [
          {
            label: 'main',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'public static void main(String[] args) {\n\t${1}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Main method',
            range: range
          },
          {
            label: 'sout',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'System.out.println(${1:message});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Print to console',
            range: range
          },
          {
            label: 'class',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'public class ${1:ClassName} {\n\t${2}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a class',
            range: range
          },
          {
            label: 'for',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'for (${1:int i = 0}; ${2:i < length}; ${3:i++}) {\n\t${4}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'For loop',
            range: range
          },
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'if (${1:condition}) {\n\t${2}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'If statement',
            range: range
          },
          {
            label: 'while',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'while (${1:condition}) {\n\t${2}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'While loop',
            range: range
          }
        ];
        return { suggestions };
      }
    });

    // ==================== C++ Configuration ====================
    monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        const suggestions = [
          {
            label: 'main',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'int main() {\n\t${1}\n\treturn 0;\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Main function',
            range: range
          },
          {
            label: 'cout',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'std::cout << ${1:message} << std::endl;',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Print to console',
            range: range
          },
          {
            label: 'cin',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'std::cin >> ${1:variable};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Read from console',
            range: range
          },
          {
            label: 'include',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '#include <${1:iostream}>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Include header',
            range: range
          },
          {
            label: 'for',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'for (${1:int i = 0}; ${2:i < n}; ${3:i++}) {\n\t${4}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'For loop',
            range: range
          },
          {
            label: 'class',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'class ${1:ClassName} {\npublic:\n\t${2}\nprivate:\n\t${3}\n};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a class',
            range: range
          }
        ];
        return { suggestions };
      }
    });

    // ==================== HTML Configuration ====================
    monaco.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        const suggestions = [
          {
            label: 'html5',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${1:Document}</title>\n</head>\n<body>\n\t${2}\n</body>\n</html>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'HTML5 boilerplate',
            range: range
          },
          {
            label: 'div',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<div class="${1:className}">\n\t${2}\n</div>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Div element',
            range: range
          },
          {
            label: 'button',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<button type="${1:button}">${2:Click me}</button>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Button element',
            range: range
          },
          {
            label: 'input',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<input type="${1:text}" placeholder="${2:Enter text}">',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Input element',
            range: range
          }
        ];
        return { suggestions };
      }
    });

    // ==================== CSS Configuration ====================
    monaco.languages.registerCompletionItemProvider('css', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        const suggestions = [
          {
            label: 'flex-center',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'display: flex;\njustify-content: center;\nalign-items: center;',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Flexbox center',
            range: range
          },
          {
            label: 'grid',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'display: grid;\ngrid-template-columns: ${1:repeat(3, 1fr)};\ngap: ${2:1rem};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'CSS Grid',
            range: range
          },
          {
            label: 'transition',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'transition: ${1:all} ${2:0.3s} ${3:ease};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Transition property',
            range: range
          }
        ];
        return { suggestions };
      }
    });

    // Yjs setup
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('monaco');
    const yLanguage = ydoc.getMap('language');
    
    yDocRef.current = ydoc;
    
    // Use environment variable for WebSocket URL
    const wsUrl = import.meta.env.VITE_WS_URL || 'wss://loom-backend-production-87df.up.railway.app';
    
    providerRef.current = new WebsocketProvider(
      wsUrl,
      roomId,
      ydoc
    );

    const awareness = providerRef.current.awareness;
    const userName = `User-${Math.floor(Math.random() * 1000)}`;
    const userColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    awareness.setLocalStateField('user', {
      name: userName,
      color: userColor
    });

    const currentLanguage = yLanguage.get('current') as string | undefined;
    if (!currentLanguage && language) {
      yLanguage.set('current', language);
    } else if (currentLanguage && currentLanguage !== language && onLanguageChange) {
      onLanguageChange(currentLanguage);
    }

    yLanguage.observe(() => {
      const newLanguage = yLanguage.get('current') as string | undefined;
      if (newLanguage && newLanguage !== language && onLanguageChange) {
        onLanguageChange(newLanguage);
      }
    });
    
    bindingRef.current = new MonacoBinding(
      ytext,
      editor.getModel()!,
      new Set([editor]),
      awareness
    );
    
    console.log('Editor mounted for room:', roomId, 'as', userName);
  }

  // Update shared language when local language changes
  useEffect(() => {
    if (yDocRef.current && language) {
      const yLanguage = yDocRef.current.getMap('language');
      const currentSharedLanguage = yLanguage.get('current') as string | undefined;
      
      if (currentSharedLanguage !== language) {
        yLanguage.set('current', language);
      }
    }
  }, [language]);

  // Add effect to handle language changes
  useEffect(() => {
    if (editorRef.current && language) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      providerRef.current?.destroy();
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
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
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          tabCompletion: 'on',
          suggest: {
            showWords: true,
            showSnippets: true,
            snippetsPreventQuickSuggestions: false,
          },
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
        }}
      />
      {lastSaved && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#4caf50',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          ✓ Saved at {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default Editor;