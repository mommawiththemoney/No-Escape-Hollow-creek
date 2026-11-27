export type GameScreenState = 'title' | 'playing' | 'paused' | 'gameover';

export type MovementStance = 'idle' | 'walk' | 'run' | 'sneak';

export type GraphicsQuality = 'low' | 'medium' | 'high';

export type TouchControlMode = 'auto' | 'always' | 'off';

export interface Vec2 {
  x: number;
  y: number;
}

export interface AABB {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: 'building' | 'bus' | 'tree' | 'fence' | 'prop' | 'boundary' | 'wall' | 'furniture';
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  facingAngle: number;
  stance: MovementStance;
  gaitPhase: number;
  idleTime: number;
  interactAnimTimer: number;
}

export type TileKind =
  | 'grass'
  | 'grass_dark'
  | 'road'
  | 'sidewalk'
  | 'dirt'
  | 'gravel'
  | 'forest_floor'
  | 'plaza'
  | 'concrete'
  | 'court';

export type PropKind =
  | 'bus'
  | 'school_bus'
  | 'bus_shelter'
  | 'house_blue'
  | 'house_ochre'
  | 'house_green'
  | 'house_victorian'
  | 'shop_diner'
  | 'shop_hardware'
  | 'shop_pharmacy'
  | 'shop_cinema'
  | 'police_station'
  | 'hospital'
  | 'school'
  | 'warehouse'
  | 'silo'
  | 'container_red'
  | 'container_blue'
  | 'shed'
  | 'gazebo'
  | 'fountain'
  | 'payphone'
  | 'welcome_sign'
  | 'car_wreck'
  | 'car_blue'
  | 'car_white'
  | 'pickup_rust'
  | 'police_car'
  | 'ambulance'
  | 'lamp_post'
  | 'pine_tree'
  | 'dead_tree'
  | 'oak_tree'
  | 'bush'
  | 'bench'
  | 'trash_bin'
  | 'dumpster'
  | 'road_barrier'
  | 'traffic_cone'
  | 'hydrant'
  | 'mailbox'
  | 'crate'
  | 'barrel'
  | 'pallet'
  | 'boulder'
  | 'fallen_log'
  | 'note_prop'
  | 'backpack_prop'
  | 'flashlight_prop'
  | 'hollow_stump'
  | 'underground_hatch'
  | 'fence_wood_h'
  | 'fence_wood_v'
  | 'fence_chain_h'
  | 'fence_chain_v'
  | 'patio_table';

export interface WorldProp {
  id: string;
  kind: PropKind;
  x: number;
  y: number;
  w: number;
  h: number;
  solid?: boolean;
  label?: string;
  lit?: boolean;
  rotation?: number;
}

export type ActionVerb =
  | 'OPEN'
  | 'SEARCH'
  | 'PICK UP'
  | 'READ'
  | 'INTERACT'
  | 'ENTER'
  | 'EXIT'
  | 'HIDE'
  | 'LEAVE'
  | 'TALK'
  | 'UNLOCK';

export interface Interactable {
  id: string;
  title: string;
  subtitle: string;
  district: string;
  promptVerb: string;
  actionVerb?: ActionVerb;
  x: number;
  y: number;
  radius: number;
  category: 'note' | 'landmark' | 'object' | 'clue';
  body: string[];
  footnote?: string;
  soundCue: 'paper' | 'phone' | 'metal' | 'wood' | 'whisper';
  grantsItem?: ItemId;
  grantsQty?: number;
  lootItems?: Array<{ itemId: ItemId; qty: number }>;
  oneTime?: boolean;
}

export interface DistrictZone {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  graphicsQuality: GraphicsQuality;
  controlSensitivity: number;
  touchControls: TouchControlMode;
}

export type ItemId =
  | 'canned_food'
  | 'bottled_water'
  | 'medkit'
  | 'bandage'
  | 'flashlight'
  | 'battery'
  | 'wood'
  | 'metal_scrap'
  | 'cloth'
  | 'radio_part'
  | 'crowbar'
  | 'rust_key'
  | 'precinct_key'
  | 'hospital_keycard'
  | 'fuse'
  | 'bus_note_doc';

export type ItemCategory = 'consumable' | 'tool' | 'material' | 'key' | 'document';

export interface InventoryItemDef {
  id: ItemId;
  name: string;
  category: ItemCategory;
  description: string;
  stackable: boolean;
  maxStack: number;
  usable: boolean;
  useLabel?: string;
  effects?: {
    hp?: number;
    stamina?: number;
    hunger?: number;
    thirst?: number;
    battery?: number;
  };
}

export interface InventorySlot {
  itemId: ItemId;
  qty: number;
}

export interface CraftingRecipe {
  id: string;
  resultId: ItemId;
  resultQty: number;
  name: string;
  description: string;
  ingredients: Array<{ itemId: ItemId; qty: number }>;
}

export interface SurvivalStats {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  battery: number;
  maxBattery: number;
  hasBackpack: boolean;
  hasFlashlight: boolean;
  flashlightOn: boolean;
  equippedWeapon: 'none' | 'crowbar';
  hiddenInSpotId: string | null;
  attackCooldown: number;
  attackSwingTimer: number;
  invulnTimer: number;
}

export type WeatherKind = 'mist' | 'rain' | 'fog';

export interface JournalEntry {
  id: string;
  title: string;
  source: string;
  district: string;
  timestamp: string;
  lines: string[];
}

export interface MissionStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface MissionState {
  id: string;
  title: string;
  summary: string;
  rewardText: string;
  completed: boolean;
  steps: MissionStep[];
}

export interface MissionToast {
  id: string;
  title: string;
  rewardText: string;
  expiresAt: number;
}

export interface NpcDialogueLine {
  speaker: string;
  role: string;
  text: string;
  choices?: Array<{
    label: string;
    nextIndex?: number;
    rewardItem?: { itemId: ItemId; qty: number };
    journalId?: string;
    missionFlag?: string;
  }>;
}

export interface NpcActor {
  id: string;
  name: string;
  role: string;
  location: 'exterior' | string;
  x: number;
  y: number;
  radius: number;
  jacketColor: string;
  lines: NpcDialogueLine[];
}

export type EnemyType = 'watcher' | 'wanderer' | 'mimic';

export type EnemyAiState = 'patrol' | 'suspicious' | 'chase' | 'search' | 'ko';

export interface EnemyState {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  facingAngle: number;
  hp: number;
  maxHp: number;
  aiState: EnemyAiState;
  alertLevel: number;
  patrolPoints: Vec2[];
  patrolIdx: number;
  lastSeenX: number;
  lastSeenY: number;
  searchTimer: number;
  attackCooldown: number;
  windupTimer: number;
  hitFlash: number;
  koTimer: number;
  homeDistrict: string;
  mimicPulseTimer: number;
}

export type InteriorFloorKind = 'wood' | 'tile_checker' | 'carpet' | 'hospital_tile' | 'concrete';

export interface InteriorRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  floor: InteriorFloorKind;
}

export type FurnitureKind =
  | 'bed'
  | 'sofa'
  | 'table'
  | 'chair'
  | 'counter'
  | 'desk'
  | 'bookshelf'
  | 'fridge'
  | 'stove'
  | 'wardrobe'
  | 'cabinet'
  | 'locker'
  | 'safe'
  | 'hospital_bed'
  | 'rug';

export interface InteriorFurniture {
  id: string;
  kind: FurnitureKind;
  x: number;
  y: number;
  w: number;
  h: number;
  solid: boolean;
  label?: string;
}

export interface InteriorDoor {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  orientation: 'h' | 'v';
  open: boolean;
  locked: boolean;
  requiredKeyId?: ItemId;
  requiredPuzzleId?: string;
  label: string;
}

export interface InteriorContainer {
  id: string;
  title: string;
  verb: 'SEARCH' | 'OPEN';
  x: number;
  y: number;
  radius: number;
  searched: boolean;
  locked?: boolean;
  requiredKeyId?: ItemId;
  loot: Array<{ itemId: ItemId; qty: number }>;
  noteTitle?: string;
  noteLines?: string[];
}

export interface InteriorHideSpot {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
}

export interface InteriorPuzzle {
  id: string;
  title: string;
  subtitle: string;
  hint: string;
  code: string;
  x: number;
  y: number;
  radius: number;
  solved: boolean;
  rewardItems: Array<{ itemId: ItemId; qty: number }>;
  journalTitle?: string;
  journalLines?: string[];
}

export interface BuildingInterior {
  id: string;
  name: string;
  district: string;
  width: number;
  height: number;
  spawnX: number;
  spawnY: number;
  exitDoor: { x: number; y: number; radius: number };
  exteriorEntrance: { x: number; y: number; radius: number; label: string };
  exteriorReturnPos: { x: number; y: number; facingAngle: number };
  rooms: InteriorRoom[];
  walls: AABB[];
  furniture: InteriorFurniture[];
  doors: InteriorDoor[];
  containers: InteriorContainer[];
  hideSpots: InteriorHideSpot[];
  puzzles: InteriorPuzzle[];
}

export interface ActivePromptTarget {
  kind:
    | 'interactable'
    | 'building_enter'
    | 'building_exit'
    | 'interior_door'
    | 'container'
    | 'hide_spot'
    | 'leave_hide'
    | 'puzzle'
    | 'npc'
    | 'pickup'
    | 'bush_hide';
  id: string;
  verb: ActionVerb;
  label: string;
  x: number;
  y: number;
}

export interface Phase1SaveData {
  version: 2;
  savedAt: string;
  playerX: number;
  playerY: number;
  facingAngle: number;
  currentInteriorId: string | null;
  discoveredIds: string[];
  collectedPickupIds: string[];
  openedContainerIds: string[];
  unlockedDoorIds: string[];
  solvedPuzzleIds: string[];
  completedMissionIds: string[];
  missionFlags: string[];
  stats: SurvivalStats;
  inventory: InventorySlot[];
  journal: JournalEntry[];
  clockMinutes: number;
  weather: WeatherKind;
}
