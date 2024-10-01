
let currentIndex = 0;

function changeCard(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = vocabularies.length - 1;
    if (currentIndex >= vocabularies.length) currentIndex = 1;
    updateCard();
}

function updateCard() {
    const vocab = vocabularies[currentIndex];
    document.querySelector('#vocab-card .card-header h3').innerText = vocab.japanese_word;
    document.querySelector('#vocab-card .card-body strong:nth-of-type(1) + span').innerText = vocab.reading;
    document.querySelector('#vocab-card .card-body strong:nth-of-type(2) + span').innerText = vocab.translation;
    const imgElement = document.querySelector('.card-image');
    if (vocab.image) {
        imgElement.src = '/images/' + vocab.image;
        imgElement.alt = vocab.japanese_word + ' image';
        imgElement.style.display = 'block';
    } else {
        imgElement.style.display = 'none';
    }
}


updateCard();
