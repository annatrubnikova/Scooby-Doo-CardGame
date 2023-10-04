let userLogin = localStorage.getItem('userLogin');
//localStorage.clear();
let userAvatar = localStorage.getItem('userAvatar')
const socket = io();

let currentRoomId;
socket.emit('register-login', {login: userLogin, avatar: userAvatar});
socket.emit('search-chat-partner');

socket.on('chat-room-assigned', (roomId) => {
 currentRoomId = roomId;
 document.getElementById("chat-room").style.display = "flex";
});

socket.on('receive-coins', (data) => {
 userCoins = data;
 const coinsCountElement = document.getElementById('coins-display');
 coinsCountElement.textContent = "Coins: " + data; // оновлюємо кількість монеток на інтерфейсі
});

socket.on('private-message', (messageData) => {
 const messagesList = document.getElementById('chat-messages');
 const messageItem = document.createElement('li');

 if (messageData.senderId === socket.id) {
   messageItem.classList.add('my-message');
   messageItem.textContent = "Me: " + messageData.text; 
 } else {
   messageItem.classList.add('their-message');
   messageItem.textContent = messageData.senderLogin + ": " + messageData.text;
 }
 messagesList.scrollTop = messagesList.scrollHeight + 200;
 //messagesList.style.height = +messagesList.style.height + 30 + "px";
 messagesList.appendChild(messageItem);
});
let opponentLogin = '';
let opponentAvatar
socket.on('opponent-info', (data) => {
  opponentLogin = data.login;
  opponentAvatar = data.avatar;
});
let mycards = [];
let userCoins  = '';

socket.on('receive-deck', (deck) => {
  document.getElementById('player-health').textContent = "Your health: 20";
  document.getElementById('opponent-health').textContent = `${opponentLogin}'s health: 20`;
  document.getElementById('draw-button').innerHTML = `<button class="drawBtn"><i class="fa-solid fa-flag"></i></button>`;
  const playerCards = document.getElementById('player-cards');
  const opponentCards = document.getElementById('opponent-cards');

  let myAvatarDiv = document.querySelector('.my-avatar'); 
  let oppAvatarDiv = document.querySelector('.opp-avatar');

  const myImg = document.createElement('img');
  const oppImg = document.createElement('img');

  myImg.src = userAvatar;
  oppImg.src = opponentAvatar;

  myImg.classList.add('avatarClass'); 
  oppImg.classList.add('avatarClass');

  myAvatarDiv.appendChild(myImg);
  oppAvatarDiv.appendChild(oppImg);

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
displayCoins.textContent =  "Coins: " + userCoins;
centerArea.appendChild(cardElement);
});

let opponentCardsRemaining = 10;

socket.on('opponent-card-selected', (cardOpponent) => {    
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
document.getElementById('player-health').textContent = `Your health: ${data.playerHealth}`;
document.getElementById('opponent-health').textContent = `${opponentLogin}'s health: ${data.opponentHealth}`;
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
 turnInfo.textContent = 'Your move!';
 enableCardClicks();
} else {
 turnInfo.textContent = `${opponentLogin}'s move`; 
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
     event.currentTarget.parentNode.removeChild(event.currentTarget);
 };

 card.classList.remove('disabled-card');
});
}


let exitUser = 0;

socket.on('game-over', (data) => {
  if (data.result === 'win') {
      exitUser = 1;
      const oppAvatar = document.querySelector('.opp-avatar img');
     document.querySelector('.opp-health').textContent = '';
      if (oppAvatar) oppAvatar.style.visibility = 'hidden';
  } else if (data.result == 'lose') {
      exitUser = 1;
      const myAvatar = document.querySelector('.my-avatar img');
      document.querySelector('.my-health').textContent = '';
      document.getElementById('coins-display').textContent = '';
      if (myAvatar) myAvatar.style.visibility = 'hidden';
  } else if (data.result == 'goodbye') {
    exitUser = 1;
    window.location.href = '/home';
  } else if (data.result == 'draw') {
    exitUser = 1;
    alert('A draw is declared.');
    window.location.href = '/home';
  }
  
  // Затримаємо відображення повідомлення та перенаправлення
  setTimeout(() => {
      if (data.result === 'win') {
          alert('You won!');
          window.location.href = '/win-page';
      } else if (data.result == 'lose') {
          alert('You lost. Try another game!');
          window.location.href = '/lose-page';
      }
  }, 3000);
});


window.addEventListener('beforeunload', function (e) {
if (exitUser == 0) { 
localStorage.setItem('isExit', 'true');
var message = 'Are you sure you want to quit the game?';
e.returnValue = message; 
return message;
}
});

let textarea = document.getElementById('chat-messages');
textarea.scrollTop = textarea.scrollHeight;

document.getElementById('draw-button').addEventListener('click', function() {
  socket.emit('player-surrendered');
});