import { GameSettings, Phase1SaveData } from './types';

const SETTINGS_KEY = 'no_escape_settings_v1';
const SAVE_KEY = 'no_escape_save_v3';

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.45,
  sfxVolume: 0.7,
  muted: false,
  graphicsQuality: 'high',
  controlSensitivity: 1.0,
  touchControls: 'auto',
};

export function loadSettings(): GameSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return {
      musicVolume:
        typeof parsed.musicVolume === 'number'
          ? Math.max(0, Math.min(1, parsed.musicVolume))
          : DEFAULT_SETTINGS.musicVolume,
      sfxVolume:
        typeof parsed.sfxVolume === 'number'
          ? Math.max(0, Math.min(1, parsed.sfxVolume))
          : DEFAULT_SETTINGS.sfxVolume,
      muted: Boolean(parsed.muted),
      graphicsQuality:
        parsed.graphicsQuality === 'low' ||
        parsed.graphicsQuality === 'medium' ||
        parsed.graphicsQuality === 'high'
          ? parsed.graphicsQuality
          : DEFAULT_SETTINGS.graphicsQuality,
      controlSensitivity:
        typeof parsed.controlSensitivity === 'number'
          ? Math.max(0.6, Math.min(1.5, parsed.controlSensitivity))
          : DEFAULT_SETTINGS.controlSensitivity,
      touchControls:
        parsed.touchControls === 'auto' ||
        parsed.touchControls === 'always' ||
        parsed.touchControls === 'off'
          ? parsed.touchControls
          : DEFAULT_SETTINGS.touchControls,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadPhase1Save(): Phase1SaveData | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Phase1SaveData;
    if (
      parsed &&
      parsed.version === 2 &&
      typeof parsed.playerX === 'number' &&
      typeof parsed.playerY === 'number' &&
      parsed.stats &&
      Array.isArray(parsed.inventory)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function writePhase1Save(data: Phase1SaveData): void {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearPhase1Save(): void {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore
  }
}
