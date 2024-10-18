const vocabularies = <%- JSON.stringify(vocabularies) %>;
let currentIndex = 0;

function changeCard(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = vocabularies.length - 1;
    if (currentIndex >= vocabularies.length) currentIndex = 0;
    updateCard();
}
function updateCard() {
    const vocab = vocabularies[currentIndex];
    
    
    document.querySelector('#vocab-card .card-header h3').innerText = vocab.japanese_word;

    
    document.getElementById('reading-text').innerText = vocab.reading;
    document.getElementById('translation-text').innerText = vocab.translation;

    
    const imgElement = document.getElementById('vocab-image');
    if (vocab.image) {
        imgElement.src = '/images/' + vocab.image;
        imgElement.alt = vocab.japanese_word + ' image';
        imgElement.style.display = 'block';
    } else {
        imgElement.style.display = 'none';
    }
}



updateCard();