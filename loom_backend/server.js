import { WebSocketServer } from 'ws';
import * as Y from 'yjs';

const wss = new WebSocketServer({ port: 1234 });

// Store documents for each room
const docs = new Map();

wss.on('connection', (ws, req) => {
  // Extract room name from URL
  const roomName = new URL(req.url, 'http://localhost').pathname.slice(1) || 'default';
  
  console.log(`Client connected to room: ${roomName}`);
  
  // Get or create Yjs document for this room
  if (!docs.has(roomName)) {
    docs.set(roomName, new Y.Doc());
  }
  
  const doc = docs.get(roomName);
  
  // Send current document state to new client
  const state = Y.encodeStateAsUpdate(doc);
  ws.send(Buffer.from([0, ...state])); // 0 = sync step 1
  
  // Handle incoming messages
  ws.on('message', (message) => {
    const buffer = new Uint8Array(message);
    
    // Apply update to document
    if (buffer[0] === 0 || buffer[0] === 2) {
      Y.applyUpdate(doc, buffer.slice(1));
      
      // Broadcast to all other clients in the same room
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(message);
        }
      });
    }
  });
  
  ws.on('close', () => {
    console.log(`Client disconnected from room: ${roomName}`);
  });
});



console.log('WebSocket server running on ws://localhost:1234');