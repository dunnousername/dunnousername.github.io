function drawPerson(year) {
    const canvas = document.getElementById('exp-thumb');
    const ctx = canvas.getContext('2d');
    
    const img = new Image(canvas.width, canvas.height);
    img.src = 'https://thispersondoesnotexist.com/image';
    img.addEventListener('load', function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    });
}

function createIdentity() {
    
}

window.addEventListener('load', function () {
    drawPerson();
});