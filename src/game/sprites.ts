import { PropKind, WorldProp } from './types';

const INK = '#11151d';
const SHADOW_PAD = 18;

export interface CachedSprite {
  canvas: HTMLCanvasElement;
  pad: number;
}

export class SpriteAtlas {
  private cache = new Map<string, CachedSprite>();

  public getSprite(prop: WorldProp): CachedSprite {
    // Key by kind + dimensions + label/lit so identical props share one cached bitmap
    const key = `${prop.kind}:${prop.w}x${prop.h}:${prop.label ?? ''}`;
    const existing = this.cache.get(key);
    if (existing) return existing;

    const canvas = document.createElement('canvas');
    canvas.width = prop.w + SHADOW_PAD * 2;
    canvas.height = prop.h + SHADOW_PAD * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(SHADOW_PAD, SHADOW_PAD);
      this.paintProp(ctx, prop.kind, prop.w, prop.h, prop.label);
    }

    const entry = { canvas, pad: SHADOW_PAD };
    this.cache.set(key, entry);
    return entry;
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  private drawShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r = 6,
    dx = 8,
    dy = 10
  ) {
    ctx.fillStyle = 'rgba(6, 9, 14, 0.46)';
    this.roundRect(ctx, x + dx, y + dy, w, h, r);
    ctx.fill();
  }

  private paintProp(
    ctx: CanvasRenderingContext2D,
    kind: PropKind,
    w: number,
    h: number,
    label?: string
  ) {
    switch (kind) {
      case 'bus':
        this.paintBus(ctx, w, h, '#3d5a64', '#c99b44', '14');
        break;
      case 'school_bus':
        this.paintBus(ctx, w, h, '#c9972c', '#1c2026', '07');
        break;
      case 'police_car':
        this.paintEmergencyCar(ctx, w, h, 'police');
        break;
      case 'ambulance':
        this.paintEmergencyCar(ctx, w, h, 'ambulance');
        break;
      case 'car_wreck':
        this.paintCar(ctx, w, h, '#6f3e3a', '#4f2c29', true);
        break;
      case 'car_blue':
        this.paintCar(ctx, w, h, '#3a556e', '#283c4f', false);
        break;
      case 'car_white':
        this.paintCar(ctx, w, h, '#9aa1a8', '#747c84', true);
        break;
      case 'pickup_rust':
        this.paintPickup(ctx, w, h);
        break;
      case 'container_red':
        this.paintContainer(ctx, w, h, '#6b3634', '#4a2321');
        break;
      case 'container_blue':
        this.paintContainer(ctx, w, h, '#354f66', '#233647');
        break;
      case 'house_blue':
        this.paintHouse(ctx, w, h, '#415870', '#2b3b4c', '#748496', true);
        break;
      case 'house_ochre':
        this.paintHouse(ctx, w, h, '#7c6145', '#4e3c29', '#a18666', false);
        break;
      case 'house_green':
        this.paintHouse(ctx, w, h, '#3f5a47', '#293c2f', '#6d8571', true);
        break;
      case 'house_victorian':
        this.paintVictorianHouse(ctx, w, h);
        break;
      case 'shop_diner':
        this.paintShop(ctx, w, h, '#523437', '#b8423f', '#e5dec9', 'DINER');
        break;
      case 'shop_hardware':
        this.paintShop(ctx, w, h, '#4f555e', '#7b5b3c', '#c8a66e', 'HARDWARE');
        break;
      case 'shop_pharmacy':
        this.paintShop(ctx, w, h, '#3e4e59', '#387556', '#cde3d5', 'PHARMACY');
        break;
      case 'shop_cinema':
        this.paintShop(ctx, w, h, '#352f42', '#8e3d3a', '#e0b861', 'STARLIGHT');
        break;
      case 'police_station':
        this.paintPoliceStation(ctx, w, h);
        break;
      case 'hospital':
        this.paintHospital(ctx, w, h);
        break;
      case 'school':
        this.paintSchool(ctx, w, h);
        break;
      case 'warehouse':
        this.paintWarehouse(ctx, w, h);
        break;
      case 'silo':
        this.paintSilo(ctx, w, h);
        break;
      case 'shed':
        this.paintShed(ctx, w, h);
        break;
      case 'gazebo':
        this.paintGazebo(ctx, w, h);
        break;
      case 'fountain':
        this.paintFountain(ctx, w, h);
        break;
      case 'bus_shelter':
        this.paintBusShelter(ctx, w, h);
        break;
      case 'payphone':
        this.paintPayphone(ctx, w, h);
        break;
      case 'welcome_sign':
        this.paintWelcomeSign(ctx, w, h, label || 'HOLLOW CREEK');
        break;
      case 'pine_tree':
        this.paintPineTree(ctx, w, h);
        break;
      case 'oak_tree':
        this.paintOakTree(ctx, w, h);
        break;
      case 'dead_tree':
        this.paintDeadTree(ctx, w, h);
        break;
      case 'bush':
        this.paintBush(ctx, w, h);
        break;
      case 'bench':
        this.paintBench(ctx, w, h);
        break;
      case 'patio_table':
        this.paintPatioTable(ctx, w, h);
        break;
      case 'trash_bin':
        this.paintTrashBin(ctx, w, h);
        break;
      case 'dumpster':
        this.paintDumpster(ctx, w, h);
        break;
      case 'road_barrier':
        this.paintRoadBarrier(ctx, w, h);
        break;
      case 'traffic_cone':
        this.paintTrafficCone(ctx, w, h);
        break;
      case 'hydrant':
        this.paintHydrant(ctx, w, h);
        break;
      case 'mailbox':
        this.paintMailbox(ctx, w, h);
        break;
      case 'crate':
        this.paintCrate(ctx, w, h);
        break;
      case 'barrel':
        this.paintBarrel(ctx, w, h);
        break;
      case 'pallet':
        this.paintPallet(ctx, w, h);
        break;
      case 'boulder':
        this.paintBoulder(ctx, w, h);
        break;
      case 'fallen_log':
        this.paintFallenLog(ctx, w, h);
        break;
      case 'hollow_stump':
        this.paintHollowStump(ctx, w, h);
        break;
      case 'underground_hatch':
        this.paintUndergroundHatch(ctx, w, h);
        break;
      case 'fence_wood_h':
        this.paintFenceWood(ctx, w, h, true);
        break;
      case 'fence_wood_v':
        this.paintFenceWood(ctx, w, h, false);
        break;
      case 'fence_chain_h':
        this.paintFenceChain(ctx, w, h, true);
        break;
      case 'fence_chain_v':
        this.paintFenceChain(ctx, w, h, false);
        break;
      case 'backpack_prop':
        this.paintBackpack(ctx, w, h);
        break;
      case 'flashlight_prop':
        this.paintFlashlight(ctx, w, h);
        break;
      case 'lamp_post':
      case 'note_prop':
        // Rendered dynamically for flicker / bobbing
        break;
    }
  }

  private paintBus(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    body: string,
    stripe: string,
    num: string
  ) {
    this.drawShadow(ctx, 0, 0, w, h, 12, 8, 10);

    // Tires protruding slightly
    ctx.fillStyle = '#171a20';
    ctx.fillRect(26, -3, 28, 6);
    ctx.fillRect(w - 56, -3, 28, 6);
    ctx.fillRect(26, h - 3, 28, 6);
    ctx.fillRect(w - 56, h - 3, 28, 6);

    // Chassis
    ctx.fillStyle = body;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    this.roundRect(ctx, 0, 0, w, h, 12);
    ctx.fill();
    ctx.stroke();

    // Roof crown & AC vents
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this.roundRect(ctx, 10, 10, w - 28, h - 20, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(17,21,29,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#2d3740';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.fillRect(42, h / 2 - 14, 24, 28);
    ctx.strokeRect(42, h / 2 - 14, 24, 28);
    ctx.fillRect(108, h / 2 - 14, 24, 28);
    ctx.strokeRect(108, h / 2 - 14, 24, 28);

    // Cracked Windshield
    ctx.fillStyle = '#18222a';
    this.roundRect(ctx, w - 22, 10, 15, h - 20, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,205,220,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w - 18, 18);
    ctx.lineTo(w - 12, 30);
    ctx.lineTo(w - 16, 40);
    ctx.stroke();

    // Stripe + Roof Number
    ctx.fillStyle = stripe;
    ctx.fillRect(12, 5, w - 38, 4);
    ctx.fillRect(12, h - 9, w - 38, 4);

    ctx.fillStyle = 'rgba(240,235,222,0.72)';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(num, 85, h / 2 + 5);

    // Open doorway step
    ctx.fillStyle = '#1f252d';
    ctx.fillRect(w - 58, h - 7, 26, 10);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.strokeRect(w - 58, h - 7, 26, 10);
  }

  private paintCar(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    color: string,
    shade: string,
    wrecked: boolean
  ) {
    this.drawShadow(ctx, 0, 0, w, h, 10, 6, 8);
    // Wheels
    ctx.fillStyle = '#16191f';
    ctx.fillRect(16, -2, 18, 4);
    ctx.fillRect(w - 34, -2, 18, 4);
    ctx.fillRect(16, h - 2, 18, 4);
    ctx.fillRect(w - 34, h - 2, 18, 4);

    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    this.roundRect(ctx, 0, 0, w, h, 10);
    ctx.fill();
    ctx.stroke();

    // Hood creases
    ctx.strokeStyle = shade;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w - 28, 12);
    ctx.lineTo(w - 6, 14);
    ctx.moveTo(w - 28, h - 12);
    ctx.lineTo(w - 6, h - 14);
    ctx.stroke();

    // Glass cabin
    ctx.fillStyle = '#1a232b';
    this.roundRect(ctx, 20, 7, w - 48, h - 14, 6);
    ctx.fill();

    // Roof
    ctx.fillStyle = color;
    this.roundRect(ctx, 32, 10, w - 72, h - 20, 4);
    ctx.fill();
    ctx.strokeStyle = shade;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (wrecked) {
      // Rust blotches & cracked glass
      ctx.fillStyle = 'rgba(104, 58, 34, 0.55)';
      ctx.beginPath();
      ctx.arc(w - 18, h / 2 + 6, 8, 0, Math.PI * 2);
      ctx.arc(24, 14, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,215,225,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w - 34, 16);
      ctx.lineTo(w - 28, 28);
      ctx.stroke();
    }
  }

  private paintEmergencyCar(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    type: 'police' | 'ambulance'
  ) {
    if (type === 'police') {
      this.paintCar(ctx, w, h, '#222730', '#13161b', false);
      // White doors / roof panel
      ctx.fillStyle = '#d4d8de';
      ctx.fillRect(34, 9, w - 74, h - 18);
      // Lightbar
      ctx.fillStyle = '#c83e3b';
      ctx.fillRect(w / 2 - 4, 12, 8, h / 2 - 12);
      ctx.fillStyle = '#3b78c8';
      ctx.fillRect(w / 2 - 4, h / 2, 8, h / 2 - 12);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w / 2 - 4, 12, 8, h - 24);
    } else {
      // Boxy Ambulance
      this.drawShadow(ctx, 0, 0, w, h, 8, 7, 9);
      ctx.fillStyle = '#cfd4da';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.8;
      this.roundRect(ctx, 0, 0, w, h, 8);
      ctx.fill();
      ctx.stroke();
      // Cab windshield
      ctx.fillStyle = '#1b242d';
      ctx.fillRect(w - 28, 7, 16, h - 14);
      // Red stripe & rooftop cross
      ctx.fillStyle = '#b93c3a';
      ctx.fillRect(6, 4, w - 42, 5);
      ctx.fillRect(6, h - 9, w - 42, 5);
      ctx.fillRect(34, h / 2 - 3, 18, 6);
      ctx.fillRect(40, h / 2 - 9, 6, 18);
    }
  }

  private paintPickup(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 8, 6, 8);
    ctx.fillStyle = '#4e5d4b';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    this.roundRect(ctx, 0, 0, w, h, 8);
    ctx.fill();
    ctx.stroke();

    // Open cargo bed
    ctx.fillStyle = '#2d332c';
    ctx.fillRect(6, 7, 42, h - 14);
    ctx.strokeStyle = '#1b1f1b';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 7, 42, h - 14);

    // Windshield
    ctx.fillStyle = '#1a232b';
    ctx.fillRect(w - 34, 8, 13, h - 16);
  }

  private paintContainer(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    fill: string,
    rib: string
  ) {
    this.drawShadow(ctx, 0, 0, w, h, 4, 8, 10);
    ctx.fillStyle = fill;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeRect(0, 0, w, h);

    ctx.fillStyle = rib;
    for (let x = 10; x < w - 10; x += 12) {
      ctx.fillRect(x, 3, 5, h - 6);
    }
  }

  private paintHouse(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    roof: string,
    ridge: string,
    trim: string,
    chimneyLeft: boolean
  ) {
    this.drawShadow(ctx, 0, 0, w, h, 6, 10, 12);

    // Foundation & porch
    ctx.fillStyle = '#383028';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    this.roundRect(ctx, 0, 0, w, h, 4);
    ctx.fill();
    ctx.stroke();

    // Two-tone pitched roof (top slope lighter, bottom slope slightly darker)
    const roofH = h - 24;
    ctx.fillStyle = roof;
    this.roundRect(ctx, 5, 5, w - 10, roofH, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.fillRect(5, 5 + roofH / 2, w - 10, roofH / 2);

    // Shingle lines
    ctx.strokeStyle = 'rgba(15,18,24,0.28)';
    ctx.lineWidth = 1.4;
    for (let y = 18; y < roofH; y += 14) {
      ctx.beginPath();
      ctx.moveTo(8, y);
      ctx.lineTo(w - 8, y);
      ctx.stroke();
    }

    // Roof outline
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    this.roundRect(ctx, 5, 5, w - 10, roofH, 4);
    ctx.stroke();

    // Ridge beam
    ctx.fillStyle = ridge;
    ctx.fillRect(6, roofH / 2 + 1, w - 12, 8);

    // Brick chimney
    const cx = chimneyLeft ? 28 : w - 54;
    ctx.fillStyle = '#6c423b';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.fillRect(cx, 20, 24, 24);
    ctx.strokeRect(cx, 20, 24, 24);
    ctx.fillStyle = '#241a18';
    ctx.fillRect(cx + 6, 26, 12, 12);

    // Front porch steps + awning
    ctx.fillStyle = trim;
    ctx.fillRect(w / 2 - 32, h - 20, 64, 18);
    ctx.strokeRect(w / 2 - 32, h - 20, 64, 18);
    ctx.fillStyle = '#232832';
    ctx.fillRect(w / 2 - 14, h - 7, 28, 7);
  }

  private paintVictorianHouse(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.paintHouse(ctx, w, h, '#4d4154', '#332a39', '#7d7085', false);
    // Turret cupola on left wing
    ctx.fillStyle = '#3b3042';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(46, 52, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#61526b';
    ctx.beginPath();
    ctx.arc(46, 52, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  private paintShop(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    roof: string,
    awning: string,
    accent: string,
    title: string
  ) {
    this.drawShadow(ctx, 0, 0, w, h, 4, 10, 12);

    // Flat commercial tar-and-gravel roof
    ctx.fillStyle = roof;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.fillRect(0, 0, w, h - 18);
    ctx.strokeRect(0, 0, w, h - 18);

    // Parapet wall trim
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, h - 30);

    // Rooftop HVAC & vent pipes
    ctx.fillStyle = '#5c6470';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.fillRect(24, 22, 34, 28);
    ctx.strokeRect(24, 22, 34, 28);
    ctx.fillRect(w - 58, 24, 28, 24);
    ctx.strokeRect(w - 58, 24, 28, 24);

    // Storefront striped awning
    ctx.fillStyle = awning;
    ctx.fillRect(8, h - 20, w - 16, 18);
    ctx.fillStyle = accent;
    for (let x = 16; x < w - 20; x += 22) {
      ctx.fillRect(x, h - 20, 10, 18);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(8, h - 20, w - 16, 18);

    // Rooftop sign
    ctx.fillStyle = 'rgba(14,18,24,0.82)';
    ctx.fillRect(w / 2 - 46, h / 2 - 22, 92, 22);
    ctx.fillStyle = accent;
    ctx.font = 'bold 12px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, h / 2 - 7);
  }

  private paintPoliceStation(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 6, 10, 12);
    ctx.fillStyle = '#334052';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.fillRect(0, 0, w, h - 14);
    ctx.strokeRect(0, 0, w, h - 14);

    ctx.strokeStyle = '#576880';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, w - 16, h - 30);

    // Radio mast & dish
    ctx.fillStyle = '#657282';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w - 48, 44, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Front portico canopy
    ctx.fillStyle = '#243040';
    ctx.fillRect(w / 2 - 44, h - 20, 88, 20);
    ctx.strokeRect(w / 2 - 44, h - 20, 88, 20);

    ctx.fillStyle = '#d4aa54';
    ctx.font = 'bold 18px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOLLOW CREEK SHERIFF', w / 2, h / 2);
  }

  private paintHospital(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 6, 12, 14);
    // Main complex roof
    ctx.fillStyle = '#4e5863';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.fillRect(0, 0, w, h - 18);
    ctx.strokeRect(0, 0, w, h - 18);

    // Skylight atrium & HVAC machinery
    ctx.fillStyle = '#2d3b47';
    ctx.fillRect(36, 26, 92, 46);
    ctx.strokeRect(36, 26, 92, 46);
    ctx.fillStyle = '#697482';
    ctx.fillRect(w - 92, 26, 56, 40);
    ctx.strokeRect(w - 92, 26, 56, 40);

    // Medical Red Cross emblem on roof
    const cx = w / 2;
    const cy = (h - 18) / 2;
    ctx.fillStyle = '#d4d8dd';
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c43b38';
    ctx.fillRect(cx - 18, cy - 6, 36, 12);
    ctx.fillRect(cx - 6, cy - 18, 12, 36);

    // ER Canopy
    ctx.fillStyle = '#8b3232';
    ctx.fillRect(w / 2 - 52, h - 22, 104, 22);
    ctx.strokeRect(w / 2 - 52, h - 22, 104, 22);
    ctx.fillStyle = '#f2ede2';
    ctx.font = 'bold 12px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMERGENCY', w / 2, h - 7);
  }

  private paintSchool(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 6, 12, 14);
    // Brick-trimmed slate roof
    ctx.fillStyle = '#5c413a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.fillRect(0, 0, w, h - 16);
    ctx.strokeRect(0, 0, w, h - 16);

    ctx.fillStyle = '#404a54';
    ctx.fillRect(10, 10, w - 20, h - 36);
    ctx.strokeRect(10, 10, w - 20, h - 36);

    // Clock cupola
    ctx.fillStyle = '#cfc7b4';
    ctx.beginPath();
    ctx.arc(w / 2, (h - 16) / 2, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#6c3832';
    ctx.beginPath();
    ctx.arc(w / 2, (h - 16) / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    // Front entrance canopy
    ctx.fillStyle = '#7b5548';
    ctx.fillRect(w / 2 - 48, h - 20, 96, 20);
    ctx.strokeRect(w / 2 - 48, h - 20, 96, 20);
    ctx.fillStyle = '#ede5d5';
    ctx.font = 'bold 13px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOLLOW CREEK HIGH', w / 2, h - 6);
  }

  private paintWarehouse(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 4, 12, 14);
    ctx.fillStyle = '#484e54';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeRect(0, 0, w, h);

    // Corrugated steel ribs & rust streaks
    ctx.strokeStyle = '#363b40';
    ctx.lineWidth = 2;
    for (let x = 14; x < w - 10; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 6);
      ctx.lineTo(x, h - 6);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(116, 62, 38, 0.35)';
    ctx.fillRect(40, 20, 74, 48);
    ctx.fillRect(w - 110, h - 68, 68, 42);

    // Roof ridge & exhaust fans
    ctx.fillStyle = '#31363b';
    ctx.fillRect(0, h / 2 - 5, w, 10);
    ctx.fillStyle = '#5c646d';
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.arc(64, 42, 14, 0, Math.PI * 2);
    ctx.arc(w - 64, 42, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private paintSilo(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.46;
    ctx.fillStyle = 'rgba(6,9,14,0.45)';
    ctx.beginPath();
    ctx.arc(cx + 8, cy + 10, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#626a73';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#78818c';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 4, r * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private paintShed(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 3, 6, 8);
    ctx.fillStyle = '#624b3a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeRect(0, 0, w, h);
    ctx.fillStyle = '#48372a';
    ctx.fillRect(4, h / 2 - 4, w - 8, 8);
  }

  private paintGazebo(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.46;
    ctx.fillStyle = 'rgba(6,9,14,0.42)';
    ctx.beginPath();
    ctx.arc(cx + 8, cy + 10, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6b513b';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4e3b2b';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private paintFountain(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.46;
    ctx.fillStyle = 'rgba(6,9,14,0.38)';
    ctx.beginPath();
    ctx.arc(cx + 6, cy + 8, r, 0, Math.PI * 2);
    ctx.fill();

    // Outer stone rim
    ctx.fillStyle = '#6c727a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dry mossy basin
    ctx.fillStyle = '#303b35';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.74, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Center plinth
    ctx.fillStyle = '#7f858d';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private paintBusShelter(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 5, 6, 8);
    ctx.fillStyle = '#46505c';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.8;
    this.roundRect(ctx, 0, 0, w, h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#303740';
    ctx.lineWidth = 2;
    for (let x = 14; x < w - 8; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 4);
      ctx.lineTo(x, h - 4);
      ctx.stroke();
    }
  }

  private paintPayphone(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 5, 4, 6);
    ctx.fillStyle = '#2d4e63';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, 0, 0, w, h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#73a3ba';
    ctx.fillRect(8, 8, w - 16, h - 16);
  }

  private paintWelcomeSign(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    text: string
  ) {
    this.drawShadow(ctx, 0, 0, w, h, 4, 4, 7);
    ctx.fillStyle = '#4f3a29';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.fillRect(6, 22, 10, 14);
    ctx.strokeRect(6, 22, 10, 14);
    ctx.fillRect(w - 16, 22, 10, 14);
    ctx.strokeRect(w - 16, 22, 10, 14);

    ctx.fillStyle = '#6f553e';
    this.roundRect(ctx, 0, 0, w, 28, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ded3bc';
    ctx.font = 'bold 10px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, w / 2, 18);
  }

  private paintPineTree(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = 'rgba(6, 10, 8, 0.42)';
    ctx.beginPath();
    ctx.ellipse(cx + 8, cy + 12, w * 0.44, h * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#493524';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + 6, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const tiers = [
      { r: w * 0.45, dy: 2, color: '#1b3629' },
      { r: w * 0.35, dy: -5, color: '#244736' },
      { r: w * 0.23, dy: -12, color: '#305c46' },
    ];
    for (const t of tiers) {
      ctx.fillStyle = t.color;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      const pts = 9;
      for (let i = 0; i < pts * 2; i++) {
        const a = (i * Math.PI) / pts;
        const rad = i % 2 === 0 ? t.r : t.r * 0.76;
        const px = cx + Math.cos(a) * rad;
        const py = cy + t.dy + Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  private paintOakTree(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = 'rgba(6, 10, 8, 0.42)';
    ctx.beginPath();
    ctx.ellipse(cx + 8, cy + 12, w * 0.46, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    const puffs = [
      { x: cx - 14, y: cy + 4, r: w * 0.24, c: '#3d4c31' },
      { x: cx + 14, y: cy + 4, r: w * 0.24, c: '#3d4c31' },
      { x: cx, y: cy - 12, r: w * 0.26, c: '#4b5c3b' },
      { x: cx - 4, y: cy - 2, r: w * 0.22, c: '#576b44' },
    ];
    for (const p of puffs) {
      ctx.fillStyle = p.c;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  private paintDeadTree(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = 'rgba(8, 10, 12, 0.38)';
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy + 12, 24, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy + 14);
    ctx.lineTo(cx, cy - 18);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 20, cy - 16);
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx + 20, cy - 20);
    ctx.stroke();
    ctx.strokeStyle = '#53453a';
    ctx.lineWidth = 4.5;
    ctx.stroke();
  }

  private paintBush(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = '#294836';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 8, cy + 2, 11, 0, Math.PI * 2);
    ctx.arc(cx + 8, cy + 2, 11, 0, Math.PI * 2);
    ctx.arc(cx, cy - 4, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private paintBench(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 3, 3, 5);
    ctx.fillStyle = '#6d503a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    this.roundRect(ctx, 0, 0, w, h, 3);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#4e3827';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(4, h / 2);
    ctx.lineTo(w - 4, h / 2);
    ctx.stroke();
  }

  private paintPatioTable(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = 'rgba(6,9,14,0.38)';
    ctx.beginPath();
    ctx.arc(cx + 4, cy + 6, w * 0.42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8b433e';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d2c9b6';
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  private paintTrashBin(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#4e5863';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private paintDumpster(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 4, 5, 7);
    ctx.fillStyle = '#2d4e3e';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, 0, 0, w, h, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1b2229';
    ctx.fillRect(6, 5, w - 12, h / 2 - 5);
  }

  private paintRoadBarrier(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 3, 4, 6);
    ctx.fillStyle = '#c87e34';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    this.roundRect(ctx, 0, 0, w, h, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dedad0';
    if (h > w) {
      for (let y = 12; y < h - 14; y += 26) {
        ctx.fillRect(4, y, w - 8, 12);
      }
    } else {
      for (let x = 12; x < w - 14; x += 26) {
        ctx.fillRect(x, 4, 12, h - 8);
      }
    }
  }

  private paintTrafficCone(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#d46a2c';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ece8df';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  private paintHydrant(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#b93c38';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dadfe6';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private paintMailbox(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#2d455e';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    this.roundRect(ctx, 2, 2, w - 4, h - 4, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c94c4c';
    ctx.fillRect(w - 6, 6, 4, 8);
  }

  private paintCrate(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 2, 4, 6);
    ctx.fillStyle = '#73573d';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeRect(0, 0, w, h);
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(w - 4, h - 4);
    ctx.moveTo(w - 4, 4);
    ctx.lineTo(4, h - 4);
    ctx.stroke();
  }

  private paintBarrel(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = 'rgba(6,9,14,0.4)';
    ctx.beginPath();
    ctx.arc(w / 2 + 4, h / 2 + 5, w * 0.42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7c4034';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#532920';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.28, 0, Math.PI * 2);
    ctx.stroke();
  }

  private paintPallet(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#6c543c';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    for (let y = 2; y < h - 4; y += 10) {
      ctx.fillRect(0, y, w, 7);
      ctx.strokeRect(0, y, w, 7);
    }
  }

  private paintBoulder(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = 'rgba(6,9,14,0.38)';
    ctx.beginPath();
    ctx.ellipse(w / 2 + 5, h / 2 + 7, w * 0.45, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#555c63';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.44, h * 0.38, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private paintFallenLog(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 8, 5, 7);
    ctx.fillStyle = '#5a4332';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, 0, 0, w, h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3b583d';
    ctx.fillRect(w * 0.3, 2, 18, h * 0.5);
  }

  private paintHollowStump(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = '#5a4332';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.45, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#291e16';
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.24, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private paintUndergroundHatch(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 0, 0, w, h, 4, 6, 8);
    ctx.fillStyle = '#3c434d';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    this.roundRect(ctx, 0, 0, w, h, 4);
    ctx.fill();
    ctx.stroke();

    // Hazard yellow-black border
    ctx.fillStyle = '#c89b3c';
    ctx.fillRect(6, 6, w - 12, 6);
    ctx.fillRect(6, h - 12, w - 12, 6);
    ctx.fillStyle = '#262b33';
    ctx.fillRect(10, 16, w - 20, h - 32);
    ctx.strokeRect(10, 16, w - 20, h - 32);
    // Heavy padlock bar
    ctx.fillStyle = '#8b95a3';
    ctx.fillRect(w / 2 - 4, 14, 8, h - 28);
  }

  private paintFenceWood(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    horizontal: boolean
  ) {
    ctx.fillStyle = '#6b5742';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    if (horizontal) {
      ctx.fillRect(0, h / 2 - 4, w, 8);
      ctx.strokeRect(0, h / 2 - 4, w, 8);
      for (let x = 2; x < w; x += 24) {
        ctx.fillStyle = '#826a52';
        ctx.fillRect(x, 1, 8, h - 2);
        ctx.strokeRect(x, 1, 8, h - 2);
      }
    } else {
      ctx.fillRect(w / 2 - 4, 0, 8, h);
      ctx.strokeRect(w / 2 - 4, 0, 8, h);
      for (let y = 2; y < h; y += 24) {
        ctx.fillStyle = '#826a52';
        ctx.fillRect(1, y, w - 2, 8);
        ctx.strokeRect(1, y, w - 2, 8);
      }
    }
  }

  private paintFenceChain(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    horizontal: boolean
  ) {
    ctx.strokeStyle = '#737d8a';
    ctx.lineWidth = 2;
    if (horizontal) {
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      for (let x = 2; x <= w - 6; x += 32) {
        ctx.fillStyle = '#535b66';
        ctx.strokeStyle = INK;
        ctx.fillRect(x, h / 2 - 4, 8, 8);
        ctx.strokeRect(x, h / 2 - 4, 8, 8);
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      for (let y = 2; y <= h - 6; y += 32) {
        ctx.fillStyle = '#535b66';
        ctx.strokeStyle = INK;
        ctx.fillRect(w / 2 - 4, y, 8, 8);
        ctx.strokeRect(w / 2 - 4, y, 8, 8);
      }
    }
  }

  private paintBackpack(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 2, 2, w - 4, h - 4, 6, 4, 5);
    ctx.fillStyle = '#5e4b39';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    this.roundRect(ctx, 2, 3, w - 4, h - 6, 6);
    ctx.fill();
    ctx.stroke();

    // Top flap & canvas straps
    ctx.fillStyle = '#75604b';
    this.roundRect(ctx, 5, 5, w - 10, h * 0.48, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d49b4b';
    ctx.fillRect(8, h * 0.45, 4, 6);
    ctx.fillRect(w - 12, h * 0.45, 4, 6);
  }

  private paintFlashlight(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.drawShadow(ctx, 2, 4, w - 4, h - 8, 4, 3, 4);
    ctx.fillStyle = '#252c36';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    this.roundRect(ctx, 2, 5, w - 10, h - 10, 4);
    ctx.fill();
    ctx.stroke();

    // Bezel head & glowing amber lens
    ctx.fillStyle = '#3c4552';
    ctx.fillRect(w - 11, 3, 9, h - 6);
    ctx.strokeRect(w - 11, 3, 9, h - 6);
    ctx.fillStyle = '#f4c15d';
    ctx.fillRect(w - 4, 5, 3, h - 10);
  }
}
