import { TileKind } from './types';

function hash2d(x: number, y: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/**
 * Draws a shape wrapped across all 3x3 periodic offsets so CanvasPatterns tile
 * seamlessly without visible 192px/256px grid seams.
 */
function drawWrapped(
  size: number,
  x: number,
  y: number,
  margin: number,
  drawAt: (ox: number, oy: number) => void
) {
  for (let dy = -1; dy <= 1; dy++) {
    const oy = y + dy * size;
    if (oy < -margin || oy > size + margin) continue;
    for (let dx = -1; dx <= 1; dx++) {
      const ox = x + dx * size;
      if (ox < -margin || ox > size + margin) continue;
      drawAt(ox, oy);
    }
  }
}

/**
 * Generates seamless CanvasPatterns for every ground material so Hollow Creek
 * looks organically weathered rather than flat tiles or blocky repeats.
 */
export function buildGroundPatterns(
  ctx: CanvasRenderingContext2D
): Record<TileKind, CanvasPattern | string> {
  const makePattern = (
    size: number,
    paint: (pctx: CanvasRenderingContext2D, s: number) => void
  ): CanvasPattern | string => {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const pctx = c.getContext('2d');
    if (!pctx) return '#223328';
    paint(pctx, size);
    return ctx.createPattern(c, 'repeat') || '#223328';
  };

  const makeGrassPaint =
    (baseHex: string, lightRgba: string, darkRgba: string, bladeRgba: string) =>
    (pctx: CanvasRenderingContext2D, s: number) => {
      pctx.fillStyle = baseHex;
      pctx.fillRect(0, 0, s, s);

      // Subtle seamless mossy & shaded soil variation
      for (let i = 0; i < 48; i++) {
        const x = hash2d(i, 101) * s;
        const y = hash2d(i, 102) * s;
        const r = 14 + hash2d(i, 103) * 20;
        const rot = hash2d(i, 104) * Math.PI;
        pctx.fillStyle = i % 2 === 0 ? lightRgba : darkRgba;
        drawWrapped(s, x, y, r + 4, (ox, oy) => {
          pctx.beginPath();
          pctx.ellipse(ox, oy, r, r * 0.74, rot, 0, Math.PI * 2);
          pctx.fill();
        });
      }

      // Scattered subtle grass blade tufts & dry weeds
      pctx.lineWidth = 1.25;
      pctx.lineCap = 'round';
      for (let i = 0; i < 110; i++) {
        const x = hash2d(i, 211) * s;
        const y = hash2d(i, 212) * s;
        pctx.strokeStyle =
          i % 6 === 0 ? 'rgba(98, 92, 62, 0.34)' : bladeRgba;
        drawWrapped(s, x, y, 10, (ox, oy) => {
          pctx.beginPath();
          pctx.moveTo(ox, oy);
          pctx.lineTo(ox - 1.8, oy - 5.2);
          pctx.moveTo(ox + 2.6, oy + 0.8);
          pctx.lineTo(ox + 3.8, oy - 5.8);
          pctx.stroke();
        });
      }
    };

  const grassPaint = makeGrassPaint(
    '#233529',
    'rgba(43, 66, 49, 0.28)',
    'rgba(22, 34, 26, 0.24)',
    'rgba(62, 92, 68, 0.48)'
  );

  const grassDarkPaint = makeGrassPaint(
    '#1c2b21',
    'rgba(33, 52, 39, 0.26)',
    'rgba(15, 24, 18, 0.3)',
    'rgba(48, 74, 54, 0.44)'
  );

  const roadPaint = (pctx: CanvasRenderingContext2D, s: number) => {
    pctx.fillStyle = '#252a32';
    pctx.fillRect(0, 0, s, s);

    // Subtle weathered asphalt mottling (wrapped seamlessly)
    for (let i = 0; i < 20; i++) {
      const x = hash2d(i, 301) * s;
      const y = hash2d(i, 302) * s;
      const rx = 18 + hash2d(i, 303) * 20;
      const ry = 12 + hash2d(i, 304) * 14;
      const rot = hash2d(i, 305) * Math.PI;
      pctx.fillStyle =
        i % 2 === 0 ? 'rgba(18, 21, 26, 0.18)' : 'rgba(54, 60, 70, 0.12)';
      drawWrapped(s, x, y, rx + 4, (ox, oy) => {
        pctx.beginPath();
        pctx.ellipse(ox, oy, rx, ry, rot, 0, Math.PI * 2);
        pctx.fill();
      });
    }

    // Fine asphalt aggregate grain
    for (let i = 0; i < 420; i++) {
      const x = hash2d(i, 321) * s;
      const y = hash2d(i, 322) * s;
      pctx.fillStyle =
        i % 3 === 0 ? 'rgba(64, 71, 82, 0.26)' : 'rgba(16, 19, 24, 0.32)';
      pctx.fillRect(x, y, 2, 2);
    }

    // Subtle hairline pavement cracks
    pctx.strokeStyle = 'rgba(12, 14, 19, 0.48)';
    pctx.lineWidth = 1.25;
    for (let i = 0; i < 5; i++) {
      const startX = hash2d(i, 341) * s;
      const startY = hash2d(i, 342) * s;
      const pts: Array<[number, number]> = [[0, 0]];
      let dx = 0;
      let dy = 0;
      for (let seg = 0; seg < 4; seg++) {
        dx += (hash2d(i * 10 + seg, 343) - 0.5) * 24;
        dy += (hash2d(i * 10 + seg, 344) - 0.5) * 24;
        pts.push([dx, dy]);
      }
      drawWrapped(s, startX, startY, 54, (ox, oy) => {
        pctx.beginPath();
        pctx.moveTo(ox, oy);
        for (let k = 1; k < pts.length; k++) {
          pctx.lineTo(ox + pts[k][0], oy + pts[k][1]);
        }
        pctx.stroke();
      });
    }
  };

  const sidewalkPaint = (pctx: CanvasRenderingContext2D, s: number) => {
    pctx.fillStyle = '#565c66';
    pctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 160; i++) {
      pctx.fillStyle =
        i % 2 === 0 ? 'rgba(110, 118, 128, 0.2)' : 'rgba(30, 34, 40, 0.2)';
      pctx.fillRect(hash2d(i, 401) * s, hash2d(i, 402) * s, 3, 2);
    }
    // Slab joint grid (48x48 concrete tiles)
    pctx.strokeStyle = 'rgba(20, 24, 31, 0.45)';
    pctx.lineWidth = 1.5;
    for (let p = 0; p < s; p += 48) {
      pctx.beginPath();
      pctx.moveTo(p, 0);
      pctx.lineTo(p, s);
      pctx.moveTo(0, p);
      pctx.lineTo(s, p);
      pctx.stroke();
    }
    // Moss creeping into sidewalk seams
    pctx.fillStyle = 'rgba(52, 78, 56, 0.45)';
    for (let i = 0; i < 16; i++) {
      const seam = Math.floor(hash2d(i, 415) * (s / 48)) * 48;
      const y = hash2d(i, 416) * s;
      drawWrapped(s, seam - 2, y, 12, (ox, oy) => {
        pctx.fillRect(ox, oy, 4, 9);
      });
    }
  };

  const plazaPaint = (pctx: CanvasRenderingContext2D, s: number) => {
    pctx.fillStyle = '#474340';
    pctx.fillRect(0, 0, s, s);
    const bw = 24;
    const bh = 16;
    for (let row = 0; row < s / bh; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = -1; col < s / bw + 1; col++) {
        const bx = col * bw + offset;
        const by = row * bh;
        const wrappedCol = ((col % (s / bw)) + s / bw) % (s / bw);
        const shade = hash2d(wrappedCol + row * 19, 501);
        pctx.fillStyle =
          shade > 0.65
            ? '#645c54'
            : shade > 0.3
              ? '#575049'
              : '#4b453f';
        pctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
      }
    }
    for (let i = 0; i < 20; i++) {
      pctx.fillStyle = 'rgba(54, 82, 56, 0.38)';
      pctx.fillRect(hash2d(i, 514) * s, hash2d(i, 515) * s, 6, 3);
    }
  };

  const concretePaint = (pctx: CanvasRenderingContext2D, s: number) => {
    pctx.fillStyle = '#474d56';
    pctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 180; i++) {
      pctx.fillStyle = 'rgba(24, 28, 34, 0.22)';
      pctx.fillRect(hash2d(i, 601) * s, hash2d(i, 602) * s, 4, 3);
    }
    pctx.strokeStyle = 'rgba(20, 23, 28, 0.34)';
    pctx.lineWidth = 1.5;
    for (let p = 0; p < s; p += 96) {
      pctx.beginPath();
      pctx.moveTo(p, 0);
      pctx.lineTo(p, s);
      pctx.moveTo(0, p);
      pctx.lineTo(s, p);
      pctx.stroke();
    }
  };

  const gravelPaint = (pctx: CanvasRenderingContext2D, s: number) => {
    pctx.fillStyle = '#3f4348';
    pctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 320; i++) {
      const x = hash2d(i, 701) * s;
      const y = hash2d(i, 702) * s;
      const sz = 1.5 + hash2d(i, 703) * 2.4;
      pctx.fillStyle =
        i % 3 === 0 ? '#5b6067' : i % 3 === 1 ? '#2e3136' : '#4d5157';
      pctx.fillRect(x, y, sz, sz);
    }
  };

  const dirtPaint = (pctx: CanvasRenderingContext2D, s: number) => {
    pctx.fillStyle = '#4a3d31';
    pctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 200; i++) {
      const x = hash2d(i, 801) * s;
      const y = hash2d(i, 802) * s;
      const r = 1.5 + hash2d(i, 803) * 2.8;
      pctx.fillStyle =
        i % 2 === 0 ? 'rgba(92, 76, 60, 0.38)' : 'rgba(44, 34, 26, 0.38)';
      drawWrapped(s, x, y, 6, (ox, oy) => {
        pctx.beginPath();
        pctx.arc(ox, oy, r, 0, Math.PI * 2);
        pctx.fill();
      });
    }
  };

  const forestPaint = (pctx: CanvasRenderingContext2D, s: number) => {
    pctx.fillStyle = '#18251e';
    pctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 26; i++) {
      const x = hash2d(i, 901) * s;
      const y = hash2d(i, 902) * s;
      const r = 16 + hash2d(i, 903) * 18;
      pctx.fillStyle =
        i % 2 === 0 ? 'rgba(30, 48, 37, 0.25)' : 'rgba(14, 22, 18, 0.25)';
      drawWrapped(s, x, y, r + 4, (ox, oy) => {
        pctx.beginPath();
        pctx.arc(ox, oy, r, 0, Math.PI * 2);
        pctx.fill();
      });
    }
    pctx.lineWidth = 1.3;
    for (let i = 0; i < 110; i++) {
      const x = hash2d(i, 911) * s;
      const y = hash2d(i, 912) * s;
      pctx.strokeStyle =
        i % 3 === 0 ? 'rgba(72, 58, 42, 0.45)' : 'rgba(40, 64, 46, 0.52)';
      const ang = hash2d(i, 913) * Math.PI * 2;
      const dx = Math.cos(ang) * 7;
      const dy = Math.sin(ang) * 7;
      drawWrapped(s, x, y, 10, (ox, oy) => {
        pctx.beginPath();
        pctx.moveTo(ox, oy);
        pctx.lineTo(ox + dx, oy + dy);
        pctx.stroke();
      });
    }
  };

  const courtPaint = (pctx: CanvasRenderingContext2D, s: number) => {
    pctx.fillStyle = '#3b4a56';
    pctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 120; i++) {
      pctx.fillStyle = 'rgba(20, 26, 33, 0.22)';
      pctx.fillRect(hash2d(i, 1001) * s, hash2d(i, 1002) * s, 3, 2);
    }
  };

  return {
    grass: makePattern(256, grassPaint),
    grass_dark: makePattern(256, grassDarkPaint),
    road: makePattern(256, roadPaint),
    sidewalk: makePattern(192, sidewalkPaint),
    plaza: makePattern(192, plazaPaint),
    concrete: makePattern(192, concretePaint),
    gravel: makePattern(192, gravelPaint),
    dirt: makePattern(192, dirtPaint),
    forest_floor: makePattern(256, forestPaint),
    court: makePattern(192, courtPaint),
  };
}
