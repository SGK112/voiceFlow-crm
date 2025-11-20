/**
 * SCROLL ANIMATION CONTROLLER
 * Triggers card slide-up animations as user scrolls
 */

(function() {
    'use strict';

    // ============================================
    // INTERSECTION OBSERVER FOR SECTIONS
    // ============================================

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before entering viewport
        threshold: 0.15 // Trigger when 15% visible
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionally unobserve after animation to improve performance
                // sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // ============================================
    // SCROLL PROGRESS INDICATOR
    // ============================================

    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;

        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }
    }

    // ============================================
    // PARALLAX EFFECT (LIGHT)
    // ============================================

    let ticking = false;

    function updateParallax() {
        const parallaxElements = document.querySelectorAll('.parallax-bg');
        const scrollTop = window.pageYOffset;

        parallaxElements.forEach(el => {
            const speed = el.dataset.speed || 0.3;
            const yPos = -(scrollTop * speed);
            el.style.setProperty('--parallax-offset', yPos + 'px');
        });

        ticking = false;
    }

    function requestParallaxUpdate() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    // ============================================
    // INITIALIZE ON DOM LOADED
    // ============================================

    function init() {
        // Create scroll progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.prepend(progressBar);

        // Observe all sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            sectionObserver.observe(section);
        });

        // Animate hero content on load
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            setTimeout(() => {
                heroContent.classList.add('loaded');
            }, 100);
        }

        // Add scroll listeners
        window.addEventListener('scroll', () => {
            updateScrollProgress();
            requestParallaxUpdate();
        }, { passive: true });

        // Initial update
        updateScrollProgress();

        // Add smooth scroll to anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Add page transition class
        document.body.classList.add('page-transition');
    }

    // ============================================
    // DYNAMIC NUMBER COUNTING (for stats)
    // ============================================

    function animateNumber(element) {
        const text = element.textContent;
        const hasPlus = text.includes('+');
        const hasK = text.includes('K');
        const hasM = text.includes('M');
        const hasDollar = text.includes('$');
        const hasPercent = text.includes('%');

        let number = parseInt(text.replace(/[^0-9]/g, ''));
        if (isNaN(number)) return;

        const duration = 2000; // 2 seconds
        const frameDuration = 1000 / 60; // 60 FPS
        const totalFrames = Math.round(duration / frameDuration);
        let frame = 0;

        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentNumber = Math.round(number * progress);

            let displayText = currentNumber.toString();
            if (hasDollar) displayText = '$' + displayText;
            if (hasK) displayText += 'K';
            if (hasM) displayText += 'M';
            if (hasPercent) displayText += '%';
            if (hasPlus) displayText += '+';

            element.textContent = displayText;

            if (frame === totalFrames) {
                clearInterval(counter);
                element.textContent = text; // Restore original
            }
        }, frameDuration);
    }

    // Observe stat numbers
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('h3');
                if (statNumber && !statNumber.dataset.animated) {
                    statNumber.dataset.animated = 'true';
                    animateNumber(statNumber);
                }
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    // ============================================
    // RUN ON LOAD
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Observe stats after init
    window.addEventListener('load', () => {
        document.querySelectorAll('.stat-item').forEach(item => {
            statObserver.observe(item);
        });
    });

    // ============================================
    // MOBILE TOUCH OPTIMIZATIONS
    // ============================================

    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', e => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > swipeThreshold) {
            // Add momentum to scroll
            if (diff > 0) {
                // Swiped up
                window.scrollBy({
                    top: 100,
                    behavior: 'smooth'
                });
            } else {
                // Swiped down
                window.scrollBy({
                    top: -100,
                    behavior: 'smooth'
                });
            }
        }
    }

    // ============================================
    // PERFORMANCE OPTIMIZATION
    // ============================================

    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.body.style.animationPlayState = 'paused';
        } else {
            document.body.style.animationPlayState = 'running';
        }
    });

})();
