document.addEventListener('DOMContentLoaded', () => 
{
    const docBody = document.body;

    fetch('/snippets/header.html')
        .then(response => response.text())
        .then(data => 
        {
            const headerDiv = document.createElement('div');
            headerDiv.innerHTML = data;
            docBody.prepend(headerDiv.firstElementChild);

            const themeToggle = document.getElementById('theme-toggle');
            themeToggle.addEventListener('click', toggleTheme);
        
            const savedTheme = localStorage.getItem('theme');
            updateThemeIcons(savedTheme === 'dark');
        });

    // Check if we need to show the cookie banner
    if (!localStorage.getItem('cookieConsent')) 
    {
        fetch('/snippets/cookie.html')
        .then(response => response.text())
        .then(data => 
        {
            const cookieDiv = document.createElement('div');
            cookieDiv.innerHTML = data;
            docBody.prepend(cookieDiv.firstElementChild);

            checkCookieConsent();
        })
        .catch(error => 
        {
            console.error('Error loading cookie banner:', error);
        });
    }
});

/* Cookie consent management */

function checkCookieConsent() 
{
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) 
    {
        // Only show if no decision has been made yet
        setTimeout(function() 
        {
            document.getElementById('cookieBanner').style.display = 'block';
        }, 1000);
    }
}

function acceptCookies() 
{
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookieBanner').style.display = 'none';
    
    // If there's a current theme, save it now
    const currentTheme = document.documentElement.className || 'light-theme';
    localStorage.setItem('theme', currentTheme);
}

function declineCookies() 
{
    // If declined, we don't store any other data
    localStorage.setItem('cookieConsent', 'declined');
    document.getElementById('cookieBanner').style.display = 'none';
}

function closeCookieBanner() 
{
    // Not making a decision just hides the banner
    document.getElementById('cookieBanner').style.display = 'none';
}