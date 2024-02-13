$(document).on('themeSwitcher:load', function() 
{
    const moonIcon = document.getElementById('moonIcon');
    
    function SetTheme(themeName) 
    {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
    }
    
    function ToggleTheme() 
    {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            SetTheme('light');
        } else {
            SetTheme('dark');
        }
    }
    
    if (moonIcon) 
    {
        moonIcon.addEventListener('click', ToggleTheme);
    }
    
    (function () 
    {
        const storedTheme = localStorage.getItem('theme') || 'dark';
        SetTheme(storedTheme);
    })();
});