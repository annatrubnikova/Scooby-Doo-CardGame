const express = require('express');
const bodyParser = require('body-parser');
const session = require("express-session");
const http = require('http');
const socketio = require('socket.io');
const app = express();
const hostname = '127.0.0.1';
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(__dirname + '/public'));

app.use(session({secret: 'hsjhjgkdfjgksj', saveUninitialized: true, resave: true, user: {}}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));
app.use(express.static('sounds'));
app.use(express.static('images'));
app.use('/', express.static('views'));

app.use((req, res, next) => {
  req.session = req.session || {};
  next();
});

const routes = require('./routers.js');
app.use('/', routes);

const server = http.createServer(app);
const io = socketio(server);

let games = {};

const cards = [
  { id: 1, attack: 4, defense: 2 },
  { id: 2, attack: 3, defense: 3 },
  { id: 3, attack: 4, defense: 1 },
  { id: 4, attack: 2, defense: 2 },
  { id: 5, attack: 1, defense: 3 },
  { id: 6, attack: 3, defense: 2 },
  { id: 7, attack: 2, defense: 1 },
  { id: 8, attack: 4, defense: 3 },
  { id: 9, attack: 3, defense: 1 },
  { id: 10, attack: 2, defense: 3 },
  { id: 11, attack: 4, defense: 2 },
  { id: 12, attack: 3, defense: 3 },
  { id: 13, attack: 1, defense: 1 },
  { id: 14, attack: 2, defense: 2 },
  { id: 15, attack: 4, defense: 3 },
  { id: 16, attack: 3, defense: 1 },
  { id: 17, attack: 2, defense: 3 },
  { id: 18, attack: 4, defense: 1 },
  { id: 19, attack: 1, defense: 2 },
  { id: 20, attack: 3, defense: 2 },
];

function generateDeck() {
  // Генерація 10 випадкових карт
  let deck = [];
  while (deck.length < 10) {
    const card = cards[Math.floor(Math.random() * cards.length)];
    if (!deck.some(e => e.id === card.id)) {
      deck.push(card);
    }
  }
  return deck;
}

function removeCardFromDeck(user, cardId) {
  const index = user.deck.findIndex(card => card.id === cardId);
  if (index !== -1) {
      user.deck.splice(index, 1);
  }
}

function startTurnTimer(user1, user2, activeUser) {
  const timeLimit = 15000; 
  const inactiveUser = activeUser === user1 ? user2 : user1;
  
  clearTimeout(inactiveUser.turnTimer);
  activeUser.emit('your-move', true);
  inactiveUser.emit('your-move', false);

  activeUser.turnTimer = setTimeout(() => {
      activeUser.missedTurns++; 

      if (activeUser.missedTurns >= 2) {
          activeUser.emit('game-over', { result: 'lose' });
          inactiveUser.emit('game-over', { result: 'win' });

          leaveChatRoom(activeUser);
          leaveChatRoom(inactiveUser);
      } else {
          startTurnTimer(user1, user2, inactiveUser); // Передаємо хід іншому гравцю
      }
  }, timeLimit);
}


let waitingQueue = [];

io.on('connection', (sock) => {
  console.log('Someone connected');
  sock.inChatRoom = false; 
  sock.missedTurns = 0;
  sock.on('search-chat-partner', () => {
    // Перевірка, чи користувач уже в черзі
    if (sock.inChatRoom) {
      console.log(`User ${sock.id} is already in a chat room`);
      return;
    }

    if (waitingQueue.includes(sock)) {
      console.log(`User ${sock.id} is already in the queue`);
      return;
    }
    
    waitingQueue.push(sock);

    // Якщо в черзі двоє людей, ми створюємо чат між ними
    while (waitingQueue.length >= 2) {
      const user1 = waitingQueue.shift();

      // Знаходимо іншого користувача, що не є користувачем user1
      let user2;
      for (let i = 0; i < waitingQueue.length; i++) {
        if (waitingQueue[i].id !== user1.id) {
          user2 = waitingQueue.splice(i, 1)[0];
          break;
        }
      }
      
      // Якщо user2 не знайдений, виходимо з циклу
      if (!user2) break;

      const roomId = `${user1.id}-${user2.id}`;
      
      user1.join(roomId);
      user2.join(roomId);

      user1.health = 20;
      user2.health = 20;

      user1.inChatRoom = true;
      user2.inChatRoom = true;

      user1.emit('chat-room-assigned', roomId);
      user2.emit('chat-room-assigned', roomId);

      console.log(`Users ${user1.id} (${user1.login}) and ${user2.id} (${user2.login}) are paired in room ${roomId}`);


      const player1Deck = generateDeck();
      const player2Deck = generateDeck();

      user1.emit('receive-deck', player1Deck);
      user2.emit('receive-deck', player2Deck);

      user1.deck = player1Deck;
      user2.deck = player2Deck;

      
      user1.emit('opponent-info', { login: user2.login });
      user2.emit('opponent-info', { login: user1.login });

      const firstMover = Math.random() < 0.5 ? 'user1' : 'user2';

      games[roomId] = {
        user1: { ...user1, deck: player1Deck, health: 20 },
        user2: { ...user2, deck: player2Deck, health: 20 },
        activeUser: firstMover === 'user1' ? user1.id : user2.id
      };

      if (firstMover === 'user1') {
        startTurnTimer(user1, user2, user1);
      } else {
        startTurnTimer(user1, user2, user2);
      }
      
      const handleCardSelection = (activeUser, opponentUser) => {
        activeUser.on('card-selected', (cardId) => {
          clearTimeout(activeUser.turnTimer);

          activeUser.emit('your-card-selected', cardId);
          opponentUser.emit('opponent-card-selected', cardId);
          activeUser.emit('your-move', false);
          opponentUser.emit('your-move', true);
      
          removeCardFromDeck(opponentUser, cardId);  
          console.log(cardId);
          const card = getCardById(cardId);
          console.log(card);
          opponentUser.health -= card.attack;
          if (activeUser.health <= 5) {
            activeUser.health += card.defense;
          }
          
          if (opponentUser.health <= 0) {
            activeUser.emit('game-over', { result: 'win' });
            opponentUser.emit('game-over', { result: 'lose' });
            leaveChatRoom(activeUser);
            leaveChatRoom(opponentUser);
            return;
        }
         
        if (activeUser.health <= 0) {
          activeUser.emit('game-over', { result: 'lose' });
          opponentUser.emit('game-over', { result: 'win' });
          leaveChatRoom(activeUser);
          leaveChatRoom(opponentUser);
          return;
      }
          activeUser.emit('update-health', { playerHealth: activeUser.health, opponentHealth: opponentUser.health });
          opponentUser.emit('update-health', { playerHealth: opponentUser.health, opponentHealth: activeUser.health });
          
          games[roomId].user1 = { ...activeUser };
          games[roomId].user2 = { ...opponentUser };

          startTurnTimer(activeUser, opponentUser, opponentUser);
        });
      };
      
      handleCardSelection(user1, user2);
      handleCardSelection(user2, user1);
    }
  
  });

  sock.on('send-private-message', (roomId, message) => {
    io.to(roomId).emit('private-message', {
        senderId: sock.id,
        senderLogin: sock.login,
        text: message
    });
});

sock.on('register-login', (login) => {
  console.log(`User ${sock.id} set login as: ${login}`);
  sock.login = login;
});

  sock.on('disconnect', () => {
    leaveChatRoom(sock);
    // Remove user from the waiting queue if they are in it
    const index = waitingQueue.indexOf(sock);
    if (index > -1) {
      waitingQueue.splice(index, 1);
    }
  });

  sock.on('reconnect-request', (roomId) => {
    const game = games[roomId];
    if (game) {
      if (game.user1.id === sock.id || game.user2.id === sock.id) {
        sock.emit('game-state', game);
      }
    }
  });
  
});

function leaveChatRoom(sock) {
  const rooms = Object.keys(sock.rooms);
  rooms.forEach(roomId => {
      if (roomId !== sock.id) {  
          sock.leave(roomId);
      }
  });
  sock.inChatRoom = false;
  const gameRoom = Object.keys(games).find(roomId => games[roomId].user1.id === sock.id || games[roomId].user2.id === sock.id);
  if (gameRoom) {
    delete games[gameRoom];
  }

  sock.emit('redirect-to-home');
}

function getCardById(cardId) {
  return cards.find(card => card.id == cardId);
}

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


