import { resolveCircleAABB } from './physics';
import { AABB, EnemyState, PlayerState, SurvivalStats } from './types';

export function createInitialEnemies(): EnemyState[] {
  return [
    {
      id: 'wanderer_elm',
      type: 'wanderer',
      name: 'Hollow Wanderer',
      x: 920,
      y: 1860,
      vx: 0,
      vy: 0,
      radius: 15,
      facingAngle: 0,
      hp: 60,
      maxHp: 60,
      aiState: 'patrol',
      alertLevel: 0,
      patrolPoints: [
        { x: 860, y: 1860 },
        { x: 1220, y: 1860 },
        { x: 1220, y: 2220 },
        { x: 860, y: 2220 },
      ],
      patrolIdx: 0,
      lastSeenX: 920,
      lastSeenY: 1860,
      searchTimer: 0,
      attackCooldown: 0,
      windupTimer: 0,
      hitFlash: 0,
      koTimer: 0,
      homeDistrict: 'Residential District',
      mimicPulseTimer: 0,
    },
    {
      id: 'watcher_plaza',
      type: 'watcher',
      name: 'The Watcher',
      x: 2480,
      y: 1860,
      vx: 0,
      vy: 0,
      radius: 16,
      facingAngle: Math.PI,
      hp: 85,
      maxHp: 85,
      aiState: 'patrol',
      alertLevel: 0,
      patrolPoints: [
        { x: 2480, y: 1860 },
        { x: 2480, y: 2340 },
        { x: 1980, y: 2340 },
        { x: 1980, y: 1860 },
      ],
      patrolIdx: 0,
      lastSeenX: 2480,
      lastSeenY: 1860,
      searchTimer: 0,
      attackCooldown: 0,
      windupTimer: 0,
      hitFlash: 0,
      koTimer: 0,
      homeDistrict: 'Town Centre',
      mimicPulseTimer: 0,
    },
    {
      id: 'mimic_alley',
      type: 'mimic',
      name: 'Static Mimic',
      x: 2040,
      y: 960,
      vx: 0,
      vy: 0,
      radius: 14,
      facingAngle: Math.PI / 2,
      hp: 50,
      maxHp: 50,
      aiState: 'patrol',
      alertLevel: 0,
      patrolPoints: [
        { x: 2040, y: 960 },
        { x: 2560, y: 960 },
        { x: 2560, y: 1180 },
      ],
      patrolIdx: 0,
      lastSeenX: 2040,
      lastSeenY: 960,
      searchTimer: 0,
      attackCooldown: 0,
      windupTimer: 0,
      hitFlash: 0,
      koTimer: 0,
      homeDistrict: 'Police Station',
      mimicPulseTimer: 2,
    },
    {
      id: 'wanderer_hospital',
      type: 'wanderer',
      name: 'Ward Wanderer',
      x: 3420,
      y: 960,
      vx: 0,
      vy: 0,
      radius: 15,
      facingAngle: 0,
      hp: 65,
      maxHp: 65,
      aiState: 'patrol',
      alertLevel: 0,
      patrolPoints: [
        { x: 3250, y: 960 },
        { x: 3860, y: 960 },
        { x: 3860, y: 1220 },
        { x: 3250, y: 1220 },
      ],
      patrolIdx: 0,
      lastSeenX: 3420,
      lastSeenY: 960,
      searchTimer: 0,
      attackCooldown: 0,
      windupTimer: 0,
      hitFlash: 0,
      koTimer: 0,
      homeDistrict: 'Abandoned Hospital',
      mimicPulseTimer: 0,
    },
    {
      id: 'watcher_forest',
      type: 'watcher',
      name: 'Pine Watcher',
      x: 3460,
      y: 2940,
      vx: 0,
      vy: 0,
      radius: 17,
      facingAngle: -Math.PI / 2,
      hp: 95,
      maxHp: 95,
      aiState: 'patrol',
      alertLevel: 0,
      patrolPoints: [
        { x: 3460, y: 2940 },
        { x: 3940, y: 2940 },
        { x: 3940, y: 3240 },
        { x: 3340, y: 3240 },
      ],
      patrolIdx: 0,
      lastSeenX: 3460,
      lastSeenY: 2940,
      searchTimer: 0,
      attackCooldown: 0,
      windupTimer: 0,
      hitFlash: 0,
      koTimer: 0,
      homeDistrict: 'Dark Forest',
      mimicPulseTimer: 0,
    },
  ];
}

export interface EnemyStepResult {
  enemies: EnemyState[];
  playerDamage: number;
  mimicCueTriggered: boolean;
  hitTelegraphStarted: boolean;
}

export function stepEnemies(
  enemies: EnemyState[],
  player: PlayerState,
  stats: SurvivalStats,
  colliders: AABB[],
  dt: number
): EnemyStepResult {
  let playerDamage = 0;
  let mimicCueTriggered = false;
  let hitTelegraphStarted = false;

  const isHidden = stats.hiddenInSpotId !== null;
  const detectRange = isHidden
    ? 0
    : (player.stance === 'sneak' ? 140 : player.stance === 'run' ? 320 : 225) +
      (stats.flashlightOn ? 75 : 0);

  const next = enemies.map((raw) => {
    const e = { ...raw };
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    e.attackCooldown = Math.max(0, e.attackCooldown - dt);

    if (e.aiState === 'ko') {
      e.koTimer = Math.max(0, e.koTimer - dt);
      e.vx *= 0.85;
      e.vy *= 0.85;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      return e;
    }

    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.hypot(dx, dy);
    const canSensePlayer = !isHidden && dist <= detectRange;

    if (e.type === 'mimic') {
      e.mimicPulseTimer -= dt;
      if (e.mimicPulseTimer <= 0) {
        e.mimicPulseTimer = 4.5 + Math.random() * 2;
        if (dist < 420 && e.aiState !== 'chase') {
          mimicCueTriggered = true;
        }
      }
    }

    // Detection & AI state transitions
    if (canSensePlayer) {
      const rate =
        dist < 130
          ? 2.2
          : player.stance === 'run'
            ? 1.35
            : stats.flashlightOn
              ? 1.15
              : 0.72;
      e.alertLevel = Math.min(1, e.alertLevel + rate * dt);
      e.lastSeenX = player.x;
      e.lastSeenY = player.y;

      if (e.alertLevel >= 1) {
        e.aiState = 'chase';
      } else if (e.aiState === 'patrol' || e.aiState === 'search') {
        e.aiState = 'suspicious';
      }
    } else {
      e.alertLevel = Math.max(0, e.alertLevel - 0.35 * dt);
      if (e.aiState === 'chase' && (isHidden || dist > 380)) {
        e.aiState = 'search';
        e.searchTimer = 4.0;
        e.windupTimer = 0;
      } else if (e.aiState === 'suspicious' && e.alertLevel <= 0.05) {
        e.aiState = 'patrol';
      }
    }

    // Windup telegraph & strike
    if (e.windupTimer > 0) {
      e.windupTimer -= dt;
      e.vx = 0;
      e.vy = 0;
      if (e.windupTimer <= 0) {
        if (!isHidden && dist <= e.radius + player.radius + 26 && stats.invulnTimer <= 0) {
          playerDamage += e.type === 'watcher' ? 22 : e.type === 'mimic' ? 18 : 14;
        }
        e.attackCooldown = 1.25;
      }
      return e;
    }

    let targetX = e.x;
    let targetY = e.y;
    let moveSpeed = 0;

    if (e.aiState === 'patrol') {
      const wp = e.patrolPoints[e.patrolIdx % e.patrolPoints.length];
      targetX = wp.x;
      targetY = wp.y;
      moveSpeed = e.type === 'watcher' ? 48 : e.type === 'mimic' ? 62 : 70;
      if (Math.hypot(targetX - e.x, targetY - e.y) < 18) {
        e.patrolIdx = (e.patrolIdx + 1) % e.patrolPoints.length;
      }
    } else if (e.aiState === 'suspicious') {
      targetX = e.lastSeenX;
      targetY = e.lastSeenY;
      // The Watcher freezes/watches briefly while suspicious before advancing
      moveSpeed = e.type === 'watcher' ? 24 : 78;
    } else if (e.aiState === 'chase') {
      targetX = player.x;
      targetY = player.y;
      moveSpeed =
        e.type === 'watcher' ? 128 : e.type === 'mimic' ? 156 : 136;

      if (dist <= e.radius + player.radius + 18 && e.attackCooldown <= 0) {
        e.windupTimer = 0.45;
        hitTelegraphStarted = true;
        return e;
      }
    } else if (e.aiState === 'search') {
      targetX = e.lastSeenX;
      targetY = e.lastSeenY;
      moveSpeed = 82;
      e.searchTimer -= dt;
      if (e.searchTimer <= 0) {
        e.aiState = 'patrol';
      }
    }

    const toDx = targetX - e.x;
    const toDy = targetY - e.y;
    const toDist = Math.hypot(toDx, toDy);
    if (toDist > 2 && moveSpeed > 0) {
      e.vx = (toDx / toDist) * moveSpeed;
      e.vy = (toDy / toDist) * moveSpeed;
      e.facingAngle = Math.atan2(toDy, toDx);
      e.x += e.vx * dt;
      e.y += e.vy * dt;

      for (let i = 0; i < colliders.length; i++) {
        const box = colliders[i];
        if (
          e.x + e.radius < box.x ||
          e.x - e.radius > box.x + box.w ||
          e.y + e.radius < box.y ||
          e.y - e.radius > box.y + box.h
        ) {
          continue;
        }
        const resolved = resolveCircleAABB(e.x, e.y, e.radius, box);
        e.x = resolved.x;
        e.y = resolved.y;
      }
    } else {
      e.vx = 0;
      e.vy = 0;
    }

    return e;
  });

  return { enemies: next, playerDamage, mimicCueTriggered, hitTelegraphStarted };
}

export function performPlayerAttack(
  player: PlayerState,
  stats: SurvivalStats,
  enemies: EnemyState[]
): {
  enemies: EnemyState[];
  stats: SurvivalStats;
  hitCount: number;
  koCount: number;
} {
  if (stats.attackCooldown > 0 || stats.hiddenInSpotId !== null) {
    return { enemies, stats, hitCount: 0, koCount: 0 };
  }

  const hasCrowbar = stats.equippedWeapon === 'crowbar';
  const reach = hasCrowbar ? 66 : 48;
  const dmg = hasCrowbar ? 34 : 18;
  const cooldown = hasCrowbar ? 0.52 : 0.65;

  let hitCount = 0;
  let koCount = 0;

  const nextEnemies = enemies.map((raw) => {
    if (raw.aiState === 'ko') return raw;
    const dx = raw.x - player.x;
    const dy = raw.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > reach + raw.radius) return raw;

    // Generous 130-degree forward arc check
    const angleToEnemy = Math.atan2(dy, dx);
    let diff = angleToEnemy - player.facingAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) > 1.25 && dist > 28) return raw;

    hitCount++;
    const nextHp = Math.max(0, raw.hp - dmg);
    const knock = hasCrowbar ? 210 : 140;
    const nx = dist > 0.1 ? dx / dist : Math.cos(player.facingAngle);
    const ny = dist > 0.1 ? dy / dist : Math.sin(player.facingAngle);

    if (nextHp <= 0) {
      koCount++;
      return {
        ...raw,
        hp: 0,
        aiState: 'ko' as const,
        koTimer: 0.45,
        hitFlash: 0.15,
        windupTimer: 0,
        vx: nx * knock,
        vy: ny * knock,
      };
    }

    return {
      ...raw,
      hp: nextHp,
      aiState: 'chase' as const,
      alertLevel: 1,
      hitFlash: 0.12,
      windupTimer: 0,
      attackCooldown: 0.5,
      x: raw.x + nx * 16,
      y: raw.y + ny * 16,
    };
  });

  return {
    enemies: nextEnemies,
    stats: {
      ...stats,
      attackCooldown: cooldown,
      attackSwingTimer: 0.22,
    },
    hitCount,
    koCount,
  };
}
