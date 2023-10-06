function showUserInfo () {
    document.getElementById("userInfo").style.display='flex';
}

function hideUserInfo () {
    document.getElementById("userInfo").style.display='none';
}

function showRules() {
    document.getElementById("rulesPopup").classList.toggle('hiddenPopup');
    document.getElementById('rulesBtn').style.backgroundColor = document.getElementById('rulesBtn').style.backgroundColor == "rgb(162, 87, 248)" ? "rgb(90, 0, 107)" : "rgb(162, 87, 248)";
}

let userLogin = document.querySelector('.loginText').innerText;
let imageElement = document.querySelector('.avatarValue').src;
localStorage.setItem('userLogin', userLogin);
localStorage.setItem('userAvatar', imageElement);
function logOut() {
    localStorage.clear();
    window.location.assign('/logout');
}

function stopMusic() {
    let audio = document.getElementById("audio");
    let volume = document.getElementById("volume");
    let btnvolume = document.getElementById("btnvolume");
    
    if(audio.volume == 0.02) {
         audio.volume = 0;
         btnvolume.classList.remove("audioBtn");
         volume.classList.remove('fa-volume-low');
         volume.classList.add('fa-volume-xmark');
    }
    else {
        audio.volume = 0.02;
        btnvolume.classList.add("audioBtn");
        volume.classList.add('fa-volume-low');
        volume.classList.remove('fa-volume-xmark');
    }
}

let audio = document.getElementById("audio");
audio.volume = 0.02;