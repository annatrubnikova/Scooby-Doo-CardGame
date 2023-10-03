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
    let btnvolume = document.getElementById("btnvolume");
    
    if(audio.volume == 0.01) {
         audio.volume = 0;
         btnvolume.classList.remove("audioBtn");
         volume.classList.remove('fa-volume-low');
         volume.classList.add('fa-volume-xmark');
    }
    else {
        audio.volume = 0.01;
        btnvolume.classList.add("audioBtn");
        volume.classList.add('fa-volume-low');
        volume.classList.remove('fa-volume-xmark');
    }
}

let audio = document.getElementById("audio");
audio.volume = 0.01;