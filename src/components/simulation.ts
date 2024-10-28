import { Status } from "../types";

// NOTE: <<- Utility Classes/Functions ->>

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

  static readonly nodeRadius = 5;
  static readonly beeRadius = 15;
  static readonly beeLegs = 3;

  static readonly detachChance = 0.0002;
  static readonly flyTowardsQueenChance = 0.1;

  static readonly queenChance = 0.02;
  static readonly grav = 0.06;
  static readonly k = 0.02;

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

  constructor(id: number, x: number, y: number, vx: number, vy: number) {
    this.id = id;

    this.pos = { x, y };
    this.vel = { x: vx, y: vy };
    this.det = { x: 0, y: 0 };

    this.xTime = 200 * Math.random();
    this.yTime = 200 * Math.random();
  }

  isTouchingBoard(): boolean {
    return this.pos.y <= rod.rodBound + Bee.beeRadius;
  }

  isTouchingWall(): boolean {
    if (this.pos.y >= canvasHeight - Bee.beeRadius) return true;
    if (this.pos.x <= Bee.beeRadius) return true;
    if (this.pos.x >= canvasWidth - Bee.beeRadius) return true;
    return false;
  }

  isTouchingBee(): null | Array<number> {
    const xc = CollisionGrid.compress(this.pos).x;
    const yc = CollisionGrid.compress(this.pos).y;

    const ids = new Set<number>();

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
      if (euclidDist(this.pos, bees.get(id)!.pos) <= 2 * Bee.beeRadius) {
        ans.push(id);
      }
    }

    return ans.length === 0 ? null : ans;
  }

  drawNode() {
    if (this.attachSet.length === 0) {
      if (this.cooldown) {
        ctx.fillStyle = `hsla(${85 + this.cooldown}, 60%, 60%, 1)`;
      } else {
        ctx.fillStyle = `hsla(${50 - this.collisionHeat}, 60%, 60%, 1)`;
      }
    } else {
      if (this.supportSet.length === 0) {
        ctx.fillStyle = `hsla(110, 60%, 60%, 1)`;
      } else {
        ctx.fillStyle = `hsla(75, 60%, 60%, 1)`;
      }
    }

    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, Bee.nodeRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  drawEdge() {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "hsla(0, 0%, 0%, 0.6)";

    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, Bee.beeRadius, 0, 2 * Math.PI);
    ctx.stroke();

    for (const i of this.attachSet) {
      ctx.beginPath();
      ctx.moveTo(this.pos.x, this.pos.y);
      if ((i as Vector2D).x !== undefined) {
        ctx.lineTo((i as Vector2D).x, (i as Vector2D).y);
      } else {
        ctx.lineTo(bees.get(i as number)!.pos.x, bees.get(i as number)!.pos.y);
      }
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
      const m = this.isReverseNoise ? -0.01 : 0.01;
      const d = unitDiff(queenPos, this.pos);
      const flyTowardsQueen = booleanChance(Bee.flyTowardsQueenChance);

      this.vel.x += m * PerlinNoise.getFBM(this.xTime);
      this.vel.y += m * PerlinNoise.getFBM(this.yTime);

      if (flyTowardsQueen) {
        this.vel.x += d.x / 10;
        this.vel.x += d.y / 10;
      }
    }
  }

  resolveAttachedVelocity() {
    const a: Vector2D = { x: 0, y: -Bee.grav };

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
        this.vel.y = 1;
        this.det = { x: 0, y: 0 };
        this.cooldown = 15;
        return;
      }
    }

    if (this.attachSet.length >= 2) {
      const newAttachSet = new Array<number | Vector2D>();

      for (const i of this.attachSet) {
        if ((i as Vector2D).x === undefined) {
          const d = euclidDist(this.pos, bees.get(i as number)!.pos);
          if (
            d <= 2 * Bee.beeRadius + 5.0 &&
            this.pos.y > bees.get(i as number)!.pos.y + 5.0
          ) {
            newAttachSet.push(i as number);
          } else {
            bees.get(i as number)!.supportSet = bees
              .get(i as number)!
              .supportSet.filter((u) => u != this.id);
          }
        } else {
          const d = euclidDist(this.pos, i as Vector2D);
          if (d <= 2 * Bee.beeRadius + 1.0) {
            newAttachSet.push(i as Vector2D);
          }
        }
      }

      this.attachSet = newAttachSet;
    }

    let otherBees = this.isTouchingBee();

    if (otherBees !== null) {
      for (const i of otherBees) {
        if (
          this.attachSet.length < Bee.beeLegs &&
          this.pos.y > bees.get(i)!.pos.y + 5.0 &&
          bees.get(i)!.aerialState === "attached" &&
          !this.attachSet.includes(i) &&
          !this.supportSet.includes(i)
        ) {
          this.attachSet.push(i);
          bees.get(i)!.supportSet.push(this.id);
        }
      }
    }

    if (!this.isAttachedToBoard() && this.isTouchingBoard()) {
      const v = { x: this.pos.x, y: rod.rodBound };
      this.attachSet.push(v as Vector2D);
    }

    for (const i of this.supportSet) {
      const d = unitDiff(this.pos, bees.get(i as number)!.pos);
      let m = 2 * Bee.beeRadius;
      m -= euclidDist(bees.get(i as number)!.pos, this.pos);
      m = clamp(m, 0, 2 * Bee.beeRadius);
      a.x += Bee.k * m * d.x;
      a.y += Bee.k * m * d.y;
    }

    for (const i of this.attachSet) {
      if ((i as Vector2D).x === undefined) {
        const d = unitDiff(this.pos, bees.get(i as number)!.pos);
        let m = 2 * Bee.beeRadius;
        m -= euclidDist(bees.get(i as number)!.pos, this.pos);
        m = clamp(m, 0, 2 * Bee.beeRadius);
        a.x += Bee.k * m * d.x;
        a.y += Bee.k * m * d.y;
      } else {
        const v = i as Vector2D;
        const d = unitDiff(this.pos, v);
        let m = Bee.beeRadius;
        m -= euclidDist(v, this.pos);
        m = clamp(m, 0, 2 * Bee.beeRadius);
        a.x += Bee.k * m * d.x;
        a.y += Bee.k * m * d.y;
      }
    }

    otherBees = this.isTouchingBee();

    if (otherBees !== null) {
      for (const i of otherBees) {
        if (!this.attachSet.includes(i) && !this.supportSet.includes(i)) {
          const d = unitDiff(this.pos, bees.get(i)!.pos);
          a.x += d.x / 4;
          a.y += d.y / 4;
        }
      }
    }

    a.x = clamp(a.x, -2, 2);
    a.y = clamp(a.y, -2, 2);

    if (this.isAttachedToBoard() || this.supportSet.length === 0) {
      const d = unitDiff(queenPos, this.pos);
      a.x += d.x / 1.5;
    }

    this.vel.x += a.x;
    this.vel.y += a.y;

    this.vel.x *= 0.75;
    this.vel.y *= 0.75;
  }

  update() {
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
        Bee.nodeRadius,
        canvasWidth - Bee.nodeRadius,
      ),
      y: clamp(
        yPosOld + this.vel.y,
        rod.rodBound + Bee.nodeRadius,
        canvasHeight - Bee.nodeRadius,
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

let canvasWidth = 0;
let canvasHeight = 0;

let simulationStatus: Status = "reset";

let queenPos: Vector2D = { x: 0, y: 0 };

const rod = new Rod();
const collisionGrid = new CollisionGrid();

let frames = 0;

let curCnt = 0;
let beeCnt = 200;

let bees = new Map<number, Bee>(); // NOTE: (id (unique): number) -> (bee: Bee)

export function resizeSimulation(width: number, height: number) {
  canvasWidth = width;
  canvasHeight = height;
  rod.resetPoints();
  queenPos = { x: canvasWidth / 2, y: canvasHeight };
}

export function setSimulationStatus(newStatus: Status) {
  /* NOTE: <<- Implementation ->>
   * When the simulation is reset, delete all existing bees.
   */
  simulationStatus = newStatus;
  if (simulationStatus === "reset" && bees.size) {
    bees.clear();
    frames = 0;
  }
}

export function initSimulation(c: CanvasRenderingContext2D) {
  ctx = c;

  const animate = () => {
    setTimeout(() => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      rod.draw();
      bees.forEach((bee: Bee, _id: number) => bee.drawEdge());
      bees.forEach((bee: Bee, _id: number) => bee.drawNode());
      if (simulationStatus === "start") {
        bees.forEach((bee: Bee, _id: number) => bee.update());
        collisionGrid.build();
        frames++;
        if (frames % 50 === 0 && curCnt < beeCnt) {
          const spawnLeft = booleanChance(0.5);
          const spawnOffset = 30 * Math.random() + 30;
          const velOffset = 0.5 * Math.random();
          if (spawnLeft) {
            bees.set(
              curCnt,
              new Bee(
                curCnt,
                spawnOffset,
                canvasHeight - spawnOffset,
                velOffset,
                -2,
              ),
            );
          } else {
            bees.set(
              curCnt,
              new Bee(
                curCnt,
                canvasWidth - spawnOffset,
                canvasHeight - spawnOffset,
                -velOffset,
                -2,
              ),
            );
          }
          curCnt++;
        }
      }
    }, 1000 / FPS);
  };

  animate();
}
