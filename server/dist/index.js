"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = require("http");
const PORT = 3001;
const rooms = new Map();
function getRoomSummary(room) {
    return {
        roles: room.roles,
        started: room.started,
    };
}
function broadcastToRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    room.clients.forEach(({ ws, role }) => {
        if (ws.readyState !== ws_1.WebSocket.OPEN)
            return;
        const isGuesser = role === 'guesser_blue' || role === 'guesser_red';
        const cards = room.state.cards.map(card => ({
            ...card,
            card_color: isGuesser ? 'hidden' : card.card_color
        }));
        ws.send(JSON.stringify({
            type: 'state',
            game: { ...room.state, cards },
            lobby: getRoomSummary(room),
            yourRole: role,
        }));
    });
}
const verifyClient = (info) => {
    const origin = info.origin;
    console.log('WebSocket connection attempt from origin:', origin);
    return origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173';
};
const wss = new ws_1.WebSocketServer({ port: PORT, host: '127.0.0.1', verifyClient });
wss.on('connection', (ws) => {
    console.log('Client connected');
    let clientInfo = null;
    ws.on('error', (err) => {
        console.log('WebSocket error:', err);
    });
    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        // Crear sala
        if (msg.type === 'create') {
            const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
            rooms.set(roomId, {
                state: {
                    cards: msg.cards ?? [],
                    turn: 'blue',
                    scores: { blue: 0, red: 0 },
                    winner: null,
                },
                clients: [],
                roles: {
                    spymaster_blue: false,
                    spymaster_red: false,
                    guesser_blue: false,
                    guesser_red: false,
                },
                started: false,
            });
            clientInfo = { ws, role: null, roomId };
            rooms.get(roomId).clients.push(clientInfo);
            // Le manda el roomId al creador
            ws.send(JSON.stringify({ type: 'created', roomId }));
        }
        // Unirse a sala existente
        if (msg.type === 'join') {
            const room = rooms.get(msg.roomId);
            if (!room) {
                ws.send(JSON.stringify({ type: 'error', message: 'Sala no encontrada' }));
                return;
            }
            clientInfo = { ws, role: null, roomId: msg.roomId };
            room.clients.push(clientInfo);
            broadcastToRoom(msg.roomId);
        }
        // Elegir rol
        if (msg.type === 'pick_role' && clientInfo) {
            const room = rooms.get(clientInfo.roomId);
            if (!room || room.started)
                return;
            const role = msg.role;
            if (room.roles[role]) {
                ws.send(JSON.stringify({ type: 'error', message: 'Rol ya tomado' }));
                return;
            }
            // Liberar rol anterior si tenía uno
            if (clientInfo.role)
                room.roles[clientInfo.role] = false;
            room.roles[role] = true;
            clientInfo.role = role;
            broadcastToRoom(clientInfo.roomId);
        }
        // Iniciar partida
        if (msg.type === 'start' && clientInfo) {
            const room = rooms.get(clientInfo.roomId);
            if (!room || room.started)
                return;
            room.started = true;
            broadcastToRoom(clientInfo.roomId);
        }
        // Revelar carta
        if (msg.type === 'reveal' && clientInfo) {
            const role = clientInfo.role;
            if (role !== 'guesser_blue' && role !== 'guesser_red')
                return;
            const room = rooms.get(clientInfo.roomId);
            if (!room || !room.started || room.state.winner)
                return;
            const card = room.state.cards[msg.index];
            if (!card || card.revealed)
                return;
            card.revealed = true;
            if (card.card_color === 'blue')
                room.state.scores.blue++;
            if (card.card_color === 'red')
                room.state.scores.red++;
            const blueTotal = room.state.cards.filter(c => c.card_color === 'blue').length;
            const redTotal = room.state.cards.filter(c => c.card_color === 'red').length;
            if (room.state.scores.blue === blueTotal)
                room.state.winner = 'blue';
            if (room.state.scores.red === redTotal)
                room.state.winner = 'red';
            broadcastToRoom(clientInfo.roomId);
        }
    });
    ws.on('close', (code, reason) => {
        console.log('Client disconnected with code:', code, 'reason:', reason.toString());
        if (!clientInfo)
            return;
        const room = rooms.get(clientInfo.roomId);
        if (!room)
            return;
        if (clientInfo.role)
            room.roles[clientInfo.role] = false;
        room.clients = room.clients.filter(c => c.ws !== ws);
    });
});
console.log(`Server running on ws://localhost:${PORT}`);
//# sourceMappingURL=index.js.map