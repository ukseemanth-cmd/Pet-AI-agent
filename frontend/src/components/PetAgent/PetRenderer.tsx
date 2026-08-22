import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetState } from '../../services/types';

interface PetRendererProps {
  state: PetState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export const PetRenderer: React.FC<PetRendererProps> = ({
  state = 'idle',
  size = 'lg',
  onClick,
}) => {
  const sizePixels = {
    sm: 120,
    md: 180,
    lg: 260,
    xl: 340,
  }[size];

  // Colors & mood accents based on state
  const moodConfig = useMemo(() => {
    switch (state) {
      case 'thinking':
        return {
          glowColor: '#38bdf8',
          coreColor: '#0ea5e9',
          eyeColor: '#7dd3fc',
          auraOpacity: 0.7,
        };
      case 'happy':
        return {
          glowColor: '#34d399',
          coreColor: '#10b981',
          eyeColor: '#a7f3d0',
          auraOpacity: 0.8,
        };
      case 'excited':
        return {
          glowColor: '#f43f5e',
          coreColor: '#fb7185',
          eyeColor: '#ffe4e6',
          auraOpacity: 0.95,
        };
      case 'celebrating':
        return {
          glowColor: '#a855f7',
          coreColor: '#c084fc',
          eyeColor: '#fdf4ff',
          auraOpacity: 1,
        };
      case 'encouraging':
        return {
          glowColor: '#f59e0b',
          coreColor: '#fbbf24',
          eyeColor: '#fef3c7',
          auraOpacity: 0.85,
        };
      case 'focused':
      case 'working':
        return {
          glowColor: '#06b6d4',
          coreColor: '#22d3ee',
          eyeColor: '#cffafe',
          auraOpacity: 0.9,
        };
      case 'concerned':
        return {
          glowColor: '#f97316',
          coreColor: '#fb923c',
          eyeColor: '#ffedd5',
          auraOpacity: 0.5,
        };
      case 'tired':
      case 'sleepy':
        return {
          glowColor: '#64748b',
          coreColor: '#94a3b8',
          eyeColor: '#cbd5e1',
          auraOpacity: 0.35,
        };
      case 'idle':
      default:
        return {
          glowColor: '#06b6d4',
          coreColor: '#22d3ee',
          eyeColor: '#a5f3fc',
          auraOpacity: 0.6,
        };
    }
  }, [state]);

  // Motion variants for body movement
  const bodyVariants: Record<string, any> = {
    idle: {
      y: [0, -10, 0],
      rotate: [0, 1, -1, 0],
      transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
    },
    thinking: {
      y: [0, -14, -6, -16, 0],
      rotate: [0, 3, -3, 2, 0],
      transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
    },
    happy: {
      y: [0, -16, 0, -12, 0],
      scale: [1, 1.05, 0.98, 1.04, 1],
      transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
    },
    excited: {
      y: [0, -26, 0, -22, 0],
      scale: [1, 1.1, 0.95, 1.08, 1],
      rotate: [0, -4, 4, -2, 0],
      transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' },
    },
    celebrating: {
      y: [0, -32, 0],
      rotate: [0, 360],
      scale: [1, 1.15, 1],
      transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
    },
    encouraging: {
      y: [0, -8, 0],
      scale: [1, 1.06, 1],
      transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
    },
    focused: {
      y: [0, -3, 0],
      scale: 1.02,
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
    working: {
      y: [0, -6, 0],
      rotate: [-1, 1, -1],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    },
    concerned: {
      y: [4, 8, 4],
      rotate: [-3, -4, -3],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    tired: {
      y: [6, 10, 6],
      scaleY: 0.95,
      transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
    },
    sleepy: {
      y: [4, 8, 4],
      scaleY: [0.96, 0.93, 0.96],
      rotate: [-2, -3, -2],
      transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      style={{ width: sizePixels, height: sizePixels }}
    >
      {/* Background Mood Aura */}
      <motion.div
        className="absolute rounded-full pointer-events-none filter blur-2xl transition-all duration-700"
        style={{
          width: sizePixels * 0.85,
          height: sizePixels * 0.85,
          backgroundColor: moodConfig.glowColor,
          opacity: moodConfig.auraOpacity * 0.4,
        }}
        animate={{
          scale: state === 'excited' || state === 'celebrating' ? [1, 1.35, 1] : [1, 1.15, 1],
          opacity: [moodConfig.auraOpacity * 0.3, moodConfig.auraOpacity * 0.55, moodConfig.auraOpacity * 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting particles / rune ring for Thinking & Celebrating */}
      <AnimatePresence>
        {state === 'thinking' && (
          <motion.div
            className="absolute rounded-full border border-dashed border-cyan-400/40 pointer-events-none"
            style={{ width: sizePixels * 1.05, height: sizePixels * 1.05 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8] absolute -top-1 left-1/2" />
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#0ea5e9] absolute -bottom-1 left-1/3" />
          </motion.div>
        )}

        {state === 'focused' && (
          <motion.div
            className="absolute rounded-full border border-cyan-400/30 pointer-events-none"
            style={{ width: sizePixels * 1.1, height: sizePixels * 1.1 }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {state === 'sleepy' && (
          <div className="absolute -top-2 right-4 pointer-events-none font-mono text-cyan-300/80 font-bold">
            <motion.span
              className="absolute text-sm"
              animate={{ y: [-5, -25], x: [0, 10], opacity: [1, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0 }}
            >
              z
            </motion.span>
            <motion.span
              className="absolute text-lg -right-3 -top-2"
              animate={{ y: [-5, -30], x: [0, 15], opacity: [1, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
            >
              Z
            </motion.span>
          </div>
        )}
      </AnimatePresence>

      {/* Main SVG Pet Mascot */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-2xl z-10"
        variants={bodyVariants}
        animate={state}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0f1d" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={moodConfig.coreColor} stopOpacity="1" />
            <stop offset="60%" stopColor={moodConfig.glowColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={moodConfig.glowColor} stopOpacity="0" />
          </radialGradient>

          <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Shadow Pod */}
        <ellipse cx="100" cy="188" rx="46" ry="7" fill="#000000" opacity="0.4" />

        {/* Cyber Antennae / Horns */}
        <g>
          {/* Left Antenna */}
          <path
            d="M 68 55 Q 52 28 44 24 Q 40 28 48 42 Q 62 58 68 62"
            fill="#1e293b"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />
          <circle cx="43" cy="23" r="4.5" fill={moodConfig.glowColor} filter="url(#neonGlow)" />

          {/* Right Antenna */}
          <path
            d="M 132 55 Q 148 28 156 24 Q 160 28 152 42 Q 138 58 132 62"
            fill="#1e293b"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />
          <circle cx="157" cy="23" r="4.5" fill={moodConfig.glowColor} filter="url(#neonGlow)" />
        </g>

        {/* Main Body Shell (Cute rounded futuristic cyber orb) */}
        <path
          d="M 100 40 C 145 40 162 68 162 115 C 162 155 138 178 100 178 C 62 178 38 155 38 115 C 38 68 55 40 100 40 Z"
          fill="url(#bodyGrad)"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="2"
        />

        {/* Sleek Side Fin Accent Lines */}
        <path d="M 44 100 Q 34 116 46 132" stroke={moodConfig.glowColor} strokeWidth="2.5" fill="none" opacity="0.7" />
        <path d="M 156 100 Q 166 116 154 132" stroke={moodConfig.glowColor} strokeWidth="2.5" fill="none" opacity="0.7" />

        {/* Visor Screen */}
        <rect
          x="54"
          y="66"
          width="92"
          height="54"
          rx="24"
          fill="url(#visorGrad)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1.5"
        />

        {/* Subtle Visor Reflection Line */}
        <path
          d="M 64 74 Q 100 68 136 74"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Dynamic Expressive Eyes */}
        <g filter="url(#neonGlow)">
          {state === 'happy' || state === 'celebrating' ? (
            /* Curved Cheerful Eyes ^^ */
            <>
              <path d="M 72 95 Q 81 83 90 95" stroke={moodConfig.eyeColor} strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 110 95 Q 119 83 128 95" stroke={moodConfig.eyeColor} strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          ) : state === 'sleepy' ? (
            /* Relaxed Drooping Slits -- */
            <>
              <path d="M 72 96 Q 81 99 90 96" stroke={moodConfig.eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 110 96 Q 119 99 128 96" stroke={moodConfig.eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </>
          ) : state === 'concerned' ? (
            /* Slanted worried eyes */
            <>
              <circle cx="81" cy="94" r="6" fill={moodConfig.eyeColor} />
              <path d="M 74 86 L 88 90" stroke={moodConfig.eyeColor} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="119" cy="94" r="6" fill={moodConfig.eyeColor} />
              <path d="M 126 86 L 112 90" stroke={moodConfig.eyeColor} strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : state === 'focused' ? (
            /* Sharp focused gaze with ring */
            <>
              <circle cx="81" cy="93" r="6.5" fill={moodConfig.eyeColor} />
              <circle cx="81" cy="93" r="2.5" fill="#030712" />
              <circle cx="119" cy="93" r="6.5" fill={moodConfig.eyeColor} />
              <circle cx="119" cy="93" r="2.5" fill="#030712" />
            </>
          ) : (
            /* Standard Expressive Glowing Eyes */
            <>
              <ellipse cx="81" cy="92" rx="7" ry="8.5" fill={moodConfig.eyeColor} />
              <circle cx="83" cy="89" r="2.5" fill="#ffffff" />
              <ellipse cx="119" cy="92" rx="7" ry="8.5" fill={moodConfig.eyeColor} />
              <circle cx="121" cy="89" r="2.5" fill="#ffffff" />
            </>
          )}

          {/* Cute Smile / Mouth */}
          {state === 'happy' || state === 'celebrating' || state === 'excited' ? (
            <path d="M 94 106 Q 100 112 106 106" stroke={moodConfig.eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : state === 'concerned' ? (
            <path d="M 95 110 Q 100 106 105 110" stroke={moodConfig.eyeColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : (
            <circle cx="100" cy="107" r="1.5" fill={moodConfig.eyeColor} opacity="0.7" />
          )}
        </g>

        {/* Chest Pulsating Arc Reactor Core */}
        <g>
          <ellipse cx="100" cy="148" rx="16" ry="16" fill="url(#coreGlow)" />
          <circle
            cx="100"
            cy="148"
            r="8"
            fill={moodConfig.coreColor}
            filter="url(#neonGlow)"
          />
          <circle cx="100" cy="148" r="4" fill="#ffffff" opacity="0.85" />
        </g>
      </motion.svg>
    </div>
  );
};
