document.addEventListener('DOMContentLoaded', () => 
{
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') 
    {
        // Add dark mode class to set to dark mode
        document.body.classList.add('dark-mode');
    } 
    else if (savedTheme === 'light' || window.matchMedia('(prefers-color-scheme: light)').matches) 
    {
        // Remove dark mode class to set to light mode
        document.body.classList.remove('dark-mode');
    }

    updateThemeIcons(savedTheme === 'dark');
});

// Update the Theme Mode Icon based on given theme
function updateThemeIcons(isDark) 
{
    const themeIcon = document.querySelector('.theme-icon'); // Select only the theme icon
    if (themeIcon) 
    {
        themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
    }
}

// Toggle the theme and store the current theme
function toggleTheme() 
{
    const isDark = document.body.classList.toggle('dark-mode');

    // Only set theme cookie if consent was given
    if (localStorage.getItem('cookieConsent') === 'accepted') 
    {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    updateThemeIcons(isDark);
}