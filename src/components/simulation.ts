import { Status } from "../types";

// NOTE: <<- Utility Classes/Functions ->>

interface DataPoint {
  x: number;
  y: number;
}

type GraphData = DataPoint[];

type Graphs = GraphData[];

interface GraphsOverall {
  widthGraphs: Graphs;
  densityGraphs: Graphs;
  weightGraphs: Graphs;
  attachmentGraphs: Graphs;
  points: GraphData;
}

interface Vector2D {
  x: number;
  y: number;
}

function euclidDist(u: Vector2D, v: Vector2D) {
  return Math.sqrt(Math.pow(u.x - v.x, 2) + Math.pow(u.y - v.y, 2));
}

function unitDiff(u: Vector2D, v: Vector2D) {
  /* NOTE: <<- Implementation ->>
   * Compute the unit vector of `u` - `v`.
   */
  const ans = { x: u.x - v.x, y: u.y - v.y };
  const mag = euclidDist(ans, { x: 0, y: 0 });
  ans.x /= mag;
  ans.y /= mag;
  return ans;
}

function rotate(u: Vector2D, angle: number) {
  return {
    x: u.x * Math.cos(angle) - u.y * Math.sin(angle),
    y: u.x * Math.sin(angle) + u.y * Math.cos(angle),
  };
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(Math.min(x, hi), lo);
}

function dot(u: Vector2D, v: Vector2D): number {
  return u.x * v.x + u.y * v.y;
}

function lerp(x: number, y: number, t: number) {
  return x + t * (y - x);
}

function fade(t: number): number {
  return ((6 * t - 15) * t + 10) * t * t * t;
}

function booleanChance(pWin: number) {
  return Math.random() <= pWin;
}

function boxMuller() {
  /* NOTE: <<- Implementation ->>
   * Returns a value between [0, 1].
   */
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5;
  if (num > 1 || num < 0) return boxMuller();
  return num;
}

function getRandomRatio(delta: number) {
  /* NOTE: <<- Implementation ->>
   * Returns a value between [1-delta, 1+delta].
   */
  if (Math.abs(delta) < 1e-9) return 1;
  return boxMuller() * (2 * delta) + (1.0 - delta);
}

// NOTE: <<- Improved Perlin Noise ->>

class PerlinNoise {
  private static getConstantVector = (i: number): Vector2D => {
    switch (i & 3) {
      case 0:
        return { x: 1, y: 1 };
      case 1:
        return { x: -1, y: 1 };
      case 2:
        return { x: -1, y: -1 };
      default:
        return { x: 1, y: -1 };
    }
  };

  static p: number[] = [];
  static BLOCKSIZE = 256;

  static getNoise(x: number, y: number, freq: number = 10 / 1009): number {
    x *= freq;
    y *= freq;

    // WARN: (x, y) is a lattice point -> output is zero

    const X = Math.floor(x) & (PerlinNoise.BLOCKSIZE - 1);
    const Y = Math.floor(y) & (PerlinNoise.BLOCKSIZE - 1);

    const xd = x - Math.floor(x);
    const yd = y - Math.floor(y);

    const xdFade = fade(xd);
    const ydFade = fade(yd);

    const topRight: Vector2D = { x: xd - 1, y: yd - 1 };
    const topLeft: Vector2D = { x: xd, y: yd - 1 };
    const botRight: Vector2D = { x: xd - 1, y: yd };
    const botLeft: Vector2D = { x: xd, y: yd };

    const valTopRight = PerlinNoise.p[PerlinNoise.p[X + 1] + Y + 1];
    const valTopLeft = PerlinNoise.p[PerlinNoise.p[X] + Y + 1];
    const valBotRight = PerlinNoise.p[PerlinNoise.p[X + 1] + Y];
    const valBotLeft = PerlinNoise.p[PerlinNoise.p[X] + Y];

    const dotTopRight = dot(
      topRight,
      PerlinNoise.getConstantVector(valTopRight),
    );
    const dotTopLeft = dot(topLeft, PerlinNoise.getConstantVector(valTopLeft));
    const dotBotRight = dot(
      botRight,
      PerlinNoise.getConstantVector(valBotRight),
    );
    const dotBotLeft = dot(botLeft, PerlinNoise.getConstantVector(valBotLeft));

    return lerp(
      lerp(dotBotLeft, dotTopLeft, ydFade),
      lerp(dotBotRight, dotTopRight, ydFade),
      xdFade,
    );
  }

  static getFBM(x: number, y = 0, freq = 10 / 1009, numOctaves = 4): number {
    let result = 0;
    let amplitude = 0.5;
    for (let octave = 0; octave < numOctaves; octave++) {
      const noise = amplitude * PerlinNoise.getNoise(x, y, freq);
      result += noise;
      amplitude /= 2;
      freq *= 2;
    }
    return result;
  }
}

for (let i = 0; i < PerlinNoise.BLOCKSIZE; i++) {
  PerlinNoise.p.push(i);
}

PerlinNoise.p = PerlinNoise.p
  .map((item) => ({ item, sortVal: Math.random() }))
  .sort((a, b) => a.sortVal - b.sortVal)
  .map((v) => v.item);

PerlinNoise.p = [...PerlinNoise.p, ...PerlinNoise.p];

// NOTE: <<- Main Classes (Collision Grid, Rod, & Bee) ->>

class CollisionGrid {
  static readonly gridLength = 100;

  static readonly dirCnt = 9;
  static readonly dx = [0, 0, 1, 1, 1, 0, -1, -1, -1];
  static readonly dy = [0, 1, 1, 0, -1, -1, -1, 0, 1];

  grid: Map<string, Set<number>>; // NOTE: (tile: string) -> bees' ids

  constructor() {
    this.grid = new Map<string, Set<number>>();
  }

  static compress(vec: Vector2D): Vector2D {
    const xc = Math.floor(vec.x / CollisionGrid.gridLength);
    const yc = Math.floor(vec.y / CollisionGrid.gridLength);

    return { x: xc, y: yc };
  }

  static hash(vec: Vector2D): string {
    return vec.x.toString() + " " + vec.y.toString();
  }

  build() {
    this.grid.clear();

    bees.forEach((bee: Bee, id: number) => {
      let s = CollisionGrid.hash(CollisionGrid.compress(bee.pos));

      if (!this.grid.has(s)) {
        this.grid.set(s, new Set<number>());
      }
      this.grid.get(s)!.add(id);
    });
  }
}

class Rod {
  rodBound: number = 0;
  leftPoint: Vector2D = { x: 0, y: 0 };
  rightPoint: Vector2D = { x: 0, y: 0 };

  constructor() {
    this.resetPoints();
  }

  draw() {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "hsla(0, 0%, 0%, 1)";

    ctx.beginPath();

    ctx.moveTo(this.leftPoint.x, this.leftPoint.y);
    ctx.lineTo(this.rightPoint.x, this.rightPoint.y);

    ctx.stroke();
  }

  resetPoints() {
    this.rodBound = canvasHeight / 3;
    this.leftPoint = { x: 0, y: this.rodBound };
    this.rightPoint = { x: canvasWidth, y: this.rodBound };
  }
}

class Bee {
  id: number;

  pos: Vector2D;
  vel: Vector2D;
  det: Vector2D;

  isQueen: boolean;

  static readonly baseNodeRadius = 5;
  static readonly baseBeeRadius = 15;
  static readonly beeLegs = 2;

  nodeRadius: number;
  beeRadius: number;

  static readonly detachChance = 0.000002;
  static readonly flyTowardsQueenChance = 0.1;

  static readonly queenChance = 0.02;
  static readonly baseGrav = 0.04;
  static readonly k = 0.02;

  grav: number;

  aerialState: "hover" | "attached" = "hover";

  xTime: number;
  yTime: number;

  isReverseNoise = false;
  collisionHeat = 0;
  cooldown = 0;

  attachSet = new Array<number | Vector2D>();
  supportSet = new Array<number | Vector2D>();

  readonly xtimeStep = clamp(Math.random(), 0.1, 0.5);
  readonly ytimeStep = clamp(Math.random(), 0.1, 0.5);

  constructor(
    id: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    isQueen: boolean,
  ) {
    this.isQueen = isQueen;
    this.id = id;

    let sizeRatio = getRandomRatio(sizeDelta);
    if (this.isQueen) sizeRatio = 1.75;

    this.nodeRadius = sizeRatio * Bee.baseNodeRadius;
    this.beeRadius = sizeRatio * Bee.baseBeeRadius;

    const massRatio = getRandomRatio(massDelta);

    this.grav = massRatio * Bee.baseGrav;

    this.pos = { x, y };
    this.vel = { x: vx, y: vy };
    this.det = { x: 0, y: 0 };

    this.xTime = 200 * Math.random();
    this.yTime = 200 * Math.random();
  }

  static resolveBeeCollision(i: number, j: number) {
    const xVelDiff = bees.get(i)!.vel.x - bees.get(j)!.vel.x;
    const yVelDiff = bees.get(i)!.vel.y - bees.get(j)!.vel.y;

    const xPosDiff = bees.get(j)!.pos.x - bees.get(i)!.pos.x;
    const yPosDiff = bees.get(j)!.pos.y - bees.get(i)!.pos.y;

    if (xVelDiff * xPosDiff + yVelDiff * yPosDiff >= 0) {
      const angle = -Math.atan2(yPosDiff, xPosDiff);

      const u1 = rotate(bees.get(i)!.vel, angle);
      const u2 = rotate(bees.get(j)!.vel, angle);

      let v1 = rotate({ x: u2.x, y: u1.y }, -angle);
      let v2 = rotate({ x: u1.x, y: u2.y }, -angle);

      v1 = { x: v1.x, y: v1.y };
      v2 = { x: v2.x, y: v2.y };

      bees.get(i)!.vel = v1;
      bees.get(j)!.vel = v2;

      bees.get(i)!.collisionHeat = 50;
      bees.get(j)!.collisionHeat = 50;
    }
  }

  isTouchingBoard(): boolean {
    return this.pos.y <= rod.rodBound + this.beeRadius;
  }

  isTouchingWall(): boolean {
    if (this.pos.y >= canvasHeight - this.beeRadius) return true;
    if (this.pos.x <= this.beeRadius) return true;
    if (this.pos.x >= canvasWidth - this.beeRadius) return true;
    return false;
  }

  isTouchingBee(): null | Array<number> {
    const xc = CollisionGrid.compress(this.pos).x;
    const yc = CollisionGrid.compress(this.pos).y;

    const ids = new Set<number>();

    ids.add(0);

    for (let d = 0; d < CollisionGrid.dirCnt; d++) {
      const nx = xc + CollisionGrid.dx[d];
      const ny = yc + CollisionGrid.dy[d];

      const s = CollisionGrid.hash({ x: nx, y: ny });

      if (collisionGrid.grid.has(s)) {
        for (const id of collisionGrid.grid.get(s)!) {
          if (id !== this.id) {
            ids.add(id);
          }
        }
      }
    }

    const ans = new Array<number>();

    for (const id of ids) {
      const dist = bees.get(id)!.beeRadius + this.beeRadius;
      if (euclidDist(this.pos, bees.get(id)!.pos) <= dist + 2.0) {
        ans.push(id);
      }
    }

    return ans.length === 0 ? null : ans;
  }

  drawNode() {
    if (this.isQueen) {
      ctx.fillStyle = `hsla(20, 60%, ${Math.abs(Math.sin(performance.now() / 500)) * 30 + 20}%, 1)`;
      ctx.beginPath();
      ctx.arc(
        this.pos.x,
        this.pos.y,
        (4 / 5) * this.nodeRadius,
        0,
        2 * Math.PI,
      );
      ctx.fill();
      return;
    }

    if (this.attachSet.length === 0) {
      if (this.cooldown) {
        ctx.fillStyle = `hsla(${95 + this.cooldown}, 40%, 60%, 1)`;
      } else {
        ctx.fillStyle = `hsla(${60 - this.collisionHeat}, 40%, 60%, 1)`;
      }
    } else {
      const massRatio = this.grav / Bee.baseGrav;
      const shade = 1.0 - (massRatio - 0.5);
      if (this.supportSet.length === 0) {
        ctx.fillStyle = `hsla(35, 60%, ${15 + 75 * shade}%, 1)`;
      } else {
        ctx.fillStyle = `hsla(60, 60%, ${15 + 75 * shade}%, 1)`;
      }
    }

    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, (4 / 5) * this.nodeRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  drawEdge() {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "hsla(0, 0%, 0%, 0.2)";

    ctx.fillStyle = "";

    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.beeRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "hsla(0, 0%, 0%, 0.6)";

    for (const i of this.attachSet) {
      ctx.beginPath();
      ctx.moveTo(this.pos.x, this.pos.y);
      let x: number, y: number;
      if ((i as Vector2D).x !== undefined) {
        x = (i as Vector2D).x;
        y = (i as Vector2D).y;
      } else {
        x = bees.get(i as number)!.pos.x;
        y = bees.get(i as number)!.pos.y;
      }
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  isAttachedToBoard() {
    for (const i of this.attachSet) {
      if ((i as Vector2D).x !== undefined) {
        return true;
      }
    }
    return false;
  }

  resolveHoverVelocity() {
    const xVelOld = this.vel.x;
    const yVelOld = this.vel.y;

    if (this.isTouchingWall()) {
      this.vel = { x: -xVelOld, y: -yVelOld };
      this.isReverseNoise = !this.isReverseNoise;
    } else if (this.isTouchingBoard() && this.cooldown === 0) {
      const v = { x: this.pos.x, y: rod.rodBound };
      this.det = { x: -xVelOld, y: -yVelOld };
      this.attachSet.push(v as Vector2D);
      this.vel = { x: 0, y: 0 };
    } else if (this.isTouchingBee() !== null && this.cooldown === 0) {
      const j = this.isTouchingBee()![0];
      if (bees.get(j)!.attachSet.length === 0) {
        Bee.resolveBeeCollision(this.id, j);
      } else {
        for (const j of this.isTouchingBee()!) {
          this.det = { x: -xVelOld, y: -yVelOld };
          this.attachSet.push(j);
          bees.get(j)!.supportSet.push(this.id);
          this.vel = { x: 0, y: 0 };
          return;
        }
      }
    } else {
      const m = this.isReverseNoise ? -0.005 : 0.005;
      const d = unitDiff({ x: canvasWidth / 2, y: rod.rodBound }, this.pos);
      const flyTowardsQueen = booleanChance(Bee.flyTowardsQueenChance);

      if (flyTowardsQueen) {
        this.vel.x += d.x / 10;
        this.vel.x += d.y / 10;
      } else {
        this.vel.x += (queenCovered ? 0 : m) * PerlinNoise.getFBM(this.xTime);
        this.vel.y += (queenCovered ? 0 : m) * PerlinNoise.getFBM(this.yTime);
      }
    }
  }

  resolveAttachedVelocity() {
    const a: Vector2D = { x: 0, y: -this.grav };

    if (this.supportSet.length === 0 && !this.isAttachedToBoard()) {
      const toDetach = booleanChance(Bee.detachChance);

      if (toDetach) {
        for (const i of this.attachSet) {
          if ((i as Vector2D).x === undefined) {
            bees.get(i as number)!.supportSet = bees
              .get(i as number)!
              .supportSet.filter((u) => u != this.id);
          }
        }
        while (this.attachSet.length) {
          this.attachSet.pop();
        }
        this.vel = this.det;
        this.vel.y = 2.0;
        this.det = { x: 0, y: 0 };
        this.cooldown = 15;
        return;
      }
    }

    const newAttachSet = new Array<number | Vector2D>();
    const candidates = new Array<[number | Vector2D, number]>();

    for (const i of this.attachSet) {
      if ((i as Vector2D).x !== undefined) {
        if (this.isTouchingBoard()) {
          const v = { x: this.pos.x, y: rod.rodBound };
          candidates.push([v, 0]);
        }
      } else {
        bees.get(i as number)!.supportSet = bees
          .get(i as number)!
          .supportSet.filter((u) => u != this.id);
      }
    }

    let otherBees = this.isTouchingBee();

    if (otherBees !== null) {
      for (const i of otherBees) {
        const dist = bees.get(i)!.beeRadius + this.beeRadius;
        if (
          this.pos.y > bees.get(i)!.pos.y + 2.5 &&
          euclidDist(this.pos, bees.get(i)!.pos) <= dist + 10.0 &&
          bees.get(i)!.aerialState === "attached"
        ) {
          candidates.push([i, euclidDist(this.pos, bees.get(i)!.pos)]);
        }
      }
    }

    candidates.sort((x, y) => {
      if (x[1] == 0) return -1;
      if (y[1] == 0) return 1;
      return x[1] - y[1];
    });

    let goingToAttachToBoard = false;

    for (let i = 0; i < Math.min(candidates.length, Bee.beeLegs); i++) {
      if ((candidates[i][0] as Vector2D).x === undefined) {
        if (goingToAttachToBoard) {
          if (this.pos.y <= bees.get(candidates[i][0] as number)!.pos.y + 2.0) {
            break;
          }
        }
        bees.get(candidates[i][0] as number)!.supportSet.push(this.id);
      } else {
        goingToAttachToBoard = true;
      }
      newAttachSet.push(candidates[i][0]);
    }

    this.attachSet = newAttachSet;

    for (const i of this.supportSet) {
      const d = unitDiff(this.pos, bees.get(i as number)!.pos);
      const dist = bees.get(i as number)!.beeRadius + this.beeRadius;
      const massRatio = bees.get(i as number)!.grav / Bee.baseGrav;
      let m = dist;
      m -= euclidDist(bees.get(i as number)!.pos, this.pos);
      m = clamp(m, 0, dist);
      m *= massRatio;
      if (!this.isAttachedToBoard()) {
        a.x += Bee.k * m * d.x;
        a.y += Bee.k * m * d.y;
      } else {
        a.y += (Bee.k * m * d.y) / 2.0;
      }
    }

    const massRatio = this.grav / Bee.baseGrav;
    const massRatioAdj = 0.5 + 1.0 * (1.0 - (massRatio - 0.5));

    for (const i of this.attachSet) {
      if ((i as Vector2D).x === undefined) {
        const d = unitDiff(this.pos, bees.get(i as number)!.pos);
        const dist = bees.get(i as number)!.beeRadius + this.beeRadius;
        let m = dist;
        m -= euclidDist(bees.get(i as number)!.pos, this.pos);
        m = clamp(m, 0, dist);
        m *= massRatioAdj;
        a.x += Bee.k * m * d.x;
        a.y += Bee.k * m * d.y;
      } else {
        const v = i as Vector2D;
        const d = unitDiff(this.pos, v);
        let m = this.beeRadius;
        m -= euclidDist(v, this.pos);
        m = clamp(m, 0, this.beeRadius);
        m *= massRatioAdj;
        a.x += Bee.k * m * d.x;
        a.y += Bee.k * m * d.y;
      }
    }

    if (otherBees !== null) {
      for (const i of otherBees) {
        if (!this.attachSet.includes(i) && !this.supportSet.includes(i)) {
          const d = unitDiff(this.pos, bees.get(i)!.pos);
          if (this.isAttachedToBoard()) {
            if (bees.get(i)!.isAttachedToBoard()) {
              a.x += d.x / 6.0;
              a.y += d.y / 6.0;
            }
          } else {
            a.x += d.x / 5.0;
            a.y += d.y / 5.0;
          }
        }
      }
    }

    if (this.isAttachedToBoard() && this.supportSet.length === 0) {
      const d = unitDiff(queenPos, this.pos);
      const p = Math.abs(this.pos.x - canvasWidth / 2) / (canvasWidth / 2);
      const toAdvance = booleanChance((p + alpha) / 2.0);
      if (toAdvance) {
        a.x += d.x / Math.abs(d.x) / (4 * (1 - alpha) + 6);
        a.y += d.y / 30;
      }
    } else if (this.isAttachedToBoard()) {
      const d = unitDiff(queenPos, this.pos);
      const p = Math.abs(this.pos.x - canvasWidth / 2) / (canvasWidth / 2);
      const toAdvance = booleanChance((p + alpha) / 2.0);
      if (toAdvance) {
        a.x += d.x / Math.abs(d.x) / (4 * (1 - alpha) + 9);
        a.y += d.y / 30;
      }
    } else if (!this.isAttachedToBoard() && this.supportSet.length === 0) {
      const d = unitDiff(queenPos, this.pos);
      const p = Math.abs(this.pos.x - canvasWidth / 2) / (canvasWidth / 2);
      const toAdvance = booleanChance((1 - p + beta) / 3.0);
      if (toAdvance) {
        a.x += d.x / Math.abs(d.x) / (6 * (1 - beta) + 6);
        a.y += d.y / 20 + (Math.random() - 0.5) / (30 * (1 - beta) + 30);
      }
    } else {
      const d = unitDiff(queenPos, this.pos);
      const p = Math.abs(this.pos.x - canvasWidth / 2) / (canvasWidth / 2);
      const toAdvance = booleanChance((p + beta) / 4.0);
      if (toAdvance) {
        a.x += d.x / Math.abs(d.x) / (3 * (1 - beta) + 3);
        a.y -= d.y / 20 + (Math.random() - 0.5) / (15 * (1 - beta) + 15);
      }
    }

    a.x = clamp(a.x, -2, 2);
    a.y = clamp(a.y, -2, 2);

    this.vel.x += a.x;
    this.vel.y += a.y;

    this.vel.x *= 0.75;
    this.vel.y *= 0.75;
  }

  update() {
    if (this.isQueen) {
      this.pos = {
        x: canvasWidth / 2,
        y: canvasHeight / 3,
      };
      this.attachSet = [this.pos];
      this.aerialState = "attached";
      return;
    }

    if (this.aerialState === "hover") {
      this.resolveHoverVelocity();
    } else {
      this.resolveAttachedVelocity();
    }

    this.vel.x = clamp(this.vel.x, -2, 2);
    this.vel.y = clamp(this.vel.y, -2, 2);

    const xPosOld = this.pos.x;
    const yPosOld = this.pos.y;

    this.pos = {
      x: clamp(
        xPosOld + this.vel.x,
        this.nodeRadius,
        canvasWidth - this.nodeRadius,
      ),
      y: clamp(
        yPosOld + this.vel.y,
        rod.rodBound + this.nodeRadius,
        canvasHeight - this.nodeRadius,
      ),
    };

    this.xTime += this.xtimeStep;
    this.yTime += this.ytimeStep;

    this.collisionHeat -= this.collisionHeat ? 1 : 0;
    this.cooldown -= this.cooldown ? 1 : 0;
    this.aerialState = this.attachSet.length >= 1 ? "attached" : "hover";

    if (this.isAttachedToBoard()) {
      for (const i of this.attachSet) {
        if ((i as Vector2D).x !== undefined) {
          (i as Vector2D).x = this.pos.x;
        }
      }
    }
  }
}

const FPS = 60;

let ctx: CanvasRenderingContext2D;

let queenCovered = false;
let showBodyOnly = false;

let canvasWidth = 0;
let canvasHeight = 0;

let alpha = 0.0;
let beta = 0.0;

let sizeDelta = 0.0;
let massDelta = 0.0;

let simulationStatus: Status = "reset";

let queenPos: Vector2D = { x: 0, y: 0 };

const rod = new Rod();
const collisionGrid = new CollisionGrid();

const Z_INTERVAL = 30;

const ENSEMBLE_COUNT = 10;

let widthGraphs: Graphs = [];
let densityGraphs: Graphs = [];
let weightGraphs: Graphs = [];
let attachmentGraphs: Graphs = [];

let graphIdx = 0;

let frames = 0;

let curCnt = 0;
let beeCnt = 300;

let bees = new Map<number, Bee>(); // NOTE: (id (unique): number) -> (bee: Bee)

export function resizeSimulation(width: number, height: number) {
  canvasWidth = width;
  canvasHeight = height;
  queenCovered = false;
  rod.resetPoints();
  queenPos = { x: canvasWidth / 2, y: canvasHeight };
}

export function setShowBodyOnly(newShowBodyOnly: boolean) {
  showBodyOnly = newShowBodyOnly;
}

export function setSimulationStatus(newStatus: Status) {
  /* NOTE: <<- Implementation ->>
   * When the simulation is reset, delete all existing bees.
   */
  simulationStatus = newStatus;
  if (simulationStatus === "reset" && bees.size) {
    bees.clear();
    frames = 0;
    curCnt = 0;
    graphIdx = 0;
    setBeeCnt(curCnt);
  }
  if (simulationStatus === "reset") {
    queenCovered = false;
  }
}

export function setSimulationAlphaBeta(newAlpha: number, newBeta: number) {
  alpha = newAlpha;
  beta = newBeta;
}

export function setSimulationSizeDelta(newSizeDelta: number) {
  sizeDelta = newSizeDelta;
}

export function setSimulationMassDelta(newMassDelta: number) {
  massDelta = newMassDelta;
}

export function setSimulationMaxBeeCnt(newMaxBeeCnt: number) {
  beeCnt = newMaxBeeCnt;
}

let setBeeCnt: React.Dispatch<React.SetStateAction<number>>;

export function updateSetBeeCnt(
  _: React.Dispatch<React.SetStateAction<number>>,
) {
  setBeeCnt = _;
}

let setWidthGraph: React.Dispatch<React.SetStateAction<GraphData>>;

export function updateSetWidthGraph(
  _: React.Dispatch<React.SetStateAction<GraphData>>,
) {
  setWidthGraph = _;
}

let setDensityGraph: React.Dispatch<React.SetStateAction<GraphData>>;

export function updateSetDensityGraph(
  _: React.Dispatch<React.SetStateAction<GraphData>>,
) {
  setDensityGraph = _;
}

let setWeightGraph: React.Dispatch<React.SetStateAction<GraphData>>;

export function updateSetWeightGraph(
  _: React.Dispatch<React.SetStateAction<GraphData>>,
) {
  setWeightGraph = _;
}

let setAttachmentGraph: React.Dispatch<React.SetStateAction<GraphData>>;

export function updateSetAttachmentGraph(
  _: React.Dispatch<React.SetStateAction<GraphData>>,
) {
  setAttachmentGraph = _;
}

let setGraphsOverall: React.Dispatch<React.SetStateAction<GraphsOverall>>;

export function updateSetGraphsOverall(
  _: React.Dispatch<React.SetStateAction<GraphsOverall>>,
) {
  setGraphsOverall = _;
}

let graphsOverall: GraphsOverall = {
  widthGraphs: [],
  densityGraphs: [],
  weightGraphs: [],
  attachmentGraphs: [],
  points: [],
};

function getZ(pos: Vector2D) {
  return Math.floor((pos.y - rod.rodBound) / Z_INTERVAL);
}

function buildWidthGraph() {
  let widthGraph: GraphData = new Array<DataPoint>();
  let minLGraph = new Array<number>();
  let maxRGraph = new Array<number>();
  let maxIdx = 1;

  bees.forEach((bee: Bee, _id: number) => {
    if (bee.aerialState === "attached") {
      maxIdx = Math.max(maxIdx, getZ(bee.pos) + 2);
    }
  });

  for (let i = 0; i < maxIdx; i++) {
    widthGraph.push({ x: (Z_INTERVAL * i) / 1000, y: 0 });
    minLGraph.push(canvasWidth);
    maxRGraph.push(0);
  }

  bees.forEach((bee: Bee, _id: number) => {
    if (bee.aerialState === "attached") {
      const z = getZ(bee.pos);
      minLGraph[z] = Math.min(minLGraph[z], bee.pos.x - bee.beeRadius);
      maxRGraph[z] = Math.max(maxRGraph[z], bee.pos.x + bee.beeRadius);
    }
  });

  for (let i = 0; i < maxIdx; i++) {
    if (maxRGraph[i] === 0) continue;
    widthGraph[i].y = (maxRGraph[i] - minLGraph[i]) / 1000;
  }

  return widthGraph;
}

function buildDensityGraph() {
  let densityGraph: GraphData = new Array<DataPoint>();
  let minLGraph = new Array<number>();
  let maxRGraph = new Array<number>();
  let weightGraph = new Array<number>();
  let maxIdx = 1;

  bees.forEach((bee: Bee, _id: number) => {
    if (bee.aerialState === "attached") {
      maxIdx = Math.max(maxIdx, getZ(bee.pos) + 2);
    }
  });

  for (let i = 0; i < maxIdx; i++) {
    densityGraph.push({ x: (Z_INTERVAL * i) / 1000, y: 0 });
    minLGraph.push(canvasWidth);
    maxRGraph.push(0);
    weightGraph.push(0);
  }

  bees.forEach((bee: Bee, _id: number) => {
    if (bee.aerialState === "attached") {
      const z = getZ(bee.pos);
      minLGraph[z] = Math.min(minLGraph[z], bee.pos.x - bee.beeRadius);
      maxRGraph[z] = Math.max(maxRGraph[z], bee.pos.x + bee.beeRadius);
      weightGraph[z] += bee.grav;
    }
  });

  for (let i = 0; i < maxIdx; i++) {
    if (maxRGraph[i] === 0) continue;
    const area =
      (Z_INTERVAL * (maxRGraph[i] - minLGraph[i])) / Math.pow(1000, 2);
    densityGraph[i].y = weightGraph[i] / area;
  }

  return densityGraph;
}

function buildWeightGraph() {
  let weightGraph: GraphData = new Array<DataPoint>();
  let minLGraph = new Array<number>();
  let maxRGraph = new Array<number>();

  let wGraph = new Array<number>();
  let mGraph = new Array<number>();

  let maxIdx = 0;

  bees.forEach((bee: Bee, _id: number) => {
    if (bee.aerialState === "attached") {
      maxIdx = Math.max(maxIdx, getZ(bee.pos) + 1);
    }
  });

  for (let i = 0; i < maxIdx; i++) {
    weightGraph.push({ x: 0, y: 0 });
    minLGraph.push(canvasWidth);
    maxRGraph.push(0);
    wGraph.push(0);
    mGraph.push(0);
  }

  bees.forEach((bee: Bee, _id: number) => {
    if (bee.aerialState === "attached") {
      const z = getZ(bee.pos);
      minLGraph[z] = Math.min(minLGraph[z], bee.pos.x - bee.beeRadius);
      maxRGraph[z] = Math.max(maxRGraph[z], bee.pos.x + bee.beeRadius);
      wGraph[z] += bee.grav;
      mGraph[z] += bee.grav;
    }
  });

  for (let i = maxIdx - 1; i >= 0; i--) {
    if (i + 1 < maxIdx) wGraph[i] += wGraph[i + 1];
  }

  for (let i = 0; i < maxIdx; i++) {
    mGraph[i] /= Z_INTERVAL;
    wGraph[i] *= Bee.baseGrav;
    weightGraph[i] = {
      x: mGraph[i],
      y: wGraph[i],
    };
  }

  if (maxIdx == 0) {
    weightGraph.push({ x: 0, y: 0 });
  }

  weightGraph = weightGraph.sort((x: DataPoint, y: DataPoint) => x.x - y.x);

  return weightGraph;
}

function buildAttachmentGraph() {
  let attachmentGraph: GraphData = new Array<DataPoint>();
  let maxIdx = 5;

  bees.forEach((bee: Bee, _id: number) => {
    if (bee.aerialState === "attached") {
      const cnt = bee.supportSet.length + bee.attachSet.length;
      maxIdx = Math.max(maxIdx, cnt + 1);
    }
  });

  for (let i = 0; i < maxIdx; i++) {
    attachmentGraph.push({ x: i, y: 0 });
  }

  bees.forEach((bee: Bee, _id: number) => {
    if (bee.aerialState === "attached") {
      const cnt = bee.supportSet.length + bee.attachSet.length;
      attachmentGraph[cnt].y++;
    }
  });

  return attachmentGraph;
}

export function initSimulation(
  canvas: HTMLCanvasElement,
  c: CanvasRenderingContext2D,
  setImageLink: React.Dispatch<React.SetStateAction<string>>,
) {
  ctx = c;

  const animate = () => {
    setTimeout(() => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      rod.draw();

      if (!showBodyOnly) {
        bees.forEach((bee: Bee, _id: number) => bee.drawEdge());
      }
      bees.forEach((bee: Bee, _id: number) => bee.drawNode());

      if (simulationStatus === "start") {
        bees.forEach((bee: Bee, _id: number) => bee.update());
        collisionGrid.build();

        if (curCnt === 0) {
          bees.set(
            curCnt,
            new Bee(curCnt, canvasWidth / 2, canvasHeight / 3, 0, 0, true),
          );
          curCnt++;
          setBeeCnt(curCnt);
        }

        if (frames % 60 === 0) {
          const graphs = 5;
          if (graphIdx % graphs == 0) {
            const widthGraph = buildWidthGraph();
            setWidthGraph(widthGraph);
            widthGraphs.push(widthGraph);
            if (widthGraphs.length > ENSEMBLE_COUNT) {
              widthGraphs.shift();
            }
            graphsOverall["widthGraphs"] = widthGraphs;
          } else if (graphIdx % graphs == 1) {
            const densityGraph = buildDensityGraph();
            setDensityGraph(densityGraph);
            densityGraphs.push(densityGraph);
            if (densityGraphs.length > ENSEMBLE_COUNT) {
              densityGraphs.shift();
            }
            graphsOverall["densityGraphs"] = densityGraphs;
          } else if (graphIdx % graphs == 2) {
            const weightGraph = buildWeightGraph();
            setWeightGraph(weightGraph);
            weightGraphs.push(weightGraph);
            if (weightGraphs.length > ENSEMBLE_COUNT) {
              weightGraphs.shift();
            }
            graphsOverall["weightGraphs"] = weightGraphs;
          } else if (graphIdx % graphs == 3) {
            const attachmentGraph = buildAttachmentGraph();
            setAttachmentGraph(attachmentGraph);
            attachmentGraphs.push(attachmentGraph);
            if (attachmentGraphs.length > ENSEMBLE_COUNT) {
              attachmentGraphs.shift();
            }
            graphsOverall["attachmentGraphs"] = attachmentGraphs;
          } else {
            const points = Array<DataPoint>();
            let xMin = 1_000_000;
            let yMin = 1_000_000;
            bees.forEach((bee: Bee, _: number) => {
              xMin = Math.min(xMin, bee.pos.x);
              yMin = Math.min(yMin, bee.pos.y);
            });
            bees.forEach((bee: Bee, _: number) => {
              points.push({
                x: bee.pos.x - xMin,
                y: bee.pos.y - yMin,
              });
            });
            graphsOverall["points"] = points;
          }
          graphIdx++;
          setGraphsOverall(graphsOverall);
          setImageLink(canvas.toDataURL("image/png"));
        }

        frames++;
        if (frames % 50 === 0 && curCnt < beeCnt) {
          const spawnLeft = booleanChance(0.5);
          const spawnOffset = 30 * Math.random() + 30;
          const velOffset = 0.5 * Math.random();

          let x: number;
          let y: number;
          let dx: number;
          let dy: number;

          if (spawnLeft) {
            x = spawnOffset;
            y = canvasHeight - spawnOffset;
          } else {
            x = canvasWidth - spawnOffset;
            y = canvasHeight - spawnOffset;
          }

          const dq = unitDiff(
            {
              x: canvasWidth / 2,
              y: canvasHeight / 3,
            },
            { x, y },
          );

          if (!queenCovered) {
            dx = 5 * dq.x;
            dy = 2.5 * dq.y;
          } else {
            if (spawnLeft) {
              dx = velOffset;
              dy = -2;
            } else {
              dx = -velOffset;
              dy = -2;
            }
          }

          bees.set(curCnt, new Bee(curCnt, x, y, dx, dy, false));

          curCnt++;
          setBeeCnt(curCnt);
          if (curCnt == 60) queenCovered = true;
        }
      }
    }, 1000 / FPS);
  };

  animate();
}
