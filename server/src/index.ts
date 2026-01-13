import http from 'http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { PongRoom } from './rooms/PongRoom';
import { ROOM_NAME } from '../../shared/messages';

const port = Number(process.env.PORT) || 2567;
const httpServer = http.createServer();

const gameServer = new Server({
    transport: new WebSocketTransport({
        server: httpServer
    })
});

gameServer.define(ROOM_NAME, PongRoom);

gameServer.listen(port);
console.log(`Colyseus server listening on ws://localhost:${port}`);
