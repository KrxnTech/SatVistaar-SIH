import React, { useEffect, useRef } from 'react';

export function InteractiveHeroGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    const cellSize = 44;
    const activeCells = new Map();
    let mouse = { x: -1000, y: -1000, isHovering: false };
    let lastHoveredKey = '';

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) {
      ro.observe(canvas.parentElement);
    }

    const heroSection = canvas.closest('.hero-immersive') || canvas.parentElement;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse = { x, y, isHovering: true };

      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      const centerKey = `${col},${row}`;

      // Only trigger on hover
      if (centerKey !== lastHoveredKey) {
        lastHoveredKey = centerKey;

        // Light up hovered central cell + neighbor cells with radial falloff
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const c = col + dx;
            const r = row + dy;
            if (c >= 0 && r >= 0 && c * cellSize < width && r * cellSize < height) {
              const key = `${c},${r}`;
              const dist = Math.hypot(dx, dy);
              const intensity = dist === 0 ? 1.0 : dist === 1 ? 0.6 : 0.3;
              const isCenter = dist === 0;
              const existing = activeCells.get(key);

              activeCells.set(key, {
                x: c * cellSize,
                y: r * cellSize,
                alpha: Math.max(existing?.alpha || 0, intensity),
                color: isCenter ? '#f97316' : (c + r) % 2 === 0 ? '#38bdf8' : '#f97316',
                // "Coming up" spring elevation scale
                scale: isCenter ? 1.18 : 1.06,
                isCenter,
                decay: isCenter ? 0.018 : 0.022,
                lift: isCenter ? 3 : 1, // upward pixel float
              });
            }
          }
        }
      }
    };

    const handleMouseLeave = () => {
      mouse.isHovering = false;
      lastHoveredKey = '';
    };

    if (heroSection) {
      heroSection.addEventListener('mousemove', handleMouseMove, { passive: true });
      heroSection.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw crisp base grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      for (let x = 0; x <= width; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Cursor spotlight glow (active only while hovering)
      if (mouse.isHovering) {
        const spotGrad = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 190
        );
        spotGrad.addColorStop(0, 'rgba(249, 115, 22, 0.14)');
        spotGrad.addColorStop(0.45, 'rgba(56, 189, 248, 0.04)');
        spotGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. Draw active hovered squares (animate scale, elevation, glow & fade)
      activeCells.forEach((cell, key) => {
        cell.alpha -= cell.decay;
        if (cell.alpha <= 0) {
          activeCells.delete(key);
          return;
        }

        // Animate scale relaxation
        if (cell.scale > 1.0) {
          cell.scale -= 0.008;
          if (cell.scale < 1.0) cell.scale = 1.0;
        }

        const isOrange = cell.color === '#f97316';
        const fillRgba = isOrange
          ? `rgba(249, 115, 22, ${cell.alpha * 0.35})`
          : `rgba(56, 189, 248, ${cell.alpha * 0.32})`;
        const strokeRgba = isOrange
          ? `rgba(249, 115, 22, ${cell.alpha * 0.95})`
          : `rgba(56, 189, 248, ${cell.alpha * 0.95})`;

        const pad = 1.5;
        const cx = cell.x + pad;
        // Floating "coming up" y-offset
        const offsetY = -cell.lift * cell.alpha;
        const cy = cell.y + pad + offsetY;
        const cw = cellSize - pad * 2;
        const ch = cellSize - pad * 2;

        ctx.save();
        if (cell.scale > 1) {
          const midX = cell.x + cellSize / 2;
          const midY = cell.y + cellSize / 2 + offsetY;
          ctx.translate(midX, midY);
          ctx.scale(cell.scale, cell.scale);
          ctx.translate(-midX, -midY);
        }

        // Glow shadow
        ctx.shadowColor = cell.color;
        ctx.shadowBlur = 14 * cell.alpha;

        // Fill square
        ctx.fillStyle = fillRgba;
        ctx.fillRect(cx, cy, cw, ch);

        // Border
        ctx.strokeStyle = strokeRgba;
        ctx.lineWidth = cell.isCenter ? 1.5 : 1;
        ctx.strokeRect(cx, cy, cw, ch);

        // Corner target reticle markers on the central hovered square
        if (cell.isCenter && cell.alpha > 0.3) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          const tick = 4;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(cx, cy + tick);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx + tick, cy);
          // Top-right
          ctx.moveTo(cx + cw - tick, cy);
          ctx.lineTo(cx + cw, cy);
          ctx.lineTo(cx + cw, cy + tick);
          // Bottom-left
          ctx.moveTo(cx, cy + ch - tick);
          ctx.lineTo(cx, cy + ch);
          ctx.lineTo(cx + tick, cy + ch);
          // Bottom-right
          ctx.moveTo(cx + cw - tick, cy + ch);
          ctx.lineTo(cx + cw, cy + ch);
          ctx.lineTo(cx + cw, cy + ch - tick);
          ctx.stroke();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ro.disconnect();
      if (heroSection) {
        heroSection.removeEventListener('mousemove', handleMouseMove);
        heroSection.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-interactive-grid-canvas" aria-hidden="true" />;
}
