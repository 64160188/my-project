document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/check-login')
        .then(response => response.json())
        .then(data => {
            var isLoggedIn = data.loggedIn;
            var username = data.username;
            var loginLink = document.getElementById('login-link');
            var signUpLink = document.getElementById('sign-up-link');
            var profileLink = document.getElementById('profile-link');

            if (isLoggedIn) {
                loginLink.textContent = 'Sign Out';
                loginLink.href = '/logout';
                signUpLink.style.display = 'none';
                profileLink.textContent = `Hello, ${username}`;
                profileLink.style.display = 'block';
            } else {
                loginLink.textContent = 'Sign In';
                loginLink.href = '/login';
                signUpLink.style.display = 'block';
                profileLink.style.display = 'none';
            }
        })
        .catch(error => console.error('Error fetching login status:', error));
});
