import http from 'http';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { wsGateway } from './websocket/index.js';

const app = createApp();
const server = http.createServer(app);

// Initialize WebSockets
wsGateway.initialize(server);

server.listen(config.port, () => {
  console.log(`================================================================`);
  console.log(`🚀 Intelligent Route Optimization API is running!`);
  console.log(`📡 URL: http://localhost:${config.port}${config.apiPrefix}`);
  console.log(`🔌 WebSocket: ws://localhost:${config.port}/ws`);
  console.log(`🏥 Health: http://localhost:${config.port}${config.apiPrefix}/system/health`);
  console.log(`================================================================`);
});

export { server, app };
