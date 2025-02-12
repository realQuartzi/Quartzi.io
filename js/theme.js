document.addEventListener('DOMContentLoaded', () => 
{
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') 
    {
        document.body.classList.add('dark-mode');
    } 
    else if (savedTheme === 'light' || window.matchMedia('(prefers-color-scheme: light)').matches) 
    {
        // Remove dark mode class and set light mode
        document.body.classList.remove('dark-mode');
    }

    updateThemeIcons(savedTheme === 'dark');
});

const observer = new MutationObserver(() => 
{
    const themeToggle = document.getElementById('theme-toggle');
  
    if(themeToggle)
    {
        themeToggle.addEventListener('click', toggleTheme);
        
        const savedTheme = localStorage.getItem('theme');
        updateThemeIcons(savedTheme === 'dark');

        observer.disconnect();
    }
    else
    {
          console.error("Could not find theme toggle button!");
    }
});

observer.observe(document.body, { childList: true, subtree: true });

function updateThemeIcons(isDark) 
{
    const themeIcon = document.querySelector('.theme-icon'); // Select only the theme icon
    if (themeIcon) {
        themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
    }
}

function toggleTheme() 
{
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
}