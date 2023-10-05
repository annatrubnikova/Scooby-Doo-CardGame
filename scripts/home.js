function showUserInfo () {
    document.getElementById("userInfo").style.display='flex';
}

function hideUserInfo () {
    document.getElementById("userInfo").style.display='none';
}

let userLogin = document.querySelector('.loginText').innerText;
let imageElement = document.querySelector('.avatarValue').src;
console.log(imageElement);
localStorage.setItem('userLogin', userLogin);
localStorage.setItem('userAvatar', imageElement);
function logOut() {
    localStorage.clear();
    window.location.assign('/logout');
}

let isExit = localStorage.getItem('isExit');
console.log(isExit);
if (isExit == 'true') {  
    localStorage.removeItem('isExit');
    window.location.href = '/lose-page';
    alert('You lost. Try another game!');
}

function stopMusic() {
    let audio = document.getElementById("audio");
    let volume = document.getElementById("volume");
    let btnvolume = document.getElementById("btnvolume");
    
    if(audio.volume == 0.09) {
         audio.volume = 0;
         btnvolume.classList.remove("audioBtn");
         volume.classList.remove('fa-volume-low');
         volume.classList.add('fa-volume-xmark');
    }
    else {
        audio.volume = 0.09;
        btnvolume.classList.add("audioBtn");
        volume.classList.add('fa-volume-low');
        volume.classList.remove('fa-volume-xmark');
    }
}

let audio = document.getElementById("audio");
audio.volume = 0.09;