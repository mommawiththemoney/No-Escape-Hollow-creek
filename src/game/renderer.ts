import { SpriteAtlas } from './sprites';
import { buildGroundPatterns } from './textures';
import {
  ActivePromptTarget,
  BuildingInterior,
  EnemyState,
  GraphicsQuality,
  Interactable,
  InteriorFurniture,
  NpcActor,
  PlayerState,
  SurvivalStats,
  TileKind,
  WeatherKind,
  WorldProp,
} from './types';
import { getAmbientDarkness } from './survival';
import {
  MAP_COLS,
  MAP_ROWS,
  TILE_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from './worldData';

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  phase: number;
}

interface FogPuff {
  x: number;
  y: number;
  vx: number;
  scale: number;
  alpha: number;
}

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
}

const OUTLINE = '#11151d';
const CHUNK_COLS = 6;
const CHUNK_ROWS = 6;
const CHUNK_W = WORLD_WIDTH / CHUNK_COLS; // 768
const CHUNK_H = WORLD_HEIGHT / CHUNK_ROWS; // 608

export interface RenderFrameData {
  viewW: number;
  viewH: number;
  camX: number;
  camY: number;
  time: number;
  tiles: TileKind[][];
  props: WorldProp[];
  player: PlayerState;
  stats: SurvivalStats;
  interactables: Interactable[];
  npcs: NpcActor[];
  enemies: EnemyState[];
  activePrompt: ActivePromptTarget | null;
  discoveredIds: Set<string>;
  hiddenPropIds: Set<string>;
  currentInterior: BuildingInterior | null;
  allInteriors: BuildingInterior[];
  clockMinutes: number;
  weather: WeatherKind;
  cameraShake: number;
  quality: GraphicsQuality;
}

export class HollowCreekRenderer {
  private motes: DustMote[] = [];
  private fogPuffs: FogPuff[] = [];
  private rainDrops: RainDrop[] = [];
  private groundChunks: Map<number, HTMLCanvasElement> = new Map();
  private groundPatterns: Record<TileKind, CanvasPattern | string> | null = null;
  private lampGlowCanvas: HTMLCanvasElement | null = null;
  private fogSpriteCanvas: HTMLCanvasElement | null = null;
  private lightCanvas: HTMLCanvasElement | null = null;
  private atlas = new SpriteAtlas();

  constructor() {
    for (let i = 0; i < 64; i++) {
      this.motes.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        vx: -10 + Math.random() * 20,
        vy: -6 + Math.random() * 12,
        r: 1.5 + Math.random() * 2.5,
        alpha: 0.14 + Math.random() * 0.24,
        phase: Math.random() * Math.PI * 2,
      });
    }

    for (let i = 0; i < 12; i++) {
      this.fogPuffs.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        vx: 10 + Math.random() * 14,
        scale: 0.9 + Math.random() * 0.7,
        alpha: 0.14 + Math.random() * 0.1,
      });
    }

    for (let i = 0; i < 90; i++) {
      this.rainDrops.push({
        x: Math.random() * 1600,
        y: Math.random() * 1000,
        len: 14 + Math.random() * 14,
        speed: 520 + Math.random() * 220,
      });
    }
  }

  private getGroundChunk(
    cx: number,
    cy: number,
    tiles: TileKind[][]
  ): HTMLCanvasElement {
    const key = cy * CHUNK_COLS + cx;
    const cached = this.groundChunks.get(key);
    if (cached) return cached;

    const off = document.createElement('canvas');
    off.width = CHUNK_W;
    off.height = CHUNK_H;
    const octx = off.getContext('2d');
    if (octx) {
      if (!this.groundPatterns) {
        this.groundPatterns = buildGroundPatterns(octx);
      }
      const originX = cx * CHUNK_W;
      const originY = cy * CHUNK_H;
      octx.save();
      octx.translate(-originX, -originY);
      this.paintGroundRegion(octx, tiles, originX, originY, CHUNK_W, CHUNK_H);
      octx.restore();
    }
    this.groundChunks.set(key, off);
    return off;
  }

  private paintGroundRegion(
    ctx: CanvasRenderingContext2D,
    tiles: TileKind[][],
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ) {
    const patterns = this.groundPatterns!;
    const startC = Math.max(0, Math.floor(rx / TILE_SIZE));
    const endC = Math.min(MAP_COLS - 1, Math.ceil((rx + rw) / TILE_SIZE) - 1);
    const startR = Math.max(0, Math.floor(ry / TILE_SIZE));
    const endR = Math.min(MAP_ROWS - 1, Math.ceil((ry + rh) / TILE_SIZE) - 1);

    for (let r = startR; r <= endR; r++) {
      for (let c = startC; c <= endC; c++) {
        const kind = tiles[r][c];
        ctx.fillStyle = patterns[kind];
        ctx.fillRect(
          c * TILE_SIZE,
          r * TILE_SIZE,
          TILE_SIZE + 0.5,
          TILE_SIZE + 0.5
        );
      }
    }

    ctx.fillStyle = 'rgba(10, 12, 16, 0.35)';
    for (let r = startR; r <= endR; r++) {
      for (let c = startC; c <= endC; c++) {
        if (tiles[r][c] !== 'road') continue;
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        if (r > 0 && tiles[r - 1][c] === 'sidewalk') {
          ctx.fillRect(x, y, TILE_SIZE, 4);
        }
        if (c > 0 && tiles[r][c - 1] === 'sidewalk') {
          ctx.fillRect(x, y, 4, TILE_SIZE);
        }
      }
    }

    this.paintRoadMarkings(ctx);

    if (rx <= 4050 && rx + rw >= 3790 && ry <= 630 && ry + rh >= 370) {
      this.paintHelipad(ctx, 3920, 500);
    }

    if (rx <= 4220 && rx + rw >= 3800 && ry <= 2140 && ry + rh >= 1780) {
      this.paintBasketballCourt(ctx, 3816, 1800, 384, 312);
    }
  }

  private paintRoadMarkings(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(192, 162, 86, 0.85)';

    const hRoad = (y: number, c0: number, c1: number) => {
      for (let x = c0 * TILE_SIZE; x < c1 * TILE_SIZE; x += 56) {
        const col = Math.floor(x / TILE_SIZE);
        if (
          (col >= 27 && col <= 30) ||
          (col >= 46 && col <= 49) ||
          (col >= 61 && col <= 64)
        ) {
          continue;
        }
        ctx.fillRect(x, y - 2, 28, 4);
      }
    };

    const vRoad = (x: number, r0: number, r1: number) => {
      for (let y = r0 * TILE_SIZE; y < r1 * TILE_SIZE; y += 56) {
        const row = Math.floor(y / TILE_SIZE);
        if (
          (row >= 21 && row <= 24) ||
          (row >= 32 && row <= 35) ||
          (row >= 53 && row <= 56)
        ) {
          continue;
        }
        ctx.fillRect(x - 2, y, 4, 28);
      }
    };

    hRoad(55.5 * TILE_SIZE, 1, 70);
    hRoad(34.5 * TILE_SIZE, 6, 64);
    hRoad(23.5 * TILE_SIZE, 28, 84);

    vRoad(29.5 * TILE_SIZE, 20, 56);
    vRoad(48.5 * TILE_SIZE, 16, 60);
    vRoad(63.5 * TILE_SIZE, 20, 56);

    const intersections: Array<[number, number]> = [
      [28, 54],
      [47, 54],
      [62, 54],
      [28, 33],
      [47, 33],
      [62, 33],
      [28, 22],
      [47, 22],
      [62, 22],
    ];
    ctx.fillStyle = 'rgba(205, 202, 190, 0.34)';
    for (const [ic, ir] of intersections) {
      const ix = ic * TILE_SIZE;
      const iy = ir * TILE_SIZE;
      for (let dx = 12; dx < 128; dx += 20) {
        ctx.fillRect(ix + dx, iy - 18, 10, 16);
        ctx.fillRect(ix + dx, iy + 146, 10, 16);
      }
      for (let dy = 12; dy < 128; dy += 20) {
        ctx.fillRect(ix - 18, iy + dy, 16, 10);
        ctx.fillRect(ix + 146, iy + dy, 16, 10);
      }
    }

    ctx.strokeStyle = 'rgba(202, 200, 190, 0.36)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(474, 2760);
    ctx.lineTo(474, 2885);
    ctx.moveTo(766, 2760);
    ctx.lineTo(766, 2885);
    ctx.stroke();
  }

  private paintHelipad(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(214, 184, 72, 0.72)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 86, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([14, 10]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 104, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(214, 184, 72, 0.78)';
    ctx.fillRect(cx - 28, cy - 36, 12, 72);
    ctx.fillRect(cx + 16, cy - 36, 12, 72);
    ctx.fillRect(cx - 22, cy - 6, 44, 12);
    ctx.restore();
  }

  private paintBasketballCourt(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.save();
    ctx.strokeStyle = 'rgba(220, 224, 230, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(x, y + h / 2 - 48, 66, 96);
    ctx.strokeRect(x + w - 66, y + h / 2 - 48, 66, 96);
    ctx.restore();
  }

  private ensureLampGlowSprite(): HTMLCanvasElement {
    if (this.lampGlowCanvas) return this.lampGlowCanvas;
    const off = document.createElement('canvas');
    off.width = 280;
    off.height = 280;
    const octx = off.getContext('2d');
    if (octx) {
      const grad = octx.createRadialGradient(140, 140, 8, 140, 140, 138);
      grad.addColorStop(0, 'rgba(244, 193, 93, 0.28)');
      grad.addColorStop(0.5, 'rgba(225, 166, 72, 0.1)');
      grad.addColorStop(1, 'rgba(225, 166, 72, 0)');
      octx.fillStyle = grad;
      octx.beginPath();
      octx.arc(140, 140, 138, 0, Math.PI * 2);
      octx.fill();
    }
    this.lampGlowCanvas = off;
    return off;
  }

  private ensureFogSprite(): HTMLCanvasElement {
    if (this.fogSpriteCanvas) return this.fogSpriteCanvas;
    const off = document.createElement('canvas');
    off.width = 320;
    off.height = 180;
    const octx = off.getContext('2d');
    if (octx) {
      const grad = octx.createRadialGradient(160, 90, 14, 160, 90, 155);
      grad.addColorStop(0, 'rgba(165, 184, 196, 0.08)');
      grad.addColorStop(0.55, 'rgba(145, 165, 178, 0.035)');
      grad.addColorStop(1, 'rgba(145, 165, 178, 0)');
      octx.fillStyle = grad;
      octx.beginPath();
      octx.ellipse(160, 90, 155, 86, 0, 0, Math.PI * 2);
      octx.fill();
    }
    this.fogSpriteCanvas = off;
    return off;
  }

  public updateParticles(
    dt: number,
    quality: GraphicsQuality,
    weather: WeatherKind,
    viewW: number,
    viewH: number
  ): void {
    const activeCount = Math.min(
      this.motes.length,
      quality === 'low' ? 20 : quality === 'medium' ? 44 : 64
    );
    for (let i = 0; i < activeCount; i++) {
      const m = this.motes[i];
      m.phase += dt * 1.4;
      m.x += (m.vx + Math.sin(m.phase) * 6) * dt;
      m.y += (m.vy + Math.cos(m.phase * 0.8) * 4) * dt;
      if (m.x < 0) m.x += WORLD_WIDTH;
      if (m.x > WORLD_WIDTH) m.x -= WORLD_WIDTH;
      if (m.y < 0) m.y += WORLD_HEIGHT;
      if (m.y > WORLD_HEIGHT) m.y -= WORLD_HEIGHT;
    }

    if (quality !== 'low') {
      for (let i = 0; i < this.fogPuffs.length; i++) {
        const f = this.fogPuffs[i];
        f.x += f.vx * dt;
        if (f.x > WORLD_WIDTH + 240) f.x = -240;
      }
    }

    if (weather === 'rain') {
      for (let i = 0; i < this.rainDrops.length; i++) {
        const d = this.rainDrops[i];
        d.x -= d.speed * 0.22 * dt;
        d.y += d.speed * dt;
        if (d.y > viewH + 30) {
          d.y = -20;
          d.x = Math.random() * (viewW + 240);
        }
        if (d.x < -40) {
          d.x += viewW + 200;
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, frame: RenderFrameData): void {
    const {
      viewW,
      viewH,
      camX,
      camY,
      time,
      currentInterior,
      cameraShake,
    } = frame;

    const shakeX =
      cameraShake > 0 ? (Math.random() - 0.5) * 14 * cameraShake : 0;
    const shakeY =
      cameraShake > 0 ? (Math.random() - 0.5) * 14 * cameraShake : 0;

    if (currentInterior) {
      this.renderInterior(ctx, frame, currentInterior, shakeX, shakeY);
    } else {
      this.renderExterior(ctx, frame, shakeX, shakeY);
    }

    // World Day/Night & Flashlight Cone Lighting Pass
    this.renderLightingOverlay(ctx, frame, shakeX, shakeY);

    // Rain Weather Streaks (Exterior only)
    if (!currentInterior && frame.weather === 'rain' && frame.quality !== 'low') {
      ctx.save();
      ctx.strokeStyle = 'rgba(182, 208, 232, 0.28)';
      ctx.lineWidth = 1.3;
      const count = frame.quality === 'medium' ? 45 : this.rainDrops.length;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const d = this.rainDrops[i];
        const rx = d.x % (viewW + 80);
        const ry = d.y % (viewH + 40);
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - d.len * 0.22, ry + d.len);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Active prompt tag floating cleanly in world space
    if (frame.activePrompt && frame.stats.hiddenInSpotId === null) {
      const ox = Math.round(viewW / 2 - camX + shakeX);
      const oy = Math.round(viewH / 2 - camY + shakeY);
      const sx = frame.activePrompt.x + ox;
      const yLift = frame.activePrompt.kind === 'npc' ? 48 : 36;
      const sy = frame.activePrompt.y + oy - yLift + Math.sin(time * 4) * 2;
      if (sx > 40 && sx < viewW - 40 && sy > 40 && sy < viewH - 40) {
        ctx.save();
        const tag = `[E] ${frame.activePrompt.verb}`;
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        const tw = ctx.measureText(tag).width + 16;
        ctx.fillStyle = 'rgba(14, 18, 24, 0.92)';
        ctx.strokeStyle = '#d49b4b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(sx - tw / 2, sy - 11, tw, 22, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f3eee4';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tag, sx, sy);
        ctx.restore();
      }
    }
  }

  private renderExterior(
    ctx: CanvasRenderingContext2D,
    frame: RenderFrameData,
    shakeX: number,
    shakeY: number
  ) {
    const {
      viewW,
      viewH,
      camX,
      camY,
      time,
      tiles,
      props,
      player,
      stats,
      interactables,
      npcs,
      enemies,
      activePrompt,
      discoveredIds,
      hiddenPropIds,
      allInteriors,
      quality,
    } = frame;

    ctx.save();
    const viewLeft = camX - viewW / 2;
    const viewTop = camY - viewH / 2;
    if (
      viewLeft < 0 ||
      viewTop < 0 ||
      viewLeft + viewW > WORLD_WIDTH ||
      viewTop + viewH > WORLD_HEIGHT
    ) {
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, viewW, viewH);
    }

    const offsetX = Math.round(viewW / 2 - camX + shakeX);
    const offsetY = Math.round(viewH / 2 - camY + shakeY);

    const cStart = Math.max(0, Math.floor(viewLeft / CHUNK_W));
    const cEnd = Math.min(CHUNK_COLS - 1, Math.floor((viewLeft + viewW) / CHUNK_W));
    const rStart = Math.max(0, Math.floor(viewTop / CHUNK_H));
    const rEnd = Math.min(CHUNK_ROWS - 1, Math.floor((viewTop + viewH) / CHUNK_H));

    for (let cy = rStart; cy <= rEnd; cy++) {
      for (let cx = cStart; cx <= cEnd; cx++) {
        const chunk = this.getGroundChunk(cx, cy, tiles);
        const worldX = cx * CHUNK_W;
        const worldY = cy * CHUNK_H;
        const ix0 = Math.max(worldX, Math.floor(viewLeft));
        const iy0 = Math.max(worldY, Math.floor(viewTop));
        const ix1 = Math.min(worldX + CHUNK_W, Math.ceil(viewLeft + viewW));
        const iy1 = Math.min(worldY + CHUNK_H, Math.ceil(viewTop + viewH));
        const sw = ix1 - ix0;
        const sh = iy1 - iy0;
        if (sw > 0 && sh > 0) {
          ctx.drawImage(
            chunk,
            ix0 - worldX,
            iy0 - worldY,
            sw,
            sh,
            ix0 + offsetX,
            iy0 + offsetY,
            sw,
            sh
          );
        }
      }
    }

    ctx.translate(offsetX, offsetY);

    // Building door entrance markers on exterior map
    const pulse = 0.5 + 0.5 * Math.sin(time * 3.4);
    for (const b of allInteriors) {
      const ex = b.exteriorEntrance;
      if (
        ex.x < viewLeft - 100 ||
        ex.x > viewLeft + viewW + 100 ||
        ex.y < viewTop - 100 ||
        ex.y > viewTop + viewH + 100
      ) {
        continue;
      }
      ctx.save();
      ctx.fillStyle = 'rgba(212, 155, 75, 0.22)';
      ctx.strokeStyle = '#d49b4b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(ex.x - 16, ex.y - 8, 32, 16, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Interactable rings
    this.drawInteractableRings(
      ctx,
      interactables,
      activePrompt?.kind === 'interactable' ? activePrompt.id : null,
      discoveredIds,
      time,
      pulse
    );

    const renderItems: Array<{ sortY: number; draw: () => void }> = [];
    const margin = 260;
    const minX = viewLeft - margin;
    const maxX = viewLeft + viewW + margin;
    const minY = viewTop - margin;
    const maxY = viewTop + viewH + margin;

    for (const p of props) {
      if (hiddenPropIds.has(p.id)) continue;
      if (p.x + p.w < minX || p.x > maxX || p.y + p.h < minY || p.y > maxY) {
        continue;
      }
      const sortY = p.kind === 'note_prop' ? p.y : p.y + p.h;
      renderItems.push({
        sortY,
        draw: () => {
          if (p.kind === 'lamp_post') {
            this.drawLampPost(ctx, p, time);
          } else if (p.kind === 'note_prop') {
            this.drawNoteProp(ctx, p, time);
          } else {
            const cached = this.atlas.getSprite(p);
            ctx.drawImage(cached.canvas, p.x - cached.pad, p.y - cached.pad);
          }
        },
      });
    }

    for (const npc of npcs) {
      if (npc.location !== 'exterior') continue;
      renderItems.push({
        sortY: npc.y + 12,
        draw: () => this.drawNpc(ctx, npc, time),
      });
    }

    for (const enemy of enemies) {
      if (
        enemy.x < minX ||
        enemy.x > maxX ||
        enemy.y < minY ||
        enemy.y > maxY
      ) {
        continue;
      }
      if (enemy.aiState === 'ko' && enemy.koTimer <= 0) continue;
      renderItems.push({
        sortY: enemy.y + enemy.radius * 0.7,
        draw: () => this.drawEnemy(ctx, enemy, time),
      });
    }

    if (stats.hiddenInSpotId === null) {
      renderItems.push({
        sortY: player.y + player.radius * 0.7,
        draw: () => this.drawAlexMorgan(ctx, player, stats, time),
      });
    }

    renderItems.sort((a, b) => a.sortY - b.sortY);
    for (const item of renderItems) {
      item.draw();
    }

    if (quality !== 'low') {
      this.drawLampGlows(ctx, props, time, minX, maxX, minY, maxY);
      this.drawFogBanks(ctx, quality, minX, maxX, minY, maxY);
    }
    this.drawParticles(ctx, quality, minX, maxX, minY, maxY);
    this.drawWestFogWall(ctx, time, minX, minY, maxY);

    ctx.restore();
  }

  private renderInterior(
    ctx: CanvasRenderingContext2D,
    frame: RenderFrameData,
    interior: BuildingInterior,
    shakeX: number,
    shakeY: number
  ) {
    const { viewW, viewH, camX, camY, player, stats, npcs, time } = frame;
    ctx.save();
    ctx.fillStyle = '#090c11';
    ctx.fillRect(0, 0, viewW, viewH);

    const offsetX = Math.round(viewW / 2 - camX + shakeX);
    const offsetY = Math.round(viewH / 2 - camY + shakeY);
    ctx.translate(offsetX, offsetY);

    // 1. Room Floors
    for (const room of interior.rooms) {
      ctx.fillStyle =
        room.floor === 'wood'
          ? '#4b3b2d'
          : room.floor === 'carpet'
            ? '#38434e'
            : room.floor === 'hospital_tile'
              ? '#5c666a'
              : room.floor === 'concrete'
                ? '#3c4148'
                : '#50555c';
      ctx.fillRect(room.x, room.y, room.w, room.h);

      // Subtle floor plank/tile pattern
      ctx.strokeStyle = 'rgba(10, 12, 16, 0.24)';
      ctx.lineWidth = 1;
      if (room.floor === 'wood') {
        for (let y = room.y + 18; y < room.y + room.h; y += 18) {
          ctx.beginPath();
          ctx.moveTo(room.x, y);
          ctx.lineTo(room.x + room.w, y);
          ctx.stroke();
        }
      } else if (room.floor === 'tile_checker' || room.floor === 'hospital_tile') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let ty = room.y; ty < room.y + room.h; ty += 32) {
          for (let tx = room.x; tx < room.x + room.w; tx += 32) {
            if (((tx + ty) / 32) % 2 === 0) {
              ctx.fillRect(tx, ty, 32, 32);
            }
          }
        }
      }

      // Room subtle title watermark on floor corner
      ctx.fillStyle = 'rgba(235, 228, 212, 0.25)';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(room.name.toUpperCase(), room.x + 26, room.y + 34);
    }

    // 2. Exit Doormat
    ctx.fillStyle = '#735036';
    ctx.strokeStyle = '#d49b4b';
    ctx.lineWidth = 2;
    ctx.fillRect(interior.exitDoor.x - 36, interior.exitDoor.y - 12, 72, 24);
    ctx.strokeRect(interior.exitDoor.x - 36, interior.exitDoor.y - 12, 72, 24);
    ctx.fillStyle = '#f3eee4';
    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', interior.exitDoor.x, interior.exitDoor.y + 3);
    ctx.textAlign = 'left';

    // 3. Rugs (non-solid ground furniture)
    for (const f of interior.furniture) {
      if (!f.solid) this.drawFurniture(ctx, f);
    }

    // 4. Walls & Doors
    for (const w of interior.walls) {
      ctx.fillStyle = '#1e242d';
      ctx.strokeStyle = '#0c0f14';
      ctx.lineWidth = 2;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = '#2f3744';
      ctx.fillRect(w.x + 2, w.y + 2, Math.max(0, w.w - 4), 4);
    }

    for (const d of interior.doors) {
      if (d.open) {
        ctx.fillStyle = 'rgba(212, 155, 75, 0.22)';
        ctx.fillRect(d.x, d.y, d.w, d.h);
      } else {
        ctx.fillStyle = d.locked ? '#6b3b34' : '#73563c';
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 2;
        ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.strokeRect(d.x, d.y, d.w, d.h);
        if (d.locked) {
          ctx.fillStyle = '#d49b4b';
          ctx.beginPath();
          ctx.arc(d.x + d.w / 2, d.y + d.h / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 5. Searchable containers / Hiding spots / Puzzles highlight rings
    const pulse = 0.5 + 0.5 * Math.sin(time * 3.5);
    for (const c of interior.containers) {
      if (c.searched) continue;
      ctx.strokeStyle = `rgba(212, 155, 75, ${0.35 + pulse * 0.35})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 16 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const puz of interior.puzzles) {
      if (puz.solved) continue;
      ctx.strokeStyle = `rgba(108, 178, 224, ${0.45 + pulse * 0.35})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(puz.x, puz.y, 18 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 6. Y-sorted Solid Furniture, NPCs & Alex Morgan
    const items: Array<{ sortY: number; draw: () => void }> = [];
    for (const f of interior.furniture) {
      if (!f.solid) continue;
      items.push({
        sortY: f.y + f.h,
        draw: () => this.drawFurniture(ctx, f),
      });
    }
    for (const npc of npcs) {
      if (npc.location !== interior.id) continue;
      items.push({
        sortY: npc.y + 12,
        draw: () => this.drawNpc(ctx, npc, time),
      });
    }
    if (stats.hiddenInSpotId === null) {
      items.push({
        sortY: player.y + player.radius * 0.7,
        draw: () => this.drawAlexMorgan(ctx, player, stats, time),
      });
    }
    items.sort((a, b) => a.sortY - b.sortY);
    for (const item of items) {
      item.draw();
    }

    ctx.restore();
  }

  private drawFurniture(ctx: CanvasRenderingContext2D, f: InteriorFurniture) {
    ctx.save();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;

    switch (f.kind) {
      case 'rug':
        ctx.fillStyle = '#5c3c3c';
        ctx.fillRect(f.x, f.y, f.w, f.h);
        ctx.strokeStyle = '#9c7852';
        ctx.strokeRect(f.x + 6, f.y + 6, f.w - 12, f.h - 12);
        break;
      case 'bed':
      case 'hospital_bed':
        ctx.fillStyle = f.kind === 'hospital_bed' ? '#586470' : '#4f3b2e';
        ctx.fillRect(f.x, f.y, f.w, f.h);
        ctx.strokeRect(f.x, f.y, f.w, f.h);
        ctx.fillStyle = f.kind === 'hospital_bed' ? '#b8c4cc' : '#6c7c8e';
        ctx.fillRect(f.x + 6, f.y + 6, f.w * 0.65, f.h - 12);
        ctx.fillStyle = '#e0dbd0';
        ctx.fillRect(f.x + f.w - 28, f.y + 10, 20, f.h - 20);
        break;
      case 'sofa':
        ctx.fillStyle = '#5c4b42';
        ctx.beginPath();
        ctx.roundRect(f.x, f.y, f.w, f.h, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#473830';
        ctx.fillRect(f.x + 6, f.y + 4, f.w - 12, 12);
        break;
      case 'fridge':
        ctx.fillStyle = '#b4bcc4';
        ctx.fillRect(f.x, f.y, f.w, f.h);
        ctx.strokeRect(f.x, f.y, f.w, f.h);
        ctx.fillStyle = '#8b949e';
        ctx.fillRect(f.x + 4, f.y + 4, f.w - 8, 8);
        break;
      case 'stove':
        ctx.fillStyle = '#333a44';
        ctx.fillRect(f.x, f.y, f.w, f.h);
        ctx.strokeRect(f.x, f.y, f.w, f.h);
        ctx.fillStyle = '#181c22';
        ctx.beginPath();
        ctx.arc(f.x + 16, f.y + 16, 6, 0, Math.PI * 2);
        ctx.arc(f.x + f.w - 16, f.y + 16, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'safe':
        ctx.fillStyle = '#2d3540';
        ctx.fillRect(f.x, f.y, f.w, f.h);
        ctx.strokeRect(f.x, f.y, f.w, f.h);
        ctx.fillStyle = '#d49b4b';
        ctx.beginPath();
        ctx.arc(f.x + f.w / 2, f.y + f.h / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'wardrobe':
      case 'locker':
        ctx.fillStyle = f.kind === 'wardrobe' ? '#5c4430' : '#4a5562';
        ctx.fillRect(f.x, f.y, f.w, f.h);
        ctx.strokeRect(f.x, f.y, f.w, f.h);
        ctx.beginPath();
        ctx.moveTo(f.x + f.w / 2, f.y + 4);
        ctx.lineTo(f.x + f.w / 2, f.y + f.h - 4);
        ctx.stroke();
        break;
      default:
        ctx.fillStyle =
          f.kind === 'counter'
            ? '#6b5e52'
            : f.kind === 'bookshelf'
              ? '#5a3d2b'
              : '#69503b';
        ctx.fillRect(f.x, f.y, f.w, f.h);
        ctx.strokeRect(f.x, f.y, f.w, f.h);
        break;
    }
    ctx.restore();
  }

  private renderLightingOverlay(
    ctx: CanvasRenderingContext2D,
    frame: RenderFrameData,
    shakeX: number,
    shakeY: number
  ) {
    const { viewW, viewH, camX, camY, player, stats, props, currentInterior, clockMinutes, weather } = frame;
    const darkness = getAmbientDarkness(clockMinutes, weather, Boolean(currentInterior));
    if (darkness <= 0.05) return;

    const scale = 0.5;
    const lw = Math.max(160, Math.floor(viewW * scale));
    const lh = Math.max(120, Math.floor(viewH * scale));
    if (!this.lightCanvas || this.lightCanvas.width !== lw || this.lightCanvas.height !== lh) {
      this.lightCanvas = document.createElement('canvas');
      this.lightCanvas.width = lw;
      this.lightCanvas.height = lh;
    }
    const lctx = this.lightCanvas.getContext('2d');
    if (!lctx) return;

    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, lw, lh);
    lctx.fillStyle = `rgba(6, 9, 16, ${darkness.toFixed(3)})`;
    lctx.fillRect(0, 0, lw, lh);

    const ox = (viewW / 2 - camX + shakeX) * scale;
    const oy = (viewH / 2 - camY + shakeY) * scale;
    const px = player.x * scale + ox;
    const py = player.y * scale + oy;

    lctx.globalCompositeOperation = 'destination-out';

    // 1. Player immediate close-vision halo
    const auraR = (stats.hiddenInSpotId ? 76 : 155) * scale;
    const aura = lctx.createRadialGradient(px, py, 8, px, py, auraR);
    aura.addColorStop(0, 'rgba(0,0,0,0.92)');
    aura.addColorStop(0.6, 'rgba(0,0,0,0.55)');
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    lctx.fillStyle = aura;
    lctx.beginPath();
    lctx.arc(px, py, auraR, 0, Math.PI * 2);
    lctx.fill();

    // 2. Flashlight directional cone
    if (stats.hasFlashlight && stats.flashlightOn && stats.battery > 0 && stats.hiddenInSpotId === null) {
      const coneLen = 360 * scale;
      const spread = 0.46;
      const coneGrad = lctx.createRadialGradient(px, py, 8, px, py, coneLen);
      coneGrad.addColorStop(0, 'rgba(0,0,0,1)');
      coneGrad.addColorStop(0.72, 'rgba(0,0,0,0.88)');
      coneGrad.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = coneGrad;
      lctx.beginPath();
      lctx.moveTo(px, py);
      lctx.arc(px, py, coneLen, player.facingAngle - spread, player.facingAngle + spread);
      lctx.closePath();
      lctx.fill();
    }

    // 3. Lit Streetlamps on Exterior or Entry Lamps inside Buildings
    if (!currentInterior) {
      const lampR = 195 * scale;
      for (const p of props) {
        if (p.kind !== 'lamp_post' || !p.lit) continue;
        const lx = (p.x + p.w / 2) * scale + ox;
        const ly = (p.y + p.h / 2) * scale + oy;
        if (lx < -lampR || lx > lw + lampR || ly < -lampR || ly > lh + lampR) continue;
        const lg = lctx.createRadialGradient(lx, ly, 6, lx, ly, lampR);
        lg.addColorStop(0, 'rgba(0,0,0,0.96)');
        lg.addColorStop(0.55, 'rgba(0,0,0,0.58)');
        lg.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.fillStyle = lg;
        lctx.beginPath();
        lctx.arc(lx, ly, lampR, 0, Math.PI * 2);
        lctx.fill();
      }
    } else {
      // Dim interior doorway glow
      const ex = currentInterior.exitDoor.x * scale + ox;
      const ey = currentInterior.exitDoor.y * scale + oy;
      const eg = lctx.createRadialGradient(ex, ey, 6, ex, ey, 165 * scale);
      eg.addColorStop(0, 'rgba(0,0,0,0.88)');
      eg.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = eg;
      lctx.beginPath();
      lctx.arc(ex, ey, 165 * scale, 0, Math.PI * 2);
      lctx.fill();
    }

    ctx.drawImage(this.lightCanvas, 0, 0, lw, lh, 0, 0, viewW, viewH);
  }

  private drawInteractableRings(
    ctx: CanvasRenderingContext2D,
    interactables: Interactable[],
    nearestId: string | null,
    discoveredIds: Set<string>,
    _time: number,
    pulse: number
  ) {
    for (const item of interactables) {
      const isTarget = item.id === nearestId;
      const isFound = discoveredIds.has(item.id);
      if (!isTarget && isFound) continue;

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        item.x,
        item.y,
        isTarget ? 26 + pulse * 4 : 17 + pulse * 3,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = isTarget
        ? `rgba(244, 193, 93, ${0.7 + pulse * 0.28})`
        : `rgba(220, 194, 132, ${0.26 + pulse * 0.18})`;
      ctx.lineWidth = isTarget ? 2.8 : 1.6;
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawLampPost(ctx: CanvasRenderingContext2D, p: WorldProp, time: number) {
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    ctx.fillStyle = 'rgba(8, 10, 14, 0.45)';
    ctx.beginPath();
    ctx.arc(cx + 3, cy + 4, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#333b46';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const flicker = p.lit ? 0.84 + 0.16 * Math.sin(time * 9 + p.x) : 0;
    ctx.fillStyle = p.lit ? `rgba(244, 193, 93, ${flicker})` : '#4f5661';
    ctx.beginPath();
    ctx.arc(cx, cy, 4.2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawNoteProp(ctx: CanvasRenderingContext2D, p: WorldProp, time: number) {
    const bob = Math.sin(time * 3) * 1.5;
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2 + bob);
    ctx.rotate(-0.22);
    ctx.fillStyle = '#ebe0c5';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.fillRect(-9, -11, 18, 22);
    ctx.strokeRect(-9, -11, 18, 22);

    ctx.strokeStyle = '#6f6554';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.lineTo(5, -5);
    ctx.moveTo(-5, 0);
    ctx.lineTo(4, 0);
    ctx.moveTo(-5, 5);
    ctx.lineTo(2, 5);
    ctx.stroke();
    ctx.restore();
  }

  private drawNpc(ctx: CanvasRenderingContext2D, npc: NpcActor, time: number) {
    ctx.save();
    ctx.translate(npc.x, npc.y);

    ctx.fillStyle = 'rgba(6, 8, 12, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = Math.sin(time * 2) * 1;
    ctx.fillStyle = npc.jacketColor;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-9, -11, 18, 22, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d4aa8c';
    ctx.beginPath();
    ctx.arc(0, -1 + bob, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d49b4b';
    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, 0, -19);
    ctx.restore();
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, e: EnemyState, time: number) {
    ctx.save();
    ctx.translate(e.x, e.y);

    if (e.aiState === 'ko') {
      ctx.globalAlpha = Math.max(0.15, e.koTimer / 0.45);
    }

    // Windup attack telegraph ring
    if (e.windupTimer > 0) {
      const pct = 1 - e.windupTimer / 0.45;
      ctx.strokeStyle = 'rgba(220, 68, 62, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 22 + pct * 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Mimic misleading static wave
    if (e.type === 'mimic' && e.aiState !== 'ko') {
      const r = 18 + ((time * 24) % 24);
      ctx.strokeStyle = 'rgba(130, 185, 210, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(6, 8, 12, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 8, e.radius, e.radius * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(e.facingAngle);

    if (e.hitFlash > 0) {
      ctx.fillStyle = '#f8f2e8';
    } else if (e.type === 'watcher') {
      ctx.fillStyle = '#151821';
    } else if (e.type === 'mimic') {
      ctx.fillStyle = '#2d3942';
    } else {
      ctx.fillStyle = '#33292b';
    }

    ctx.strokeStyle = '#080a0e';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, e.radius * 0.9, e.radius * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing eyes
    ctx.fillStyle =
      e.aiState === 'chase'
        ? '#e85d56'
        : e.type === 'watcher'
          ? '#e8e2c5'
          : '#d49b4b';
    ctx.beginPath();
    ctx.arc(7, -3.5, 2, 0, Math.PI * 2);
    ctx.arc(7, 3.5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Upright detection indicator (? or !)
    if (e.aiState === 'suspicious' || e.aiState === 'chase') {
      ctx.save();
      ctx.fillStyle = e.aiState === 'chase' ? '#e85d56' : '#d49b4b';
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(e.aiState === 'chase' ? '!' : '?', e.x, e.y - 24);
      ctx.restore();
    }
  }

  private drawAlexMorgan(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    stats: SurvivalStats,
    time: number
  ) {
    ctx.save();
    ctx.translate(player.x, player.y);

    if (stats.invulnTimer > 0 && Math.floor(stats.invulnTimer * 14) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }

    // Attack swing visual arc
    if (stats.attackSwingTimer > 0) {
      ctx.save();
      ctx.rotate(player.facingAngle);
      ctx.strokeStyle =
        stats.equippedWeapon === 'crowbar'
          ? 'rgba(235, 196, 118, 0.85)'
          : 'rgba(220, 226, 234, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(
        4,
        0,
        stats.equippedWeapon === 'crowbar' ? 42 : 30,
        -0.9,
        0.9
      );
      ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(6, 8, 12, 0.48)';
    ctx.beginPath();
    ctx.ellipse(0, 7, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    const isMoving = player.stance !== 'idle';
    const stride = isMoving ? Math.sin(player.gaitPhase) : 0;
    const bob = isMoving
      ? Math.abs(Math.cos(player.gaitPhase)) * (player.stance === 'run' ? 2.8 : 1.6)
      : Math.sin(time * 2.4) * 0.8;
    const crouchScale = player.stance === 'sneak' ? 0.88 : 1;

    ctx.rotate(player.facingAngle);
    ctx.scale(crouchScale, crouchScale);

    const footSpread = player.stance === 'run' ? 8.5 : 5.5;
    ctx.fillStyle = '#262220';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(stride * footSpread, -6, 5.2, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-stride * footSpread, 6, 5.2, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (stats.hasBackpack) {
      ctx.fillStyle = '#5c4b3b';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-16, -9, 10, 18, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#75614e';
      ctx.fillRect(-14, -6, 4, 12);
    }

    const reachBoost = player.interactAnimTimer > 0 ? 6 : 0;
    ctx.fillStyle = '#252f3d';
    ctx.beginPath();
    ctx.ellipse(-stride * 4 + 2, -12, 5.5, 3.8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(stride * 4 + 2 + reachBoost, 12, 5.5, 3.8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (stats.equippedWeapon === 'crowbar') {
      ctx.strokeStyle = '#9ca6b3';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(6, 12);
      ctx.lineTo(22, 8);
      ctx.stroke();
    }

    ctx.fillStyle = '#293444';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.roundRect(-8, -11, 16, 22, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3b4a60';
    ctx.fillRect(2, -5, 4, 10);

    ctx.translate(2, -bob * 0.4);
    ctx.fillStyle = '#dfb597';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#151922';
    ctx.beginPath();
    ctx.arc(5.2, -3.2, 1.5, 0, Math.PI * 2);
    ctx.arc(5.2, 3.2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#231c1a';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-1.5, 0, 9.5, Math.PI * 0.45, Math.PI * 1.55);
    ctx.quadraticCurveTo(3, -3, 3, 0);
    ctx.quadraticCurveTo(3, 3, -1.5, 9.5);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawLampGlows(
    ctx: CanvasRenderingContext2D,
    props: WorldProp[],
    time: number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
  ) {
    const sprite = this.ensureLampGlowSprite();
    ctx.save();
    for (const p of props) {
      if (p.kind !== 'lamp_post' || !p.lit) continue;
      if (
        p.x < minX - 150 ||
        p.x > maxX + 150 ||
        p.y < minY - 150 ||
        p.y > maxY + 150
      ) {
        continue;
      }
      const cx = p.x + p.w / 2;
      const cy = p.y + p.h / 2;
      const flicker = 0.92 + 0.08 * Math.sin(time * 7 + p.x);
      const r = 140 * flicker;
      ctx.drawImage(sprite, cx - r, cy - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  private drawFogBanks(
    ctx: CanvasRenderingContext2D,
    quality: GraphicsQuality,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
  ) {
    const sprite = this.ensureFogSprite();
    const count = quality === 'medium' ? 8 : this.fogPuffs.length;
    for (let i = 0; i < count; i++) {
      const f = this.fogPuffs[i];
      const w = 320 * f.scale;
      const h = 180 * f.scale;
      if (f.x + w < minX || f.x - w > maxX || f.y + h < minY || f.y - h > maxY) {
        continue;
      }
      ctx.drawImage(sprite, f.x - w / 2, f.y - h / 2, w, h);
    }
  }

  private drawParticles(
    ctx: CanvasRenderingContext2D,
    quality: GraphicsQuality,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
  ) {
    const activeCount = Math.min(
      this.motes.length,
      quality === 'low' ? 20 : quality === 'medium' ? 44 : 64
    );
    ctx.save();
    for (let i = 0; i < activeCount; i++) {
      const m = this.motes[i];
      if (m.x < minX || m.x > maxX || m.y < minY || m.y > maxY) continue;
      ctx.fillStyle = `rgba(210, 222, 232, ${m.alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawWestFogWall(
    ctx: CanvasRenderingContext2D,
    time: number,
    minX: number,
    minY: number,
    maxY: number
  ) {
    if (minX > 360) return;
    const y0 = Math.max(0, minY);
    const y1 = Math.min(WORLD_HEIGHT, maxY);
    if (y1 <= y0) return;
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.9);
    const fogGrad = ctx.createLinearGradient(0, 0, 240, 0);
    fogGrad.addColorStop(0, `rgba(138, 158, 170, ${0.42 + pulse * 0.07})`);
    fogGrad.addColorStop(0.55, `rgba(138, 158, 170, ${0.14 + pulse * 0.04})`);
    fogGrad.addColorStop(1, 'rgba(138, 158, 170, 0)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, y0, 240, y1 - y0);
  }
}
