import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, ChevronRight, ArrowRight } from 'lucide-react';
import { Room3DScene } from './Room3DScene';

const LOGO_URL = "/assets/aistudio/____-removebg-preview_d70a7f72.png";
const FALLBACK_LOGO_URL = "/images/logo.png";

// Sound synthesizer via Web Audio API (safe, no external assets required)
class AudioEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Soft rhythmic footstep sound
  playFootstep() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65 + Math.random() * 15, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio might be blocked by browser policy
    }
  }

  // Metallic knob turn and click
  playKnobTurn() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(1200, now + 0.12);
      clickOsc.frequency.exponentialRampToValueAtTime(150, now + 0.18);

      clickGain.gain.setValueAtTime(0.09, now + 0.12);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now + 0.12);
      clickOsc.stop(now + 0.22);
    } catch {}
  }

  // Wooden door creak swing open
  playDoorCreak() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.2);
      osc.frequency.linearRampToValueAtTime(140, now + 0.45);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }
}

const sfx = new AudioEffects();

// Realistic Spherical Doorknob Lock Component (喇叭鎖)
interface RoundDoorLockProps {
  isKnobTurned: boolean;
  onKnobClick?: () => void;
  interactive?: boolean;
}

const RoundDoorLock: React.FC<RoundDoorLockProps> = ({ isKnobTurned, onKnobClick, interactive = true }) => {
  return (
    <div 
      className={`relative select-none flex items-center justify-center ${interactive ? 'cursor-pointer group' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (onKnobClick) onKnobClick();
      }}
      title="喇叭鎖 (點擊旋轉開門)"
    >
      {/* Outer Rosette / Escutcheon Plate (喇叭鎖圓形護蓋底座) */}
      <div 
        className="w-14 h-14 rounded-full relative flex items-center justify-center shadow-[2px_4px_10px_rgba(0,0,0,0.6)]"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #FFEBAA 0%, #D4AF37 45%, #8A6A1C 80%, #3D2B03 100%)',
          boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 3px rgba(0,0,0,0.8), 2px 3px 8px rgba(0,0,0,0.7)',
        }}
      >
        <div 
          className="w-12 h-12 rounded-full border border-[#FFF2B2]/60 shadow-[inset_0_0_4px_rgba(0,0,0,0.6)] flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 40% 35%, #F0CB5B 0%, #C99B28 50%, #6E5312 95%)',
          }}
        >
          <div className="absolute top-1.5 w-1 h-1 rounded-full bg-[#4A380C] shadow-inner" />
          <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#4A380C] shadow-inner" />

          {/* Cylindrical Neck / Stem */}
          <div 
            className="w-6 h-6 rounded-full relative flex items-center justify-center shadow-md"
            style={{
              background: 'linear-gradient(135deg, #FFE89E 0%, #B88924 50%, #4D3809 100%)',
            }}
          >
            {/* Spherical Round Knob */}
            <motion.div 
              animate={{ 
                rotate: isKnobTurned ? 38 : 0,
                scale: isKnobTurned ? 0.96 : 1
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-10 h-10 rounded-full relative flex items-center justify-center transition-transform"
              style={{
                background: 'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #FFF3BF 15%, #E5BD45 42%, #B5841D 70%, #523908 95%)',
                boxShadow: `
                  3px 4px 10px rgba(0,0,0,0.65),
                  inset -2px -3px 6px rgba(45,30,5,0.7),
                  inset 2px 2px 5px rgba(255,255,255,0.85)
                `,
              }}
            >
              <div className="absolute top-1.5 left-2 w-3.5 h-2 rounded-full bg-white/70 blur-[0.6px] transform -rotate-25 pointer-events-none" />
              <div className="absolute bottom-1.5 right-2 w-2.5 h-1.5 rounded-full bg-amber-200/30 blur-[1px] pointer-events-none" />

              {/* Center Keyhole Cylinder */}
              <div 
                className="w-4 h-4 rounded-full relative flex items-center justify-center border border-[#966E16]/80 shadow-inner"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #FCE390 0%, #A87C1D 65%, #3B2A06 100%)',
                  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8), inset -0.5px -0.5px 1px rgba(255,255,255,0.4)',
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1A1203] shadow-inner" />
                  <div className="w-0.5 h-1.5 bg-[#140D02] rounded-b-sm -mt-0.5 shadow-inner" />
                </div>
              </div>

              <div className="absolute inset-0 rounded-full border border-amber-300/30 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>

      {interactive && !isKnobTurned && (
        <span className="absolute -inset-2 rounded-full border-2 border-amber-400/60 animate-ping pointer-events-none opacity-40" />
      )}
    </div>
  );
};

// Single-Leaf Door Panel Component (單扇門板)
interface SingleDoorPanelProps {
  isDoorOpen: boolean;
  isKnobTurned: boolean;
  onKnobClick?: () => void;
  interactive?: boolean;
}

const SingleDoorPanel: React.FC<SingleDoorPanelProps> = ({ 
  isDoorOpen, 
  isKnobTurned, 
  onKnobClick,
  interactive = true 
}) => {
  return (
    <div 
      className="relative select-none"
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Outer Door Frame Casing (門框) */}
      <div 
        className="relative p-2.5 rounded-t-lg bg-[#1F1713] border-t-2 border-x-2 border-[#4A372D] shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
        style={{
          boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.1), 0 15px 45px rgba(0,0,0,0.8)',
        }}
      >
        <div className="absolute -bottom-2.5 left-0 right-0 h-2.5 bg-[#140E0B] border-t border-[#3B2C24]" />

        <div 
          className="absolute inset-2.5 overflow-hidden rounded-t pointer-events-none bg-black"
          style={{
            background: '#000000',
            boxShadow: 'none',
          }}
        />

        {/* The Single Door Leaf (單扇門板本體) */}
        <motion.div
          animate={{
            rotateY: isDoorOpen ? -78 : 0,
            x: isDoorOpen ? -4 : 0,
          }}
          transition={{
            duration: 1.1,
            ease: [0.25, 1, 0.5, 1],
          }}
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
          }}
          className="relative w-56 h-[420px] sm:w-64 sm:h-[480px] rounded-t flex flex-col justify-between p-3.5 shadow-2xl border border-[#443328]"
        >
          <div 
            className="absolute inset-0 rounded-t"
            style={{
              background: 'linear-gradient(180deg, #33241C 0%, #251A14 50%, #1A120E 100%)',
              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.15), inset -2px -2px 4px rgba(0,0,0,0.8)',
            }}
          />

          <div className="absolute left-0 top-10 -translate-x-1.5 w-2 h-7 rounded-sm bg-gradient-to-r from-[#D4AF37] to-[#5C450F] shadow-md border-y border-[#FFEAA7]" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-2 h-7 rounded-sm bg-gradient-to-r from-[#D4AF37] to-[#5C450F] shadow-md border-y border-[#FFEAA7]" />
          <div className="absolute left-0 bottom-10 -translate-x-1.5 w-2 h-7 rounded-sm bg-gradient-to-r from-[#D4AF37] to-[#5C450F] shadow-md border-y border-[#FFEAA7]" />

          {/* Upper Recessed Panel */}
          <div 
            className="relative z-10 w-full h-[44%] rounded border border-[#140E0B] p-2 flex flex-col justify-between"
            style={{
              background: 'linear-gradient(180deg, #2A1D16 0%, #1D1410 100%)',
              boxShadow: 'inset 2px 3px 6px rgba(0,0,0,0.85), inset -1px -1px 2px rgba(255,255,255,0.08), 1px 1px 2px rgba(255,255,255,0.06)',
            }}
          >
            <div 
              className="w-full h-full rounded border border-[#3E2D23]/80 p-2 flex items-center justify-center relative"
              style={{
                boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.7)',
              }}
            >
              <div className="text-center opacity-30 select-none pointer-events-none">
                <span className="text-[10px] font-mono tracking-[0.3em] text-amber-200/80 block uppercase">
                  CUBE PIXEL
                </span>
                <span className="text-[8px] font-serif text-amber-100/60 block mt-0.5">
                  紡塊像素
                </span>
              </div>
            </div>
          </div>

          {/* Lower Recessed Panel */}
          <div 
            className="relative z-10 w-full h-[48%] rounded border border-[#140E0B] p-2"
            style={{
              background: 'linear-gradient(180deg, #2A1D16 0%, #18100C 100%)',
              boxShadow: 'inset 2px 3px 6px rgba(0,0,0,0.85), inset -1px -1px 2px rgba(255,255,255,0.08), 1px 1px 2px rgba(255,255,255,0.06)',
            }}
          >
            <div 
              className="w-full h-full rounded border border-[#3E2D23]/80 flex items-center justify-center"
              style={{
                boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.7)',
              }}
            >
              <div className="w-12 h-16 border border-white/5 rounded-sm opacity-20" />
            </div>
          </div>

          <div className="absolute right-3.5 top-[52%] -translate-y-1/2 z-20">
            <RoundDoorLock 
              isKnobTurned={isKnobTurned} 
              onKnobClick={onKnobClick}
              interactive={interactive}
            />
          </div>

          <div className="absolute right-0 top-[52%] -translate-y-1/2 translate-x-[1px] w-[3px] h-12 bg-[#8C6B1B] rounded-r-xs shadow-sm" />
        </motion.div>
      </div>
    </div>
  );
};

export const MobileWebsite: React.FC = () => {
  // Unified Scene Flow (Desktop & Mobile):
  // 'landing' -> LOGO and "開始探索"
  // 'walking' -> Perspective slow walk towards the single door panel
  // 'door_reached' -> Door enlarged so round knob lock (喇叭鎖) is clearly visible
  // 'door_opening' -> Knob turns and door swings inward
  // 'black_frame' -> Pure plain black transition frame before text
  // 'text_transition' -> Black background transition with welcome messages
  // 'room' -> Full interactive 3D world (Room3DScene)
  const [sceneState, setSceneState] = useState<'landing' | 'walking' | 'door_reached' | 'door_opening' | 'black_frame' | 'text_transition' | 'room'>('landing');

  const [walkProgress, setWalkProgress] = useState(0);
  const [isKnobTurned, setIsKnobTurned] = useState(false);

  const walkingAnimRef = useRef<number | null>(null);
  const walkStartTimeRef = useRef<number>(0);
  const lastFootstepStepRef = useRef<number>(-1);

  const handleStartExplore = () => {
    setSceneState('walking');
    setWalkProgress(0);
    setIsKnobTurned(false);
    walkStartTimeRef.current = performance.now();
    lastFootstepStepRef.current = -1;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12); } catch {}
    }
  };

  useEffect(() => {
    if (sceneState !== 'walking') return;

    const WALK_DURATION = 4200;

    const updateWalk = (now: number) => {
      const elapsed = now - walkStartTimeRef.current;
      const rawProgress = Math.min(elapsed / WALK_DURATION, 1);
      const smoothProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      setWalkProgress(smoothProgress);

      const currentStep = Math.floor(rawProgress * 6);
      if (currentStep > lastFootstepStepRef.current && currentStep < 6) {
        lastFootstepStepRef.current = currentStep;
        sfx.playFootstep();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(6); } catch {}
        }
      }

      if (rawProgress >= 1) {
        setSceneState('door_reached');
      } else {
        walkingAnimRef.current = requestAnimationFrame(updateWalk);
      }
    };

    walkingAnimRef.current = requestAnimationFrame(updateWalk);

    return () => {
      if (walkingAnimRef.current) {
        cancelAnimationFrame(walkingAnimRef.current);
      }
    };
  }, [sceneState]);

  const handleKnobAction = () => {
    if (sceneState !== 'door_reached') return;

    sfx.playKnobTurn();
    setIsKnobTurned(true);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([20, 15, 25]); } catch {}
    }

    setSceneState('door_opening');

    setTimeout(() => {
      sfx.playDoorCreak();
    }, 280);

    setTimeout(() => {
      setSceneState('black_frame');
    }, 1150);
  };

  useEffect(() => {
    if (sceneState !== 'black_frame') return;
    const timer = setTimeout(() => {
      setSceneState('text_transition');
    }, 750);
    return () => clearTimeout(timer);
  }, [sceneState]);

  useEffect(() => {
    if (sceneState !== 'text_transition') return;
    const timer = setTimeout(() => {
      setSceneState('room');
    }, 3800);
    return () => clearTimeout(timer);
  }, [sceneState]);

  const cameraBobY = sceneState === 'walking' ? Math.sin(walkProgress * Math.PI * 12) * 3.0 : 0;
  const cameraSwayX = sceneState === 'walking' ? Math.cos(walkProgress * Math.PI * 6) * 1.6 : 0;
  const cameraTilt = sceneState === 'walking' ? Math.sin(walkProgress * Math.PI * 6) * 0.22 : 0;

  const doorScale = sceneState === 'landing'
    ? 0.13
    : 0.13 + Math.pow(walkProgress, 1.35) * 2.02;

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#000B18] text-white flex flex-col items-center justify-between overflow-hidden select-none font-rounded">
      {/* 3D Cosmic / Pixel Ambient Environment */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Atmospheric Neon Aura Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* 1. INITIAL LANDING SCREEN: LOGO & 開始探索 */}
      <AnimatePresence mode="wait">
        {sceneState === 'landing' && (
          <motion.div
            key="landing-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm flex-1 flex flex-col items-center justify-center px-6 z-20 text-center gap-10 my-auto"
          >
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex flex-col items-center justify-center"
            >
              <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-3xl border-2 border-pink-400/50 shadow-[0_0_45px_rgba(244,114,182,0.45),inset_0_0_25px_rgba(244,114,182,0.2)] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/25 via-transparent to-amber-400/25 pointer-events-none" />
                <img 
                  src={LOGO_URL} 
                  alt="Logo" 
                  className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(251,191,36,0.65)] relative z-10"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_LOGO_URL;
                  }}
                />
              </div>
            </motion.div>

            <div className="w-full flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleStartExplore}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-black text-lg tracking-[0.25em] shadow-[0_0_35px_rgba(244,114,182,0.6)] border border-pink-300/50 flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer"
              >
                <Compass className="w-5 h-5 text-amber-200 animate-spin" style={{ animationDuration: '8s' }} />
                <span>開始探索</span>
                <ArrowRight className="w-5 h-5 text-amber-200 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. WALKING & DOOR SCENE */}
      <AnimatePresence mode="wait">
        {(sceneState === 'walking' || sceneState === 'door_reached' || sceneState === 'door_opening') && (
          <motion.div
            key="walking-door-viewport"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden z-20"
            style={{ perspective: '1000px' }}
          >
            <div 
              className="absolute -bottom-20 left-[-50%] right-[-50%] h-[60%] pointer-events-none origin-bottom"
              style={{
                transform: 'rotateX(72deg)',
                backgroundImage: `
                  linear-gradient(to right, rgba(244, 114, 182, 0.15) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(251, 191, 36, 0.2) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundPosition: `0px ${(walkProgress * 400) % 40}px`,
                maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 100%)',
              }}
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-gradient-to-t from-pink-500/20 via-amber-400/10 to-transparent blur-3xl pointer-events-none" />

            <div 
              className="relative flex flex-col items-center justify-center w-full h-full transition-transform ease-out"
              style={{
                transform: `translate3d(${cameraSwayX}px, ${cameraBobY}px, 0) rotate(${cameraTilt}deg)`,
              }}
            >
              <div 
                className="relative flex items-center justify-center transition-transform ease-linear"
                style={{
                  transform: `scale(${doorScale})`,
                  transformOrigin: 'center 62%',
                }}
              >
                <SingleDoorPanel 
                  isDoorOpen={sceneState === 'door_opening'}
                  isKnobTurned={isKnobTurned}
                  onKnobClick={handleKnobAction}
                  interactive={sceneState === 'door_reached'}
                />
              </div>
            </div>

            {sceneState === 'door_reached' && (
              <div className="absolute bottom-12 left-0 right-0 flex justify-center z-30">
                <motion.button 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleKnobAction}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold text-sm tracking-widest shadow-[0_0_30px_rgba(251,191,36,0.6)] border border-amber-200/60 cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>推開房門</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2.5 PURE BLACK FRAME & TEXT TRANSITION */}
      <AnimatePresence mode="wait">
        {(sceneState === 'black_frame' || sceneState === 'text_transition') && (
          <motion.div
            key="black-transition-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 w-full h-full z-50 bg-black flex flex-col items-center justify-center p-8 text-center select-none cursor-pointer"
            onClick={() => {
              if (sceneState === 'text_transition') setSceneState('room');
            }}
          >
            {sceneState === 'text_transition' && (
              <div className="max-w-md w-full space-y-8 flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.15 }}
                  className="text-amber-100 font-serif text-lg sm:text-2xl tracking-[0.2em] font-medium leading-relaxed drop-shadow-[0_2px_10px_rgba(251,191,36,0.15)]"
                >
                  「歡迎光臨保持可愛漫研社的網站」
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 1.2 }}
                  className="text-amber-300/90 font-serif text-base sm:text-xl tracking-[0.18em] leading-relaxed italic"
                >
                  「記得幫我關門 會有蚊子」
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 2.25 }}
                  className="text-white/50 font-sans text-xs sm:text-sm tracking-[0.15em] font-light"
                >
                  「東西越來越多了 載入慢敬請見諒」
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 3D INTERACTIVE ROOM SCENE */}
      <AnimatePresence mode="wait">
        {sceneState === 'room' && (
          <motion.div
            key="room-3d-scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full z-40 bg-[#0a0c16]"
          >
            <Room3DScene />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer (hidden during full 3D room mode) */}
      {sceneState !== 'room' && (
        <footer className="w-full max-w-md flex flex-col items-center gap-1 pt-1 pb-2 text-center font-mono z-30 border-t border-white/5">
          <div className="text-[8px] text-white/40 tracking-wider">
            © 2026 CUBEPIXEL • 保持你的可愛
          </div>
        </footer>
      )}
    </div>
  );
};
