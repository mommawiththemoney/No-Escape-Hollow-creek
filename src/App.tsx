import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackpackModal, BackpackTab } from './components/BackpackModal';
import { ActiveContainerView, ContainerModal } from './components/ContainerModal';
import { DialogueModal } from './components/DialogueModal';
import { GameHud } from './components/GameHud';
import { GameOverModal } from './components/GameOverModal';
import { InteractionModal } from './components/InteractionModal';
import { MapModal } from './components/MapModal';
import { MobileControls } from './components/MobileControls';
import { PauseModal, SettingsModal } from './components/Modals';
import { ActivePuzzlePrompt, PuzzleModal } from './components/PuzzleModal';
import { TitleScreen } from './components/TitleScreen';
import { soundEngine } from './game/audio';
import { createInitialEnemies, performPlayerAttack, stepEnemies } from './game/enemies';
import { createBuildingInteriors, getInteriorColliders } from './game/interiors';
import { buildMissionsState, INTRO_DIALOGUE_LINES, NPCS } from './game/missions';
import {
  PLAYER_RADIUS,
  clampToWorldBounds,
  lerpCamera,
  stepPlayerMovement,
} from './game/physics';
import { HollowCreekRenderer } from './game/renderer';
import {
  loadPhase1Save,
  loadSettings,
  saveSettings,
  writePhase1Save,
} from './game/storage';
import {
  CRAFTING_RECIPES,
  ITEM_DEFS,
  addItemToInventory,
  consumeInventoryItem,
  craftItem,
  createInitialSurvivalStats,
  formatGameClock,
  getItemCount,
  getMaxSlots,
  removeItemFromInventory,
  stepSurvivalStats,
} from './game/survival';
import {
  ActivePromptTarget,
  BuildingInterior,
  EnemyState,
  GameScreenState,
  GameSettings,
  Interactable,
  InventorySlot,
  ItemId,
  JournalEntry,
  MissionState,
  MissionToast,
  MovementStance,
  NpcDialogueLine,
  Phase1SaveData,
  PlayerState,
  SurvivalStats,
  WeatherKind,
} from './game/types';
import {
  FOREST_HATCH_PUZZLE,
  PLAYER_SPAWN,
  WORLD_HEIGHT,
  WORLD_INTERACTABLES,
  WORLD_PICKUPS,
  WORLD_PROPS,
  WORLD_WIDTH,
  buildWorldColliders,
  createTileGrid,
  getDistrictAt,
} from './game/worldData';

const WEATHERS: WeatherKind[] = ['mist', 'rain', 'fog'];

function createInitialPlayer(save?: Phase1SaveData | null): PlayerState {
  return {
    x: save ? save.playerX : PLAYER_SPAWN.x,
    y: save ? save.playerY : PLAYER_SPAWN.y,
    vx: 0,
    vy: 0,
    radius: PLAYER_RADIUS,
    facingAngle: save ? save.facingAngle : PLAYER_SPAWN.facingAngle,
    stance: 'idle',
    gaitPhase: 0,
    idleTime: 0,
    interactAnimTimer: 0,
  };
}

function hydrateInteriors(
  save?: Phase1SaveData | null
): Record<string, BuildingInterior> {
  const map = createBuildingInteriors();
  if (!save) return map;
  const opened = new Set(save.openedContainerIds ?? []);
  const unlocked = new Set(save.unlockedDoorIds ?? []);
  const solved = new Set(save.solvedPuzzleIds ?? []);
  for (const interior of Object.values(map)) {
    for (const c of interior.containers) {
      if (opened.has(c.id)) c.searched = true;
    }
    for (const d of interior.doors) {
      if (unlocked.has(d.id)) {
        d.locked = false;
      }
    }
    for (const p of interior.puzzles) {
      if (solved.has(p.id)) p.solved = true;
    }
  }
  return map;
}

export default function App() {
  const initialSave = useMemo(() => loadPhase1Save(), []);
  const initialAutostart = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  }, []);

  const [screenState, setScreenState] = useState<GameScreenState>(
    initialAutostart ? 'playing' : 'title'
  );
  const [gameOverOutcome, setGameOverOutcome] = useState<'defeat' | 'victory'>('defeat');
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [backpackTab, setBackpackTab] = useState<BackpackTab>('inventory');
  const [packFeedback, setPackFeedback] = useState<string | null>(null);
  const [saveData, setSaveData] = useState<Phase1SaveData | null>(initialSave);
  const [activeClue, setActiveClue] = useState<Interactable | null>(null);
  const [activeContainer, setActiveContainer] = useState<ActiveContainerView | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<ActivePuzzlePrompt | null>(null);
  const [dialogueState, setDialogueState] = useState<{
    lines: NpcDialogueLine[];
    index: number;
    npcName?: string;
  } | null>(null);

  // Discrete HUD snapshots
  const [districtName, setDistrictName] = useState(() =>
    getDistrictAt(PLAYER_SPAWN.x, PLAYER_SPAWN.y)
  );
  const [interiorName, setInteriorName] = useState<string | null>(null);
  const [stance, setStance] = useState<MovementStance>('idle');
  const [statsSnap, setStatsSnap] = useState<SurvivalStats>(() =>
    createInitialSurvivalStats()
  );
  const [inventorySnap, setInventorySnap] = useState<InventorySlot[]>([]);
  const [journalSnap, setJournalSnap] = useState<JournalEntry[]>([]);
  const [missionsSnap, setMissionsSnap] = useState<MissionState[]>(() =>
    buildMissionsState(
      {
        stats: createInitialSurvivalStats(),
        inventory: [],
        discoveredIds: new Set(),
        openedContainerIds: new Set(),
        solvedPuzzleIds: new Set(),
        missionFlags: new Set(),
        visitedDistricts: new Set(['Abandoned Bus Station']),
        currentInteriorId: null,
      },
      new Set()
    ).missions
  );
  const [missionToast, setMissionToast] = useState<MissionToast | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [clockSnap, setClockSnap] = useState(194); // 03:14 AM
  const [weatherSnap, setWeatherSnap] = useState<WeatherKind>('mist');
  const [activePrompt, setActivePrompt] = useState<ActivePromptTarget | null>(null);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [mobileSneak, setMobileSneak] = useState(false);
  const [isTouchViewport, setIsTouchViewport] = useState(false);

  // Simulation refs (owned by rAF loop)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<HollowCreekRenderer | null>(null);
  const tilesRef = useRef(createTileGrid());
  const collidersRef = useRef(buildWorldColliders());
  const interiorsRef = useRef<Record<string, BuildingInterior>>(createBuildingInteriors());
  const currentInteriorRef = useRef<BuildingInterior | null>(null);
  const enemiesRef = useRef<EnemyState[]>(createInitialEnemies());

  const playerRef = useRef<PlayerState>(createInitialPlayer(null));
  const cameraRef = useRef({ x: PLAYER_SPAWN.x, y: PLAYER_SPAWN.y });
  const statsRef = useRef<SurvivalStats>(createInitialSurvivalStats());
  const inventoryRef = useRef<InventorySlot[]>([]);
  const journalRef = useRef<JournalEntry[]>([]);
  const discoveredRef = useRef<Set<string>>(new Set());
  const collectedPickupsRef = useRef<Set<string>>(new Set());
  const hiddenPropsRef = useRef<Set<string>>(new Set());
  const openedContainerIdsRef = useRef<Set<string>>(new Set());
  const unlockedDoorIdsRef = useRef<Set<string>>(new Set());
  const solvedPuzzleIdsRef = useRef<Set<string>>(new Set());
  const completedMissionIdsRef = useRef<Set<string>>(new Set());
  const missionFlagsRef = useRef<Set<string>>(new Set());
  const visitedDistrictsRef = useRef<Set<string>>(new Set(['Abandoned Bus Station']));

  const clockMinutesRef = useRef(194);
  const weatherRef = useRef<WeatherKind>('mist');
  const weatherTimerRef = useRef(55);
  const cameraShakeRef = useRef(0);
  const statusTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Input refs
  const keysPressedRef = useRef<Set<string>>(new Set());
  const joystickRef = useRef({ x: 0, y: 0 });
  const mobileRunRef = useRef(false);
  const mobileSneakRef = useRef(false);
  const prevStepHalfRef = useRef(0);

  // Mirrors for rAF & keyboard listeners
  const screenStateRef = useRef(screenState);
  const settingsRef = useRef(settings);
  const modalOpenRef = useRef(false);
  const activeClueRef = useRef(activeClue);
  const activeContainerRef = useRef(activeContainer);
  const activePuzzleRef = useRef(activePuzzle);
  const dialogueRef = useRef(dialogueState);
  const backpackOpenRef = useRef(backpackOpen);
  const mapOpenRef = useRef(mapOpen);
  const settingsOpenRef = useRef(settingsOpen);
  const activePromptRef = useRef<ActivePromptTarget | null>(null);

  const hudCacheRef = useRef({
    district: districtName,
    stance: 'idle' as MovementStance,
    promptKey: '' as string,
    statsSyncTimer: 0,
  });

  const modalFrozen =
    screenState !== 'playing' ||
    Boolean(activeClue) ||
    Boolean(activeContainer) ||
    Boolean(activePuzzle) ||
    Boolean(dialogueState) ||
    backpackOpen ||
    mapOpen ||
    settingsOpen;

  useEffect(() => {
    screenStateRef.current = screenState;
    document.body.dataset.state = screenState;
  }, [screenState]);

  useEffect(() => {
    modalOpenRef.current = modalFrozen;
    activeClueRef.current = activeClue;
    activeContainerRef.current = activeContainer;
    activePuzzleRef.current = activePuzzle;
    dialogueRef.current = dialogueState;
    backpackOpenRef.current = backpackOpen;
    mapOpenRef.current = mapOpen;
    settingsOpenRef.current = settingsOpen;
  }, [
    modalFrozen,
    activeClue,
    activeContainer,
    activePuzzle,
    dialogueState,
    backpackOpen,
    mapOpen,
    settingsOpen,
  ]);

  useEffect(() => {
    settingsRef.current = settings;
    soundEngine.updateSettings(settings);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    const checkTouch = () => {
      const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
      const touchPoints = navigator.maxTouchPoints > 0;
      const narrow = window.innerWidth < 820;
      setIsTouchViewport(coarse || touchPoints || narrow);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const showBanner = useCallback((msg: string) => {
    setStatusBanner(msg);
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    statusTimerRef.current = window.setTimeout(() => {
      setStatusBanner(null);
    }, 3200);
  }, []);

  const pushJournalEntry = useCallback(
    (id: string, title: string, source: string, district: string, lines: string[]) => {
      if (journalRef.current.some((e) => e.id === id)) return;
      const entry: JournalEntry = {
        id,
        title,
        source,
        district,
        timestamp: formatGameClock(clockMinutesRef.current),
        lines,
      };
      journalRef.current = [...journalRef.current, entry];
      setJournalSnap(journalRef.current);
    },
    []
  );

  const syncInventoryAndStats = useCallback(() => {
    // Auto-equip crowbar if carried
    if (getItemCount(inventoryRef.current, 'crowbar') > 0) {
      statsRef.current = { ...statsRef.current, equippedWeapon: 'crowbar' };
    } else if (statsRef.current.equippedWeapon === 'crowbar') {
      statsRef.current = { ...statsRef.current, equippedWeapon: 'none' };
    }
    setInventorySnap([...inventoryRef.current]);
    setStatsSnap({ ...statsRef.current });
  }, []);

  const evaluateMissions = useCallback(() => {
    const { missions, newlyCompleted } = buildMissionsState(
      {
        stats: statsRef.current,
        inventory: inventoryRef.current,
        discoveredIds: discoveredRef.current,
        openedContainerIds: openedContainerIdsRef.current,
        solvedPuzzleIds: solvedPuzzleIdsRef.current,
        missionFlags: missionFlagsRef.current,
        visitedDistricts: visitedDistrictsRef.current,
        currentInteriorId: currentInteriorRef.current?.id ?? null,
      },
      completedMissionIdsRef.current
    );

    if (newlyCompleted.length > 0) {
      for (const m of newlyCompleted) {
        completedMissionIdsRef.current.add(m.id);
        if (m.id === 'm1_awakening') {
          statsRef.current = {
            ...statsRef.current,
            maxStamina: statsRef.current.maxStamina + 25,
            stamina: statsRef.current.maxStamina + 25,
          };
          inventoryRef.current = addItemToInventory(
            inventoryRef.current,
            'battery',
            1,
            getMaxSlots(statsRef.current.hasBackpack)
          ).inventory;
        } else if (m.id === 'm2_shelter') {
          statsRef.current = {
            ...statsRef.current,
            maxHp: statsRef.current.maxHp + 15,
            hp: Math.min(statsRef.current.maxHp + 15, statsRef.current.hp + 25),
          };
          inventoryRef.current = addItemToInventory(
            inventoryRef.current,
            'wood',
            1,
            getMaxSlots(statsRef.current.hasBackpack)
          ).inventory;
        } else if (m.id === 'm3_signal') {
          statsRef.current = {
            ...statsRef.current,
            maxBattery: statsRef.current.maxBattery + 20,
            battery: statsRef.current.maxBattery + 20,
          };
          inventoryRef.current = addItemToInventory(
            inventoryRef.current,
            'metal_scrap',
            1,
            getMaxSlots(statsRef.current.hasBackpack)
          ).inventory;
        }
        soundEngine.playMissionChime();
        setMissionToast({
          id: m.id,
          title: m.title,
          rewardText: m.rewardText,
          expiresAt: Date.now() + 4600,
        });
        if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => {
          setMissionToast(null);
        }, 4600);
      }
      syncInventoryAndStats();
    }

    setMissionsSnap(missions);
    document.body.dataset.missions = String(completedMissionIdsRef.current.size);
  }, [syncInventoryAndStats]);

  const persistProgress = useCallback(() => {
    const p = playerRef.current;
    const payload: Phase1SaveData = {
      version: 2,
      savedAt: new Date().toISOString(),
      playerX: Math.round(p.x),
      playerY: Math.round(p.y),
      facingAngle: Number(p.facingAngle.toFixed(3)),
      currentInteriorId: currentInteriorRef.current?.id ?? null,
      discoveredIds: Array.from(discoveredRef.current),
      collectedPickupIds: Array.from(collectedPickupsRef.current),
      openedContainerIds: Array.from(openedContainerIdsRef.current),
      unlockedDoorIds: Array.from(unlockedDoorIdsRef.current),
      solvedPuzzleIds: Array.from(solvedPuzzleIdsRef.current),
      completedMissionIds: Array.from(completedMissionIdsRef.current),
      missionFlags: Array.from(missionFlagsRef.current),
      stats: { ...statsRef.current, hiddenInSpotId: null },
      inventory: inventoryRef.current.map((s) => ({ ...s })),
      journal: journalRef.current.map((j) => ({ ...j })),
      clockMinutes: Math.round(clockMinutesRef.current),
      weather: weatherRef.current,
    };
    writePhase1Save(payload);
    setSaveData(payload);
  }, []);

  const clearInputs = useCallback(() => {
    keysPressedRef.current.clear();
    joystickRef.current = { x: 0, y: 0 };
    mobileRunRef.current = false;
    mobileSneakRef.current = false;
    setMobileSneak(false);
  }, []);

  const enterPlaying = useCallback(
    (fromSave: Phase1SaveData | null, showIntro: boolean) => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      clearInputs();

      const nextInteriors = hydrateInteriors(fromSave);
      interiorsRef.current = nextInteriors;
      currentInteriorRef.current =
        fromSave?.currentInteriorId && nextInteriors[fromSave.currentInteriorId]
          ? nextInteriors[fromSave.currentInteriorId]
          : null;

      const nextPlayer = createInitialPlayer(fromSave);
      playerRef.current = nextPlayer;
      cameraRef.current = { x: nextPlayer.x, y: nextPlayer.y };
      enemiesRef.current = createInitialEnemies();

      statsRef.current = fromSave?.stats
        ? { ...fromSave.stats, hiddenInSpotId: null }
        : createInitialSurvivalStats();
      inventoryRef.current = fromSave?.inventory
        ? fromSave.inventory.map((s) => ({ ...s }))
        : [];
      journalRef.current = fromSave?.journal
        ? fromSave.journal.map((j) => ({ ...j }))
        : [];

      discoveredRef.current = new Set(fromSave?.discoveredIds ?? []);
      collectedPickupsRef.current = new Set(fromSave?.collectedPickupIds ?? []);
      hiddenPropsRef.current = new Set();
      for (const pickup of WORLD_PICKUPS) {
        if (collectedPickupsRef.current.has(pickup.id) && pickup.propId) {
          hiddenPropsRef.current.add(pickup.propId);
        }
      }
      openedContainerIdsRef.current = new Set(fromSave?.openedContainerIds ?? []);
      unlockedDoorIdsRef.current = new Set(fromSave?.unlockedDoorIds ?? []);
      solvedPuzzleIdsRef.current = new Set(fromSave?.solvedPuzzleIds ?? []);
      completedMissionIdsRef.current = new Set(fromSave?.completedMissionIds ?? []);
      missionFlagsRef.current = new Set(fromSave?.missionFlags ?? []);
      visitedDistrictsRef.current = new Set([
        'Abandoned Bus Station',
        getDistrictAt(nextPlayer.x, nextPlayer.y),
      ]);

      clockMinutesRef.current = fromSave?.clockMinutes ?? 194;
      weatherRef.current = fromSave?.weather ?? 'mist';
      weatherTimerRef.current = 55;
      cameraShakeRef.current = 0;

      setDiscoveredCount(discoveredRef.current.size);
      setClockSnap(clockMinutesRef.current);
      setWeatherSnap(weatherRef.current);
      setInteriorName(currentInteriorRef.current?.name ?? null);
      const d = getDistrictAt(nextPlayer.x, nextPlayer.y);
      hudCacheRef.current.district = d;
      setDistrictName(d);

      setActiveClue(null);
      setActiveContainer(null);
      setActivePuzzle(null);
      setBackpackOpen(false);
      setMapOpen(false);
      setSettingsOpen(false);
      setDialogueState(
        showIntro ? { lines: INTRO_DIALOGUE_LINES, index: 0 } : null
      );

      syncInventoryAndStats();
      setJournalSnap(journalRef.current);
      evaluateMissions();

      document.body.dataset.clues = String(discoveredRef.current.size);
      document.body.dataset.interior = currentInteriorRef.current?.id ?? '';

      soundEngine.unlockAndStartAmbient();
      soundEngine.resumeAmbient();
      setScreenState('playing');
      canvasRef.current?.focus();
    },
    [clearInputs, evaluateMissions, syncInventoryAndStats]
  );

  const handleNewGame = useCallback(() => {
    soundEngine.playUiClick();
    enterPlaying(null, !initialAutostart);
  }, [enterPlaying, initialAutostart]);

  const handleContinue = useCallback(() => {
    soundEngine.playUiClick();
    enterPlaying(saveData, false);
  }, [enterPlaying, saveData]);

  const grantItems = useCallback(
    (items: Array<{ itemId: ItemId; qty: number }>): boolean => {
      const maxSlots = getMaxSlots(statsRef.current.hasBackpack);
      let working = inventoryRef.current;
      let anyAdded = false;
      for (const it of items) {
        const res = addItemToInventory(working, it.itemId, it.qty, maxSlots);
        working = res.inventory;
        if (res.added > 0) anyAdded = true;
      }
      inventoryRef.current = working;
      syncInventoryAndStats();
      return anyAdded;
    },
    [syncInventoryAndStats]
  );

  const handleToggleFlashlight = useCallback(() => {
    if (screenStateRef.current !== 'playing') return;
    if (!statsRef.current.hasFlashlight) {
      showBanner('Find your Transit Flashlight beside Bus #14 first.');
      return;
    }
    if (!statsRef.current.flashlightOn && statsRef.current.battery <= 0) {
      showBanner('Flashlight battery depleted. Load an AA Battery Cell in [Tab].');
      return;
    }
    soundEngine.playFlashlightClick();
    statsRef.current = {
      ...statsRef.current,
      flashlightOn: !statsRef.current.flashlightOn,
    };
    setStatsSnap({ ...statsRef.current });
  }, [showBanner]);

  const handleAttack = useCallback(() => {
    if (screenStateRef.current !== 'playing' || modalOpenRef.current) return;
    if (statsRef.current.hiddenInSpotId !== null) return;
    if (statsRef.current.attackCooldown > 0) return;

    const res = performPlayerAttack(
      playerRef.current,
      statsRef.current,
      enemiesRef.current
    );
    statsRef.current = res.stats;
    if (!currentInteriorRef.current) {
      enemiesRef.current = res.enemies;
    }
    if (res.hitCount > 0) {
      soundEngine.playCombatHit(false);
      cameraShakeRef.current = 0.3;
      if (res.koCount > 0) {
        showBanner('Threat incapacitated!');
      }
    } else {
      soundEngine.playInteractCue('wood');
    }
    setStatsSnap({ ...statsRef.current });
  }, [showBanner]);

  const triggerInteract = useCallback(() => {
    if (screenStateRef.current !== 'playing') return;
    if (settingsOpenRef.current || mapOpenRef.current || backpackOpenRef.current) return;

    if (activeClueRef.current) {
      soundEngine.playUiClick();
      setActiveClue(null);
      canvasRef.current?.focus();
      return;
    }

    if (dialogueRef.current) {
      const dlg = dialogueRef.current;
      const cur = dlg.lines[dlg.index];
      if (!cur?.choices || cur.choices.length === 0) {
        soundEngine.playUiClick();
        if (dlg.index < dlg.lines.length - 1) {
          setDialogueState({ ...dlg, index: dlg.index + 1 });
        } else {
          setDialogueState(null);
          canvasRef.current?.focus();
        }
      }
      return;
    }

    if (activeContainerRef.current) {
      const c = activeContainerRef.current;
      if (!c.alreadySearched && c.items.length > 0) {
        // Trigger take all via Interact key
        const interior = currentInteriorRef.current;
        const containerObj = interior?.containers.find((x) => x.id === c.id);
        grantItems(c.items);
        if (containerObj) containerObj.searched = true;
        openedContainerIdsRef.current.add(c.id);
        if (c.noteLines && c.noteLines.length > 0) {
          pushJournalEntry(
            `note_${c.id}`,
            c.noteTitle ?? c.title,
            c.title,
            interior?.district ?? districtName,
            c.noteLines
          );
        }
        soundEngine.playInteractCue('paper');
        evaluateMissions();
        persistProgress();
        showBanner(`Collected items from ${c.title}.`);
      } else {
        soundEngine.playUiClick();
      }
      setActiveContainer(null);
      canvasRef.current?.focus();
      return;
    }

    if (activePuzzleRef.current) return;

    const target = activePromptRef.current;
    if (!target) return;

    clearInputs();
    playerRef.current.interactAnimTimer = 0.25;

    if (target.kind === 'leave_hide') {
      statsRef.current = { ...statsRef.current, hiddenInSpotId: null };
      soundEngine.playInteractCue('wood');
      setStatsSnap({ ...statsRef.current });
      return;
    }

    if (target.kind === 'hide_spot' || target.kind === 'bush_hide') {
      statsRef.current = {
        ...statsRef.current,
        hiddenInSpotId: target.id,
        flashlightOn: false,
      };
      soundEngine.playInteractCue('wood');
      setStatsSnap({ ...statsRef.current });
      return;
    }

    if (target.kind === 'pickup') {
      const pickup = WORLD_PICKUPS.find((p) => p.id === target.id);
      if (!pickup || collectedPickupsRef.current.has(pickup.id)) return;
      if (pickup.unlocks === 'backpack') {
        statsRef.current = { ...statsRef.current, hasBackpack: true };
      } else if (pickup.unlocks === 'flashlight') {
        statsRef.current = {
          ...statsRef.current,
          hasFlashlight: true,
          flashlightOn: true,
        };
      }
      grantItems(pickup.items);
      collectedPickupsRef.current.add(pickup.id);
      if (pickup.propId) hiddenPropsRef.current.add(pickup.propId);
      soundEngine.playInteractCue('paper');
      showBanner(pickup.message);
      evaluateMissions();
      persistProgress();
      return;
    }

    if (target.kind === 'building_enter') {
      const interior = interiorsRef.current[target.id];
      if (!interior) return;
      currentInteriorRef.current = interior;
      playerRef.current = {
        ...playerRef.current,
        x: interior.spawnX,
        y: interior.spawnY,
        vx: 0,
        vy: 0,
        facingAngle: -Math.PI / 2,
      };
      cameraRef.current = { x: interior.spawnX, y: interior.spawnY };
      missionFlagsRef.current.add(`entered_${interior.id}`);
      setInteriorName(interior.name);
      document.body.dataset.interior = interior.id;
      soundEngine.playInteractCue('wood');
      evaluateMissions();
      persistProgress();
      return;
    }

    if (target.kind === 'building_exit') {
      const interior = currentInteriorRef.current;
      if (!interior) return;
      currentInteriorRef.current = null;
      playerRef.current = {
        ...playerRef.current,
        x: interior.exteriorReturnPos.x,
        y: interior.exteriorReturnPos.y,
        vx: 0,
        vy: 0,
        facingAngle: interior.exteriorReturnPos.facingAngle,
      };
      cameraRef.current = {
        x: interior.exteriorReturnPos.x,
        y: interior.exteriorReturnPos.y,
      };
      setInteriorName(null);
      document.body.dataset.interior = '';
      soundEngine.playInteractCue('wood');
      persistProgress();
      return;
    }

    if (target.kind === 'interior_door') {
      const interior = currentInteriorRef.current;
      const door = interior?.doors.find((d) => d.id === target.id);
      if (!interior || !door) return;
      if (door.locked) {
        if (door.requiredKeyId) {
          if (getItemCount(inventoryRef.current, door.requiredKeyId) > 0) {
            door.locked = false;
            door.open = true;
            unlockedDoorIdsRef.current.add(door.id);
            soundEngine.playInteractCue('metal');
            showBanner(`Unlocked with ${ITEM_DEFS[door.requiredKeyId].name}.`);
            persistProgress();
          } else {
            soundEngine.playInteractCue('metal');
            showBanner(`Locked — Requires ${ITEM_DEFS[door.requiredKeyId].name}.`);
          }
        } else if (door.requiredPuzzleId) {
          const puz = interior.puzzles.find((p) => p.id === door.requiredPuzzleId);
          if (puz && !puz.solved) {
            setActivePuzzle({
              id: puz.id,
              title: puz.title,
              subtitle: puz.subtitle,
              hint: puz.hint,
              code: puz.code,
              hasFuse: false,
            });
          }
        }
      } else {
        door.open = !door.open;
        soundEngine.playInteractCue('wood');
      }
      return;
    }

    if (target.kind === 'container') {
      const interior = currentInteriorRef.current;
      const c = interior?.containers.find((x) => x.id === target.id);
      if (!c) return;
      soundEngine.playInteractCue('wood');
      setActiveContainer({
        id: c.id,
        title: c.title,
        items: c.loot,
        noteTitle: c.noteTitle,
        noteLines: c.noteLines,
        alreadySearched: c.searched,
      });
      return;
    }

    if (target.kind === 'puzzle') {
      if (target.id === FOREST_HATCH_PUZZLE.id) {
        if (solvedPuzzleIdsRef.current.has(FOREST_HATCH_PUZZLE.id)) return;
        soundEngine.playInteractCue('metal');
        setActivePuzzle({
          id: FOREST_HATCH_PUZZLE.id,
          title: FOREST_HATCH_PUZZLE.title,
          subtitle: FOREST_HATCH_PUZZLE.subtitle,
          hint: FOREST_HATCH_PUZZLE.hint,
          code: FOREST_HATCH_PUZZLE.code,
          requiresFuse: true,
          hasFuse: getItemCount(inventoryRef.current, 'fuse') > 0,
        });
        return;
      }
      const interior = currentInteriorRef.current;
      const puz = interior?.puzzles.find((p) => p.id === target.id);
      if (!puz || puz.solved) return;
      soundEngine.playInteractCue('metal');
      setActivePuzzle({
        id: puz.id,
        title: puz.title,
        subtitle: puz.subtitle,
        hint: puz.hint,
        code: puz.code,
        hasFuse: false,
      });
      return;
    }

    if (target.kind === 'npc') {
      const npc = NPCS.find((n) => n.id === target.id);
      if (!npc) return;
      soundEngine.playUiClick();
      setDialogueState({ lines: npc.lines, index: 0, npcName: npc.name });
      return;
    }

    if (target.kind === 'interactable') {
      const clue = WORLD_INTERACTABLES.find((i) => i.id === target.id);
      if (!clue) return;
      soundEngine.playInteractCue(clue.soundCue);

      const firstDiscovery = !discoveredRef.current.has(clue.id);
      if (firstDiscovery) {
        discoveredRef.current.add(clue.id);
        setDiscoveredCount(discoveredRef.current.size);
        document.body.dataset.clues = String(discoveredRef.current.size);

        if (clue.grantsItem) {
          grantItems([{ itemId: clue.grantsItem, qty: clue.grantsQty ?? 1 }]);
        }
        if (clue.lootItems && clue.lootItems.length > 0) {
          grantItems(clue.lootItems);
          showBanner(
            `Found ${clue.lootItems
              .map((l) => `${ITEM_DEFS[l.itemId].name} x${l.qty}`)
              .join(', ')}`
          );
        }
        pushJournalEntry(clue.id, clue.title, clue.subtitle, clue.district, clue.body);
      }

      setActiveClue(clue);
      evaluateMissions();
      persistProgress();
    }
  }, [
    clearInputs,
    districtName,
    evaluateMissions,
    grantItems,
    persistProgress,
    pushJournalEntry,
    showBanner,
  ]);

  const togglePause = useCallback(() => {
    if (settingsOpenRef.current) {
      setSettingsOpen(false);
      return;
    }
    if (mapOpenRef.current) {
      setMapOpen(false);
      return;
    }
    if (backpackOpenRef.current) {
      setBackpackOpen(false);
      return;
    }
    if (activePuzzleRef.current) {
      setActivePuzzle(null);
      return;
    }
    if (activeContainerRef.current) {
      setActiveContainer(null);
      return;
    }
    if (dialogueRef.current) {
      setDialogueState(null);
      return;
    }
    if (activeClueRef.current) {
      setActiveClue(null);
      return;
    }
    if (screenStateRef.current === 'playing') {
      clearInputs();
      persistProgress();
      soundEngine.pauseAmbient();
      setScreenState('paused');
    } else if (screenStateRef.current === 'paused') {
      clearInputs();
      soundEngine.resumeAmbient();
      setScreenState('playing');
      canvasRef.current?.focus();
    }
  }, [clearInputs, persistProgress]);

  const openBackpackTab = useCallback(
    (tab: BackpackTab) => {
      if (screenStateRef.current !== 'playing' || settingsOpenRef.current) return;
      soundEngine.playUiClick();
      clearInputs();
      setPackFeedback(null);
      if (backpackOpenRef.current && backpackTab === tab) {
        setBackpackOpen(false);
        canvasRef.current?.focus();
      } else {
        setMapOpen(false);
        setBackpackTab(tab);
        setBackpackOpen(true);
      }
    },
    [backpackTab, clearInputs]
  );

  const toggleMap = useCallback(() => {
    if (screenStateRef.current !== 'playing' || settingsOpenRef.current) return;
    soundEngine.playUiClick();
    clearInputs();
    setBackpackOpen(false);
    setMapOpen((prev) => !prev);
  }, [clearInputs]);

  // Global keyboard bindings
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;

      if (screenStateRef.current === 'title') {
        if (!settingsOpenRef.current && (code === 'Enter' || code === 'Space')) {
          e.preventDefault();
          handleNewGame();
        } else if (code === 'Escape' && settingsOpenRef.current) {
          setSettingsOpen(false);
        }
        return;
      }

      if (code === 'Escape' || code === 'KeyP') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (code === 'Tab') {
        e.preventDefault();
        if (!e.repeat) openBackpackTab('inventory');
        return;
      }

      if (code === 'KeyJ') {
        e.preventDefault();
        if (!e.repeat) openBackpackTab('journal');
        return;
      }

      if (code === 'KeyM') {
        e.preventDefault();
        if (!e.repeat) toggleMap();
        return;
      }

      if (code === 'KeyF' && !modalOpenRef.current && !e.repeat) {
        e.preventDefault();
        handleToggleFlashlight();
        return;
      }

      if (code === 'Space' && !modalOpenRef.current && !e.repeat) {
        e.preventDefault();
        handleAttack();
        return;
      }

      if (
        code === 'KeyE' ||
        ((activeClueRef.current || dialogueRef.current || activeContainerRef.current) &&
          code === 'Enter')
      ) {
        if (!e.repeat) {
          e.preventDefault();
          triggerInteract();
        }
        return;
      }

      if (!modalOpenRef.current) {
        if (
          code === 'ArrowUp' ||
          code === 'ArrowDown' ||
          code === 'ArrowLeft' ||
          code === 'ArrowRight' ||
          code === 'Space'
        ) {
          e.preventDefault();
        }
        keysPressedRef.current.add(code);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.code);
    };

    const onBlurOrHide = () => {
      keysPressedRef.current.clear();
      mobileRunRef.current = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlurOrHide);
    document.addEventListener('visibilitychange', onBlurOrHide);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlurOrHide);
      document.removeEventListener('visibilitychange', onBlurOrHide);
    };
  }, [
    handleAttack,
    handleNewGame,
    handleToggleFlashlight,
    openBackpackTab,
    toggleMap,
    togglePause,
    triggerInteract,
  ]);

  // 60 FPS Simulation & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    if (!rendererRef.current) {
      rendererRef.current = new HollowCreekRenderer();
    }

    let viewW = container.clientWidth || window.innerWidth;
    let viewH = container.clientHeight || window.innerHeight;

    let needsFrozenRender = true;
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      viewW = Math.max(320, Math.floor(rect.width));
      viewH = Math.max(240, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      needsFrozenRender = true;
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(container);

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let slowRenderer = false;
    let frameCounter = 0;

    const computePrompt = (
      px: number,
      py: number,
      interior: BuildingInterior | null
    ): ActivePromptTarget | null => {
      if (statsRef.current.hiddenInSpotId) {
        return {
          kind: 'leave_hide',
          id: statsRef.current.hiddenInSpotId,
          verb: 'LEAVE',
          label: 'Hiding Spot',
          x: px,
          y: py,
        };
      }

      if (interior) {
        // Exit door
        if (
          Math.hypot(px - interior.exitDoor.x, py - interior.exitDoor.y) <=
          interior.exitDoor.radius
        ) {
          return {
            kind: 'building_exit',
            id: interior.id,
            verb: 'EXIT',
            label: 'Return to Hollow Creek',
            x: interior.exitDoor.x,
            y: interior.exitDoor.y,
          };
        }

        // Gather all in-range interior candidates and pick the closest (with small boost to unsolved/unsearched targets)
        let bestTarget: ActivePromptTarget | null = null;
        let bestScore = Infinity;

        for (const npc of NPCS) {
          if (npc.location === interior.id) {
            const d = Math.hypot(px - npc.x, py - npc.y);
            if (d <= npc.radius && d < bestScore) {
              bestScore = d;
              bestTarget = {
                kind: 'npc',
                id: npc.id,
                verb: 'TALK',
                label: npc.name,
                x: npc.x,
                y: npc.y,
              };
            }
          }
        }

        for (const puz of interior.puzzles) {
          if (!puz.solved) {
            const d = Math.hypot(px - puz.x, py - puz.y);
            if (d <= puz.radius && d < bestScore) {
              bestScore = d;
              bestTarget = {
                kind: 'puzzle',
                id: puz.id,
                verb: 'UNLOCK',
                label: puz.title,
                x: puz.x,
                y: puz.y,
              };
            }
          }
        }

        for (const door of interior.doors) {
          const cx = door.x + door.w / 2;
          const cy = door.y + door.h / 2;
          const d = Math.hypot(px - cx, py - cy);
          const score = d + (door.open ? 48 : 0);
          if (d <= 64 && score < bestScore) {
            bestScore = score;
            bestTarget = {
              kind: 'interior_door',
              id: door.id,
              verb: door.locked ? 'UNLOCK' : door.open ? 'INTERACT' : 'OPEN',
              label: door.label,
              x: cx,
              y: cy,
            };
          }
        }

        for (const h of interior.hideSpots) {
          const d = Math.hypot(px - h.x, py - h.y);
          if (d <= h.radius && d < bestScore) {
            bestScore = d;
            bestTarget = {
              kind: 'hide_spot',
              id: h.id,
              verb: 'HIDE',
              label: h.label,
              x: h.x,
              y: h.y,
            };
          }
        }

        for (const c of interior.containers) {
          const d = Math.hypot(px - c.x, py - c.y);
          const searched = openedContainerIdsRef.current.has(c.id);
          const score = d + (searched ? 24 : 0);
          if (d <= c.radius && score < bestScore) {
            bestScore = score;
            bestTarget = {
              kind: 'container',
              id: c.id,
              verb: c.verb,
              label: c.title,
              x: c.x,
              y: c.y,
            };
          }
        }

        return bestTarget;
      }

      // Exterior priority: Pickups -> Hatch Puzzle -> Building Entrances -> NPCs -> Interactables -> Bush Hide
      for (const pickup of WORLD_PICKUPS) {
        if (collectedPickupsRef.current.has(pickup.id)) continue;
        if (Math.hypot(px - pickup.x, py - pickup.y) <= pickup.radius) {
          return {
            kind: 'pickup',
            id: pickup.id,
            verb: pickup.verb,
            label: pickup.title,
            x: pickup.x,
            y: pickup.y,
          };
        }
      }

      if (
        !solvedPuzzleIdsRef.current.has(FOREST_HATCH_PUZZLE.id) &&
        Math.hypot(px - FOREST_HATCH_PUZZLE.x, py - FOREST_HATCH_PUZZLE.y) <=
          FOREST_HATCH_PUZZLE.radius
      ) {
        return {
          kind: 'puzzle',
          id: FOREST_HATCH_PUZZLE.id,
          verb: 'UNLOCK',
          label: FOREST_HATCH_PUZZLE.title,
          x: FOREST_HATCH_PUZZLE.x,
          y: FOREST_HATCH_PUZZLE.y,
        };
      }

      for (const b of Object.values(interiorsRef.current)) {
        const ent = b.exteriorEntrance;
        if (Math.hypot(px - ent.x, py - ent.y) <= ent.radius) {
          return {
            kind: 'building_enter',
            id: b.id,
            verb: 'ENTER',
            label: ent.label,
            x: ent.x,
            y: ent.y,
          };
        }
      }

      for (const npc of NPCS) {
        if (npc.location === 'exterior' && Math.hypot(px - npc.x, py - npc.y) <= npc.radius) {
          return {
            kind: 'npc',
            id: npc.id,
            verb: 'TALK',
            label: npc.name,
            x: npc.x,
            y: npc.y,
          };
        }
      }

      let bestClue: Interactable | null = null;
      let bestDist = Infinity;
      for (const item of WORLD_INTERACTABLES) {
        const d = Math.hypot(px - item.x, py - item.y);
        if (d <= item.radius && d < bestDist) {
          bestDist = d;
          bestClue = item;
        }
      }
      if (bestClue) {
        return {
          kind: 'interactable',
          id: bestClue.id,
          verb: bestClue.actionVerb ?? 'INTERACT',
          label: bestClue.title,
          x: bestClue.x,
          y: bestClue.y,
        };
      }

      for (const prop of WORLD_PROPS) {
        if (prop.kind !== 'bush') continue;
        const bx = prop.x + prop.w / 2;
        const by = prop.y + prop.h / 2;
        if (Math.hypot(px - bx, py - by) <= 58) {
          return {
            kind: 'bush_hide',
            id: prop.id,
            verb: 'HIDE',
            label: 'Dense Bush',
            x: bx,
            y: by,
          };
        }
      }

      return null;
    };

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
      frameCounter++;

      const state = screenStateRef.current;
      const renderer = rendererRef.current!;
      const activeSettings = settingsRef.current;
      const frozen = modalOpenRef.current;

      if (!frozen) {
        elapsed += dt;
        needsFrozenRender = true;
        renderer.updateParticles(
          dt,
          activeSettings.graphicsQuality,
          weatherRef.current,
          viewW,
          viewH
        );
      }

      if (state === 'title' && !frozen) {
        const panX = PLAYER_SPAWN.x - 40 + Math.sin(elapsed * 0.22) * 110;
        const panY = PLAYER_SPAWN.y - 110 + Math.cos(elapsed * 0.16) * 45;
        cameraRef.current = lerpCamera(
          cameraRef.current.x,
          cameraRef.current.y,
          panX,
          panY,
          viewW,
          viewH,
          WORLD_WIDTH,
          WORLD_HEIGHT,
          dt
        );
      } else if (state === 'playing' && !frozen) {
        const interior = currentInteriorRef.current;
        const activeW = interior ? interior.width : WORLD_WIDTH;
        const activeH = interior ? interior.height : WORLD_HEIGHT;
        const activeColliders = interior
          ? getInteriorColliders(interior)
          : collidersRef.current;

        const keys = keysPressedRef.current;
        let ix = joystickRef.current.x;
        let iy = joystickRef.current.y;

        if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
        if (keys.has('KeyW') || keys.has('ArrowUp')) iy -= 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) iy += 1;

        const wantsRun =
          mobileRunRef.current ||
          keys.has('ShiftLeft') ||
          keys.has('ShiftRight');
        const runHeld = wantsRun && statsRef.current.stamina > 3;
        const sneakHeld =
          mobileSneakRef.current ||
          keys.has('ControlLeft') ||
          keys.has('ControlRight') ||
          keys.has('KeyC');

        const isHidden = statsRef.current.hiddenInSpotId !== null;
        let nextPlayer = isHidden
          ? { ...playerRef.current, vx: 0, vy: 0, stance: 'idle' as MovementStance }
          : stepPlayerMovement(
              playerRef.current,
              { x: ix, y: iy, run: runHeld, sneak: sneakHeld },
              activeColliders,
              activeW,
              activeH,
              dt,
              activeSettings.controlSensitivity
            );

        if (interior) {
          const clamped = clampToWorldBounds(
            nextPlayer.x,
            nextPlayer.y,
            nextPlayer.radius,
            interior.width,
            interior.height
          );
          nextPlayer = { ...nextPlayer, x: clamped.x, y: clamped.y };
        }

        if (nextPlayer.stance !== 'idle') {
          const halfStep = Math.floor(nextPlayer.gaitPhase / Math.PI);
          if (halfStep !== prevStepHalfRef.current) {
            prevStepHalfRef.current = halfStep;
            soundEngine.playFootstep(nextPlayer.stance);
          }
        }
        playerRef.current = nextPlayer;

        // Survival stats, clock & weather
        statsRef.current = stepSurvivalStats(
          statsRef.current,
          nextPlayer.stance,
          dt,
          !interior && weatherRef.current === 'rain'
        );

        // Day/night clock: ~1.5 game minutes per real second
        clockMinutesRef.current = (clockMinutesRef.current + dt * 1.5) % 1440;
        weatherTimerRef.current -= dt;
        if (weatherTimerRef.current <= 0) {
          weatherTimerRef.current = 45 + Math.random() * 35;
          const nextW = WEATHERS[(WEATHERS.indexOf(weatherRef.current) + 1) % WEATHERS.length];
          weatherRef.current = nextW;
          setWeatherSnap(nextW);
        }

        cameraShakeRef.current = Math.max(0, cameraShakeRef.current - dt * 1.6);

        // Enemies step when outdoors
        let dangerLevel = 0;
        if (!interior) {
          const eRes = stepEnemies(
            enemiesRef.current,
            nextPlayer,
            statsRef.current,
            collidersRef.current,
            dt
          );
          enemiesRef.current = eRes.enemies;
          if (eRes.playerDamage > 0) {
            statsRef.current = {
              ...statsRef.current,
              hp: Math.max(0, statsRef.current.hp - eRes.playerDamage),
              invulnTimer: 0.9,
            };
            cameraShakeRef.current = 0.7;
            soundEngine.playCombatHit(true);
            setStatsSnap({ ...statsRef.current });
          }
          if (eRes.mimicCueTriggered) {
            soundEngine.playInteractCue('whisper');
          }
          for (const e of eRes.enemies) {
            if (e.aiState === 'chase') dangerLevel = 1;
            else if (e.aiState === 'suspicious') dangerLevel = Math.max(dangerLevel, 0.5);
          }
        }
        soundEngine.updateAtmosphere(
          weatherRef.current,
          Boolean(interior),
          dangerLevel
        );

        if (statsRef.current.hp <= 0) {
          clearInputs();
          soundEngine.pauseAmbient();
          setGameOverOutcome('defeat');
          setScreenState('gameover');
        }

        // Camera follow
        cameraRef.current = interior
          ? { x: interior.width / 2, y: interior.height / 2 }
          : lerpCamera(
              cameraRef.current.x,
              cameraRef.current.y,
              nextPlayer.x,
              nextPlayer.y,
              viewW,
              viewH,
              WORLD_WIDTH,
              WORLD_HEIGHT,
              dt
            );

        document.body.dataset.playerX = String(Math.round(nextPlayer.x));
        document.body.dataset.playerY = String(Math.round(nextPlayer.y));

        // District tracking & mission eval when entering new districts
        if (!interior) {
          const nextDistrict = getDistrictAt(nextPlayer.x, nextPlayer.y);
          if (nextDistrict !== hudCacheRef.current.district) {
            hudCacheRef.current.district = nextDistrict;
            setDistrictName(nextDistrict);
            if (!visitedDistrictsRef.current.has(nextDistrict)) {
              visitedDistrictsRef.current.add(nextDistrict);
              evaluateMissions();
            }
          }
        }

        if (nextPlayer.stance !== hudCacheRef.current.stance) {
          hudCacheRef.current.stance = nextPlayer.stance;
          setStance(nextPlayer.stance);
        }

        // Compute nearest prompt
        const nextPrompt = computePrompt(nextPlayer.x, nextPlayer.y, interior);
        activePromptRef.current = nextPrompt;
        const pKey = nextPrompt
          ? `${nextPrompt.kind}:${nextPrompt.id}:${nextPrompt.verb}`
          : '';
        if (pKey !== hudCacheRef.current.promptKey) {
          hudCacheRef.current.promptKey = pKey;
          setActivePrompt(nextPrompt);
        }

        // Throttled 4Hz HUD vitals + clock sync
        hudCacheRef.current.statsSyncTimer += dt;
        if (hudCacheRef.current.statsSyncTimer >= 0.25) {
          hudCacheRef.current.statsSyncTimer = 0;
          setStatsSnap({ ...statsRef.current });
          setClockSnap(Math.floor(clockMinutesRef.current));
        }
      }

      const shouldSkipSlowIdleFrame =
        slowRenderer &&
        !needsFrozenRender &&
        state !== 'paused' &&
        (state === 'title' || playerRef.current.stance === 'idle') &&
        frameCounter % 3 !== 0;

      if ((!frozen && !shouldSkipSlowIdleFrame) || needsFrozenRender) {
        needsFrozenRender = false;
        const showPlayer = state !== 'title';
        const renderPlayer = showPlayer
          ? playerRef.current
          : { ...playerRef.current, x: -9999, y: -9999 };

        const t0 = performance.now();
        renderer.render(ctx, {
          viewW,
          viewH,
          camX: cameraRef.current.x,
          camY: cameraRef.current.y,
          time: elapsed,
          tiles: tilesRef.current,
          props: WORLD_PROPS,
          player: renderPlayer,
          stats: statsRef.current,
          interactables: WORLD_INTERACTABLES,
          npcs: NPCS,
          enemies: enemiesRef.current,
          activePrompt: state === 'playing' ? activePromptRef.current : null,
          discoveredIds: discoveredRef.current,
          hiddenPropIds: hiddenPropsRef.current,
          currentInterior: currentInteriorRef.current,
          allInteriors: Object.values(interiorsRef.current),
          clockMinutes: clockMinutesRef.current,
          weather: weatherRef.current,
          cameraShake: cameraShakeRef.current,
          quality: activeSettings.graphicsQuality,
        });
        const renderMs = performance.now() - t0;
        if (renderMs > 12) slowRenderer = true;
        else if (renderMs < 5) slowRenderer = false;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [clearInputs, evaluateMissions]);

  const handleUseItem = useCallback(
    (itemId: ItemId) => {
      const res = consumeInventoryItem(
        inventoryRef.current,
        statsRef.current,
        itemId
      );
      inventoryRef.current = res.inventory;
      statsRef.current = res.stats;
      if (itemId === 'bandage' || itemId === 'medkit') {
        missionFlagsRef.current.add('used_or_crafted_med');
      }
      soundEngine.playUiClick();
      if (res.message) setPackFeedback(res.message);
      syncInventoryAndStats();
      evaluateMissions();
      persistProgress();
    },
    [evaluateMissions, persistProgress, syncInventoryAndStats]
  );

  const handleDropItem = useCallback(
    (itemId: ItemId) => {
      inventoryRef.current = removeItemFromInventory(
        inventoryRef.current,
        itemId,
        1
      ).inventory;
      soundEngine.playUiClick();
      setPackFeedback(`Dropped 1x ${ITEM_DEFS[itemId].name}.`);
      syncInventoryAndStats();
      persistProgress();
    },
    [persistProgress, syncInventoryAndStats]
  );

  const handleCraft = useCallback(
    (recipeId: string) => {
      const recipe = CRAFTING_RECIPES.find((r) => r.id === recipeId);
      if (!recipe) return;
      const res = craftItem(
        inventoryRef.current,
        recipe,
        getMaxSlots(statsRef.current.hasBackpack)
      );
      inventoryRef.current = res.inventory;
      if (res.crafted && (recipe.resultId === 'bandage' || recipe.resultId === 'medkit')) {
        missionFlagsRef.current.add('used_or_crafted_med');
      }
      soundEngine.playInteractCue(res.crafted ? 'metal' : 'wood');
      setPackFeedback(res.message);
      syncInventoryAndStats();
      evaluateMissions();
      persistProgress();
    },
    [evaluateMissions, persistProgress, syncInventoryAndStats]
  );

  const handleDialogueAdvance = useCallback(
    (choiceIndex?: number) => {
      if (!dialogueState) return;
      soundEngine.playUiClick();
      const cur = dialogueState.lines[dialogueState.index];
      if (cur.choices && choiceIndex !== undefined) {
        const choice = cur.choices[choiceIndex];
        if (!choice) return;
        if (choice.rewardItem) {
          const flagKey = `reward_${dialogueState.npcName ?? 'npc'}_${choice.rewardItem.itemId}`;
          if (!missionFlagsRef.current.has(flagKey)) {
            missionFlagsRef.current.add(flagKey);
            grantItems([choice.rewardItem]);
            showBanner(
              `Received ${ITEM_DEFS[choice.rewardItem.itemId].name} x${choice.rewardItem.qty}`
            );
          }
        }
        if (choice.missionFlag) {
          missionFlagsRef.current.add(choice.missionFlag);
        }
        evaluateMissions();
        persistProgress();
        if (choice.nextIndex !== undefined) {
          setDialogueState({ ...dialogueState, index: choice.nextIndex });
        } else {
          setDialogueState(null);
          canvasRef.current?.focus();
        }
        return;
      }

      if (dialogueState.index < dialogueState.lines.length - 1) {
        setDialogueState({ ...dialogueState, index: dialogueState.index + 1 });
      } else {
        setDialogueState(null);
        canvasRef.current?.focus();
      }
    },
    [dialogueState, evaluateMissions, grantItems, persistProgress, showBanner]
  );

  const handlePuzzleSubmit = useCallback(
    (code: string): { ok: boolean; message: string } => {
      if (!activePuzzle) return { ok: false, message: 'No active lock.' };
      if (code !== activePuzzle.code) {
        soundEngine.playInteractCue('metal');
        return { ok: false, message: 'Incorrect code. Check surrounding clues.' };
      }

      soundEngine.playMissionChime();
      solvedPuzzleIdsRef.current.add(activePuzzle.id);

      if (activePuzzle.id === FOREST_HATCH_PUZZLE.id) {
        inventoryRef.current = removeItemFromInventory(
          inventoryRef.current,
          'fuse',
          1
        ).inventory;
        syncInventoryAndStats();
        evaluateMissions();
        persistProgress();
        setActivePuzzle(null);
        soundEngine.pauseAmbient();
        setGameOverOutcome('victory');
        setScreenState('gameover');
        return { ok: true, message: 'Unlocked!' };
      }

      const interior = currentInteriorRef.current;
      const puz = interior?.puzzles.find((p) => p.id === activePuzzle.id);
      if (interior && puz) {
        puz.solved = true;
        grantItems(puz.rewardItems);
        for (const door of interior.doors) {
          if (door.requiredPuzzleId === puz.id) {
            door.locked = false;
            door.open = true;
            unlockedDoorIdsRef.current.add(door.id);
          }
        }
        if (puz.journalLines && puz.journalLines.length > 0) {
          pushJournalEntry(
            `puz_${puz.id}`,
            puz.journalTitle ?? puz.title,
            puz.title,
            interior.district,
            puz.journalLines
          );
        }
        showBanner(
          `Unlocked ${puz.title}! Obtained ${puz.rewardItems
            .map((r) => ITEM_DEFS[r.itemId].name)
            .join(', ')}.`
        );
      }

      evaluateMissions();
      persistProgress();
      setActivePuzzle(null);
      canvasRef.current?.focus();
      return { ok: true, message: 'Unlocked!' };
    },
    [
      activePuzzle,
      evaluateMissions,
      grantItems,
      persistProgress,
      pushJournalEntry,
      showBanner,
      syncInventoryAndStats,
    ]
  );

  const activeMission = useMemo(
    () => missionsSnap.find((m) => !m.completed) ?? missionsSnap[missionsSnap.length - 1] ?? null,
    [missionsSnap]
  );

  const showTouchControls =
    screenState === 'playing' &&
    !modalFrozen &&
    (settings.touchControls === 'always' ||
      (settings.touchControls === 'auto' && isTouchViewport));

  return (
    <main className="relative w-full h-full overflow-hidden bg-[#0b0e13]">
      <div ref={containerRef} className="w-full h-full relative">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          data-testid="game-canvas"
          aria-label="NO ESCAPE Hollow Creek game world"
          className="block w-full h-full outline-none"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at center, rgba(9,12,18,0) 52%, rgba(7,10,15,0.36) 100%)',
          }}
        />
      </div>

      {screenState === 'title' && (
        <TitleScreen
          saveData={saveData}
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          onOpenSettings={() => {
            soundEngine.playUiClick();
            setSettingsOpen(true);
          }}
        />
      )}

      {screenState === 'playing' && (
        <>
          <GameHud
            districtName={districtName}
            interiorName={interiorName}
            stance={stance}
            stats={statsSnap}
            clockMinutes={clockSnap}
            weather={weatherSnap}
            activeMission={activeMission}
            activePrompt={modalFrozen ? null : activePrompt}
            missionToast={missionToast}
            statusBanner={statusBanner}
            muted={settings.muted}
            touchControlsVisible={showTouchControls}
            onToggleMute={() =>
              setSettings((prev) => ({ ...prev, muted: !prev.muted }))
            }
            onOpenInventory={() => openBackpackTab('inventory')}
            onOpenJournal={() => openBackpackTab('journal')}
            onOpenMap={toggleMap}
            onOpenSettings={() => {
              soundEngine.playUiClick();
              setSettingsOpen(true);
            }}
            onPause={togglePause}
            onInteract={triggerInteract}
            onToggleFlashlight={handleToggleFlashlight}
            onAttack={handleAttack}
          />

          <MobileControls
            visible={showTouchControls}
            canInteract={Boolean(activePrompt)}
            interactLabel={activePrompt?.verb ?? 'Interact'}
            hasFlashlight={statsSnap.hasFlashlight}
            flashlightOn={statsSnap.flashlightOn}
            hasCrowbar={statsSnap.equippedWeapon === 'crowbar'}
            onJoystickMove={(x, y) => {
              joystickRef.current = { x, y };
            }}
            onRunChange={(held) => {
              mobileRunRef.current = held;
            }}
            onSneakToggle={() => {
              setMobileSneak((prev) => {
                const next = !prev;
                mobileSneakRef.current = next;
                return next;
              });
            }}
            sneakActive={mobileSneak}
            onInteract={triggerInteract}
            onToggleFlashlight={handleToggleFlashlight}
            onAttack={handleAttack}
            onOpenInventory={() => openBackpackTab('inventory')}
          />
        </>
      )}

      <InteractionModal
        item={activeClue}
        onClose={() => {
          soundEngine.playUiClick();
          setActiveClue(null);
          canvasRef.current?.focus();
        }}
      />

      <DialogueModal
        open={Boolean(dialogueState)}
        lines={dialogueState?.lines ?? []}
        lineIndex={dialogueState?.index ?? 0}
        onAdvance={handleDialogueAdvance}
        onClose={() => {
          soundEngine.playUiClick();
          setDialogueState(null);
          canvasRef.current?.focus();
        }}
      />

      <ContainerModal
        container={activeContainer}
        onTakeAll={triggerInteract}
        onClose={() => {
          soundEngine.playUiClick();
          setActiveContainer(null);
          canvasRef.current?.focus();
        }}
      />

      <PuzzleModal
        puzzle={activePuzzle}
        onSubmitCode={handlePuzzleSubmit}
        onClose={() => {
          soundEngine.playUiClick();
          setActivePuzzle(null);
          canvasRef.current?.focus();
        }}
      />

      <BackpackModal
        open={backpackOpen}
        initialTab={backpackTab}
        inventory={inventorySnap}
        stats={statsSnap}
        journal={journalSnap}
        missions={missionsSnap}
        feedback={packFeedback}
        onUseItem={handleUseItem}
        onDropItem={handleDropItem}
        onCraft={handleCraft}
        onClose={() => {
          soundEngine.playUiClick();
          setBackpackOpen(false);
          canvasRef.current?.focus();
        }}
      />

      <MapModal
        open={mapOpen}
        playerX={
          currentInteriorRef.current
            ? currentInteriorRef.current.exteriorReturnPos.x
            : playerRef.current.x
        }
        playerY={
          currentInteriorRef.current
            ? currentInteriorRef.current.exteriorReturnPos.y
            : playerRef.current.y
        }
        discoveredIds={discoveredRef.current}
        onClose={() => {
          soundEngine.playUiClick();
          setMapOpen(false);
          canvasRef.current?.focus();
        }}
      />

      <PauseModal
        open={screenState === 'paused' && !settingsOpen}
        discoveredCount={discoveredCount}
        totalClues={WORLD_INTERACTABLES.length}
        missionsCompleted={missionsSnap.filter((m) => m.completed).length}
        totalMissions={missionsSnap.length}
        onResume={() => {
          soundEngine.playUiClick();
          togglePause();
        }}
        onOpenSettings={() => {
          soundEngine.playUiClick();
          setSettingsOpen(true);
        }}
        onSaveAndQuit={() => {
          soundEngine.playUiClick();
          persistProgress();
          soundEngine.pauseAmbient();
          setMapOpen(false);
          setBackpackOpen(false);
          setScreenState('title');
        }}
      />

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onChange={setSettings}
        onClose={() => {
          soundEngine.playUiClick();
          setSettingsOpen(false);
          if (screenState === 'playing') {
            canvasRef.current?.focus();
          }
        }}
      />

      <GameOverModal
        open={screenState === 'gameover'}
        outcome={gameOverOutcome}
        cluesFound={discoveredCount}
        totalClues={WORLD_INTERACTABLES.length}
        missionsDone={missionsSnap.filter((m) => m.completed).length}
        totalMissions={missionsSnap.length}
        hasSave={Boolean(saveData)}
        onLoadSave={() => {
          soundEngine.playUiClick();
          enterPlaying(saveData, false);
        }}
        onRestart={() => {
          soundEngine.playUiClick();
          enterPlaying(null, false);
        }}
        onMainMenu={() => {
          soundEngine.playUiClick();
          setScreenState('title');
        }}
      />
    </main>
  );
}
