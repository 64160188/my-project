let correctIndex;
let randomIndex;
let currentWord;
const wordElement = document.getElementById('vocab-word');
const image1Element = document.getElementById('image1');
const image2Element = document.getElementById('image2');
const resultMessage = document.getElementById('result-message');
const nextBtn = document.getElementById('next-btn');


function initializeGame() {
    
    correctIndex = Math.floor(Math.random() * vocabularies.length);
    currentWord = vocabularies[correctIndex];

    
    wordElement.innerText = currentWord.japanese_word;

    
    do {
        randomIndex = Math.floor(Math.random() * vocabularies.length);
    } while (randomIndex === correctIndex);

    
    const correctPosition = Math.random() < 0.5 ? 1 : 2;
    if (correctPosition === 1) {
        image1Element.src = '/images/' + currentWord.image;
        image1Element.alt = currentWord.japanese_word + ' image';
        image2Element.src = '/images/' + vocabularies[randomIndex].image;
        image2Element.alt = vocabularies[randomIndex].japanese_word + ' image';
    } else {
        image2Element.src = '/images/' + currentWord.image;
        image2Element.alt = currentWord.japanese_word + ' image';
        image1Element.src = '/images/' + vocabularies[randomIndex].image;
        image1Element.alt = vocabularies[randomIndex].japanese_word + ' image';
    }

    
    nextBtn.style.display = 'none';
    resultMessage.innerText = '';
}


