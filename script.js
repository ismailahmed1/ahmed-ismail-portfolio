function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}

// Update theme icons based on current theme
function updateThemeIcons(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeIconMobile = document.getElementById('theme-icon-mobile');
    const iconSrc = theme === 'dark' ? './assets/sun.svg' : './assets/moon.svg';

    if (themeIcon) themeIcon.src = iconSrc;
    if (themeIconMobile) themeIconMobile.src = iconSrc;
}

// Toggle theme between light and dark
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    updateThemeIcons(newTheme);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set dark mode as default
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcons('dark');

    // Set dynamic copyright year
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

// Theme toggle event listeners
document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
document.getElementById('theme-toggle-mobile')?.addEventListener('click', toggleTheme);
