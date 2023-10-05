let userLogin = localStorage.getItem('userLogin');
let userAvatar = localStorage.getItem('userAvatar')
const socket = io();

let currentRoomId;
socket.emit('search-chat-partner', true);

// game
socket.on('receive-coins', (data) => {
  userCoins = data;
  const coinsCountElement = document.getElementById('coins-display');
  coinsCountElement.textContent = "Coins: " + data; 
});

let opponentLogin = 'Scooby-Doo';
let opponentAvatar = 'http://127.0.0.1:3000/scooby_avatar.png';

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

  myAvatarDiv.prepend(myImg);
  oppAvatarDiv.prepend(oppImg);

  mycards = deck;

  deck.forEach(card => {
    const cardElement = document.createElement('img');
    cardElement.classList.add('card');
    cardElement.classList.add('mycard');
    cardElement.setAttribute('id', `${card.id}`);
    cardElement.src = `card${card.id}.png`;
    cardElement.onclick = () => {
      socket.emit('card-selected', card.id);
      event.currentTarget.parentNode.removeChild(event.currentTarget);
    };
    playerCards.appendChild(cardElement);
  });

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

  const cardElement = document.createElement('img');
  cardElement.classList.add('card');
  cardElement.classList.add('card-on-table');

  cardElement.src = `card${cardId}.png`;

  let displayCoins = document.getElementById('coins-display');
  userCoins -= cardData.coins;
  displayCoins.textContent =  "Coins: " + userCoins;
  centerArea.appendChild(cardElement);
});

let opponentCardsRemaining = 10;

socket.on('opponent-card-selected', (computerCard) => {    
  const centerArea = document.getElementById('ggggg');
  const cardElement = document.createElement('img');
  cardElement.classList.add('opponent-card');
  cardElement.classList.add('card-on-table');
  cardElement.src = `card${computerCard.id}.png`;

  centerArea.appendChild(cardElement);

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
  document.getElementById('opponent-health').textContent = `Computer's health: ${data.opponentHealth}`;
});


socket.on('your-move', (isYourMove) => {
  const turnInfo = document.getElementById('turn-info');
  if (isYourMove) {
    turnInfo.textContent = 'Your move!';
    enableCardClicks();
    runtimer("progress-bar1", "progress-bar2");
  } else {
    turnInfo.textContent = `Computer's move`; 
    disableCardClicks();
    runtimer("progress-bar2", "progress-bar1");
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
      event.currentTarget.parentNode.removeChild(event.currentTarget);
    };
    
    card.classList.remove('disabled-card');
  });
}

document.getElementById('draw-button').addEventListener('click', function() {
    socket.emit('draw-playered');
  });

socket.on('game-over', (data) => {
  const showModal = (text) => {
    document.getElementById('modalText').textContent = text; 
    document.querySelector('.modal').style.display = 'block';
    setTimeout(() => {
      document.querySelector('.modal').style.display = 'none';
      redirectToPage();
    }, 10000);
  }

  const redirectToPage = () => {
    if (data.result === 'win') {
      window.location.href = '/win-page';
    } else if (data.result == 'lose') {
      window.location.href = '/lose-page';
    } else if (data.result == 'draw') {
        window.location.href = '/home';
    }}
  
  if (data.result === 'win') {
    const oppAvatar = document.querySelector('.opp-avatar img');
    document.querySelector('.opp-health').textContent = '';
    if (oppAvatar) oppAvatar.style.visibility = 'hidden';
    showModal('You won!');
  } else if (data.result == 'lose') {
    const myAvatar = document.querySelector('.my-avatar img');
    document.querySelector('.my-health').textContent = '';
    document.getElementById('coins-display').textContent = '';
    if (myAvatar) myAvatar.style.visibility = 'hidden';
    showModal('You lost. Try another game!');
  }  else if (data.result == 'draw') {
    showModal('A draw is declared.');
}
});



document.getElementById('draw-button').addEventListener('click', function() {
  socket.emit('player-surrendered');
});


function runtimer(id, anotherid) {
  document.getElementById("progress-container1").style.display = "block";
  document.getElementById("progress-container2").style.display = "block";
  let timeLeft = 13; 
  if (window.interval) {
    clearInterval(window.interval);
  }
  
  function updateProgressBar() {
    const progressBar = document.getElementById(id);
    const anotherProgressBar = document.getElementById(anotherid);
  
    anotherProgressBar.style.width = 0;
    
    const percentage = (timeLeft / 13) * 100;
    progressBar.style.width = percentage + '%';
  }

  function countdown() {
    updateProgressBar();

    if (timeLeft === 0) {
      clearInterval(window.interval);
    } else {
      timeLeft--;
    }
  }

  window.interval = setInterval(countdown, 1000);
}