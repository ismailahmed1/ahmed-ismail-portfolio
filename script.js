function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("icon");
}

// Dark mode functionality
function initTheme() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme) {
        document.documentElement.setAttribute('data-theme', storedTheme);
        updateThemeIcon(storedTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    icon.src = theme === 'dark' ? 'assets/sun.svg' : 'assets/moon.svg';
    icon.alt = theme === 'dark' ? 'Light mode' : 'Dark mode';
}

// Initialize theme
document.addEventListener('DOMContentLoaded', initTheme);

// Add event listener to theme toggle button
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);