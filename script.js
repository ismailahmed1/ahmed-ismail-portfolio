const themeIcon = document.getElementById('theme-icon');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.src = theme === 'dark' ? './assets/sun.svg' : './assets/moon.svg';
    localStorage.setItem('theme', theme);
}

setTheme(localStorage.getItem('theme') || 'dark');

document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
});

const blocks = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
    });
}, { threshold: 0.15 });

blocks.forEach((block, i) => {
    block.style.transitionDelay = `${Math.min(i, 3) * 80}ms`;
    observer.observe(block);
});
