import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, SkipForward, Sparkles, Zap } from 'lucide-react';

const SpiderWebIntro = ({ onComplete, isOpen = true }) => {
  const canvasRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [phaseText, setPhaseText] = useState('FIRING WEB SHOOTER...');
  const [isVisible, setIsVisible] = useState(isOpen);
  const [revealing, setRevealing] = useState(false);

  // Play synthetic "THWIP!" web shooter sound
  const playThwipSound = () => {
    if (muted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.25, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // 1. High pressure air/fluid hiss (White Noise + Bandpass filter sweep)
      const bufferSize = ctx.sampleRate * 0.28;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(3.5, ctx.currentTime);
      filter.frequency.setValueAtTime(3800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.25);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.26);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);

      noiseSource.start();

      // 2. High tensile snap tonal chirp
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.2);

      oscGain.gain.setValueAtTime(0.4, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Audio context might be restricted before first gesture; ignore safely
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setIsVisible(true);
    setRevealing(false);

    // Initial audio trigger
    playThwipSound();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const centerX = width / 2;
    const centerY = height / 2;

    // Number of spoke lines radiating out
    const numSpokes = 18;
    const maxRadius = Math.sqrt(width * width + height * height) / 2 + 50;
    const numRings = 9;

    // Particle web splatters
    const particles = [];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 12;
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 3,
        alpha: 0.9,
        decay: 0.015 + Math.random() * 0.02
      });
    }

    const startTime = performance.now();

    const render = (currentTime) => {
      const elapsed = currentTime - startTime;

      ctx.clearRect(0, 0, width, height);

      // Background vignette pulse with Spidy red & blue glow
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, maxRadius);
      bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.96)');
      bgGrad.addColorStop(0.5, 'rgba(11, 15, 25, 0.98)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 1)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Phase 1: Radial Spoke Growth (0 - 800ms)
      const spokeProgress = Math.min(1, elapsed / 700);

      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = 'rgba(240, 249, 255, 0.9)';

      // Draw Spokes
      for (let i = 0; i < numSpokes; i++) {
        const angle = (i * Math.PI * 2) / numSpokes;
        const currentLen = maxRadius * spokeProgress;
        const targetX = centerX + Math.cos(angle) * currentLen;
        const targetY = centerY + Math.sin(angle) * currentLen;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        // Add subtle wave / whip vibration in early flight
        if (spokeProgress < 1) {
          const midX = (centerX + targetX) / 2 + Math.sin(elapsed * 0.05 + i) * 8;
          const midY = (centerY + targetY) / 2 + Math.cos(elapsed * 0.05 + i) * 8;
          ctx.quadraticCurveTo(midX, midY, targetX, targetY);
        } else {
          ctx.lineTo(targetX, targetY);
        }
        ctx.stroke();
      }

      // Phase 2: Concentric Web Rings weaving (400ms - 1500ms)
      if (elapsed > 400) {
        setPhaseText('WEBBING TENSION AT MAXIMUM');
        const ringGlobalProgress = Math.min(1, (elapsed - 400) / 900);

        for (let r = 1; r <= numRings; r++) {
          const ringTargetFrac = r / numRings;
          if (ringGlobalProgress >= ringTargetFrac * 0.8) {
            const ringRadius = (maxRadius * 0.85 * (r / numRings));
            const subProgress = Math.min(1, (ringGlobalProgress - ringTargetFrac * 0.7) / 0.3);

            ctx.beginPath();
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = `rgba(224, 242, 254, ${0.75 * subProgress})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';

            for (let i = 0; i <= numSpokes; i++) {
              const a1 = (i * Math.PI * 2) / numSpokes;
              const a2 = ((i + 1) * Math.PI * 2) / numSpokes;

              const x1 = centerX + Math.cos(a1) * ringRadius;
              const y1 = centerY + Math.sin(a1) * ringRadius;
              const x2 = centerX + Math.cos(a2) * ringRadius;
              const y2 = centerY + Math.sin(a2) * ringRadius;

              // Droop sag center for natural spiderweb catenary curve
              const sag = ringRadius * 0.08;
              const midA = (a1 + a2) / 2;
              const sagX = centerX + Math.cos(midA) * (ringRadius - sag);
              const sagY = centerY + Math.sin(midA) * (ringRadius - sag);

              if (i === 0) ctx.moveTo(x1, y1);
              ctx.quadraticCurveTo(sagX, sagY, x2, y2);
            }
            ctx.stroke();
          }
        }
      }

      // Silk Spray Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(6, 182, 212, 1)';
          ctx.fill();
        }
      }

      ctx.restore();

      // Phase 3: Tension recoil & Snap open (1800ms - 2500ms)
      if (elapsed > 1700 && !revealing) {
        setPhaseText('SPIDER-SENSE ONLINE — WORKSPACE UNLOCKED');
      }

      if (elapsed > 2200 && !revealing) {
        setRevealing(true);
      }

      if (elapsed < 2700) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        handleDismiss();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleDismiss = () => {
    setRevealing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 450);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto transition-all duration-500 ${
        revealing ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Interactive Web Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Center Spider-Man Emblem & Hero HUD */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 animate-fade-in pointer-events-none select-none">
        {/* Glowing Spider Badge */}
        <div className="relative group">
          {/* Animated Spider-Sense Aura Waves */}
          <div className="absolute -inset-6 rounded-full bg-cyan-500/20 blur-xl animate-pulse"></div>
          <div className="absolute -inset-3 rounded-full bg-indigo-500/30 blur-md"></div>
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-950/90 border-2 border-cyan-400/80 flex items-center justify-center shadow-2xl shadow-cyan-500/50 backdrop-blur-xl">
            {/* Custom SVG Spider-Man Web Symbol */}
            <svg
              className="w-14 h-14 sm:w-16 sm:h-16 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Spider Body */}
              <ellipse cx="12" cy="12" rx="3.2" ry="5.5" fill="currentColor" fillOpacity="0.25" />
              <circle cx="12" cy="6.2" r="2.2" fill="currentColor" />
              {/* Spider Eyes / Markings */}
              <path d="M10.8 5.8 L12 7 L13.2 5.8" stroke="#ffffff" strokeWidth="1.2" />
              {/* Legs Top */}
              <path d="M10 8 C6 5, 4 7, 3 11" />
              <path d="M14 8 C18 5, 20 7, 21 11" />
              {/* Legs Middle Top */}
              <path d="M9.5 11 C5 10, 3 13, 2 16" />
              <path d="M14.5 11 C19 10, 21 13, 22 16" />
              {/* Legs Middle Bottom */}
              <path d="M9.5 13 C5 16, 4 19, 4 22" />
              <path d="M14.5 13 C19 16, 20 19, 20 22" />
              {/* Legs Bottom */}
              <path d="M10.5 16 C8 19, 7 21, 8 23" />
              <path d="M13.5 16 C16 19, 17 21, 16 23" />
            </svg>
          </div>
        </div>

        {/* Hero Titles */}
        <div className="mt-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold tracking-widest uppercase shadow-sm">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>THWIP! WEB-SHOOTER ENGAGED</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            SPIDY TASK AUTOMATION
          </h1>

          <p className="text-xs sm:text-sm text-cyan-200/90 font-mono tracking-wider font-semibold">
            {phaseText}
          </p>
        </div>
      </div>

      {/* Floating Interactive Controls (Top-Right) */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3 pointer-events-auto">
        {/* Mute/Unmute Audio Toggle */}
        <button
          onClick={() => {
            const nextMuted = !muted;
            setMuted(nextMuted);
            if (!nextMuted) playThwipSound();
          }}
          className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white shadow-lg backdrop-blur-md transition cursor-pointer"
          title={muted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Skip Animation Button */}
        <button
          onClick={handleDismiss}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 hover:text-white shadow-lg backdrop-blur-md transition cursor-pointer group"
        >
          <span>Skip Intro</span>
          <SkipForward className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-[11px] text-slate-400/80 font-mono pointer-events-none tracking-wider">
        PRESS <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">ESC</kbd> OR CLICK ANYWHERE TO OPEN
      </div>
    </div>
  );
};

export default SpiderWebIntro;
