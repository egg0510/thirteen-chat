import { create } from 'zustand';
import type { Persona, VAD } from '../types';

interface AppState {
  model: string;
  setModel: (m: string) => void;
  personas: Persona[];
  setPersonas: (ps: Persona[]) => void;
  activePersona?: Persona; setActivePersona: (p?: Persona) => void;
  vad: VAD; setVAD: (v: Partial<VAD>) => void;
}

export const useApp = create<AppState>((set) => ({
  model: 'DeepSeek-Chat',
  setModel: (m) => set({ model: m }),
  personas: [],
  setPersonas: (ps) => set({ personas: ps }),
  activePersona: undefined,
  setActivePersona: (p) => set({ activePersona: p }),
  vad: { valence: 0.6, arousal: 0.4, dominance: 0.5 },
  setVAD: (v) => set((s) => ({ vad: { ...s.vad, ...v } })),
}));
