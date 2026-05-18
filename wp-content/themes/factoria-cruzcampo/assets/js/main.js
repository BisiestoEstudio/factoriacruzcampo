const lenis = new Lenis({
    duration: 1.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

// --- Marquee scroll acceleration ---
const MARQUEE_SPEED_FACTOR = 0.6; // how much velocity boosts the rate
const MARQUEE_MAX_BOOST    = 3;   // cap: never faster than 4× base speed
const MARQUEE_LERP         = 0.07; // smoothing factor (lower = smoother)

let marqueeAnims    = null;
let scrollVelocity  = 0;
let marqueeRate     = 1;

lenis.on('scroll', ({ velocity }) => {
    scrollVelocity = velocity;
});

document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
        const els = document.querySelectorAll('.b-scroll-text__track, .b-marquee__item');
        marqueeAnims = Array.from(els)
            .map(el => el.getAnimations()[0])
            .filter(Boolean);
    });
});
// ------------------------------------

function raf(time) {
    lenis.raf(time);

    if (marqueeAnims && marqueeAnims.length) {
        const targetRate = 1 + Math.min(Math.abs(scrollVelocity) * MARQUEE_SPEED_FACTOR, MARQUEE_MAX_BOOST);
        marqueeRate += (targetRate - marqueeRate) * MARQUEE_LERP;
        for (const anim of marqueeAnims) {
            anim.playbackRate = marqueeRate;
        }
    }

    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);


