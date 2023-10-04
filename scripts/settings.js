function showUserInfo () {
    document.getElementById("userInfo").style.display='flex';
}

function showConfirm() {
    document.getElementById('customConfirm').style.display = 'block';
}

function hideConfirm() {
    document.getElementById('customConfirm').style.display = 'none';
}

function submitForm() {
    document.getElementById('deleteAccountForm').submit();
}

function hideUserInfo () {
    document.getElementById("userInfo").style.display='none';
}

function onImageClick () {
    
}

window.onload = function() {
    let hidden_if_empty = document.getElementById('hidden_if_empty');
    hidden_if_empty.style.display = (hidden_if_empty.innerHTML.trim() === '#status#') ? 'none' : 'block';
    let hidden_if_empty_error = document.getElementById('hidden_if_empty_error');
    hidden_if_empty_error.style.display = (hidden_if_empty_error.innerHTML.trim() === '#error#') ? 'none' : 'block';
    const login = document.getElementsByClassName("fullnameText");
    let valueOfLogin = document.getElementById('signUpFullname');
    valueOfLogin.value = login[0].textContent;
    const mail = document.getElementsByClassName("emailText");
    let valueOfmail = document.getElementById('signUpEmail');
    valueOfmail.value = mail[0].textContent;

    //avatars rendering
    let container = document.getElementById('arrayOfAvatars');
    let images = ['daphne_avatar.JPG', 'fred_avatar.JPG', 'scooby_avatar.png', 'shaggy_avatar.jpg', 'velma_avatar.JPG'];
    for(let i = 0; i<images.length; i++) {
        let image = document.createElement("img");
        image.src = images[i];
        image.classList.add(images[i], document.getElementsByClassName("avatarValue")[0].classList[1] == images[i] ? 'selectedAvatar' : 'unselected');
        image.addEventListener('click', () => {
            const imgElements = document.querySelectorAll('#arrayOfAvatars img');
            imgElements.forEach((img) => {
                img.classList.remove('selectedAvatar');
                img.classList.add('unselected');
            });
            image.classList.add('selectedAvatar');
            image.classList.remove('unselected');
            let avat = document.getElementById('signUpavatar');
            avat.value = image.src.substring(image.src.lastIndexOf('/') + 1);
        });
        container.appendChild(image);
    }
};