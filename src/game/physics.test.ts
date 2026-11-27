import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAYER_RADIUS,
  WALK_SPEED,
  clampToWorldBounds,
  findNearestInteractable,
  lerpCamera,
  normalizeMoveInput,
  resolveCircleAABB,
  stepPlayerMovement,
} from './physics';
import { AABB, Interactable, PlayerState } from './types';
import {
  DISTRICTS,
  PLAYER_SPAWN,
  WORLD_HEIGHT,
  WORLD_INTERACTABLES,
  WORLD_WIDTH,
  buildWorldColliders,
  getDistrictAt,
} from './worldData';

function makePlayer(x = 500, y = 500): PlayerState {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    radius: PLAYER_RADIUS,
    facingAngle: 0,
    stance: 'idle',
    gaitPhase: 0,
    idleTime: 0,
    interactAnimTimer: 0,
  };
}

test('diagonal movement input normalizes to unit length', () => {
  const cardinal = normalizeMoveInput(1, 0);
  const diagonal = normalizeMoveInput(1, 1);

  assert.equal(Math.hypot(cardinal.x, cardinal.y), 1);
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 1e-6);
});

test('diagonal movement does not exceed cardinal walk speed over time', () => {
  let straight = makePlayer(500, 500);
  let diagonal = makePlayer(500, 500);

  for (let i = 0; i < 60; i++) {
    straight = stepPlayerMovement(
      straight,
      { x: 1, y: 0, run: false, sneak: false },
      [],
      2000,
      2000,
      1 / 60
    );
    diagonal = stepPlayerMovement(
      diagonal,
      { x: 1, y: 1, run: false, sneak: false },
      [],
      2000,
      2000,
      1 / 60
    );
  }

  const straightDist = Math.hypot(straight.x - 500, straight.y - 500);
  const diagDist = Math.hypot(diagonal.x - 500, diagonal.y - 500);

  assert.ok(Math.abs(straightDist - diagDist) < 0.5);
  assert.ok(Math.hypot(diagonal.vx, diagonal.vy) <= WALK_SPEED + 0.5);
});

test('circle vs AABB prevents walking through solid walls and allows axis sliding', () => {
  const wall: AABB = { id: 'wall', x: 520, y: 400, w: 60, h: 200 };
  const resolved = resolveCircleAABB(515, 480, PLAYER_RADIUS, wall);
  assert.equal(resolved.x, 520 - PLAYER_RADIUS);
  assert.equal(resolved.y, 480);

  let player = makePlayer(500, 480);
  for (let i = 0; i < 30; i++) {
    player = stepPlayerMovement(
      player,
      { x: 1, y: 1, run: false, sneak: false },
      [wall],
      2000,
      2000,
      1 / 60
    );
  }
  // X is stopped at wall edge, Y continues sliding smoothly downward
  assert.ok(player.x <= 520 - PLAYER_RADIUS + 0.01);
  assert.ok(player.y > 510);
});

test('world boundary clamping keeps player inside map limits', () => {
  const clamped = clampToWorldBounds(-50, 3000, PLAYER_RADIUS, 1000, 1000);
  assert.ok(clamped.x >= PLAYER_RADIUS + 8);
  assert.ok(clamped.y <= 1000 - PLAYER_RADIUS - 8);
});

test('findNearestInteractable picks closest object within radius', () => {
  const items: Interactable[] = [
    {
      id: 'far',
      title: 'Far Sign',
      subtitle: 'Out of reach',
      district: 'Town Centre',
      promptVerb: 'Read',
      x: 300,
      y: 300,
      radius: 50,
      category: 'landmark',
      body: ['Far'],
      soundCue: 'wood',
    },
    {
      id: 'near',
      title: 'Bus Note',
      subtitle: 'Paper',
      district: 'Abandoned Bus Station',
      promptVerb: 'Read',
      x: 120,
      y: 100,
      radius: 60,
      category: 'note',
      body: ['Near'],
      soundCue: 'paper',
    },
  ];

  const found = findNearestInteractable(100, 100, items);
  assert.ok(found);
  assert.equal(found.item.id, 'near');

  const none = findNearestInteractable(800, 800, items);
  assert.equal(none, null);
});

test('camera smoothly clamps inside world edges', () => {
  const cam = lerpCamera(0, 0, 50, 50, 1280, 720, 2304, 1824, 1);
  assert.ok(cam.x >= 640 - 1);
  assert.ok(cam.y >= 360 - 1);
});

test('expanded Hollow Creek world has 8 districts, 20 clues, and unobstructed spawn', () => {
  assert.equal(DISTRICTS.length, 8);
  assert.equal(WORLD_INTERACTABLES.length, 20);
  assert.equal(getDistrictAt(PLAYER_SPAWN.x, PLAYER_SPAWN.y), 'Abandoned Bus Station');

  const colliders = buildWorldColliders();
  for (const box of colliders) {
    const resolved = resolveCircleAABB(
      PLAYER_SPAWN.x,
      PLAYER_SPAWN.y,
      PLAYER_RADIUS,
      box
    );
    assert.equal(
      resolved.x,
      PLAYER_SPAWN.x,
      `Spawn overlaps collider ${box.id}`
    );
    assert.equal(
      resolved.y,
      PLAYER_SPAWN.y,
      `Spawn overlaps collider ${box.id}`
    );
  }

  for (const item of WORLD_INTERACTABLES) {
    assert.ok(item.x > 0 && item.x < WORLD_WIDTH);
    assert.ok(item.y > 0 && item.y < WORLD_HEIGHT);
  }
});

import {
  BACKPACK_INVENTORY_SLOTS,
  BASE_INVENTORY_SLOTS,
  CRAFTING_RECIPES,
  addItemToInventory,
  consumeInventoryItem,
  craftItem,
  createInitialSurvivalStats,
  getItemCount,
  getMaxSlots,
  stepSurvivalStats,
} from './survival';
import { createInitialEnemies, performPlayerAttack, stepEnemies } from './enemies';
import { createBuildingInteriors, getInteriorColliders } from './interiors';
import { buildMissionsState } from './missions';

test('survival inventory capacity, consumption, crafting, and stat drain', () => {
  assert.equal(getMaxSlots(false), BASE_INVENTORY_SLOTS);
  assert.equal(getMaxSlots(true), BACKPACK_INVENTORY_SLOTS);

  let stats = createInitialSurvivalStats();
  stats.hp = 60;
  stats.hunger = 40;
  stats.thirst = 40;
  stats.hasFlashlight = true;
  stats.flashlightOn = true;

  let inv = addItemToInventory([], 'cloth', 2, 16).inventory;
  inv = addItemToInventory(inv, 'canned_food', 1, 16).inventory;
  inv = addItemToInventory(inv, 'bottled_water', 1, 16).inventory;

  // Craft Bandage from 2 Cloth Strips
  const bandageRecipe = CRAFTING_RECIPES.find((r) => r.id === 'craft_bandage')!;
  const crafted = craftItem(inv, bandageRecipe, 16);
  assert.equal(crafted.crafted, true);
  assert.equal(getItemCount(crafted.inventory, 'bandage'), 1);
  assert.equal(getItemCount(crafted.inventory, 'cloth'), 0);

  // Consume Bandage & Food & Water
  const usedBandage = consumeInventoryItem(crafted.inventory, stats, 'bandage');
  assert.equal(usedBandage.stats.hp, 84);
  const usedFood = consumeInventoryItem(usedBandage.inventory, usedBandage.stats, 'canned_food');
  assert.equal(usedFood.stats.hunger, 75);
  const usedWater = consumeInventoryItem(usedFood.inventory, usedFood.stats, 'bottled_water');
  assert.equal(usedWater.stats.thirst, 82);

  // Stamina and flashlight battery drain while running
  const afterRun = stepSurvivalStats(usedWater.stats, 'run', 2, false);
  assert.ok(afterRun.stamina < usedWater.stats.stamina);
  assert.ok(afterRun.battery < usedWater.stats.battery);
});

test('enemy stealth, hidden spots, chase windup, and player crowbar combat', () => {
  const enemies = createInitialEnemies();
  const base = enemies[0]; // wanderer_elm
  const nearPlayer = makePlayer(base.x + 24, base.y);
  nearPlayer.stance = 'run';

  // Hidden player is completely undetected
  const hiddenStats = createInitialSurvivalStats();
  hiddenStats.hiddenInSpotId = 'mh_wardrobe_hide';
  const hiddenStep = stepEnemies([base], nearPlayer, hiddenStats, [], 1.0);
  assert.equal(hiddenStep.enemies[0].aiState, 'patrol');
  assert.equal(hiddenStep.playerDamage, 0);

  // Exposed running player triggers chase & windup -> damage
  const openStats = createInitialSurvivalStats();
  let state = stepEnemies([base], nearPlayer, openStats, [], 0.6).enemies;
  assert.equal(state[0].aiState, 'chase');
  state = stepEnemies(state, nearPlayer, openStats, [], 0.1).enemies;
  assert.ok(state[0].windupTimer > 0);
  const strikeStep = stepEnemies(state, nearPlayer, openStats, [], 0.5);
  assert.ok(strikeStep.playerDamage > 0);

  // Player crowbar attack hits & knocks back
  const armedStats = { ...openStats, equippedWeapon: 'crowbar' as const };
  nearPlayer.facingAngle = Math.PI; // facing left toward enemy at base.x
  const atk = performPlayerAttack(nearPlayer, armedStats, strikeStep.enemies);
  assert.equal(atk.hitCount, 1);
  assert.ok(atk.enemies[0].hp < base.hp);
});

test('all 5 building interiors have unobstructed spawns and valid doors', () => {
  const interiors = Object.values(createBuildingInteriors());
  assert.equal(interiors.length, 5);
  const extColliders = buildWorldColliders();

  for (const b of interiors) {
    const boxes = getInteriorColliders(b);
    for (const box of boxes) {
      const res = resolveCircleAABB(b.spawnX, b.spawnY, PLAYER_RADIUS, box);
      assert.equal(res.x, b.spawnX, `${b.id} spawn collides with ${box.id}`);
      assert.equal(res.y, b.spawnY, `${b.id} spawn collides with ${box.id}`);
    }
    // Exterior return & approach points should not collide with exterior fences/buildings
    for (const ext of extColliders) {
      const res = resolveCircleAABB(
        b.exteriorReturnPos.x,
        b.exteriorReturnPos.y,
        PLAYER_RADIUS,
        ext
      );
      assert.equal(
        res.x,
        b.exteriorReturnPos.x,
        `${b.id} exterior return collides with ${ext.id}`
      );
      assert.equal(
        res.y,
        b.exteriorReturnPos.y,
        `${b.id} exterior return collides with ${ext.id}`
      );
      const approachY = b.exteriorReturnPos.y + 28;
      const appRes = resolveCircleAABB(
        b.exteriorReturnPos.x,
        approachY,
        PLAYER_RADIUS,
        ext
      );
      assert.equal(
        appRes.x,
        b.exteriorReturnPos.x,
        `${b.id} approach path collides with ${ext.id}`
      );
      assert.equal(
        appRes.y,
        approachY,
        `${b.id} approach path collides with ${ext.id}`
      );
    }
  }
});

test('missions track awakening completion cleanly', () => {
  const stats = createInitialSurvivalStats();
  stats.hasBackpack = true;
  stats.hasFlashlight = true;

  const evalRes = buildMissionsState(
    {
      stats,
      inventory: [],
      discoveredIds: new Set(['bus_note']),
      openedContainerIds: new Set(),
      solvedPuzzleIds: new Set(),
      missionFlags: new Set(),
      visitedDistricts: new Set(['Abandoned Bus Station', 'Residential District']),
      currentInteriorId: null,
    },
    new Set()
  );
  assert.equal(evalRes.missions[0].completed, true);
  assert.equal(evalRes.newlyCompleted.length, 1);
  assert.equal(evalRes.newlyCompleted[0].id, 'm1_awakening');
});

