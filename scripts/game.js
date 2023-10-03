let userLogin = localStorage.getItem('userLogin');
//localStorage.clear();
const socket = io();

let currentRoomId;
socket.emit('register-login', userLogin);
socket.emit('search-chat-partner');

socket.on('chat-room-assigned', (roomId) => {
 currentRoomId = roomId;
 document.getElementById("chat-room").style.display = "flex";
 console.log(`Ви приєдналися до кімнати: ${roomId}`);
});

socket.on('receive-coins', (data) => {
 userCoins = data;
 const coinsCountElement = document.getElementById('coins-display');
 coinsCountElement.textContent = "Монетки: " + data; // оновлюємо кількість монеток на інтерфейсі
});

socket.on('private-message', (messageData) => {
 const messagesList = document.getElementById('chat-messages');
 const messageItem = document.createElement('li');

 if (messageData.senderId === socket.id) {
   messageItem.classList.add('my-message');
   messageItem.textContent = "Я: " + messageData.text; 
 } else {
   messageItem.classList.add('their-message');
   messageItem.textContent = messageData.senderLogin + ": " + messageData.text;
 }
 messagesList.scrollTop = messagesList.scrollHeight + 200;
 //messagesList.style.height = +messagesList.style.height + 30 + "px";
 messagesList.appendChild(messageItem);
});

let mycards = [];
let userCoins  = '';

socket.on('receive-deck', (deck) => {
 const playerCards = document.getElementById('player-cards');
 const opponentCards = document.getElementById('opponent-cards');
 mycards = deck;
// Відображення ваших карт
 deck.forEach(card => {
   const cardElement = document.createElement('img');
   cardElement.classList.add('card');
   cardElement.classList.add('mycard');
   cardElement.setAttribute('id', `${card.id}`);
   cardElement.src = `card${card.id}.png`;
   //cardElement.textContent = `Attack: ${card.attack} Defense: ${card.defense} Coins: ${card.coins}`;
   cardElement.onclick = () => {
     socket.emit('card-selected', card.id);
     socket.emit('your-card-selected', card.id);
     console.log("Card clicked!");
     event.currentTarget.parentNode.removeChild(event.currentTarget);
   };
   playerCards.appendChild(cardElement);
});

// Створення 10 "закритих" карток для опонента
for (let i = 0; i < 10; i++) {
 const cardBackElement = document.createElement('img');
 cardBackElement.src = 'back_card.png';
 cardBackElement.classList.add('card', 'card-back', 'card-oppo');
 opponentCards.appendChild(cardBackElement);
}
});




let opponentLogin = '';

socket.on('opponent-info', (data) => {
opponentLogin = data.login;
});



socket.on('your-card-selected', (cardId) => {  
const centerArea = document.getElementById('game-table');
const cardData = mycards.find(card => card.id == cardId); 

//const cardElement = document.createElement('div');
const cardElement = document.createElement('img');
cardElement.classList.add('card');
cardElement.classList.add('card-on-table');
//cardElement.textContent = `Attack: ${cardData.attack} Defense: ${cardData.defense} Coins ${cardData.coins}`; 
cardElement.src = `card${cardId}.png`;
//cardElement.textContent = `Attack: ${cardData.attack} Defense: ${cardData.defense} Coins ${cardData.coins}`; 
let displayCoins = document.getElementById('coins-display');
userCoins -= cardData.coins;
displayCoins.textContent =  "Монетки: " + userCoins;
centerArea.appendChild(cardElement);
});

let opponentCardsRemaining = 10;

socket.on('opponent-card-selected', (cardOpponent) => {
console.log('Card:', cardOpponent);        
const centerArea = document.getElementById('ggggg');
const cardElement = document.createElement('img');
cardElement.classList.add('opponent-card');
cardElement.classList.add('card-on-table');
cardElement.src = `card${cardOpponent.id}.png`;
//cardElement.textContent = `Attack: ${cardOpponent.attack} Defense: ${cardOpponent.defense} Coins: ${cardOpponent.coins}`; 
centerArea.appendChild(cardElement);

// Видаляємо "закриту" картку опонента
if (opponentCardsRemaining > 0) {
 const opponentCards = document.getElementById('opponent-cards');
 const cardBackElement = opponentCards.getElementsByClassName('card-back')[0];
 if (cardBackElement) {
     cardBackElement.remove();
     opponentCardsRemaining--;
 }
}
});

socket.on('update-health', (data) => {
document.getElementById('player-health').textContent = data.playerHealth;
document.getElementById('opponent-health').textContent = data.opponentHealth;
});


function sendPrivateMessage() {
 const messageInput = document.getElementById('message-input');
 const message = messageInput.value;
 if (message) {
   socket.emit('send-private-message', currentRoomId, message);
   messageInput.value = "";
 }
}

socket.on('your-move', (isYourMove) => {
const turnInfo = document.getElementById('turn-info');
if (isYourMove) {
 turnInfo.textContent = 'Ваш хід!';
 enableCardClicks();
} else {
 turnInfo.textContent = `Хід ${opponentLogin}`; 
 disableCardClicks();
}
});

function disableCardClicks() {
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
 card.onclick = null; 
 card.classList.add('disabled-card'); 
});
}

function enableCardClicks() {
const cards = document.querySelectorAll('.mycard');
const audioPlayer = document.getElementById('audioPlayer');
cards.volume = 0.01;

cards.forEach(card => {
 card.onclick = (event) => {
     if (audioPlayer.paused) {
         audioPlayer.play().then(() => {
             console.log("Audio is playing!");
         }).catch((error) => {
             console.error("Error playing the audio:", error);
         });
     } else {
         audioPlayer.pause();
         audioPlayer.currentTime = 0;
     }

     socket.emit('card-selected', card.getAttribute('id'));
     socket.emit('your-card-selected', card.getAttribute('id'));
     console.log("Card clicked!");
     event.currentTarget.parentNode.removeChild(event.currentTarget);
 };

 // Видалення деактивованого класу з картки
 card.classList.remove('disabled-card');
});
}


let exitUser = 0;

socket.on('game-over', (data) => {
if (data.result === 'win') {
 exitUser = 1;
 alert('Ви виграли!');
 window.location.href = '/win-page';
} else if (data.result == 'lose') {
 exitUser = 1;
 alert('Ви програли.');
 window.location.href = '/lose-page';
} else if (data.result == 'goodbye') {
exitUser = 1;
 window.location.href = '/home';
}
});

window.addEventListener('beforeunload', function (e) {
if (exitUser == 0) { 
localStorage.setItem('isExit', 'true');
var message = 'Ви впевнені, що хочете покинути гру?';
e.returnValue = message; 
return message;
}
});

let textarea = document.getElementById('chat-messages');
textarea.scrollTop = textarea.scrollHeight;