import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PetState } from '../../services/types';
import { PetType, PetTheme, getPetSpecies, getThemeConfig } from '../../config/petConfig';
import { useCompanion } from '../../context/CompanionContext';

interface PetRendererProps {
  state?: PetState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  petType?: PetType;
  theme?: PetTheme;
  accessories?: string[];
  interactive?: boolean;
  onClick?: () => void;
}

// ─── Helper: Mood-based eye shape ───────────────────────────────────────────
function Eyes({
  state,
  lx, ly, rx, ry,
  eyeColor,
  radius = 9,
}: {
  state: PetState;
  lx: number; ly: number; rx: number; ry: number;
  eyeColor: string;
  radius?: number;
}) {
  const r = radius;
  if (state === 'happy' || state === 'celebrating') {
    return (
      <g>
        <path d={`M ${lx - r} ${ly} Q ${lx} ${ly - r * 1.2} ${lx + r} ${ly}`} stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d={`M ${rx - r} ${ry} Q ${rx} ${ry - r * 1.2} ${rx + r} ${ry}`} stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx={lx - 4} cy={ly + 5} r={4} fill="#f43f5e" opacity="0.35" />
        <circle cx={rx + 4} cy={ry + 5} r={4} fill="#f43f5e" opacity="0.35" />
      </g>
    );
  }
  if (state === 'sleepy' || state === 'tired') {
    return (
      <g>
        <path d={`M ${lx - r} ${ly} Q ${lx} ${ly + r * 0.8} ${lx + r} ${ly}`} stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d={`M ${rx - r} ${ry} Q ${rx} ${ry + r * 0.8} ${rx + r} ${ry}`} stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    );
  }
  if (state === 'concerned') {
    return (
      <g>
        <line x1={lx - r * 0.8} y1={ly - 7} x2={lx + r * 0.8} y2={ly - 3} stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
        <circle cx={lx} cy={ly} r={r} fill="#1e1b4b" />
        <circle cx={lx} cy={ly} r={r * 0.56} fill={eyeColor} />
        <circle cx={lx} cy={ly} r={r * 0.3} fill="#1e1b4b" />
        <circle cx={lx - 3} cy={ly - 3} r={2.5} fill="#fff" />
        <line x1={rx + r * 0.8} y1={ry - 7} x2={rx - r * 0.8} y2={ry - 3} stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
        <circle cx={rx} cy={ry} r={r} fill="#1e1b4b" />
        <circle cx={rx} cy={ry} r={r * 0.56} fill={eyeColor} />
        <circle cx={rx} cy={ry} r={r * 0.3} fill="#1e1b4b" />
        <circle cx={rx - 3} cy={ry - 3} r={2.5} fill="#fff" />
      </g>
    );
  }
  if (state === 'thinking') {
    return (
      <g>
        <circle cx={lx} cy={ly} r={r} fill="#1e1b4b" />
        <circle cx={lx} cy={ly} r={r * 0.55} fill={eyeColor} />
        <circle cx={lx + 2} cy={ly} r={r * 0.3} fill="#1e1b4b" />
        <circle cx={lx - 2} cy={ly - 3} r={2.5} fill="#fff" />
        <circle cx={rx} cy={ry} r={r} fill="#1e1b4b" />
        <circle cx={rx} cy={ry} r={r * 0.55} fill={eyeColor} />
        <circle cx={rx - 2} cy={ry} r={r * 0.3} fill="#1e1b4b" />
        <circle cx={rx + 2} cy={ry - 3} r={2.5} fill="#fff" />
      </g>
    );
  }
  // Default big sparkly anime eyes
  return (
    <g>
      <circle cx={lx} cy={ly} r={r} fill="#1e1b4b" />
      <circle cx={lx} cy={ly} r={r * 0.72} fill={eyeColor} opacity="0.85" />
      <circle cx={lx} cy={ly} r={r * 0.42} fill="#1e1b4b" />
      <circle cx={lx - r * 0.38} cy={ly - r * 0.38} r={r * 0.36} fill="#fff" />
      <circle cx={lx + r * 0.2} cy={ly + r * 0.18} r={r * 0.18} fill="#fff" />
      <circle cx={rx} cy={ry} r={r} fill="#1e1b4b" />
      <circle cx={rx} cy={ry} r={r * 0.72} fill={eyeColor} opacity="0.85" />
      <circle cx={rx} cy={ry} r={r * 0.42} fill="#1e1b4b" />
      <circle cx={rx - r * 0.38} cy={ry - r * 0.38} r={r * 0.36} fill="#fff" />
      <circle cx={rx + r * 0.2} cy={ry + r * 0.18} r={r * 0.18} fill="#fff" />
      {/* Soft blush */}
      <circle cx={lx - r * 1.6} cy={ly + r * 0.8} r={r * 0.65} fill="#f43f5e" opacity="0.18" />
      <circle cx={rx + r * 1.6} cy={ry + r * 0.8} r={r * 0.65} fill="#f43f5e" opacity="0.18" />
    </g>
  );
}

// ─── 1. CAT — slim, dainty, triangular ears, long curling tail ─────────────
function CatBody({ colors, state, uid, accessories }: { colors: any; state: PetState; uid: string; accessories: string[] }) {
  return (
    <>
      {/* Slender curling tail behind body */}
      <motion.path
        d="M 112 155 C 148 152 165 128 162 98 C 160 82 148 80 144 92 C 140 108 148 128 120 148"
        fill={colors.coatA}
        stroke={colors.coatB}
        strokeWidth="1"
        style={{ transformOrigin: '115px 155px' }}
        animate={{ rotate: state === 'excited' ? [-14, 14, -14] : state === 'happy' ? [-10, 10, -10] : [-6, 6, -6] }}
        transition={{ duration: state === 'excited' ? 0.6 : state === 'happy' ? 0.9 : 2.8, repeat: Infinity }}
      />

      {/* Slim small body - cat is noticeably smaller */}
      <ellipse cx="100" cy="128" rx="34" ry="38" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* Pointed triangular ears with inner fluff */}
      {/* Left ear */}
      <motion.g style={{ transformOrigin: '74px 70px' }}
        animate={{ rotate: state === 'excited' ? [0, 8, -5, 0] : [0, 2, -1, 0] }}
        transition={{ duration: 2.8, repeat: Infinity }}>
        <polygon points="64,82 58,42 88,72" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />
        <polygon points="66,78 62,50 83,72" fill={colors.innerEar} />
      </motion.g>
      {/* Right ear */}
      <motion.g style={{ transformOrigin: '126px 70px' }}
        animate={{ rotate: state === 'excited' ? [0, -8, 5, 0] : [0, -2, 1, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, delay: 0.25 }}>
        <polygon points="136,82 142,42 112,72" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />
        <polygon points="134,78 138,50 117,72" fill={colors.innerEar} />
      </motion.g>

      {/* Round small head - cat head is round and small */}
      <ellipse cx="100" cy="90" rx="32" ry="30" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* White chin/face muzzle patch */}
      <ellipse cx="100" cy="100" rx="14" ry="10" fill={colors.belly} />

      {/* Eyes - cats have medium eyes, slightly almond shaped */}
      <Eyes state={state} lx={88} ly={88} rx={112} ry={88} eyeColor={colors.eye} radius={8} />

      {/* Triangle cat nose */}
      <path d="M 97.5 100 Q 100 97.5 102.5 100 Q 100 104 97.5 100 Z" fill={colors.nose} />

      {/* Cat mouth */}
      <path d="M 100 103 L 100 106 M 95 106 Q 100 110 100 106 Q 100 110 105 106" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Cat whiskers — delicate and long */}
      <g stroke="#94a3b8" strokeWidth="1" opacity="0.55" strokeLinecap="round">
        <line x1="74" y1="100" x2="50" y2="95" />
        <line x1="74" y1="104" x2="48" y2="106" />
        <line x1="74" y1="108" x2="52" y2="115" />
        <line x1="126" y1="100" x2="150" y2="95" />
        <line x1="126" y1="104" x2="152" y2="106" />
        <line x1="126" y1="108" x2="148" y2="115" />
      </g>

      {/* Tiny slim paws */}
      <ellipse cx="86" cy="162" rx="9" ry="6" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      <ellipse cx="114" cy="162" rx="9" ry="6" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      {/* Tiny toe marks */}
      <g stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round">
        <line x1="83" y1="159" x2="83" y2="164" />
        <line x1="86" y1="158" x2="86" y2="164" />
        <line x1="89" y1="159" x2="89" y2="164" />
        <line x1="111" y1="159" x2="111" y2="164" />
        <line x1="114" y1="158" x2="114" y2="164" />
        <line x1="117" y1="159" x2="117" y2="164" />
      </g>

      {/* Kitty collar + bell */}
      <path d="M 70 120 Q 100 132 130 120" stroke="#e11d48" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="100" cy="127" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
      <circle cx="100" cy="127" r="1.2" fill="#78350f" />

      {/* Ground shadow */}
      <ellipse cx="100" cy="168" rx="36" ry="6" fill="#000" opacity="0.2" />
    </>
  );
}

// ─── 2. DOG — visibly bigger/wider, floppy ears, stocky build ─────────────
function DogBody({ colors, state, uid, accessories }: { colors: any; state: PetState; uid: string; accessories: string[] }) {
  return (
    <>
      {/* Happy wagging tail - bigger and more prominent */}
      <motion.path
        d="M 126 148 C 155 140 175 120 174 92 C 174 80 162 80 160 92 C 158 110 148 126 130 142"
        fill={colors.coatA}
        style={{ transformOrigin: '130px 150px' }}
        animate={{ rotate: state === 'excited' || state === 'celebrating' ? [-22, 22, -22] : state === 'happy' ? [-16, 16, -16] : [-8, 8, -8] }}
        transition={{ duration: state === 'excited' ? 0.5 : state === 'happy' ? 0.8 : 2, repeat: Infinity }}
      />

      {/* DOG has a noticeably wider, chunkier body */}
      <ellipse cx="100" cy="130" rx="46" ry="42" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* Floppy drooping ears that hang down the sides */}
      {/* Left floppy ear */}
      <motion.g style={{ transformOrigin: '60px 90px' }}
        animate={{ rotate: state === 'happy' || state === 'excited' ? [0, -12, 6, 0] : [0, -3, 3, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}>
        <path d="M 60 88 C 30 84 20 112 28 138 C 36 148 52 144 58 122 C 62 108 66 96 60 88 Z"
          fill={colors.coatB} filter={`url(#shadow-${uid})`} />
      </motion.g>
      {/* Right floppy ear */}
      <motion.g style={{ transformOrigin: '140px 90px' }}
        animate={{ rotate: state === 'happy' || state === 'excited' ? [0, 12, -6, 0] : [0, 3, -3, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}>
        <path d="M 140 88 C 170 84 180 112 172 138 C 164 148 148 144 142 122 C 138 108 134 96 140 88 Z"
          fill={colors.coatB} filter={`url(#shadow-${uid})`} />
      </motion.g>

      {/* Dog head is bigger and wider, more rounded */}
      <ellipse cx="100" cy="94" rx="44" ry="40" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* Wide muzzle - dogs have pronounced snout */}
      <ellipse cx="100" cy="110" rx="20" ry="14" fill={colors.belly} />
      {/* Darker muzzle spot */}
      <ellipse cx="100" cy="108" rx="18" ry="11" fill={colors.belly} opacity="0.9" />

      {/* Big round dog nose */}
      <ellipse cx="100" cy="108" rx="7" ry="5.5" fill={colors.nose} />
      {/* Nose highlight */}
      <ellipse cx="97" cy="106" rx="2.5" ry="1.5" fill="#64748b" opacity="0.5" />

      {/* Dog mouth - wide smile */}
      <path d="M 100 113 L 100 117 M 91 117 Q 100 124 100 117 Q 100 124 109 117" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Dog tongue when happy */}
      {(state === 'happy' || state === 'excited' || state === 'celebrating') && (
        <path d="M 96 118 C 96 130 104 130 104 118 Z" fill="#fb7185" />
      )}

      {/* Dog eyes — wide set, friendly */}
      <Eyes state={state} lx={84} ly={90} rx={116} ry={90} eyeColor={colors.eye} radius={10} />

      {/* Dog brow fold lines */}
      <path d="M 74 80 Q 84 76 88 82" stroke={colors.coatB} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M 126 80 Q 116 76 112 82" stroke={colors.coatB} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* Big stocky paws */}
      <ellipse cx="82" cy="168" rx="13" ry="8" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      <ellipse cx="118" cy="168" rx="13" ry="8" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      <g stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round">
        <line x1="77" y1="164" x2="77" y2="170" />
        <line x1="82" y1="162" x2="82" y2="170" />
        <line x1="87" y1="164" x2="87" y2="170" />
        <line x1="113" y1="164" x2="113" y2="170" />
        <line x1="118" y1="162" x2="118" y2="170" />
        <line x1="123" y1="164" x2="123" y2="170" />
      </g>

      {/* Ground shadow - bigger for bigger dog */}
      <ellipse cx="100" cy="176" rx="50" ry="7" fill="#000" opacity="0.25" />
    </>
  );
}

// ─── 3. FOX — long pointed snout, large triangular ears, bushy tail ────────
function FoxBody({ colors, state, uid, accessories }: { colors: any; state: PetState; uid: string; accessories: string[] }) {
  return (
    <>
      {/* Big bushy fox tail with white tip */}
      <motion.g style={{ transformOrigin: '120px 152px' }}
        animate={{ rotate: state === 'excited' ? [-18, 18, -18] : state === 'happy' ? [-12, 12, -12] : [-6, 6, -6] }}
        transition={{ duration: state === 'excited' ? 0.65 : 2.2, repeat: Infinity }}>
        <path d="M 116 148 C 158 148 178 120 174 78 C 170 60 154 58 146 76 C 136 98 148 126 120 144 Z"
          fill={colors.coatA} />
        {/* White tail tip */}
        <ellipse cx="163" cy="68" rx="14" ry="18" fill="#f1f5f9" transform="rotate(-20 163 68)" />
      </motion.g>

      {/* Fox body - medium, slimmer than dog */}
      <ellipse cx="100" cy="130" rx="38" ry="40" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* White chest bib — foxes have distinctive white chest */}
      <path d="M 100 108 C 120 115 124 145 118 164 C 110 170 90 170 82 164 C 76 145 80 115 100 108 Z" fill="#f8fafc" opacity="0.92" />

      {/* Tall sharp fox ears with dark tips */}
      {/* Left ear */}
      <motion.g style={{ transformOrigin: '68px 72px' }}
        animate={{ rotate: state === 'thinking' ? [0, 8, 0] : [0, 3, -1, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}>
        <polygon points="56,84 42,28 90,62" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />
        {/* Dark tip */}
        <polygon points="42,28 48,44 44,52" fill="#1e293b" />
        {/* White inner */}
        <polygon points="58,78 46,38 82,62" fill="#f8fafc" />
      </motion.g>
      {/* Right ear */}
      <motion.g style={{ transformOrigin: '132px 72px' }}
        animate={{ rotate: state === 'thinking' ? [0, -8, 0] : [0, -3, 1, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.2 }}>
        <polygon points="144,84 158,28 110,62" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />
        {/* Dark tip */}
        <polygon points="158,28 152,44 156,52" fill="#1e293b" />
        {/* White inner */}
        <polygon points="142,78 154,38 118,62" fill="#f8fafc" />
      </motion.g>

      {/* Fox head - narrower, slightly pointed */}
      <ellipse cx="100" cy="90" rx="36" ry="34" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* PROMINENT LONG POINTED SNOUT - fox defining feature */}
      <path d="M 80 104 Q 100 116 120 104 Q 118 128 100 130 Q 82 128 80 104 Z" fill={colors.belly} />
      <path d="M 80 104 Q 100 112 120 104 Q 118 118 100 120 Q 82 118 80 104 Z" fill="#f1f5f9" />

      {/* Fox nose - smaller, pointed */}
      <path d="M 96 110 Q 100 107 104 110 Q 100 116 96 110 Z" fill={colors.nose} />

      {/* Fox mouth */}
      <path d="M 100 115 L 100 118 M 95 118 Q 100 122 100 118 Q 100 122 105 118" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Fox eyes — almond, slightly slanted */}
      <Eyes state={state} lx={86} ly={85} rx={114} ry={85} eyeColor={colors.eye} radius={8.5} />

      {/* Fox whiskers */}
      <g stroke="#94a3b8" strokeWidth="1.2" opacity="0.5" strokeLinecap="round">
        <line x1="76" y1="107" x2="46" y2="100" />
        <line x1="76" y1="112" x2="44" y2="116" />
        <line x1="76" y1="117" x2="48" y2="124" />
        <line x1="124" y1="107" x2="154" y2="100" />
        <line x1="124" y1="112" x2="156" y2="116" />
        <line x1="124" y1="117" x2="152" y2="124" />
      </g>

      {/* Slim fox paws */}
      <ellipse cx="86" cy="166" rx="10" ry="7" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      <ellipse cx="114" cy="166" rx="10" ry="7" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      <g stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round">
        <line x1="83" y1="163" x2="83" y2="169" />
        <line x1="86" y1="162" x2="86" y2="169" />
        <line x1="89" y1="163" x2="89" y2="169" />
        <line x1="111" y1="163" x2="111" y2="169" />
        <line x1="114" y1="162" x2="114" y2="169" />
        <line x1="117" y1="163" x2="117" y2="169" />
      </g>

      <ellipse cx="100" cy="173" rx="40" ry="6" fill="#000" opacity="0.22" />
    </>
  );
}

// ─── 4. PANDA — chubby/round body, stubby limbs, black patches ─────────────
function PandaBody({ colors, state, uid, accessories }: { colors: any; state: PetState; uid: string; accessories: string[] }) {
  return (
    <>
      {/* PANDA is very round and chubby — much wider than tall */}
      {/* Big round chubby body */}
      <ellipse cx="100" cy="134" rx="52" ry="46" fill="#f8fafc" filter={`url(#shadow-${uid})`} />

      {/* Black belly marking */}
      <ellipse cx="100" cy="140" rx="36" ry="30" fill="#1e293b" opacity="0.08" />

      {/* Round black panda ears */}
      <motion.circle cx="62" cy="60" r="22" fill="#0f172a" filter={`url(#shadow-${uid})`}
        animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.circle cx="138" cy="60" r="22" fill="#0f172a" filter={`url(#shadow-${uid})`}
        animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.3 }} />

      {/* LARGE round head - pandas have huge heads relative to body */}
      <circle cx="100" cy="96" r="48" fill="#f8fafc" filter={`url(#shadow-${uid})`} />

      {/* Iconic black eye patches — real panda feature */}
      <motion.ellipse cx="82" cy="90" rx="18" ry="16" fill="#1e293b" transform="rotate(-15 82 90)"
        animate={{ scaleX: state === 'happy' ? 0.9 : 1 }} transition={{ duration: 0.3 }} />
      <motion.ellipse cx="118" cy="90" rx="18" ry="16" fill="#1e293b" transform="rotate(15 118 90)"
        animate={{ scaleX: state === 'happy' ? 0.9 : 1 }} transition={{ duration: 0.3 }} />

      {/* Eyes inside patches */}
      <Eyes state={state} lx={82} ly={90} rx={118} ry={90} eyeColor={colors.eye} radius={7} />

      {/* Wide round muzzle */}
      <ellipse cx="100" cy="112" rx="20" ry="14" fill="#e2e8f0" />

      {/* Panda nose */}
      <ellipse cx="100" cy="110" rx="6" ry="4.5" fill="#1e293b" />

      {/* Panda mouth */}
      <path d="M 100 114 L 100 118 M 93 118 Q 100 125 100 118 Q 100 125 107 118" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Stubby round arms — pandas have fat arms */}
      <ellipse cx="42" cy="136" rx="14" ry="22" fill="#1e293b" transform="rotate(20 42 136)" filter={`url(#shadow-${uid})`} />
      <ellipse cx="158" cy="136" rx="14" ry="22" fill="#1e293b" transform="rotate(-20 158 136)" filter={`url(#shadow-${uid})`} />

      {/* Stubby wide paws */}
      <ellipse cx="84" cy="172" rx="16" ry="9" fill="#e2e8f0" filter={`url(#shadow-${uid})`} />
      <ellipse cx="116" cy="172" rx="16" ry="9" fill="#e2e8f0" filter={`url(#shadow-${uid})`} />
      <g stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round">
        <line x1="79" y1="168" x2="79" y2="175" />
        <line x1="84" y1="166" x2="84" y2="175" />
        <line x1="89" y1="168" x2="89" y2="175" />
        <line x1="111" y1="168" x2="111" y2="175" />
        <line x1="116" y1="166" x2="116" y2="175" />
        <line x1="121" y1="168" x2="121" y2="175" />
      </g>

      {/* Big ground shadow — panda is wide */}
      <ellipse cx="100" cy="180" rx="56" ry="7" fill="#000" opacity="0.22" />
    </>
  );
}

// ─── 5. BUNNY — small body, VERY TALL EARS dominate the silhouette ─────────
function BunnyBody({ colors, state, uid, accessories }: { colors: any; state: PetState; uid: string; accessories: string[] }) {
  return (
    <>
      {/* Cotton ball tail */}
      <motion.circle cx="126" cy="154" r="13" fill="#f8fafc" filter={`url(#shadow-${uid})`}
        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />

      {/* Compact oval bunny body */}
      <ellipse cx="100" cy="138" rx="36" ry="38" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* White belly */}
      <ellipse cx="100" cy="142" rx="24" ry="26" fill={colors.belly} opacity="0.95" />

      {/* VERY TALL UPRIGHT EARS — the defining bunny feature */}
      {/* Left bunny ear - tall and slightly outward */}
      <motion.g style={{ transformOrigin: '80px 80px' }}
        animate={{
          rotate: state === 'excited' ? [0, -12, 8, 0] : state === 'happy' ? [-3, 4, -3] : [-2, 3, -2],
          scaleY: state === 'excited' ? [1, 1.04, 0.96, 1] : 1
        }}
        transition={{ duration: state === 'excited' ? 0.8 : 2.6, repeat: Infinity }}>
        <path d="M 76 82 C 54 52 50 8 72 4 C 88 2 96 38 88 80 Z"
          fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />
        {/* Pink inner ear */}
        <path d="M 77 76 C 60 52 58 14 72 10 C 83 8 89 40 83 76 Z"
          fill={colors.innerEar} />
      </motion.g>
      {/* Right bunny ear */}
      <motion.g style={{ transformOrigin: '120px 80px' }}
        animate={{
          rotate: state === 'excited' ? [0, 12, -8, 0] : state === 'happy' ? [3, -4, 3] : [2, -3, 2],
        }}
        transition={{ duration: state === 'excited' ? 0.8 : 2.6, repeat: Infinity, delay: 0.2 }}>
        <path d="M 124 82 C 146 52 150 8 128 4 C 112 2 104 38 112 80 Z"
          fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />
        {/* Pink inner ear */}
        <path d="M 123 76 C 140 52 142 14 128 10 C 117 8 111 40 117 76 Z"
          fill={colors.innerEar} />
      </motion.g>

      {/* Bunny head - smaller, rounder than dog */}
      <circle cx="100" cy="102" r="30" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* Soft muzzle */}
      <ellipse cx="100" cy="112" rx="12" ry="9" fill={colors.belly} />

      {/* Bunny nose - Y-shaped */}
      <circle cx="100" cy="111" r="4" fill={colors.nose} />
      <path d="M 100 115 L 95 120 M 100 115 L 105 120" stroke={colors.nose} strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Bunny eyes — big and round */}
      <Eyes state={state} lx={88} ly={100} rx={112} ry={100} eyeColor={colors.eye} radius={8.5} />

      {/* Bunny whiskers */}
      <g stroke="#94a3b8" strokeWidth="0.9" opacity="0.5" strokeLinecap="round">
        <line x1="76" y1="111" x2="52" y2="106" />
        <line x1="76" y1="115" x2="50" y2="118" />
        <line x1="124" y1="111" x2="148" y2="106" />
        <line x1="124" y1="115" x2="150" y2="118" />
      </g>

      {/* Small dainty bunny paws */}
      <ellipse cx="86" cy="168" rx="10" ry="7" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      <ellipse cx="114" cy="168" rx="10" ry="7" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      <g stroke="#f9a8d4" strokeWidth="1" strokeLinecap="round">
        <line x1="83" y1="165" x2="83" y2="171" />
        <line x1="86" y1="163" x2="86" y2="171" />
        <line x1="89" y1="165" x2="89" y2="171" />
        <line x1="111" y1="165" x2="111" y2="171" />
        <line x1="114" y1="163" x2="114" y2="171" />
        <line x1="117" y1="165" x2="117" y2="171" />
      </g>

      <ellipse cx="100" cy="175" rx="38" ry="5.5" fill="#000" opacity="0.2" />
    </>
  );
}

// ─── 6. DRAGON — large, wide, horns, winglets, glowing flame tail ──────────
function DragonBody({ colors, state, uid, accessories }: { colors: any; state: PetState; uid: string; accessories: string[] }) {
  return (
    <>
      {/* Dragon wings */}
      <path d="M 38 110 Q 12 86 22 62 Q 38 88 44 110 Z" fill={colors.coatA} opacity="0.85" filter={`url(#shadow-${uid})`} />
      <path d="M 162 110 Q 188 86 178 62 Q 162 88 156 110 Z" fill={colors.coatA} opacity="0.85" filter={`url(#shadow-${uid})`} />

      {/* Wing webbing */}
      <path d="M 22 62 Q 18 72 28 80 Q 38 88 44 110 Q 28 98 22 62 Z" fill={colors.coatB} opacity="0.5" />
      <path d="M 178 62 Q 182 72 172 80 Q 162 88 156 110 Q 172 98 178 62 Z" fill={colors.coatB} opacity="0.5" />

      {/* Flame tail — swishy dragon tail */}
      <motion.g style={{ transformOrigin: '122px 152px' }}
        animate={{ rotate: state === 'excited' ? [-14, 14, -14] : [-6, 6, -6] }}
        transition={{ duration: state === 'excited' ? 0.7 : 2.4, repeat: Infinity }}>
        <path d="M 118 150 C 155 148 174 124 170 90 C 168 78 158 78 155 90 C 150 110 158 130 126 148 Z"
          fill={colors.coatA} />
        {/* Flame tip */}
        <path d="M 170 90 Q 184 74 178 60 Q 162 76 155 90 Z" fill="#f97316" />
        <path d="M 178 60 Q 190 50 184 40 Q 172 54 178 60 Z" fill="#fbbf24" />
      </motion.g>

      {/* Large wide dragon body */}
      <ellipse cx="100" cy="130" rx="50" ry="44" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* Belly scale pattern */}
      <ellipse cx="100" cy="138" rx="34" ry="30" fill={colors.belly} opacity="0.7" />
      {/* Scale lines */}
      <path d="M 80 125 Q 100 120 120 125 M 76 135 Q 100 128 124 135 M 80 145 Q 100 138 120 145"
        stroke={colors.nose} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />

      {/* Curved horns — PROMINENT on dragon head */}
      <path d="M 72 64 Q 52 38 38 26 Q 50 42 62 70 Z" fill="#f59e0b" filter={`url(#shadow-${uid})`} />
      <path d="M 128 64 Q 148 38 162 26 Q 150 42 138 70 Z" fill="#f59e0b" filter={`url(#shadow-${uid})`} />

      {/* Ridge spikes on head */}
      <polygon points="88,60 84,48 92,58" fill={colors.accent} opacity="0.8" />
      <polygon points="100,56 96,44 104,56" fill={colors.accent} opacity="0.8" />
      <polygon points="112,60 108,48 116,58" fill={colors.accent} opacity="0.8" />

      {/* Large wide dragon head */}
      <ellipse cx="100" cy="92" rx="46" ry="38" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* Dragon muzzle - slightly elongated */}
      <path d="M 78 106 Q 100 118 122 106 Q 120 128 100 130 Q 80 128 78 106 Z" fill={colors.belly} opacity="0.85" />

      {/* Dragon nostrils */}
      <ellipse cx="93" cy="114" rx="3.5" ry="2.5" fill={colors.nose} />
      <ellipse cx="107" cy="114" rx="3.5" ry="2.5" fill={colors.nose} />

      {/* Dragon mouth */}
      <path d="M 86 118 Q 100 126 114 118" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Dragon eyes — large, bright amber */}
      <Eyes state={state} lx={84} ly={88} rx={116} ry={88} eyeColor={colors.eye} radius={11} />

      {/* Large clawed paws */}
      <ellipse cx="82" cy="170" rx="14" ry="9" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      <ellipse cx="118" cy="170" rx="14" ry="9" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      {/* Dragon claws */}
      <g fill={colors.nose} opacity="0.7">
        <ellipse cx="76" cy="173" rx="3" ry="5" transform="rotate(-20 76 173)" />
        <ellipse cx="82" cy="174" rx="3" ry="5" />
        <ellipse cx="88" cy="173" rx="3" ry="5" transform="rotate(20 88 173)" />
        <ellipse cx="112" cy="173" rx="3" ry="5" transform="rotate(-20 112 173)" />
        <ellipse cx="118" cy="174" rx="3" ry="5" />
        <ellipse cx="124" cy="173" rx="3" ry="5" transform="rotate(20 124 173)" />
      </g>

      <ellipse cx="100" cy="179" rx="54" ry="7" fill="#000" opacity="0.25" />
    </>
  );
}

// ─── 7. OWL (Nova) — round wide face, feather tufts, disc face ─────────────
function OwlBody({ colors, state, uid, accessories }: { colors: any; state: PetState; uid: string; accessories: string[] }) {
  return (
    <>
      {/* Owl tail feathers */}
      <path d="M 82 164 Q 78 178 88 178 Q 100 180 100 170 Z" fill={colors.coatA} />
      <path d="M 100 170 Q 100 180 112 178 Q 122 178 118 164 Z" fill={colors.coatA} />
      <path d="M 92 162 Q 88 178 96 176 Z" fill={colors.coatB} opacity="0.6" />
      <path d="M 108 162 Q 112 178 104 176 Z" fill={colors.coatB} opacity="0.6" />

      {/* Wide rounded owl body — like a puffed-up barn owl */}
      <ellipse cx="100" cy="132" rx="44" ry="42" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* Cream-colored heart-shaped face disc — barn owl feature */}
      <path d="M 100 72 C 62 72 52 98 58 118 C 64 138 82 148 100 148 C 118 148 136 138 142 118 C 148 98 138 72 100 72 Z"
        fill={colors.belly} opacity="0.9" />

      {/* Feather ear tufts — owl horned tufts */}
      <motion.g style={{ transformOrigin: '76px 64px' }}
        animate={{ rotate: state === 'thinking' ? [0, 6, 0] : [0, 2, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}>
        <path d="M 68 74 Q 56 44 62 32 Q 74 48 82 76 Z" fill={colors.coatA} filter={`url(#shadow-${uid})`} />
        <path d="M 70 72 Q 60 48 64 38 Q 74 52 80 74 Z" fill={colors.coatB} opacity="0.5" />
      </motion.g>
      <motion.g style={{ transformOrigin: '124px 64px' }}
        animate={{ rotate: state === 'thinking' ? [0, -6, 0] : [0, -2, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.2 }}>
        <path d="M 132 74 Q 144 44 138 32 Q 126 48 118 76 Z" fill={colors.coatA} filter={`url(#shadow-${uid})`} />
        <path d="M 130 72 Q 140 48 136 38 Q 126 52 120 74 Z" fill={colors.coatB} opacity="0.5" />
      </motion.g>

      {/* Huge round owl head — the defining feature */}
      <circle cx="100" cy="98" r="46" fill={`url(#coatGrad-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* Heart face disc */}
      <path d="M 100 76 C 78 76 68 92 72 108 C 76 124 88 132 100 132 C 112 132 124 124 128 108 C 132 92 122 76 100 76 Z"
        fill={colors.belly} opacity="0.95" />

      {/* OWL EYES — massive, prominent, circular */}
      {/* Eye ring decorations */}
      <circle cx="82" cy="100" r="16" fill={colors.coatA} opacity="0.4" />
      <circle cx="118" cy="100" r="16" fill={colors.coatA} opacity="0.4" />

      <Eyes state={state} lx={82} ly={100} rx={118} ry={100} eyeColor={colors.eye} radius={12} />

      {/* Tiny hooked beak */}
      <path d="M 96 110 Q 100 106 104 110 Q 102 116 100 116 Q 98 116 96 110 Z" fill={colors.nose} />

      {/* Wing texture on body */}
      <path d="M 60 120 Q 52 140 58 158 Q 68 148 70 130 Z" fill={colors.coatB} opacity="0.5" />
      <path d="M 140 120 Q 148 140 142 158 Q 132 148 130 130 Z" fill={colors.coatB} opacity="0.5" />

      {/* Feather markings */}
      <g opacity="0.2" stroke={colors.coatB} strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M 72 122 Q 80 118 88 124" />
        <path d="M 68 132 Q 78 127 88 133" />
        <path d="M 112 122 Q 120 118 128 124" />
        <path d="M 112 132 Q 122 127 132 133" />
      </g>

      {/* Owl talons */}
      <ellipse cx="84" cy="168" rx="11" ry="7" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      <ellipse cx="116" cy="168" rx="11" ry="7" fill={colors.belly} filter={`url(#shadow-${uid})`} />
      {/* Talon claws */}
      <g fill={colors.nose} opacity="0.65">
        <ellipse cx="79" cy="171" rx="2.5" ry="5" transform="rotate(-20 79 171)" />
        <ellipse cx="84" cy="172" rx="2.5" ry="5" />
        <ellipse cx="89" cy="171" rx="2.5" ry="5" transform="rotate(20 89 171)" />
        <ellipse cx="111" cy="171" rx="2.5" ry="5" transform="rotate(-20 111 171)" />
        <ellipse cx="116" cy="172" rx="2.5" ry="5" />
        <ellipse cx="121" cy="171" rx="2.5" ry="5" transform="rotate(20 121 171)" />
      </g>

      <ellipse cx="100" cy="175" rx="46" ry="6.5" fill="#000" opacity="0.22" />
    </>
  );
}

// ─── Accessories Layer (overlaid on top of all pets) ────────────────────────
function AccessoryLayer({ accessories, eyeLx, eyeLy, eyeRx, eyeRy }: {
  accessories: string[];
  eyeLx: number; eyeLy: number;
  eyeRx: number; eyeRy: number;
}) {
  return (
    <>
      {accessories.includes('glasses') && (
        <g>
          <circle cx={eyeLx} cy={eyeLy} r="13" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx={eyeRx} cy={eyeRy} r="13" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <path d={`M ${eyeLx + 13} ${eyeLy - 1} Q ${(eyeLx + eyeRx) / 2} ${eyeLy - 5} ${eyeRx - 13} ${eyeRy - 1}`} stroke="#f59e0b" strokeWidth="2.5" fill="none" />
          <line x1={eyeLx - 13} y1={eyeLy} x2={eyeLx - 24} y2={eyeLy - 3} stroke="#f59e0b" strokeWidth="2" />
          <line x1={eyeRx + 13} y1={eyeRy} x2={eyeRx + 24} y2={eyeRy - 3} stroke="#f59e0b" strokeWidth="2" />
        </g>
      )}
      {accessories.includes('headphones') && (
        <g>
          <path d={`M ${eyeLx - 12} 78 C ${eyeLx - 16} 30 ${eyeRx + 16} 30 ${eyeRx + 12} 78`} stroke="#0f172a" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d={`M ${eyeLx - 12} 78 C ${eyeLx - 16} 30 ${eyeRx + 16} 30 ${eyeRx + 12} 78`} stroke="#ec4899" strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x={eyeLx - 26} y="68" width="14" height="24" rx="7" fill="#1e293b" stroke="#ec4899" strokeWidth="2" />
          <rect x={eyeRx + 12} y="68" width="14" height="24" rx="7" fill="#1e293b" stroke="#ec4899" strokeWidth="2" />
        </g>
      )}
      {accessories.includes('cap') && (
        <g>
          <path d="M 66 62 C 66 44 134 44 134 62 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          <path d="M 58 62 C 58 58 142 58 150 66 C 130 70 74 70 58 62 Z" fill="#38bdf8" />
          <circle cx="100" cy="44" r="3" fill="#ffffff" />
        </g>
      )}
      {accessories.includes('hoodie') && (
        <g>
          <path d="M 56 136 C 68 160 132 160 144 136 C 132 150 68 150 56 136 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <path d="M 122 148 L 132 174 L 144 172 L 132 146 Z" fill="#dc2626" />
        </g>
      )}
      {accessories.includes('dev_badge') && (
        <g>
          <circle cx="130" cy="152" r="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="130" y="155.5" fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">&lt;/&gt;</text>
        </g>
      )}
      {accessories.includes('star_badge') && (
        <g>
          <circle cx="70" cy="152" r="9" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
          <path d="M 70 147 L 71.7 150.5 L 75.5 151 L 72.8 153.6 L 73.7 157.5 L 70 155.5 L 66.3 157.5 L 67.2 153.6 L 64.5 151 L 68.3 150.5 Z" fill="#fbbf24" />
        </g>
      )}
      {accessories.includes('explorer_pin') && (
        <g>
          <circle cx="130" cy="152" r="9" fill="#0f172a" stroke="#34d399" strokeWidth="1.5" />
          <path d="M 130 147 L 133 152 L 130 157 L 127 152 Z" fill="#34d399" />
        </g>
      )}
    </>
  );
}

// ─── THEME COLOR OVERRIDE ────────────────────────────────────────────────────
function applyTheme(species: any, theme: PetTheme) {
  let { coatColorA: coatA, coatColorB: coatB, bellyColor: belly, eyeColor: eye, noseColor: nose, innerEarColor: innerEar, glowColor: glow, accentColor: accent } = species;
  if (theme === 'midnight') { coatA = '#312e81'; coatB = '#1e1b4b'; belly = '#e0e7ff'; eye = '#a5b4fc'; glow = '#818cf8'; accent = '#6366f1'; }
  else if (theme === 'sunset') { coatA = '#ea580c'; coatB = '#9a3412'; belly = '#ffedd5'; eye = '#fbbf24'; glow = '#fb923c'; accent = '#f97316'; }
  else if (theme === 'ocean') { coatA = '#0284c7'; coatB = '#075985'; belly = '#e0f2fe'; eye = '#38bdf8'; glow = '#38bdf8'; accent = '#0ea5e9'; }
  else if (theme === 'forest') { coatA = '#16a34a'; coatB = '#14532d'; belly = '#dcfce7'; eye = '#4ade80'; glow = '#4ade80'; accent = '#22c55e'; }
  else if (theme === 'neon') { coatA = '#c026d3'; coatB = '#701a75'; belly = '#fae8ff'; eye = '#f472b6'; glow = '#f472b6'; accent = '#e879f9'; }
  return { coatA, coatB, belly, eye, nose, innerEar, glow, accent };
}

// ─── MAIN BODY MOTION based on mood ─────────────────────────────────────────
function useBodyMotion(state: PetState) {
  const idle = { y: [0, -5, 0], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const } };
  const motions: Record<PetState, object> = {
    idle: idle,
    happy: { y: [0, -14, 0, -10, 0], scale: [1, 1.04, 0.98, 1.02, 1], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const } },
    excited: { y: [0, -22, 0, -18, 0], rotate: [0, -4, 4, -1, 0], scale: [1, 1.07, 0.96, 1.05, 1], transition: { duration: 1.0, repeat: Infinity, ease: 'easeInOut' as const } },
    celebrating: { y: [0, -26, 0], rotate: [0, -8, 8, 0], scale: [1, 1.1, 1], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const } },
    encouraging: { y: [0, -7, 0], scale: [1, 1.03, 1], transition: { duration: 2.0, repeat: Infinity, ease: 'easeInOut' as const } },
    thinking: { y: [0, -6, -3, -6, 0], rotate: [0, 3, -1, 2, 0], transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const } },
    focused: { y: [0, -2, 0], scale: 1.01, transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const } },
    working: { y: [0, -4, 0], transition: { duration: 1.3, repeat: Infinity, ease: 'easeInOut' as const } },
    concerned: { y: [2, 5, 2], rotate: [-2, -3, -2], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const } },
    sleepy: { y: [3, 8, 3], scaleY: [0.98, 0.93, 0.98], transition: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' as const } },
    tired: { y: [4, 8, 4], scaleY: 0.95, transition: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' as const } },
  };
  return motions[state] || idle;
}

// ─── EYE POSITIONS PER PET ───────────────────────────────────────────────────
const EYE_POS: Record<PetType, { lx: number; ly: number; rx: number; ry: number }> = {
  cat:    { lx: 88, ly: 88, rx: 112, ry: 88 },
  dog:    { lx: 84, ly: 90, rx: 116, ry: 90 },
  fox:    { lx: 86, ly: 85, rx: 114, ry: 85 },
  panda:  { lx: 82, ly: 90, rx: 118, ry: 90 },
  bunny:  { lx: 88, ly: 100, rx: 112, ry: 100 },
  dragon: { lx: 84, ly: 88, rx: 116, ry: 88 },
  nova:   { lx: 82, ly: 100, rx: 118, ry: 100 },
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export const PetRenderer: React.FC<PetRendererProps> = ({
  state = 'idle',
  size = 'lg',
  petType: propPetType,
  theme: propTheme,
  accessories: propAccessories,
  interactive = true,
  onClick,
}) => {
  let contextProfile = null;
  try {
    const ctx = useCompanion();
    contextProfile = ctx?.profile;
  } catch { /* Render outside provider */ }

  const petType: PetType = propPetType || (contextProfile?.pet_type as PetType) || 'cat';
  const theme: PetTheme = propTheme || (contextProfile?.theme as PetTheme) || 'default';
  const accessories: string[] = propAccessories || contextProfile?.accessories || [];

  const species = getPetSpecies(petType);
  const colors = useMemo(() => applyTheme(species, theme), [species, theme]);

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseOffset({ x: ((e.clientX - rect.left) / rect.width - 0.5) * 8, y: ((e.clientY - rect.top) / rect.height - 0.5) * 6 });
  };

  const sizePixels = { sm: 120, md: 180, lg: 260, xl: 340 }[size];
  const bodyMotion = useBodyMotion(state);
  const uid = useMemo(() => Math.random().toString(36).substring(2, 7), []);
  const eyePos = EYE_POS[petType];

  const bodyProps = { colors, state, uid, accessories };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouseOffset({ x: 0, y: 0 })}
      className="relative flex items-center justify-center select-none"
      style={{ width: sizePixels, height: sizePixels, cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Ambient glow */}
      <motion.div className="absolute rounded-full pointer-events-none filter blur-2xl"
        style={{ width: sizePixels * 0.7, height: sizePixels * 0.7, backgroundColor: colors.glow, opacity: 0.25 }}
        animate={{ scale: state === 'excited' || state === 'celebrating' ? [1, 1.3, 1] : [1, 1.1, 1], opacity: [0.18, 0.32, 0.18] }}
        transition={{ duration: 3.5, repeat: Infinity }} />

      {/* Sleepy ZZZ */}
      {(state === 'sleepy' || state === 'tired') && (
        <div className="absolute -top-2 right-4 pointer-events-none font-bold text-amber-200/80">
          <motion.span className="absolute text-xs" animate={{ y: [-5, -22], x: [0, 6], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }}>z</motion.span>
          <motion.span className="absolute text-sm -right-3 -top-2" animate={{ y: [-5, -26], x: [0, 10], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}>Z</motion.span>
        </div>
      )}

      {/* Celebration particles */}
      {(state === 'celebrating' || state === 'happy') && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.span className="absolute -top-3 left-6 text-base" animate={{ y: [0, -18], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.1 }}>✨</motion.span>
          <motion.span className="absolute -top-4 right-6 text-base" animate={{ y: [0, -20], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.8 }}>💛</motion.span>
        </div>
      )}

      <motion.svg
        viewBox="0 0 200 190"
        className="w-full h-full drop-shadow-2xl z-10 overflow-visible"
        animate={bodyMotion as any}
        style={{ transform: `translate3d(${mouseOffset.x}px,${mouseOffset.y}px,0) rotate(${mouseOffset.x * 0.3}deg)`, transition: 'transform 0.12s ease-out' }}
      >
        <defs>
          <linearGradient id={`coatGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.coatA} />
            <stop offset="100%" stopColor={colors.coatB} />
          </linearGradient>
          <filter id={`shadow-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Render species-specific body */}
        {petType === 'cat' && <CatBody {...bodyProps} />}
        {petType === 'dog' && <DogBody {...bodyProps} />}
        {petType === 'fox' && <FoxBody {...bodyProps} />}
        {petType === 'panda' && <PandaBody {...bodyProps} />}
        {petType === 'bunny' && <BunnyBody {...bodyProps} />}
        {petType === 'dragon' && <DragonBody {...bodyProps} />}
        {petType === 'nova' && <OwlBody {...bodyProps} />}

        {/* Accessories are always on top */}
        <AccessoryLayer
          accessories={accessories}
          eyeLx={eyePos.lx}
          eyeLy={eyePos.ly}
          eyeRx={eyePos.rx}
          eyeRy={eyePos.ry}
        />

      </motion.svg>
    </div>
  );
};
