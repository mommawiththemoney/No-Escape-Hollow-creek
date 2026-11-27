import React from 'react';
import {
  GameSettings,
  GraphicsQuality,
  TouchControlMode,
} from '../game/types';

interface PauseModalProps {
  open: boolean;
  discoveredCount: number;
  totalClues: number;
  missionsCompleted: number;
  totalMissions: number;
  onResume: () => void;
  onOpenSettings: () => void;
  onSaveAndQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  open,
  discoveredCount,
  totalClues,
  missionsCompleted,
  totalMissions,
  onResume,
  onOpenSettings,
  onSaveAndQuit,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[rgba(6,8,12,0.76)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="w-full max-w-sm bg-[#141a22] border-2 border-[#3a4556] rounded-xl p-6 shadow-[0_12px_32px_rgba(0,0,0,0.65)]">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#d49b4b]">
          Hollow Creek
        </div>
        <h2
          id="pause-title"
          className="font-display text-3xl font-bold text-[#f3eee4] mt-1 tracking-wide"
        >
          Game Paused
        </h2>
        <div className="mt-2 text-sm text-[#9ca8b9] font-mono-tabular space-y-0.5">
          <div>
            Clues Discovered: {discoveredCount} / {totalClues}
          </div>
          <div>
            Missions Completed: {missionsCompleted} / {totalMissions}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="min-h-[44px] w-full px-5 py-2.5 bg-[#d49b4b] hover:bg-[#e3ab5c] text-[#11151c] font-semibold text-sm rounded-lg border-2 border-[#11151c] shadow-[0_3px_0_#11151c] cursor-pointer transition-colors"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="min-h-[44px] w-full px-5 py-2.5 bg-[#1b232e] hover:bg-[#242e3d] text-[#e8ecf2] font-medium text-sm rounded-lg border border-[#364152] cursor-pointer transition-colors"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={onSaveAndQuit}
            className="min-h-[44px] w-full px-5 py-2.5 bg-[#141a22] hover:bg-[#1e2632] text-[#c2cbd8] font-medium text-sm rounded-lg border border-[#2d3645] cursor-pointer transition-colors"
          >
            Save &amp; Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  open: boolean;
  settings: GameSettings;
  onChange: (next: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  settings,
  onChange,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[rgba(6,8,12,0.8)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="w-full max-w-md bg-[#141a22] border-2 border-[#3a4556] rounded-xl p-6 shadow-[0_12px_32px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between">
          <h2
            id="settings-title"
            className="font-display text-3xl font-bold text-[#f3eee4] tracking-wide"
          >
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Settings"
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#343e4d] text-[#c9d1dd] hover:bg-[#1e2632] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <div className="flex justify-between text-sm text-[#dce2ec] mb-1.5">
              <span>Ambience Volume</span>
              <span className="font-mono-tabular text-[#9ca8b9]">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.musicVolume}
              onChange={(e) =>
                onChange({ ...settings, musicVolume: Number(e.target.value) })
              }
              className="w-full accent-[#d49b4b] cursor-pointer"
            />
          </label>

          <label className="block">
            <div className="flex justify-between text-sm text-[#dce2ec] mb-1.5">
              <span>Sound Effects Volume</span>
              <span className="font-mono-tabular text-[#9ca8b9]">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.sfxVolume}
              onChange={(e) =>
                onChange({ ...settings, sfxVolume: Number(e.target.value) })
              }
              className="w-full accent-[#d49b4b] cursor-pointer"
            />
          </label>

          <label className="block">
            <div className="flex justify-between text-sm text-[#dce2ec] mb-1.5">
              <span>Control Sensitivity</span>
              <span className="font-mono-tabular text-[#9ca8b9]">
                {settings.controlSensitivity.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min={0.6}
              max={1.5}
              step={0.1}
              value={settings.controlSensitivity}
              onChange={(e) =>
                onChange({
                  ...settings,
                  controlSensitivity: Number(e.target.value),
                })
              }
              className="w-full accent-[#d49b4b] cursor-pointer"
            />
          </label>

          <div>
            <div className="text-sm text-[#dce2ec] mb-1.5">Graphics Quality</div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0e1218] rounded-lg border border-[#2a323f]">
              {(['low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onChange({ ...settings, graphicsQuality: q })}
                  className={`min-h-[38px] rounded-md text-xs font-semibold capitalize cursor-pointer transition-colors ${
                    settings.graphicsQuality === q
                      ? 'bg-[#d49b4b] text-[#11151c]'
                      : 'text-[#9ca8b9] hover:text-[#e8ecf2]'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-[#dce2ec] mb-1.5">
              Touch Controls
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0e1218] rounded-lg border border-[#2a323f]">
              {(
                [
                  { id: 'auto', label: 'Auto' },
                  { id: 'always', label: 'Always On' },
                  { id: 'off', label: 'Off' },
                ] as { id: TouchControlMode; label: string }[]
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() =>
                    onChange({ ...settings, touchControls: mode.id })
                  }
                  className={`min-h-[38px] rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                    settings.touchControls === mode.id
                      ? 'bg-[#d49b4b] text-[#11151c]'
                      : 'text-[#9ca8b9] hover:text-[#e8ecf2]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 bg-[#d49b4b] hover:bg-[#e3ab5c] text-[#11151c] font-semibold text-sm rounded-lg border-2 border-[#11151c] shadow-[0_3px_0_#11151c] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
