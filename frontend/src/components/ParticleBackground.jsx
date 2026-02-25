import { useEffect, useRef } from "react";

// ParticleBackground.jsx
// Renders 60 slowly drifting white dots on a fixed <canvas> that sits
// behind all page content. Uses requestAnimationFrame for smooth animation
// and cleans up properly on unmount to avoid memory leaks.

const PARTICLE_COUNT = 60;

function createParticle(width, height) {
    return {
        x: Math.random() * width,
        y: Math.random() * height,
        // Slow drift — max ~0.2 px per frame so particles are barely perceptible
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.15,
    };
}

export default function ParticleBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationId;

        // Match canvas pixel size to the actual viewport.
        // Storing in particles initialised below.
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const particles = Array.from({ length: PARTICLE_COUNT }, () =>
            createParticle(width, height)
        );

        function draw() {
            // Clear with a fully transparent fill so the dark body shows through.
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                // Move
                p.x += p.vx;
                p.y += p.vy;

                // Wrap at edges so particles never disappear
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Draw as a small white circle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            });

            animationId = requestAnimationFrame(draw);
        }

        draw();

        // Update canvas size when the window is resized.
        // Particles keep their relative positions; they will re-wrap naturally.
        function handleResize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 0,
                pointerEvents: "none",
            }}
        />
    );
}
