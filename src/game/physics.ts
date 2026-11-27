import { AABB, Interactable, MovementStance, PlayerState, Vec2 } from './types';

export const PLAYER_RADIUS = 14;
export const WALK_SPEED = 165;
export const RUN_SPEED = 265;
export const SNEAK_SPEED = 98;
export const ACCEL_RATE = 18;
export const DECEL_RATE = 15;

export interface InputVector {
  x: number;
  y: number;
  run: boolean;
  sneak: boolean;
}

/**
 * Normalizes a 2D movement input vector so diagonal movement is never faster
 * than straight cardinal movement. Preserves analog joystick magnitude in [0, 1].
 */
export function normalizeMoveInput(rawX: number, rawY: number, sensitivity = 1): Vec2 {
  const sx = rawX * sensitivity;
  const sy = rawY * sensitivity;
  const mag = Math.hypot(sx, sy);
  if (mag < 0.001) {
    return { x: 0, y: 0 };
  }
  if (mag > 1) {
    return { x: sx / mag, y: sy / mag };
  }
  return { x: sx, y: sy };
}

export function resolveStance(
  moveMag: number,
  runHeld: boolean,
  sneakHeld: boolean
): MovementStance {
  if (moveMag < 0.05) {
    return 'idle';
  }
  if (sneakHeld) {
    return 'sneak';
  }
  if (runHeld) {
    return 'run';
  }
  return 'walk';
}

export function getTargetSpeed(stance: MovementStance): number {
  switch (stance) {
    case 'run':
      return RUN_SPEED;
    case 'sneak':
      return SNEAK_SPEED;
    case 'walk':
      return WALK_SPEED;
    default:
      return 0;
  }
}

/**
 * Resolves circle vs AABB penetration by pushing the circle out along the
 * shallowest penetration axis (or corner vector when overlapping a corner).
 */
export function resolveCircleAABB(
  cx: number,
  cy: number,
  radius: number,
  box: AABB
): Vec2 {
  const closestX = Math.max(box.x, Math.min(cx, box.x + box.w));
  const closestY = Math.max(box.y, Math.min(cy, box.y + box.h));
  const dx = cx - closestX;
  const dy = cy - closestY;
  const distSq = dx * dx + dy * dy;

  if (distSq >= radius * radius) {
    return { x: cx, y: cy };
  }

  if (distSq > 0.00001) {
    const dist = Math.sqrt(distSq);
    const overlap = radius - dist;
    return {
      x: cx + (dx / dist) * overlap,
      y: cy + (dy / dist) * overlap,
    };
  }

  // Center is inside the box; push out via nearest edge
  const leftPen = cx - box.x;
  const rightPen = box.x + box.w - cx;
  const topPen = cy - box.y;
  const bottomPen = box.y + box.h - cy;
  const minPen = Math.min(leftPen, rightPen, topPen, bottomPen);

  if (minPen === leftPen) return { x: box.x - radius, y: cy };
  if (minPen === rightPen) return { x: box.x + box.w + radius, y: cy };
  if (minPen === topPen) return { x: cx, y: box.y - radius };
  return { x: cx, y: box.y + box.h + radius };
}

export function clampToWorldBounds(
  x: number,
  y: number,
  radius: number,
  worldWidth: number,
  worldHeight: number
): Vec2 {
  return {
    x: Math.max(radius + 8, Math.min(worldWidth - radius - 8, x)),
    y: Math.max(radius + 8, Math.min(worldHeight - radius - 8, y)),
  };
}

/**
 * Steps Alex Morgan's movement simulation for dt seconds with smooth
 * acceleration, normalized 8-directional speed, and sliding collision resolution.
 */
export function stepPlayerMovement(
  player: PlayerState,
  input: InputVector,
  colliders: AABB[],
  worldWidth: number,
  worldHeight: number,
  dt: number,
  sensitivity = 1
): PlayerState {
  const dir = normalizeMoveInput(input.x, input.y, sensitivity);
  const mag = Math.hypot(dir.x, dir.y);
  const stance = resolveStance(mag, input.run, input.sneak);
  const maxSpeed = getTargetSpeed(stance);

  const targetVx = dir.x * maxSpeed;
  const targetVy = dir.y * maxSpeed;
  const rate = mag > 0.05 ? ACCEL_RATE : DECEL_RATE;
  const blend = 1 - Math.exp(-rate * dt);

  let vx = player.vx + (targetVx - player.vx) * blend;
  let vy = player.vy + (targetVy - player.vy) * blend;

  if (Math.hypot(vx, vy) < 2 && mag < 0.05) {
    vx = 0;
    vy = 0;
  }

  let nextX = player.x + vx * dt;
  let nextY = player.y + vy * dt;

  // Iterative collision resolution for clean corner sliding
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < colliders.length; i++) {
      const box = colliders[i];
      // Broadphase quick reject
      if (
        nextX + player.radius < box.x ||
        nextX - player.radius > box.x + box.w ||
        nextY + player.radius < box.y ||
        nextY - player.radius > box.y + box.h
      ) {
        continue;
      }
      const pushed = resolveCircleAABB(nextX, nextY, player.radius, box);
      nextX = pushed.x;
      nextY = pushed.y;
    }
  }

  const bounded = clampToWorldBounds(
    nextX,
    nextY,
    player.radius,
    worldWidth,
    worldHeight
  );

  // Actual displacement for distance-synced gait animation (prevents foot skating)
  const movedDist = Math.hypot(bounded.x - player.x, bounded.y - player.y);
  const gaitAdvance = movedDist * (stance === 'sneak' ? 0.11 : 0.085);

  let facingAngle = player.facingAngle;
  if (mag > 0.08) {
    const desiredAngle = Math.atan2(dir.y, dir.x);
    let delta = desiredAngle - facingAngle;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    facingAngle += delta * Math.min(1, dt * 16);
  }

  return {
    ...player,
    x: bounded.x,
    y: bounded.y,
    vx,
    vy,
    facingAngle,
    stance: movedDist < 0.1 && mag < 0.05 ? 'idle' : stance,
    gaitPhase: (player.gaitPhase + gaitAdvance) % (Math.PI * 2),
    idleTime: mag < 0.05 ? player.idleTime + dt : 0,
    interactAnimTimer: Math.max(0, player.interactAnimTimer - dt),
  };
}

export function findNearestInteractable(
  playerX: number,
  playerY: number,
  interactables: Interactable[]
): { item: Interactable; distance: number } | null {
  let best: Interactable | null = null;
  let bestDist = Infinity;

  for (const item of interactables) {
    const dist = Math.hypot(item.x - playerX, item.y - playerY);
    if (dist <= item.radius && dist < bestDist) {
      best = item;
      bestDist = dist;
    }
  }

  return best ? { item: best, distance: bestDist } : null;
}

export function lerpCamera(
  camX: number,
  camY: number,
  targetX: number,
  targetY: number,
  viewportW: number,
  viewportH: number,
  worldW: number,
  worldH: number,
  dt: number
): Vec2 {
  const halfW = viewportW / 2;
  const halfH = viewportH / 2;

  const clampedTargetX =
    worldW <= viewportW
      ? worldW / 2
      : Math.max(halfW, Math.min(worldW - halfW, targetX));
  const clampedTargetY =
    worldH <= viewportH
      ? worldH / 2
      : Math.max(halfH, Math.min(worldH - halfH, targetY));

  const smooth = 1 - Math.exp(-8.5 * dt);
  return {
    x: camX + (clampedTargetX - camX) * smooth,
    y: camY + (clampedTargetY - camY) * smooth,
  };
}
