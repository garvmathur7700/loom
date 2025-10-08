import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const wss = new WebSocketServer({ port: 1234 });

// Store documents and awareness for each room
const docs = new Map();
const awarenesses = new Map();

const messageSync = 0;
const messageAwareness = 1;

wss.on('connection', (ws, req) => {
  // Extract room name from URL
  const roomName = new URL(req.url, 'http://localhost').pathname.slice(1) || 'default';
  
  console.log(`Client connected to room: ${roomName}`);
  
  // Get or create Yjs document for this room
  if (!docs.has(roomName)) {
    const doc = new Y.Doc();
    docs.set(roomName, doc);
    
    const awareness = new awarenessProtocol.Awareness(doc);
    awarenesses.set(roomName, awareness);
  }
  
  const doc = docs.get(roomName);
  const awareness = awarenesses.get(roomName);
  
  // Send sync step 1
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  ws.send(encoding.toUint8Array(encoder));
  
  // Send current awareness state
  const awarenessStates = awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys()))
    );
    ws.send(encoding.toUint8Array(awarenessEncoder));
  }
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const uint8Array = new Uint8Array(message);
      const decoder = decoding.createDecoder(uint8Array);
      const messageType = decoding.readVarUint(decoder);
      
      if (messageType === messageSync) {
        // Handle sync protocol
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, doc, ws);
        
        if (encoding.length(encoder) > 1) {
          ws.send(encoding.toUint8Array(encoder));
        }
        
        // Broadcast updates to other clients
        if (syncMessageType === syncProtocol.messageYjsSyncStep2) {
          const update = encoding.toUint8Array(encoder);
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(update);
            }
          });
        }
      } else if (messageType === messageAwareness) {
        // Handle awareness protocol
        awarenessProtocol.applyAwarenessUpdate(
          awareness,
          decoding.readVarUint8Array(decoder),
          ws
        );
        
        // Broadcast awareness to other clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(uint8Array);
          }
        });
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });
  
  ws.on('close', () => {
    console.log(`Client disconnected from room: ${roomName}`);
    // Remove awareness state
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, [doc.clientID], new Map())
    );
    const awarenessMessage = encoding.toUint8Array(awarenessEncoder);
    
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(awarenessMessage);
      }
    });
  });
});

console.log('WebSocket server running on ws://localhost:1234');