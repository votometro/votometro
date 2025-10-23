import { useEffect, useRef } from 'react';

export default function ConnectionAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Dynamically import p5 only on the client side
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;

      const sketch = (p: any) => {
        let particles: Particle[] = [];
        const numParticles = 80;

        class Particle {
          x: number;
          y: number;
          vx: number;
          vy: number;
          size: number;
          color: p5.Color;

          constructor() {
            this.x = p.random(p.width);
            this.y = p.random(p.height);
            this.vx = p.random(-0.5, 0.5);
            this.vy = p.random(-0.5, 0.5);
            this.size = p.random(3, 8);

            // Use colors from the design: yellow and gray variations
            const colors = [
              p.color(242, 255, 102, 180), // Primary yellow
              p.color(254, 230, 138, 180), // Light yellow
              p.color(115, 102, 255, 180),   // Purple
              p.color(156, 163, 175, 120), // Gray
            ];
            this.color = p.random(colors);
          }

          update() {
            this.x += this.vx;
            this.y += this.vy;

            // Wrap around edges
            if (this.x < 0) this.x = p.width;
            if (this.x > p.width) this.x = 0;
            if (this.y < 0) this.y = p.height;
            if (this.y > p.height) this.y = 0;
          }

          display() {
            p.noStroke();
            p.fill(this.color);
            p.circle(this.x, this.y, this.size);
          }

          connect(others: Particle[]) {
            others.forEach(other => {
              const d = p.dist(this.x, this.y, other.x, other.y);
              if (d < 120 && d > 0) {
                p.stroke(0, 0, 0, p.map(d, 0, 120, 30, 0));
                p.strokeWeight(p.map(d, 0, 120, 1.5, 0.2));
                p.line(this.x, this.y, other.x, other.y);
              }
            });
          }
        }

        p.setup = () => {
          p.createCanvas(containerRef.current!.offsetWidth, containerRef.current!.offsetHeight);
          for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
          }
        };

        p.draw = () => {
          p.background(255);

          particles.forEach(particle => {
            particle.update();
            particle.connect(particles);
            particle.display();
          });
        };

        p.windowResized = () => {
          if (containerRef.current) {
            p.resizeCanvas(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
          }
        };
      };

      p5InstanceRef.current = new p5(sketch, containerRef.current);
    });

    return () => {
      p5InstanceRef.current?.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] rounded-[3rem] overflow-hidden bg-white"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
