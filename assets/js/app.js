
document.addEventListener('DOMContentLoaded', () => {
    const options = { threshold: 0.35 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            } else {
                entry.target.classList.remove('show');
            }
        });
    }, options);

    const variants = ['slide-left', 'slide-right', 'zoom', 'tilt', 'rise'];
    document.querySelectorAll('.reveal').forEach((el, idx) => {
        if (!el.dataset.reveal) {
            const chosen = variants[idx % variants.length];
            el.classList.add(chosen);
        } else {
            el.classList.add(el.dataset.reveal);
        }
        if (!el.classList.contains('show')) {
            observer.observe(el);
        }
    });

    // Simple slider for overview banner with slide animation
    const slider = document.querySelector('[data-slider="overview"]');
    if (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-slide]'));
        const dotsContainer = slider.querySelector('.dots');
        const dots = Array.from(slider.querySelectorAll('[data-dot]'));
        let current = 0;
        let timer;

        const TRANSITION = 'transform 0.5s ease';
        let lastDirection = 'next';

        slides.forEach((slide, i) => {
            slide.style.transition = TRANSITION;
            slide.style.transform = i === 0 ? 'translateX(0)' : 'translateX(100%)';
            if (i !== 0) slide.classList.add('pointer-events-none');
        });

        const updateDots = (index) => {
            dots.forEach((dot, i) => {
                dot.classList.toggle('bg-white', i === index);
                dot.classList.toggle('bg-white/40', i !== index);
                dot.classList.toggle('border-white/60', i === index);
                dot.classList.toggle('border-white/30', i !== index);
                dot.classList.toggle('w-3', i === index);
                dot.classList.toggle('h-3', i === index);
            });
        };

        let isAnimating = false;

        const resetPositions = (activeIndex, direction = 'next') => {
            slides.forEach((slide, i) => {
                // disable transition to avoid flicker when resetting off-screen
                slide.style.transition = 'none';
                if (i === activeIndex) {
                    slide.classList.remove('pointer-events-none');
                    slide.style.transform = 'translateX(0)';
                } else {
                    slide.classList.add('pointer-events-none');
                    slide.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
                }
                // force reflow then restore transition
                void slide.offsetHeight;
                slide.style.transition = TRANSITION;
            });
        };

        const animateTo = (nextIndex, direction = 'next') => {
            if (nextIndex === current || isAnimating) return;
            isAnimating = true;
            lastDirection = direction;
            const currentSlide = slides[current];
            const nextSlide = slides[nextIndex];

            // Ensure all other slides are placed off-screen in the correct direction
            slides.forEach((slide, i) => {
                if (i !== current && i !== nextIndex) {
                    slide.style.transition = 'none';
                    slide.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
                    void slide.offsetHeight;
                    slide.style.transition = TRANSITION;
                }
            });

            // Prepare next slide position based on direction
            nextSlide.classList.remove('pointer-events-none');
            nextSlide.style.transition = 'none';
            nextSlide.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
            void nextSlide.offsetHeight;
            nextSlide.style.transition = TRANSITION;

            requestAnimationFrame(() => {
                // Animate in
                nextSlide.style.transform = 'translateX(0)';
                // Animate out
                currentSlide.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
            });

            setTimeout(() => {
                resetPositions(nextIndex, lastDirection);
                current = nextIndex;
                updateDots(current);
                isAnimating = false;
            }, 500);
        };

        const next = () => animateTo((current + 1) % slides.length, 'next');
        const prev = () => animateTo((current - 1 + slides.length) % slides.length, 'prev');

        const startAuto = () => {
            clearInterval(timer);
            timer = setInterval(next, 5000);
        };

        slider.querySelector('[data-action="next"]')?.addEventListener('click', () => {
            next();
            startAuto();
        });
        slider.querySelector('[data-action="prev"]')?.addEventListener('click', () => {
            prev();
            startAuto();
        });
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = Number(dot.dataset.dot);
                animateTo(idx, idx > current ? 'next' : 'prev');
                startAuto();
            });
        });

        updateDots(0);
        startAuto();
    }

    // Hide/show header on scroll
    const headerEl = document.getElementById('header');
    if (headerEl) {
        let lastY = window.scrollY;
        const threshold = 40;
        const deltaMin = 6;
        const onScroll = () => {
            const y = window.scrollY;
            const delta = y - lastY;
            if (y <= threshold) {
                headerEl.classList.remove('header-hidden');
            } else if (delta > deltaMin) {
                headerEl.classList.add('header-hidden');
            } else if (delta < -deltaMin) {
                headerEl.classList.remove('header-hidden');
            }
            lastY = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        const toggleBackToTop = () => {
            if (window.scrollY > 240) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        };
        window.addEventListener('scroll', toggleBackToTop, { passive: true });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        toggleBackToTop();
    }
});
