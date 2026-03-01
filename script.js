document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const siteHeader = document.querySelector('.site-header');
    const floatingIconsLayer = document.querySelector('.floating-icons-layer');
    const revealItems = document.querySelectorAll('.reveal');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');
    const proofNumbers = document.querySelectorAll('.proof-number');
    let floatingIconsResizeTimer = null;

    const floatingIconPool = [
        'fa-toolbox',
        'fa-video',
        'fa-tv',
        'fa-bicycle',
        'fa-camera',
        'fa-guitar',
        'fa-couch',
        'fa-chair',
        'fa-briefcase',
        'fa-lightbulb',
        'fa-laptop',
        'fa-music',
        'fa-headphones',
        'fa-gamepad',
        'fa-print',
        'fa-wrench',
        'fa-blender',
        'fa-fan'
    ];

    const buildFloatingIcons = () => {
        if (!floatingIconsLayer) {
            return;
        }

        floatingIconsLayer.innerHTML = '';

        const iconCount = window.innerWidth < 640 ? 12 : window.innerWidth < 1024 ? 18 : 26;

        for (let index = 0; index < iconCount; index += 1) {
            const icon = document.createElement('i');
            const iconName = floatingIconPool[Math.floor(Math.random() * floatingIconPool.length)];
            const opacity = (0.08 + Math.random() * 0.09).toFixed(2);
            const driftX = (Math.random() * 160 - 80).toFixed(0);
            const driftY = (Math.random() * 180 - 90).toFixed(0);
            const rotateStart = (Math.random() * 50 - 25).toFixed(1);
            const rotateEnd = (Math.random() * 90 - 45).toFixed(1);
            const size = (1.35 + Math.random() * 1.85).toFixed(2);
            const duration = (18 + Math.random() * 20).toFixed(1);

            icon.className = `fa-solid ${iconName} floating-icon`;
            icon.style.left = `${(Math.random() * 100).toFixed(2)}%`;
            icon.style.top = `${(Math.random() * 100).toFixed(2)}%`;
            icon.style.fontSize = `${size}rem`;
            icon.style.setProperty('--opacity', opacity);
            icon.style.setProperty('--dx', `${driftX}px`);
            icon.style.setProperty('--dy', `${driftY}px`);
            icon.style.setProperty('--rotate-start', `${rotateStart}deg`);
            icon.style.setProperty('--rotate-end', `${rotateEnd}deg`);
            icon.style.setProperty('--duration', `${duration}s`);
            icon.style.animationDelay = `-${(Math.random() * 18).toFixed(1)}s`;

            if (prefersReducedMotion) {
                icon.style.animation = 'none';
            }

            floatingIconsLayer.appendChild(icon);
        }
    };

    const updateHeaderState = () => {
        if (!siteHeader) {
            return;
        }

        siteHeader.classList.toggle('is-scrolled', window.scrollY > 12);
    };

    const smoothScrollToSection = (event) => {
        const href = event.currentTarget.getAttribute('href');

        if (!href || href === '#') {
            return;
        }

        const target = document.querySelector(href);

        if (!target) {
            return;
        }

        event.preventDefault();
        setActiveLink(target.id);
        target.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
        });
    };

    const setActiveLink = (sectionId) => {
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });
    };

    const formatCounterValue = (element, value) => {
        const suffix = element.dataset.suffix || '';
        const pad = parseInt(element.dataset.pad || '0', 10);
        const formatted = String(value).padStart(pad, '0');
        return `${formatted}${suffix}`;
    };

    const animateCounter = (element) => {
        if (element.dataset.animated === 'true') {
            return;
        }

        const target = parseInt(element.dataset.target || '0', 10);

        if (Number.isNaN(target)) {
            return;
        }

        element.dataset.animated = 'true';

        if (prefersReducedMotion) {
            element.textContent = formatCounterValue(element, target);
            return;
        }

        const duration = 1100;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(target * eased);

            element.textContent = formatCounterValue(element, currentValue);

            if (progress < 1) {
                window.requestAnimationFrame(tick);
            }
        };

        window.requestAnimationFrame(tick);
    };

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    buildFloatingIcons();

    window.addEventListener('resize', () => {
        window.clearTimeout(floatingIconsResizeTimer);
        floatingIconsResizeTimer = window.setTimeout(buildFloatingIcons, 180);
    });

    if (window.location.hash) {
        setActiveLink(window.location.hash.slice(1));
    } else {
        setActiveLink('inicio');
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', smoothScrollToSection);
    });

    if (prefersReducedMotion) {
        revealItems.forEach((item) => item.classList.add('is-visible'));
        proofNumbers.forEach((number) => animateCounter(number));
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.2,
                rootMargin: '0px 0px -10% 0px'
            }
        );

        revealItems.forEach((item) => revealObserver.observe(item));

        const counterObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.6
            }
        );

        proofNumbers.forEach((number) => counterObserver.observe(number));
    }

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            const visibleEntries = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (!visibleEntries.length) {
                return;
            }

            setActiveLink(visibleEntries[0].target.id);
        },
        {
            threshold: [0.3, 0.55, 0.8],
            rootMargin: '-22% 0px -42% 0px'
        }
    );

    sections.forEach((section) => sectionObserver.observe(section));
});
