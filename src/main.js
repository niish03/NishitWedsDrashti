gsap.registerPlugin(ScrollTrigger);

// 1. Smooth Scrolling Setup - Lenis
const lenis = new Lenis({
  duration: 1.5, // slightly slower for a more cinematic feel
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  smoothTouch: false,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Force scroll trigger updates when lenis scrolls
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
});
gsap.ticker.lagSmoothing(0, 0);

// 2. Audio Player Logic
const musicBtn = document.getElementById('music-btn');
const bgMusic = document.getElementById('bg-music');
let isPlaying = false;

musicBtn.addEventListener('click', () => {
  if (isPlaying) {
    bgMusic.pause();
    musicBtn.classList.remove('playing');
    gsap.to(musicBtn, { rotation: 0, duration: 0.5 });
  } else {
    bgMusic.play().catch(e => console.log('Audio error:', e));
    musicBtn.classList.add('playing');
    gsap.to(musicBtn, { rotation: 360, duration: 2, ease: "none", repeat: -1 });
  }
  isPlaying = !isPlaying;
});

// Optionally, listen for the first interaction to start music implicitly if desired
// document.body.addEventListener('click', function initiateAudio() {
//    if (!isPlaying) musicBtn.click();
//    document.body.removeEventListener('click', initiateAudio);
// }, { once: true });


// 3. Cinematic 3D Parallax & Scroll Animations Setup
function initAnimations() {
  setTimeout(() => {
    // Parallax Window implementation matching the demo:
    // The background (mahal/bg) moves slowly, text moves at medium speed, foreground (car) acts as an anchor or slides in reverse.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        scrub: true,
        start: "top top",
        end: "bottom top"
      }
    });

    // Background glides down slowly
    tl.to('.bg-layer', { yPercent: 20, ease: "none" }, 0);

    // Text slides up and fades out softly
    tl.to('.text-layer', {
      yPercent: -10, // Moves UP while scrolling down
      opacity: 0,
      rotationX: 15,
      ease: "none"
    }, 0);

    // Foreground (Car) moves from right to left in a straight path
    tl.fromTo('.car-layer',
      { x: '0%' },
      { x: '100%', y: "-6%", scale: "0.1", ease: "none"},
      0);

    // Fade-in Elements on Scroll
    const fadeElements = gsap.utils.toArray('.fade-trigger');
    fadeElements.forEach(elem => {
      gsap.to(elem, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: elem,
          start: "top 85%", // Trigger when 85% down the viewport
        }
      });
    });

    // 3D pop up hover interactions for Event Sections (Desktop mainly)
    const eventBoxes = document.querySelectorAll('.content-box');
    eventBoxes.forEach(box => {
      box.addEventListener('mousemove', (e) => {
        const rect = box.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(box, {
          rotationY: x * 0.03,
          rotationX: -y * 0.03,
          ease: "power1.out",
          transformPerspective: 1000
        });
      });
      box.addEventListener('mouseleave', () => {
        gsap.to(box, { rotationY: 0, rotationX: 0, duration: 0.6, ease: "power3.out" });
      });
    });

  }, 1000); // Start scroll setup after entrance animations
}

window.addEventListener('load', () => {
  initAnimations();
});
