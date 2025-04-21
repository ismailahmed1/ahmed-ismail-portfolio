function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("icon");
}

// Theme handling
document.addEventListener('DOMContentLoaded', () => {
    // Set dark mode as default
    document.documentElement.setAttribute('data-theme', 'dark');
    
    // Update theme toggle button icons
    const themeIcon = document.getElementById('theme-icon');
    const themeIconMobile = document.getElementById('theme-icon-mobile');
    if (themeIcon) themeIcon.src = './assets/sun.svg';
    if (themeIconMobile) themeIconMobile.src = './assets/sun.svg';
});

// Theme toggle functionality
document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update theme toggle button icons
    const themeIcon = document.getElementById('theme-icon');
    const themeIconMobile = document.getElementById('theme-icon-mobile');
    if (newTheme === 'dark') {
        if (themeIcon) themeIcon.src = './assets/sun.svg';
        if (themeIconMobile) themeIconMobile.src = './assets/sun.svg';
    } else {
        if (themeIcon) themeIcon.src = './assets/moon.svg';
        if (themeIconMobile) themeIconMobile.src = './assets/moon.svg';
    }
});

// Mobile theme toggle functionality
document.getElementById('theme-toggle-mobile')?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update theme toggle button icons
    const themeIcon = document.getElementById('theme-icon');
    const themeIconMobile = document.getElementById('theme-icon-mobile');
    if (newTheme === 'dark') {
        if (themeIcon) themeIcon.src = './assets/sun.svg';
        if (themeIconMobile) themeIconMobile.src = './assets/sun.svg';
    } else {
        if (themeIcon) themeIcon.src = './assets/moon.svg';
        if (themeIconMobile) themeIconMobile.src = './assets/moon.svg';
    }
});