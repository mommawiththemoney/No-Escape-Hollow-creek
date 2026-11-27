import React from 'react';
import { formatGameClock, getDayPhaseLabel } from '../game/survival';
import {
  ActivePromptTarget,
  MissionState,
  MissionToast,
  MovementStance,
  SurvivalStats,
  WeatherKind,
} from '../game/types';

interface GameHudProps {
  districtName: string;
  interiorName: string | null;
  stance: MovementStance;
  stats: SurvivalStats;
  clockMinutes: number;
  weather: WeatherKind;
  activeMission: MissionState | null;
  activePrompt: ActivePromptTarget | null;
  missionToast: MissionToast | null;
  statusBanner: string | null;
  muted: boolean;
  touchControlsVisible?: boolean;
  onToggleMute: () => void;
  onOpenInventory: () => void;
  onOpenJournal: () => void;
  onOpenMap: () => void;
  onOpenSettings: () => void;
  onPause: () => void;
  onInteract: () => void;
  onToggleFlashlight: () => void;
  onAttack: () => void;
}

const WEATHER_LABELS: Record<WeatherKind, string> = {
  mist: 'Mist',
  rain: 'Rain',
  fog: 'Heavy Fog',
};

const STANCE_LABELS: Record<MovementStance, string> = {
  idle: 'Still',
  walk: 'Walk',
  run: 'Run',
  sneak: 'Sneak',
};

export const GameHud: React.FC<GameHudProps> = ({
  districtName,
  interiorName,
  stance,
  stats,
  clockMinutes,
  weather,
  activeMission,
  activePrompt,
  missionToast,
  statusBanner,
  muted,
  touchControlsVisible = false,
  onToggleMute,
  onOpenInventory,
  onOpenJournal,
  onOpenMap,
  onOpenSettings,
  onPause,
  onInteract,
  onToggleFlashlight,
  onAttack,
}) => {
  const currentStep =
    activeMission?.steps.find((s) => !s.completed)?.label ??
    activeMission?.summary ??
    'Explore Hollow Creek';

  const hpPct = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const stamPct = Math.max(
    0,
    Math.min(100, (stats.stamina / stats.maxStamina) * 100)
  );
  const hungerPct = Math.max(
    0,
    Math.min(100, (stats.hunger / stats.maxHunger) * 100)
  );
  const thirstPct = Math.max(
    0,
    Math.min(100, (stats.thirst / stats.maxThirst) * 100)
  );
  const battPct = Math.max(
    0,
    Math.min(100, (stats.battery / stats.maxBattery) * 100)
  );

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-2.5 sm:p-4">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-2">
        {/* Top-Left: Location, Clock, Compact Vitals & Active Mission */}
        <div
          className="bg-[rgba(14,18,24,0.9)] border border-[#343e4d] rounded-lg px-3 py-2 shadow-[0_3px_0_rgba(8,10,14,0.65)] w-[210px] sm:w-[272px]"
          data-testid="hud-panel"
        >
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em]">
            <span className="text-[#d49b4b] truncate">
              {interiorName ?? districtName}
            </span>
            <span className="font-mono-tabular text-[#9ca8b8] shrink-0">
              {STANCE_LABELS[stance]}
            </span>
          </div>

          <div className="mt-0.5 text-[11px] font-mono-tabular text-[#b9c3d1]">
            {formatGameClock(clockMinutes)} · {getDayPhaseLabel(clockMinutes)} ·{' '}
            {WEATHER_LABELS[weather]}
          </div>

          {/* Vitals */}
          <div className="mt-2 space-y-1">
            <VitalBar
              label="HP"
              value={Math.round(stats.hp)}
              pct={hpPct}
              fillClass={hpPct <= 30 ? 'bg-[#d9534f]' : 'bg-[#c94c4c]'}
            />
            <VitalBar
              label="STM"
              value={Math.round(stats.stamina)}
              pct={stamPct}
              fillClass="bg-[#d49b4b]"
            />
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <VitalMini
                label="FOOD"
                value={Math.round(hungerPct)}
                fillClass="bg-[#7aa85b]"
              />
              <VitalMini
                label="H2O"
                value={Math.round(thirstPct)}
                fillClass="bg-[#5694b8]"
              />
            </div>
            {stats.hasFlashlight && (
              <VitalBar
                label={stats.flashlightOn ? 'BAT*' : 'BAT'}
                value={Math.round(battPct)}
                pct={battPct}
                fillClass={stats.flashlightOn ? 'bg-[#f0c76e]' : 'bg-[#7d8898]'}
              />
            )}
          </div>

          {/* Active Objective */}
          {activeMission && (
            <div className="mt-2 pt-1.5 border-t border-[#27303d]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#d49b4b] truncate">
                {activeMission.title}
              </div>
              <div className="text-[11px] text-[#e5e9f0] leading-snug line-clamp-2 mt-0.5">
                {currentStep}
              </div>
            </div>
          )}
        </div>

        {/* Top-Right: Utility Controls */}
        <div className="flex flex-wrap justify-end items-center gap-1.5 pointer-events-auto max-w-[160px] sm:max-w-none">
          <HudButton
            label="Open Backpack Inventory"
            title="Inventory & Crafting [Tab]"
            testId="btn-inventory"
            onClick={onOpenInventory}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              <line x1="4" y1="13" x2="20" y2="13" />
            </svg>
          </HudButton>

          <HudButton
            label="Open Journal & Missions"
            title="Journal & Missions [J]"
            testId="btn-journal"
            onClick={onOpenJournal}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </HudButton>

          <HudButton
            label="Open Town Map"
            title="Town Map [M]"
            testId="btn-map"
            onClick={onOpenMap}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
          </HudButton>

          <HudButton
            label={muted ? 'Unmute audio' : 'Mute audio'}
            title="Mute"
            onClick={onToggleMute}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              {muted ? (
                <>
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </>
              ) : (
                <>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              )}
            </svg>
          </HudButton>

          <HudButton label="Open Settings" title="Settings" onClick={onOpenSettings}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </HudButton>

          <HudButton label="Pause Game" title="Pause [Esc]" onClick={onPause}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="9" y1="6" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="18" />
            </svg>
          </HudButton>
        </div>
      </div>

      {/* Top-Center Banners (Mission Toast / Hidden State / Status Message) */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none max-w-[340px] sm:max-w-md w-full px-3">
        {missionToast && (
          <div
            data-testid="mission-toast"
            className="px-4 py-2 rounded-lg bg-[#15241b] border-2 border-[#599b6a] shadow-[0_6px_18px_rgba(0,0,0,0.65)] text-center"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9de3af]">
              Mission Complete
            </div>
            <div className="text-sm font-bold text-[#f3eee4]">{missionToast.title}</div>
            <div className="text-xs text-[#c5e8ce]">{missionToast.rewardText}</div>
          </div>
        )}

        {stats.hiddenInSpotId && (
          <div
            data-testid="hidden-banner"
            className="px-4 py-2 rounded-lg bg-[rgba(14,18,24,0.94)] border border-[#567494] text-xs font-semibold text-[#cfe0f4] text-center"
          >
            HIDDEN — Enemies cannot spot you · Press [E] to Leave
          </div>
        )}

        {statusBanner && (
          <div className="px-3.5 py-1.5 rounded-lg bg-[rgba(14,18,24,0.92)] border border-[#445166] text-xs font-medium text-[#e9edf3] text-center">
            {statusBanner}
          </div>
        )}
      </div>

      {/* Bottom-Center Prompt & Desktop Quick Strip */}
      <div
        className={`flex flex-col items-center gap-2 ${
          touchControlsVisible ? 'pb-36 sm:pb-3' : 'pb-1.5 sm:pb-2'
        }`}
      >
        {activePrompt && (
          <button
            type="button"
            onClick={onInteract}
            data-testid="interact-prompt"
            className="pointer-events-auto min-h-[44px] px-4 py-2 bg-[rgba(16,20,28,0.95)] hover:bg-[#1e2634] border-2 border-[#d49b4b] rounded-lg shadow-[0_4px_0_#0b0e13] flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#d49b4b] text-[#11151c] font-mono-tabular font-bold text-xs">
              E
            </span>
            <span className="text-sm font-bold text-[#f2ede2] whitespace-nowrap">
              {activePrompt.verb}
            </span>
            <span className="text-xs text-[#a5b0c0] whitespace-nowrap">
              {activePrompt.label}
            </span>
          </button>
        )}

        {!touchControlsVisible && (
          <div className="hidden sm:flex items-center gap-2 pointer-events-auto text-[11px] text-[#aeb8c7] bg-[rgba(11,14,19,0.78)] px-3 py-1 rounded border border-[#28313e]">
            {stats.hasFlashlight && (
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleFlashlight();
                }}
                className="hover:text-[#f2ede2] cursor-pointer whitespace-nowrap"
              >
                [F] Light {stats.flashlightOn ? 'ON' : 'OFF'}
              </button>
            )}
            {stats.hasFlashlight && <span aria-hidden="true">·</span>}
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onAttack();
              }}
              className="hover:text-[#f2ede2] cursor-pointer whitespace-nowrap"
            >
              [Space] {stats.equippedWeapon === 'crowbar' ? 'Crowbar' : 'Defend'}
            </button>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">[Tab] Pack</span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">[J] Journal</span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">[M] Map</span>
          </div>
        )}
      </div>
    </div>
  );
};

const VitalBar: React.FC<{
  label: string;
  value: number;
  pct: number;
  fillClass: string;
}> = ({ label, value, pct, fillClass }) => (
  <div className="flex items-center gap-1.5">
    <span className="w-8 text-[10px] font-mono-tabular font-semibold text-[#9aa6b8]">
      {label}
    </span>
    <div className="flex-1 h-2 bg-[#0b0e13] rounded-sm overflow-hidden border border-[#27303e]">
      <div
        className={`h-full transition-[width] duration-150 ${fillClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
    <span className="w-7 text-right text-[10px] font-mono-tabular text-[#dce2eb]">
      {value}
    </span>
  </div>
);

const VitalMini: React.FC<{
  label: string;
  value: number;
  fillClass: string;
}> = ({ label, value, fillClass }) => (
  <div className="flex items-center gap-1">
    <span className="text-[9px] font-mono-tabular text-[#8e9aad]">{label}</span>
    <div className="flex-1 h-1.5 bg-[#0b0e13] rounded-sm overflow-hidden border border-[#27303e]">
      <div className={`h-full ${fillClass}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const HudButton: React.FC<{
  label: string;
  title: string;
  testId?: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, title, testId, onClick, children }) => (
  <button
    type="button"
    tabIndex={-1}
    aria-label={label}
    title={title}
    data-testid={testId}
    onClick={(e) => {
      e.currentTarget.blur();
      onClick();
    }}
    className="w-11 h-11 flex items-center justify-center bg-[rgba(14,18,24,0.9)] hover:bg-[#1e2632] text-[#e8ecf2] border border-[#343e4d] rounded-lg shadow-[0_3px_0_rgba(8,10,14,0.65)] cursor-pointer transition-colors"
  >
    {children}
  </button>
);
