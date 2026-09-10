const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Theme ---------- */

const themeIcon = document.getElementById('theme-icon');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.src = theme === 'dark' ? './assets/sun.svg' : './assets/moon.svg';
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
}

setTheme(localStorage.getItem('theme') || 'dark');
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

/* ---------- Section headings type in like shell commands ---------- */

/* Types text into an element one character at a time, then calls done() */
function typeInto(el, text, speed, done) {
    if (reduceMotion) {
        el.textContent = text;
        if (done) done();
        return;
    }

    let i = 0;
    (function step() {
        el.textContent = text.slice(0, (i += 1));
        if (i < text.length) return setTimeout(step, speed);
        if (done) done();
    })();
}

/*
 * Splits a heading into its "$" prompt and the command text after it, so the
 * command can be typed out. Returns a function that runs the animation.
 * Nothing is hidden until this runs, so with JS off the page reads normally.
 */
function asCommand(heading, body) {
    const prompt = heading.querySelector('.prompt');
    const rest = [...heading.childNodes]
        .filter((node) => node !== prompt)
        .map((node) => node.textContent)
        .join('')
        .trim();

    const cmd = document.createElement('span');
    const caret = document.createElement('span');
    caret.className = 'h2-caret';
    caret.textContent = '▊';
    caret.setAttribute('aria-hidden', 'true');

    [...heading.childNodes]
        .filter((node) => node !== prompt)
        .forEach((node) => node.remove());
    heading.append(cmd, caret);

    /*
     * Fade in the individual rows of a list rather than the list as a block, so
     * output arrives line by line the way a real command prints it. The list
     * itself is included so container-level paint (the timeline's spine, the
     * stats box border) arrives with its rows instead of hanging there empty.
     */
    const lines = body.flatMap((el) =>
        /^(UL|OL|DL)$/.test(el.tagName) ? [el, ...el.children] : [el]
    );

    lines.forEach((el) => el.classList.add('pending'));

    return () => typeInto(cmd, rest, 42, () => {
        // Beat between the command and its output, as if Enter were pressed
        setTimeout(() => {
            caret.remove();
            lines.forEach((el, i) => {
                el.style.animationDelay = `${Math.min(i, 10) * 55}ms`;
                el.classList.remove('pending');
                el.classList.add('fading');
            });
        }, 160);
    });
}

const headings = [...document.querySelectorAll('main section')].map((section) => {
    const heading = section.querySelector('h2');
    const body = [...section.children].filter((el) => el !== heading);
    return { section, run: asCommand(heading, body) };
});

if (reduceMotion) {
    headings.forEach(({ run }) => run());
} else {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            obs.unobserve(entry.target);
            headings.find(({ section }) => section === entry.target).run();
        });
    /*
     * threshold:0 + a bottom margin fires as soon as the section's top edge
     * clears the lower 12% of the viewport. A ratio-based threshold could
     * never fire for a section taller than the screen.
     */
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

    headings.forEach(({ section }) => observer.observe(section));
}

/* The hero's own command line, typed on load */
const kicker = document.querySelector('.kicker');
const kickerRun = asCommand(kicker, []);
kickerRun();

/* ---------- Section nav: highlight whatever is currently in view ---------- */

const navLinks = [...document.querySelectorAll('.section-nav a')];
const navTargets = navLinks.map((a) => document.querySelector(a.getAttribute('href')));

if (navLinks.length) {
    let queued = false;

    const syncNav = () => {
        let current = 0;
        navTargets.forEach((section, i) => {
            if (section && section.getBoundingClientRect().top <= 140) current = i;
        });
        navLinks.forEach((a, i) => a.classList.toggle('active', i === current));
    };

    window.addEventListener('scroll', () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            syncNav();
            queued = false;
        });
    }, { passive: true });

    syncNav();
}

/* ---------- Clock ---------- */

const clock = document.getElementById('clock');

function tick() {
    clock.textContent = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

tick();
setInterval(tick, 15000);

/* ---------- Typed roles ---------- */

/* Deliberately not the current role — the status line below already says it */
const roles = [
    'Computer Systems Engineering @ Carleton',
    'ex-Tesla · TrendAI · Ross Video · Nokia',
    'I like software that touches hardware',
    'I teach CS to 70K+ followers'
];

const roleText = document.getElementById('role-text');

if (reduceMotion) {
    roleText.textContent = roles[0];
} else {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    (function type() {
        const full = roles[roleIndex];
        charIndex += deleting ? -1 : 1;
        roleText.textContent = full.slice(0, charIndex);

        let delay = deleting ? 28 : 55;

        if (!deleting && charIndex === full.length) {
            deleting = true;
            delay = 2400;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 350;
        }

        setTimeout(type, delay);
    })();
}

/* ---------- Name scramble on hover ---------- */

const nameEl = document.getElementById('name');
const GLYPHS = '!<>-_\\/[]{}—=+*^?#01';

if (!reduceMotion) {
    let scrambling = false;

    nameEl.addEventListener('pointerenter', () => {
        if (scrambling) return;
        scrambling = true;

        const target = nameEl.dataset.text;
        let frame = 0;

        const timer = setInterval(() => {
            nameEl.textContent = target
                .split('')
                .map((ch, i) => {
                    if (ch === ' ') return ' ';
                    if (i < frame / 2) return ch;
                    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                })
                .join('');

            frame += 1;
            if (frame / 2 >= target.length) {
                clearInterval(timer);
                nameEl.textContent = target;
                scrambling = false;
            }
        }, 32);
    });
}

/* ---------- Toast ---------- */

const toastEl = document.getElementById('toast');
let toastTimer;

function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

/* ---------- Copy email ---------- */

const emailLink = document.getElementById('email-link');

emailLink.addEventListener('click', (e) => {
    if (!navigator.clipboard) return;
    e.preventDefault();
    navigator.clipboard
        .writeText(emailLink.dataset.email)
        .then(() => toast(`copied ${emailLink.dataset.email}`))
        .catch(() => { window.location.href = emailLink.href; });
});

/* ---------- Terminal ---------- */

const term = document.getElementById('term');
const termBody = document.getElementById('term-body');
const termForm = document.getElementById('term-form');
const termLine = document.getElementById('term-line');

const PROJECTS = {
    shaghalnyshokran: ['AI resume reviewer — 7,000+ users', 'https://shaghalnyshokran.com'],
    'meeting-voice-agent': ['Real-time Google Meet agent — YC Hackathon', 'https://github.com/prmsregmi/carleton'],
    mediclarify: ['AI medical document simplifier', 'https://github.com/ismailahmed1/MediClarify'],
    ecolens: ['Sustainability tracker', 'https://github.com/ismailahmed1/eco-lens'],
    nobu: ['Money tracker', 'https://github.com/ismailahmed1/money-tracker-app'],
    sewy: ['Football manager AI journalist', 'https://github.com/ismailahmed1/football-manager-bot'],
    portfolio: ['This page', 'https://github.com/ismailahmed1/ahmed-ismail-portfolio']
};

const LINKS = {
    github: 'https://github.com/ismailahmed1',
    linkedin: 'https://www.linkedin.com/in/ismailahmed1/',
    x: 'https://x.com/therealcanadawy',
    tiktok: 'https://www.tiktok.com/@elcanadawy1',
    instagram: 'https://www.instagram.com/elcanadawy1',
    resume: './assets/Ahmed_Ismail_Resume.pdf'
};

const FORTUNES = [
    'Ran the model overnight. Woke up to 98.9% recall and a very warm laptop.',
    'The Ansible bug bricked every single-NIC device. The fix was one line. It always is.',
    "There are two hard problems in CS: naming things, cache invalidation, and off-by-one errors.",
    'Shipped to 7,000 people before I ever shipped to a code review.',
    'Best debugging tool ever built: explaining it out loud to 70,000 strangers.',
    'Migrated 50+ Perl modules to Python. Perl is still out there. Somewhere. Waiting.'
];

function print(text, className) {
    const div = document.createElement('div');
    div.className = `out${className ? ` ${className}` : ''}`;
    div.textContent = text;
    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
}

function printEcho(command) {
    const div = document.createElement('div');
    div.className = 'out echo';
    div.innerHTML = 'ahmed@portfolio ~ % <b></b>';
    div.querySelector('b').textContent = command;
    termBody.appendChild(div);
}

const COMMANDS = {
    help() {
        print(
            'Available commands\n' +
            '  about        who I am\n' +
            '  experience   where I have worked\n' +
            '  skills       what I work with\n' +
            '  projects     what I have built\n' +
            '  education    school\n' +
            '  socials      where to find me\n' +
            '  open <name>  open a project or link in a new tab\n' +
            '  resume       download my resume\n' +
            '  email        copy my email to the clipboard\n' +
            '  theme        switch between light and dark\n' +
            '  neofetch     system info\n' +
            '  fortune      a thought from the trenches\n' +
            '  date         current date and time\n' +
            '  clear        clear the screen\n' +
            '  exit         close this terminal'
        );
    },

    about() {
        print(
            'Ahmed Ismail\n' +
            'Computer Systems Engineering student at Carleton, graduating April 2027.\n\n' +
            'Software Engineer Intern at Shopify on the Database Platform team,\n' +
            'working on database services. Before this: computer vision at Tesla,\n' +
            'real-time ML infrastructure at TrendAI, test automation at Ross Video,\n' +
            'and validation tooling for optical systems at Nokia.\n\n' +
            'Outside of code: gym, video games, Marvel marathons, Egypt.'
        );
    },

    /* Direct children only — each entry nests its own bullet list */
    experience() {
        document.querySelectorAll('.timeline > li').forEach((li, i) => {
            if (i) print('');
            print(
                `${li.querySelector('.org').textContent}\n` +
                `${li.querySelector('.role').textContent} · ${li.querySelector('.when').textContent}`
            );
            li.querySelectorAll('.bullets li').forEach((b) => {
                print(`  - ${b.textContent}`);
            });
        });
    },

    skills() {
        document.querySelectorAll('.skills dt').forEach((dt) => {
            print(`${dt.textContent.padEnd(16)}${dt.nextElementSibling.textContent}`);
        });
    },

    projects() {
        Object.entries(PROJECTS).forEach(([key, [desc]]) => {
            print(`${key.padEnd(22)}${desc}`);
        });
        print("\nTip: 'open shaghalnyshokran' opens one in a new tab.", 'echo');
    },

    education() {
        print(
            'Carleton University — Ottawa, Canada\n' +
            'B.Eng., Computer Systems Engineering · GPA 3.7/4.0 · Expected April 2027\n' +
            'Coursework: Data Structures & Algorithms, Object-Oriented Programming,\n' +
            '            Embedded Systems, Operating Systems'
        );
    },

    socials() {
        print('tiktok      @elcanadawy1');
        print('instagram   @elcanadawy1');
        print('x           @therealcanadawy');
        print('github      @ismailahmed1');
        print('\n70K+ followers · 4.25M monthly impressions · top post 1.8M views', 'echo');
    },

    open(args) {
        const key = (args[0] || '').toLowerCase();
        if (!key) return print('usage: open <project|github|linkedin|x|tiktok|instagram|resume>', 'err');

        const url = LINKS[key] || (PROJECTS[key] && PROJECTS[key][1]);
        if (!url) return print(`open: no such target: ${key}`, 'err');

        window.open(url, '_blank', 'noopener');
        print(`opening ${url}`, 'ok');
    },

    resume() {
        window.open(LINKS.resume, '_blank', 'noopener');
        print('opening resume.pdf', 'ok');
    },

    email() {
        const address = emailLink.dataset.email;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(address).catch(() => {});
        }
        print(`${address} — copied to clipboard`, 'ok');
    },

    theme() {
        toggleTheme();
        print(`theme → ${document.documentElement.getAttribute('data-theme')}`, 'ok');
    },

    neofetch() {
        print(
            '       .--.        ahmed@portfolio\n' +
            '      |o_o |       ---------------\n' +
            '      |:_/ |       role     SWE Intern @ Shopify — Database Platform\n' +
            '     //   \\ \\      school   Carleton University, B.Eng. 2027\n' +
            '    (|     | )     langs    Python · Go · Rust · TypeScript · Java · C\n' +
            "   /'\\_   _/`\\     ml       PyTorch · OpenCV · OpenVINO · YOLO\n" +
            '   \\___)=(___/     infra    AWS · Docker · Terraform · Postgres · Redis\n' +
            '                   shipped  7,000+ users · 70K+ followers\n' +
            '                   uptime   always building'
        );
    },

    fortune() {
        print(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
    },

    date() {
        print(new Date().toString());
    },

    clear() {
        termBody.replaceChildren();
    },

    exit() {
        closeTerm();
    },

    sudo(args) {
        print(`Nice try. ${args.join(' ') || 'that'} requires permissions you do not have.`, 'err');
    },

    echo(args) {
        print(args.join(' '));
    }
};

const ALIASES = {
    ls: 'projects',
    whoami: 'about',
    exp: 'experience',
    cat: 'experience',
    stack: 'skills',
    school: 'education',
    social: 'socials',
    cv: 'resume',
    '?': 'help',
    man: 'help',
    quit: 'exit',
    cls: 'clear'
};

const history = [];
let historyIndex = 0;

function run(input) {
    const parts = input.trim().split(/\s+/);
    const name = (parts[0] || '').toLowerCase();
    if (!name) return;

    const command = COMMANDS[ALIASES[name] || name];

    if (!command) {
        print(`zsh: command not found: ${name}`, 'err');
        print("Type 'help' to see what this thing can do.", 'echo');
        return;
    }

    command(parts.slice(1));
}

function openTerm() {
    term.hidden = false;
    if (!termBody.childElementCount) {
        print('ahmed-ismail portfolio shell — v2.0');
        print("Type 'help' for commands, 'exit' or esc to close.\n", 'echo');
    }
    termLine.focus();
}

function closeTerm() {
    term.hidden = true;
    termLine.blur();
}

termForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = termLine.value;
    printEcho(value);
    if (value.trim()) {
        history.push(value);
        historyIndex = history.length;
    }
    run(value);
    termLine.value = '';
    termBody.scrollTop = termBody.scrollHeight;
});

/* Arrow keys walk history; tab completes a command name */
termLine.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (!history.length) return;
        e.preventDefault();
        historyIndex = Math.min(
            Math.max(historyIndex + (e.key === 'ArrowUp' ? -1 : 1), 0),
            history.length
        );
        termLine.value = history[historyIndex] || '';
    }

    if (e.key === 'Tab') {
        e.preventDefault();
        const typed = termLine.value.trim().toLowerCase();
        if (!typed) return;
        const match = Object.keys(COMMANDS)
            .concat(Object.keys(ALIASES))
            .find((name) => name.startsWith(typed));
        if (match) termLine.value = match;
    }
});

document.getElementById('term-open').addEventListener('click', openTerm);
document.getElementById('term-close').addEventListener('click', closeTerm);

/* Clicking the backdrop closes; clicking inside keeps focus in the input */
term.addEventListener('mousedown', (e) => {
    if (e.target === term) closeTerm();
});

term.addEventListener('click', (e) => {
    if (e.target !== term && !window.getSelection().toString()) termLine.focus();
});

/* ---------- Global keyboard shortcuts ---------- */

document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);

    if (e.key === 'Escape' && !term.hidden) {
        closeTerm();
        return;
    }

    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === '`') {
        e.preventDefault();
        term.hidden ? openTerm() : closeTerm();
    }

    if (e.key.toLowerCase() === 't') toggleTheme();
});
