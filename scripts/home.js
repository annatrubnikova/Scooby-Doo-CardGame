function showUserInfo () {
    document.getElementById("userInfo").style.display='flex';
}

function hideUserInfo () {
    document.getElementById("userInfo").style.display='none';
}

let userLogin = document.querySelector('.loginText').innerText;
console.log(userLogin);
localStorage.setItem('userLogin', userLogin);

function logOut() {
    localStorage.clear();
    window.location.assign('/logout');
}

let isExit = localStorage.getItem('isExit');
if (isExit == 'true') {  
    localStorage.removeItem('isExit');
    window.location.href = '/lose-page';
    alert('Ви програли.');
}

function stopMusic() {
    let audio = document.getElementById("audio");
    let volume = document.getElementById("volume");
    if(audio.volume == 0.01) {
         audio.volume = 0;
         volume.classList.remove('fa-volume-off');
         volume.classList.add('fa-volume-xmark');
    }
    else {
        audio.volume = 0.01;
        volume.classList.add('fa-volume-off');
        volume.classList.remove('fa-volume-xmark');
    }
}

let audio = document.getElementById("audio");
audio.volume = 0.01;