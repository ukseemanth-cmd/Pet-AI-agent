export type PetType = 'nova' | 'cat' | 'dog' | 'fox' | 'panda' | 'bunny' | 'dragon';
export type PetPersonality = 'gentle' | 'balanced' | 'strict';
export type PetTheme = 'default' | 'midnight' | 'sunset' | 'ocean' | 'forest' | 'neon';

export interface CompanionProfile {
  pet_type: PetType;
  pet_name: string;
  personality: PetPersonality;
  theme: PetTheme;
  accessories: string[];
  onboarding_done: boolean;
}

export interface PetSpeciesConfig {
  type: PetType;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
  defaultName: string;
  accentColor: string;      // Primary accent / aura
  glowColor: string;
  coatColorA: string;       // Primary fur gradient top
  coatColorB: string;       // Primary fur gradient bottom
  bellyColor: string;       // Chest / muzzle fur
  eyeColor: string;         // Iris color
  noseColor: string;
  innerEarColor: string;
}

export interface PetAccessoryConfig {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export const PET_SPECIES: PetSpeciesConfig[] = [
  {
    type: 'cat',
    label: 'Cat',
    emoji: '🐱',
    tagline: 'Calm, Clever & Playful',
    description: 'Keeps you calm, focused, and quietly brilliant throughout your day.',
    defaultName: 'Mochi',
    accentColor: '#a78bfa',
    glowColor: '#c4b5fd',
    coatColorA: '#382bf0',
    coatColorB: '#1e1b4b',
    bellyColor: '#f1f5f9',
    eyeColor: '#38bdf8',
    noseColor: '#f472b6',
    innerEarColor: '#fda4af',
  },
  {
    type: 'dog',
    label: 'Dog',
    emoji: '🐶',
    tagline: 'Loyal, Joyful & Energizing',
    description: 'Always by your side, wagging its tail and celebrating every single win.',
    defaultName: 'Buddy',
    accentColor: '#f59e0b',
    glowColor: '#fbbf24',
    coatColorA: '#d97706',
    coatColorB: '#78350f',
    bellyColor: '#fef3c7',
    eyeColor: '#78350f',
    noseColor: '#1e293b',
    innerEarColor: '#fed7aa',
  },
  {
    type: 'fox',
    label: 'Fox',
    emoji: '🦊',
    tagline: 'Clever, Strategic & Sharp',
    description: 'Sharp instincts to guide you toward high-impact priority tasks.',
    defaultName: 'Rusty',
    accentColor: '#f97316',
    glowColor: '#fb923c',
    coatColorA: '#ea580c',
    coatColorB: '#7c2d12',
    bellyColor: '#ffffff',
    eyeColor: '#f59e0b',
    noseColor: '#0f172a',
    innerEarColor: '#ffffff',
  },
  {
    type: 'panda',
    label: 'Panda',
    emoji: '🐼',
    tagline: 'Relaxed, Grounded & Peaceful',
    description: 'Brings peaceful clarity, helping you stay grounded in the chaos.',
    defaultName: 'Bao',
    accentColor: '#34d399',
    glowColor: '#6ee7b7',
    coatColorA: '#1e293b',
    coatColorB: '#0f172a',
    bellyColor: '#ffffff',
    eyeColor: '#0f172a',
    noseColor: '#0f172a',
    innerEarColor: '#1e293b',
  },
  {
    type: 'bunny',
    label: 'Bunny',
    emoji: '🐰',
    tagline: 'Cheerful, Gentle & Uplifting',
    description: 'Turns tiny steps into big momentum with cheerful energy.',
    defaultName: 'Pip',
    accentColor: '#ec4899',
    glowColor: '#f472b6',
    coatColorA: '#fbcfe8',
    coatColorB: '#f472b6',
    bellyColor: '#ffffff',
    eyeColor: '#ec4899',
    noseColor: '#fb7185',
    innerEarColor: '#fda4af',
  },
  {
    type: 'dragon',
    label: 'Dragon',
    emoji: '🐲',
    tagline: 'Bold, Ambitious & Inspiring',
    description: 'A magical companion inspiring you to achieve your highest potential.',
    defaultName: 'Ember',
    accentColor: '#ef4444',
    glowColor: '#f87171',
    coatColorA: '#10b981',
    coatColorB: '#064e3b',
    bellyColor: '#fef08a',
    eyeColor: '#f59e0b',
    noseColor: '#064e3b',
    innerEarColor: '#34d399',
  },
  {
    type: 'nova',
    label: 'Starlight Owl',
    emoji: '🦉',
    tagline: 'Wise, Mystical & Focused',
    description: 'A mystical starlight owl guiding your productivity with wisdom.',
    defaultName: 'Nova',
    accentColor: '#06b6d4',
    glowColor: '#22d3ee',
    coatColorA: '#1e3a8a',
    coatColorB: '#0f172a',
    bellyColor: '#e0f2fe',
    eyeColor: '#38bdf8',
    noseColor: '#f59e0b',
    innerEarColor: '#60a5fa',
  },
];

export const PERSONALITY_OPTIONS = [
  {
    value: 'gentle' as PetPersonality,
    label: 'Gentle',
    icon: '🌿',
    quote: '"Let\'s take this one step at a time."',
    description: 'Soft encouragement. Zero pressure.',
  },
  {
    value: 'balanced' as PetPersonality,
    label: 'Balanced',
    icon: '⚡',
    quote: '"Let\'s make today count."',
    description: 'Friendly, practical, and steady.',
  },
  {
    value: 'strict' as PetPersonality,
    label: 'Ambitious',
    icon: '🎯',
    quote: '"Your goals won\'t achieve themselves. Let\'s go."',
    description: 'Direct, focused, and high-standard.',
  },
];

export const THEME_OPTIONS = [
  { value: 'default' as PetTheme, label: 'Natural Coat', color: '#f59e0b', glowColor: '#fbbf24' },
  { value: 'midnight' as PetTheme, label: 'Midnight Nightfall', color: '#6366f1', glowColor: '#8b5cf6' },
  { value: 'sunset' as PetTheme, label: 'Warm Sunset', color: '#f97316', glowColor: '#fb923c' },
  { value: 'ocean' as PetTheme, label: 'Ocean Breeze', color: '#0ea5e9', glowColor: '#38bdf8' },
  { value: 'forest' as PetTheme, label: 'Forest Meadow', color: '#22c55e', glowColor: '#4ade80' },
  { value: 'neon' as PetTheme, label: 'Pastel Dream', color: '#a855f7', glowColor: '#e879f9' },
];

export const ACCESSORY_OPTIONS: PetAccessoryConfig[] = [
  { id: 'glasses', label: 'Cute Glasses', emoji: '👓', description: 'Smart study spectacles' },
  { id: 'headphones', label: 'Cozy Headphones', emoji: '🎧', description: 'Lo-fi focus music gear' },
  { id: 'cap', label: 'Tiny Cap', emoji: '🧢', description: 'Little cozy cap' },
  { id: 'hoodie', label: 'Pet Scarf / Bandana', emoji: '🧣', description: 'Warm snug scarf' },
  { id: 'dev_badge', label: 'Builder Pin', emoji: '💻', description: 'Little code pin' },
  { id: 'star_badge', label: 'Gold Star', emoji: '⭐', description: 'Honor student star' },
  { id: 'explorer_pin', label: 'Explorer Badge', emoji: '🧭', description: 'Adventurer compass' },
];

export const getPetSpecies = (type: PetType): PetSpeciesConfig =>
  PET_SPECIES.find((p) => p.type === type) ?? PET_SPECIES[0];

export const getThemeConfig = (theme: PetTheme) =>
  THEME_OPTIONS.find((t) => t.value === theme) ?? THEME_OPTIONS[0];
