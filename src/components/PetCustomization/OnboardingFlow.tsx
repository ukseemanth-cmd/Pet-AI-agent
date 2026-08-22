import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Sparkles, ArrowLeft, Palette, Sparkle } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PET_SPECIES,
  PERSONALITY_OPTIONS,
  THEME_OPTIONS,
  ACCESSORY_OPTIONS,
  PetType,
  PetPersonality,
  PetTheme,
  getPetSpecies,
} from '../../config/petConfig';
import { PetRenderer } from '../PetAgent/PetRenderer';
import { PetState } from '../../services/types';
import { useCompanion } from '../../context/CompanionContext';
import { sound } from '../../utils/audio';

interface OnboardingFlowProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'choose' | 'personality' | 'customize' | 'ready';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { completeOnboarding } = useCompanion();

  const [step, setStep] = useState<Step>('welcome');
  const [selectedType, setSelectedType] = useState<PetType>('fox');
  const [hoveredType, setHoveredType] = useState<PetType | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<PetPersonality>('balanced');
  const [selectedTheme, setSelectedTheme] = useState<PetTheme>('default');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [petName, setPetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [petState, setPetState] = useState<PetState>('happy');

  const previewType = hoveredType || selectedType;
  const previewSpecies = getPetSpecies(previewType);
  const selectedSpecies = getPetSpecies(selectedType);
  const finalName = petName.trim() || selectedSpecies.defaultName;

  // Trigger celebration confetti on reaching 'ready' step
  useEffect(() => {
    if (step === 'ready') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: [selectedSpecies.accentColor, '#22d3ee', '#a855f7', '#fbbf24'],
        });
      } catch {
        // ignore
      }
    }
  }, [step, selectedSpecies.accentColor]);

  // Animate pet on selection
  const handleSelectPet = (type: PetType) => {
    setSelectedType(type);
    setPetState('excited');
    sound.playTaskComplete();
    setTimeout(() => setPetState('happy'), 1200);
  };

  const handleHover = (type: PetType | null) => {
    setHoveredType(type);
    if (type && type !== selectedType) {
      setPetState('idle');
    }
  };

  const toggleAccessory = (accId: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
    setPetState('excited');
    setTimeout(() => setPetState('happy'), 800);
  };

  const handleComplete = async () => {
    setIsSaving(true);
    setPetState('celebrating');
    sound.playLevelUp();
    try {
      await completeOnboarding({
        pet_type: selectedType,
        pet_name: finalName,
        personality: selectedPersonality,
        theme: selectedTheme,
        accessories: selectedAccessories,
      });
      onComplete();
    } catch (err) {
      console.error('Failed to save companion:', err);
      setIsSaving(false);
      onComplete();
    }
  };

  const handleSkip = async () => {
    setIsSaving(true);
    try {
      await completeOnboarding({
        pet_type: 'nova',
        pet_name: 'Nova',
        personality: 'balanced',
        theme: 'default',
        accessories: [],
      });
      onComplete();
    } catch (err) {
      console.error(err);
      onComplete();
    }
  };

  const stepVariants = {
    enter: { opacity: 0, y: 20, scale: 0.98 },
    center: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -16, scale: 0.98 },
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#07080d]/95 backdrop-blur-xl overflow-y-auto py-8">
      {/* Dynamic Background Atmospheric Orbs */}
      <div
        className="fixed top-[-120px] left-1/4 w-[650px] h-[650px] rounded-full filter blur-[160px] pointer-events-none transition-all duration-1000 opacity-20"
        style={{ backgroundColor: previewSpecies.accentColor }}
      />
      <div className="fixed bottom-[-100px] right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-600/10 filter blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
        <AnimatePresence mode="wait">

          {/* ═════════ 1. WELCOME STEP ═════════ */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center text-center gap-6 max-w-lg"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-44 h-44"
              >
                <PetRenderer petType="cat" state="happy" size="md" />

              </motion.div>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-3"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Productivity Pet Companion</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight"
                >
                  Meet Your New<br />
                  <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                    AI Companion.
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed max-w-md mx-auto"
                >
                  Choose the companion that works alongside you — understanding your goals, breaking down tasks, keeping you focused, and celebrating every milestone.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center gap-3 w-full"
              >
                <button
                  onClick={() => setStep('choose')}
                  className="group flex items-center justify-center gap-2 w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <span>Choose Your Companion</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
                </button>
                <button
                  onClick={handleSkip}
                  className="text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer py-1"
                >
                  Skip for now
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ═════════ 2. CHOOSE PET SPECIES ═════════ */}
          {step === 'choose' && (
            <motion.div
              key="choose"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full"
            >
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                {/* Pet Live Preview Stage */}
                <div className="lg:sticky lg:top-4 flex flex-col items-center gap-4 lg:w-72 w-full glass-panel p-6 rounded-3xl border border-white/10">
                  <motion.div
                    key={previewType}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 260 }}
                    className="w-48 h-48"
                  >
                    <PetRenderer
                      petType={previewType}
                      theme={selectedTheme}
                      accessories={selectedAccessories}
                      state={petState}
                      size="md"
                    />
                  </motion.div>
                  <motion.div
                    key={previewType + '-info'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-extrabold text-slate-100 flex items-center justify-center gap-2">
                      <span>{previewSpecies.emoji}</span>
                      <span>{previewSpecies.label}</span>
                    </div>
                    <div className="text-xs font-mono text-cyan-400 mt-0.5">{previewSpecies.tagline}</div>
                    <div className="text-xs text-slate-400 mt-2 leading-relaxed">
                      "{previewSpecies.description}"
                    </div>
                  </motion.div>
                </div>

                {/* Pet Selection Grid */}
                <div className="flex-1 w-full">
                  <div className="mb-5">
                    <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">Step 1 of 3</div>
                    <h2 className="text-2xl font-extrabold text-slate-100">Choose Your AI Companion</h2>
                    <p className="text-xs text-slate-400 mt-1">Pick the companion archetype that matches how you like to work.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                    {PET_SPECIES.map((species) => {
                      const isSelected = selectedType === species.type;
                      return (
                        <motion.button
                          key={species.type}
                          onClick={() => handleSelectPet(species.type)}
                          onMouseEnter={() => handleHover(species.type)}
                          onMouseLeave={() => handleHover(null)}
                          whileHover={{ scale: 1.03, y: -3 }}
                          whileTap={{ scale: 0.97 }}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-cyan-500/70 bg-cyan-500/10 shadow-lg'
                              : 'border-white/8 bg-slate-900/60 hover:border-white/20'
                          }`}
                          style={{
                            boxShadow: isSelected ? `0 0 24px ${species.accentColor}35` : undefined,
                          }}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shadow-md shadow-cyan-500/40"
                            >
                              <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                            </motion.div>
                          )}
                          <span className="text-3xl sm:text-4xl">{species.emoji}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-100">{species.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{species.tagline}</div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <button
                      onClick={() => setStep('welcome')}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={() => {
                        setStep('personality');
                        setPetState('encouraging');
                      }}
                      className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═════════ 3. PERSONALITY STYLE ═════════ */}
          {step === 'personality' && (
            <motion.div
              key="personality"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-32 h-32">
                  <PetRenderer
                    petType={selectedType}
                    theme={selectedTheme}
                    accessories={selectedAccessories}
                    state={petState}
                    size="sm"
                  />
                </div>

                <div className="text-center">
                  <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">Step 2 of 3</div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                    How should {selectedSpecies.label} motivate you?
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Select the communication and encouragement tone.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
                  {PERSONALITY_OPTIONS.map((opt) => {
                    const isSelected = selectedPersonality === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        onClick={() => {
                          setSelectedPersonality(opt.value);
                          sound.playTaskComplete();
                        }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex flex-col justify-between p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-cyan-500/70 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                            : 'border-white/8 bg-slate-900/60 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{opt.icon}</span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-100">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-1">{opt.description}</div>
                        </div>
                        <div className="text-xs text-cyan-300/80 italic mt-4 border-t border-white/5 pt-2">
                          {opt.quote}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex justify-between w-full pt-4 border-t border-white/5">
                  <button
                    onClick={() => setStep('choose')}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setStep('customize');
                      setPetState('happy');
                    }}
                    className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <span>Next: Customize & Name</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═════════ 4. CUSTOMIZE & NAME STEP ═════════ */}
          {step === 'customize' && (
            <motion.div
              key="customize"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-36 h-36">
                  <PetRenderer
                    petType={selectedType}
                    theme={selectedTheme}
                    accessories={selectedAccessories}
                    state={petName.trim() ? 'happy' : 'idle'}
                    size="md"
                  />
                </div>

                <div className="text-center">
                  <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">Step 3 of 3</div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Personalize Your Companion</h2>
                  <p className="text-xs text-slate-400 mt-1">Give your companion a name and style.</p>
                </div>

                {/* Name Input */}
                <div className="w-full max-w-md space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block text-left">
                    Companion Name
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => {
                      setPetName(e.target.value.slice(0, 20));
                      setPetState('excited');
                      setTimeout(() => setPetState('happy'), 500);
                    }}
                    placeholder={`e.g. ${selectedSpecies.defaultName}`}
                    maxLength={20}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-100 placeholder-slate-500 text-sm font-semibold focus:outline-none focus:border-cyan-500/50 transition-all text-center"
                  />
                  <div className="text-center">
                    <span className="text-xs text-slate-400">
                      Live preview:{' '}
                      <span className="text-cyan-400 font-bold">
                        {finalName} the {selectedSpecies.label}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Color Theme Selector */}
                <div className="w-full">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2 text-center">
                    Color Theme
                  </label>
                  <div className="flex flex-wrap justify-center gap-2">
                    {THEME_OPTIONS.map((t) => {
                      const isSel = selectedTheme === t.value;
                      return (
                        <button
                          key={t.value}
                          onClick={() => {
                            setSelectedTheme(t.value);
                            sound.playTaskComplete();
                          }}
                          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSel
                              ? 'border-white/30 text-white bg-white/10 shadow-md'
                              : 'border-white/8 text-slate-400 hover:border-white/20 hover:text-slate-200'
                          }`}
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: t.color, boxShadow: isSel ? `0 0 8px ${t.glowColor}` : undefined }}
                          />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cosmetic Accessories Selector */}
                <div className="w-full">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2 text-center">
                    Cosmetic Accessories (Optional)
                  </label>
                  <div className="flex flex-wrap justify-center gap-2">
                    {ACCESSORY_OPTIONS.map((acc) => {
                      const isEquipped = selectedAccessories.includes(acc.id);
                      return (
                        <button
                          key={acc.id}
                          onClick={() => toggleAccessory(acc.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isEquipped
                              ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300 shadow-md shadow-cyan-500/10'
                              : 'border-white/8 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-slate-200'
                          }`}
                        >
                          <span>{acc.emoji}</span>
                          <span>{acc.label}</span>
                          {isEquipped && <Check className="w-3 h-3 text-cyan-400 stroke-[3] ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between w-full pt-4 border-t border-white/5">
                  <button
                    onClick={() => setStep('personality')}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setStep('ready');
                      setPetState('celebrating');
                    }}
                    className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <span>Complete Setup</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═════════ 5. READY STEP ═════════ */}
          {step === 'ready' && (
            <motion.div
              key="ready"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center text-center gap-6 max-w-md"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 190 }}
                className="w-48 h-48"
              >
                <PetRenderer
                  petType={selectedType}
                  theme={selectedTheme}
                  accessories={selectedAccessories}
                  state="celebrating"
                  size="md"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase flex items-center justify-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Companion Is Ready
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-4xl font-extrabold text-slate-100">
                  {selectedSpecies.emoji} {finalName}
                </h2>
                <div className="text-xs text-slate-400 mt-1">
                  {selectedSpecies.label} · {PERSONALITY_OPTIONS.find((p) => p.value === selectedPersonality)?.label} Motivation Style
                </div>
                <div className="mt-4 px-5 py-3 rounded-2xl bg-slate-900/70 border border-white/8 text-xs text-slate-300 italic max-w-sm mx-auto">
                  {PERSONALITY_OPTIONS.find((p) => p.value === selectedPersonality)?.quote}
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleComplete}
                disabled={isSaving}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/30 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSaving ? 'Awakening Companion...' : 'Enter Workspace →'}
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
