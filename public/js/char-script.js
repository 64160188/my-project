function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function showDetails(character, description) {
    document.getElementById('popup-char_value').innerText = character;
    document.getElementById('popup-description').innerText = description;
    document.getElementById('details-popup').style.display = 'block';
}

function hideDetails() {
    document.getElementById('details-popup').style.display = 'none';
}


document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.tablinks').click();
});