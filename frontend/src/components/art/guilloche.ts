/*
 * Guilloche: the interlaced lathe engraving of banknotes and share certificates. A curve is a sum of
 * sines (polar for rosettes, cartesian for bands); several copies, each shifted by a fraction of one
 * lobe, weave into the familiar lattice. Pure and deterministic, so server and client draw the same
 * lines. Coordinates are rounded to 0.1 unit, which stays crisp under a 3x loupe.
 */

export type RosetteBand = {
  /** Base radius of the band. */
  radius: number;
  /** Amplitude and lobe count of the main wave (lobes must be a whole number for a closed curve). */
  amp: number;
  lobes: number;
  /** Optional counter-wave: woven against the main one, it turns petals into a lattice. */
  amp2?: number;
  lobes2?: number;
  /** Copies woven together, each shifted by 1/copies of a lobe. */
  copies: number;
};

const TAU = Math.PI * 2;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** One closed path per copy for a rosette band centred on (cx, cy). */
export function rosetteBandPaths(cx: number, cy: number, band: RosetteBand, detail = 12): string[] {
  const { radius, amp, lobes, amp2 = 0, lobes2 = 0, copies } = band;
  const steps = Math.max(160, Math.max(lobes, lobes2) * detail);
  const paths: string[] = [];
  for (let c = 0; c < copies; c++) {
    const shift = (c / copies) * (TAU / lobes);
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * TAU;
      const r = radius + amp * Math.sin(lobes * (t + shift)) + amp2 * Math.sin(lobes2 * (t - shift));
      d += `${i === 0 ? "M" : "L"}${r1(cx + r * Math.cos(t))} ${r1(cy + r * Math.sin(t))}`;
    }
    paths.push(`${d}Z`);
  }
  return paths;
}

export type WaveBand = {
  width: number;
  height: number;
  /** Whole waves across the width for the main and the counter wave. */
  waves: number;
  waves2?: number;
  amp: number;
  amp2?: number;
  copies: number;
};

/** Horizontal guilloche band (section rules, plate edges). */
export function waveBandPaths({ width, height, waves, waves2 = 0, amp, amp2 = 0, copies }: WaveBand): string[] {
  const steps = Math.max(120, Math.max(waves, waves2) * 24);
  const mid = height / 2;
  const paths: string[] = [];
  for (let c = 0; c < copies; c++) {
    const shift = (c / copies) * TAU;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const u = (i / steps) * TAU;
      const y = mid + amp * Math.sin(waves * u + shift) + amp2 * Math.sin(waves2 * u - shift);
      d += `${i === 0 ? "M" : "L"}${r1(x)} ${r1(y)}`;
    }
    paths.push(d);
  }
  return paths;
}

/** A circle path (for microprint text on a ring), starting at the left and running clockwise. */
export function circlePath(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0`;
}

/** Small deterministic hash so a word (a role, a module) can choose its own rosette parameters. */
export function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A compact rosette whose lobes and weave follow a seed: every role or module gets its own mark. */
export function seededBands(seed: number, size = 100): RosetteBand[] {
  const pick = (n: number, mod: number) => (seed >>> n) % mod;
  const s = size / 100;
  return [
    { radius: 9 * s, amp: 5 * s, lobes: 5 + pick(0, 4), copies: 4 },
    { radius: 24 * s, amp: 7 * s, lobes: 10 + pick(3, 6) * 2, amp2: 3 * s, lobes2: 3 + pick(6, 3), copies: 6 },
    { radius: 40 * s, amp: 6 * s, lobes: 18 + pick(9, 5) * 2, amp2: 3 * s, lobes2: 4 + pick(12, 3), copies: 7 },
  ];
}

/** A full plate rosette (640 viewBox) whose bands follow a seed: each page engraves its own. */
export function plateBands(seed: number): RosetteBand[] {
  const pick = (n: number, mod: number) => (seed >>> n) % mod;
  return [
    { radius: 26, amp: 12, lobes: 6 + pick(0, 5), copies: 6 },
    { radius: 78, amp: 16, lobes: 14 + pick(4, 5) * 2, amp2: 6, lobes2: 3 + pick(8, 4), copies: 9 },
    { radius: 150, amp: 22, lobes: 22 + pick(12, 6) * 2, amp2: 8, lobes2: 5 + pick(16, 3), copies: 12 },
    { radius: 230, amp: 16, lobes: 32 + pick(20, 5) * 2, amp2: 9, lobes2: 6 + pick(24, 4), copies: 11 },
    { radius: 296, amp: 6, lobes: 60 + pick(28, 4) * 4, copies: 4 },
  ];
}
