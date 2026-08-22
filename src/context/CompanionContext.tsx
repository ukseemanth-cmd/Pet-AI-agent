import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CompanionProfile, PetType, PetPersonality, PetTheme, getPetSpecies } from '../config/petConfig';
import { getCompanionProfile, updateCompanionProfile } from '../services/companionApi';

interface CompanionContextValue {
  profile: CompanionProfile | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  updateProfile: (updates: Partial<Omit<CompanionProfile, 'onboarding_done'>>) => Promise<void>;
  completeOnboarding: (profile: {
    pet_type: PetType;
    pet_name: string;
    personality: PetPersonality;
    theme: PetTheme;
    accessories: string[];
  }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CompanionContext = createContext<CompanionContextValue | null>(null);

export const CompanionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<CompanionProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await getCompanionProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load companion profile:', err);
      // Fallback: no profile, will trigger onboarding
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const updateProfile = useCallback(async (updates: Partial<Omit<CompanionProfile, 'onboarding_done'>>) => {
    if (!profile) return;
    const apiUpdates: any = {};
    if (updates.pet_type !== undefined) apiUpdates.pet_type = updates.pet_type;
    if (updates.pet_name !== undefined) apiUpdates.pet_name = updates.pet_name;
    if (updates.personality !== undefined) apiUpdates.personality = updates.personality;
    if (updates.theme !== undefined) apiUpdates.theme = updates.theme;
    if (updates.accessories !== undefined) apiUpdates.accessories = updates.accessories;

    const updated = await updateCompanionProfile(apiUpdates);
    setProfile(updated);
  }, [profile]);

  const completeOnboarding = useCallback(async (data: {
    pet_type: PetType;
    pet_name: string;
    personality: PetPersonality;
    theme: PetTheme;
    accessories: string[];
  }) => {
    const updated = await updateCompanionProfile({
      ...data,
      onboarding_done: true,
    });
    setProfile(updated);
  }, []);

  const needsOnboarding = !isLoading && (profile === null || !profile.onboarding_done);

  return (
    <CompanionContext.Provider value={{
      profile,
      isLoading,
      needsOnboarding,
      updateProfile,
      completeOnboarding,
      refreshProfile,
    }}>
      {children}
    </CompanionContext.Provider>
  );
};

export const useCompanion = (): CompanionContextValue => {
  const ctx = useContext(CompanionContext);
  if (!ctx) throw new Error('useCompanion must be used within CompanionProvider');
  return ctx;
};
