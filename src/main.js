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

    // Parallax Clouds - Move slowly upwards on scroll
    gsap.to('.cloud-1', {
      yPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: '#transition',
        scrub: true,
        start: "top bottom",
        end: "bottom top"
      }
    });

    gsap.to('.cloud-2', {
      yPercent: -35,
      ease: "none",
      scrollTrigger: {
        trigger: '#transition',
        scrub: true,
        start: "top bottom",
        end: "bottom top"
      }
    });

    gsap.to('.cloud-3', {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: '#transition',
        scrub: true,
        start: "top bottom",
        end: "bottom top"
      }
    });

    // Scratch to Reveal Logic
    const canvas = document.getElementById('scratch-pad');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let isDrawing = false;

      // Setup Canvas to look like blank wax
      function setupCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Rich Red Wax Gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#8A151B'); // Deep red wax
        gradient.addColorStop(0.5, '#A31D24'); // Lighter center
        gradient.addColorStop(1, '#6E0E14'); // Dark red edge

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw "Scratch Here" text lightly embossed
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "clamp(1rem, 4vw, 1.2rem) Outfit";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Scratch Here", canvas.width / 2, canvas.height / 2);
      }

      setupCanvas();

      function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      }

      let hasPopped = false;

      function checkPercentage() {
        if (hasPopped) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let transparent = 0;
        
        // Fast sampling by checking every 4th pixel's alpha (RGBA)
        for (let i = 3; i < data.length; i += 16) {
          if (data[i] === 0) transparent++;
        }
        
        const totalSampled = data.length / 16;
        const percent = transparent / totalSampled;
        
        // The canvas is a square, but CSS border-radius: 50% makes it a circle.
        // The invisible corners take up ~21.5% of the total area. 
        // If the user scratches 70% of the *visible* circle, that is about 55% of the total square area.
        // We set the threshold to 0.5 (50% of total area) to trigger reliably.
        if (percent > 0.4) {
          hasPopped = true;
          
          // Trigger Confetti Popper using the imported canvas-confetti
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#D4AF37', '#8A151B', '#F8F3EB', '#C3CBB4'] // Match theme: Gold, Red, Cream, Sage
            });
          }

          // Automatically dissolve the rest of the canvas for a clean look
          gsap.to(canvas, { opacity: 0, duration: 0.8, onComplete: () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.opacity = 1; // restore opacity in case they touch it again
          }});
        }
      }

      function scratch(x, y) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        // Slightly randomized fluffy brush effect for "thick liquid/foil" feel
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();

        // Randomly check completion (~10% of scratch events to save performance)
        if (!hasPopped && Math.random() < 0.1) {
          checkPercentage();
        }
      }

      canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const { x, y } = getCoordinates(e);
        scratch(x, y);
      });

      canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        scratch(x, y);
      });

      window.addEventListener('mouseup', () => { isDrawing = false; });

      // Touch Support
      canvas.addEventListener('touchstart', (e) => {
        isDrawing = true;
        const { x, y } = getCoordinates(e);
        scratch(x, y);
        e.preventDefault(); // Prevent scrolling while scratching
      }, { passive: false });

      canvas.addEventListener('touchmove', (e) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        scratch(x, y);
        e.preventDefault();
      }, { passive: false });

      window.addEventListener('touchend', () => { isDrawing = false; });
    }

  }, 1000); // Start scroll setup after entrance animations
}

window.addEventListener('load', () => {
  initAnimations();
});
