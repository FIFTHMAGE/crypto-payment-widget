/** Real-time WebSocket Updates */
import { WebSocketServer } from 'ws';
export const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
  ws.on('message', (data) => console.log('Received:', data));
  ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));
});
export const broadcast = (data: any) => wss.clients.forEach(client => client.send(JSON.stringify(data)));

