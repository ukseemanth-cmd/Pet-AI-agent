import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, Sparkles, AlertTriangle
} from 'lucide-react';
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
import { useCompanion } from '../../context/CompanionContext';
import { PetState } from '../../services/types';
import { sound } from '../../utils/audio';

interface CompanionSettingsProps {
  onClose: () => void;
}

export const CompanionSettings: React.FC<CompanionSettingsProps> = ({ onClose }) => {
  const { profile, updateProfile } = useCompanion();

  const [selectedType, setSelectedType] = useState<PetType>((profile?.pet_type as PetType) || 'nova');
  const [petName, setPetName] = useState(profile?.pet_name || '');
  const [selectedPersonality, setSelectedPersonality] = useState<PetPersonality>((profile?.personality as PetPersonality) || 'balanced');
  const [selectedTheme, setSelectedTheme] = useState<PetTheme>((profile?.theme as PetTheme) || 'default');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(profile?.accessories || []);
  const [petState, setPetState] = useState<PetState>('happy');
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const species = getPetSpecies(selectedType);
  const isSpeciesChanged = selectedType !== profile?.pet_type;
  const hasChanges =
    isSpeciesChanged ||
    petName.trim() !== (profile?.pet_name || '') ||
    selectedPersonality !== profile?.personality ||
    selectedTheme !== profile?.theme ||
    JSON.stringify(selectedAccessories.sort()) !== JSON.stringify((profile?.accessories || []).sort());

  const toggleAccessory = (accId: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
    setPetState('excited');
    setTimeout(() => setPetState('happy'), 600);
  };

  const handleSave = async (confirmed: boolean = false) => {
    if (isSpeciesChanged && !confirmed && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    setIsSaving(true);
    setPetState('celebrating');
    sound.playLevelUp();
    try {
      await updateProfile({
        pet_type: selectedType,
        pet_name: petName.trim() || species.defaultName,
        personality: selectedPersonality,
        theme: selectedTheme,
        accessories: selectedAccessories,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setPetState('happy');
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="w-full max-w-2xl rounded-3xl bg-[#0b0f17] border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">My Companion · Personalization</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[72vh]">
          <div className="flex flex-col md:flex-row gap-0">
            {/* Live Pet Preview Stage */}
            <div className="md:w-56 bg-slate-950/60 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col items-center justify-center gap-3">
              <div className="w-36 h-36">
                <PetRenderer
                  petType={selectedType}
                  theme={selectedTheme}
                  accessories={selectedAccessories}
                  state={petState}
                  size="sm"
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-slate-100">
                  {species.emoji} {petName.trim() || species.defaultName}
                </div>
                <div className="text-[11px] font-mono text-cyan-400">{species.tagline}</div>
                <div className="text-[10px] text-slate-400 mt-1 max-w-[170px] leading-relaxed">
                  {species.description}
                </div>
              </div>
            </div>

            {/* Configuration Tabs */}
            <div className="flex-1 p-6 space-y-5">
              {/* Pet Name */}
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
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
                  placeholder={species.defaultName}
                  maxLength={20}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 placeholder-slate-500 text-sm font-semibold focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              {/* Species */}
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                  Companion Species
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PET_SPECIES.map((s) => {
                    const isSel = selectedType === s.type;
                    return (
                      <motion.button
                        key={s.type}
                        onClick={() => {
                          setSelectedType(s.type);
                          setPetState('excited');
                          sound.playTaskComplete();
                          setTimeout(() => setPetState('happy'), 700);
                        }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer ${
                          isSel
                            ? 'border-cyan-500/70 bg-cyan-500/15 text-slate-100 shadow-md shadow-cyan-500/10'
                            : 'border-white/8 bg-slate-900/50 text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        {isSel && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                          </div>
                        )}
                        <span className="text-xl">{s.emoji}</span>
                        <span className="text-[10px] font-bold">{s.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Motivation Style */}
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                  Motivation Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PERSONALITY_OPTIONS.map((opt) => {
                    const isSel = selectedPersonality === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSelectedPersonality(opt.value);
                          sound.playTaskComplete();
                        }}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSel
                            ? 'border-cyan-500/60 bg-cyan-500/10 text-slate-100'
                            : 'border-white/8 bg-slate-900/50 text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-base">{opt.icon}</span>
                        <span className="text-[11px] font-bold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme */}
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                  Color Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {THEME_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => {
                        setSelectedTheme(t.value);
                        sound.playTaskComplete();
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                        selectedTheme === t.value
                          ? 'border-white/30 text-white bg-white/10'
                          : 'border-white/8 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cosmetic Accessories */}
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                  Cosmetic Accessories
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ACCESSORY_OPTIONS.map((acc) => {
                    const isEquipped = selectedAccessories.includes(acc.id);
                    return (
                      <button
                        key={acc.id}
                        onClick={() => toggleAccessory(acc.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                          isEquipped
                            ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300'
                            : 'border-white/8 bg-slate-900/50 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <span>{acc.emoji}</span>
                        <span>{acc.label}</span>
                        {isEquipped && <Check className="w-2.5 h-2.5 text-cyan-400 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Change confirmation modal */}
              <AnimatePresence>
                {showConfirm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <div className="font-bold">Change your companion?</div>
                        <div className="text-amber-400/80 mt-0.5">
                          Your XP, streaks, tasks, and achievements will remain completely safe. Only your companion appearance and personality will change.
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
                      >
                        Keep Current
                      </button>
                      <button
                        onClick={() => handleSave(true)}
                        className="px-3.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                      >
                        Change Companion
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-slate-950/40">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={(!hasChanges && !showConfirm) || isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs transition-all cursor-pointer disabled:opacity-40 shadow-lg"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Saved!</span>
              </>
            ) : isSaving ? (
              <span>Saving...</span>
            ) : (
              <span>Save Companion</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
