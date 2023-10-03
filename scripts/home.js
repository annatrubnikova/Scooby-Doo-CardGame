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