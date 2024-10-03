import { Status } from "../types";

// NOTE: <<- Utility Classes/Functions ->>

interface Vector2D {
  x: number;
  y: number;
}

function euclidDist(u: Vector2D, v: Vector2D) {
  return Math.sqrt(Math.pow(u.x - v.x, 2) + Math.pow(u.y - v.y, 2));
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
  static readonly gridLength = 30;

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
    ctx.setLineDash([3, 5]);

    ctx.beginPath();

    ctx.moveTo(this.leftPoint.x, this.leftPoint.y);
    ctx.lineTo(this.rightPoint.x, this.rightPoint.y);

    ctx.stroke();
    ctx.setLineDash([]);
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

  static readonly nodeRadius = 5;
  static readonly beeRadius = 7;

  aerialState: "hover" | "attach" = "hover";

  static readonly aerialStateToggleProb = 0.002;

  static readonly attachBoardProb = 0.5;
  static readonly attachBeeProb = 0.5;

  static readonly detachBoardProb = 0.02;
  static readonly detachBeeProb = 0.02;

  xTime: number;
  yTime: number;

  isReverseNoise = false;
  isAttached = false;
  attachedTo = -1;
  isHeated = 0;

  readonly xtimeStep = clamp(Math.random(), 0.1, 0.5);
  readonly ytimeStep = clamp(Math.random(), 0.1, 0.5);

  attachedBees: Set<number>;

  static resolveCollision(i: number, j: number) {
    const xVelDiff = bees.get(i)!.vel.x - bees.get(j)!.vel.x;
    const yVelDiff = bees.get(i)!.vel.y - bees.get(j)!.vel.y;

    const xPosDiff = bees.get(j)!.pos.x - bees.get(i)!.pos.x;
    const yPosDiff = bees.get(j)!.pos.y - bees.get(i)!.pos.y;

    if (bees.get(j)!.isAttached) {
      const toAttachBee = booleanChance(Bee.attachBeeProb);

      if (toAttachBee) {
        bees.get(i)!.vel = { x: 0, y: 0 };
        bees.get(i)!.isAttached = true;
        bees.get(i)!.attachedTo = j;
        bees.get(j)!.attachedBees.add(i);
      } else {
        bees.get(i)!.vel = {
          x: bees.get(i)!.vel.x,
          y: bees.get(i)!.vel.y,
        };
      }
      return;
    }

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
    }
  }

  constructor(id: number) {
    this.id = id;

    let ok = true;

    do {
      const xPosRange = canvasWidth - Bee.nodeRadius;
      const xPos = Bee.nodeRadius + xPosRange * Math.random();

      this.pos = {
        x: xPos,
        y: 2.5 * rod.rodBound + 120 * (Math.random() - 0.5),
      };
      this.vel = { x: 0, y: 0 };

      this.attachedBees = new Set<number>();

      ok = true;

      bees.forEach((bee: Bee, _id: number) => {
        ok &&= euclidDist(this.pos, bee.pos) > 2 * Bee.beeRadius;
      });
    } while (!ok);

    this.xTime = 200 * Math.random();
    this.yTime = 200 * Math.random();
  }

  getNoiseAcceleration(): Vector2D {
    const multiplier = this.isReverseNoise ? -1 : 1;

    const xNoise = 0.05 * PerlinNoise.getFBM(this.xTime);
    const yNoise = 0.05 * PerlinNoise.getFBM(this.yTime);

    return { x: multiplier * xNoise, y: multiplier * yNoise };
  }

  isTouchingBoard(): boolean {
    return this.pos.y === rod.rodBound + Bee.nodeRadius;
  }

  isTouchingWall(): boolean {
    if (this.pos.y === canvasHeight - Bee.nodeRadius) return true;
    if (this.pos.x === Bee.nodeRadius) return true;
    if (this.pos.x === canvasWidth - Bee.nodeRadius) return true;
    return false;
  }

  isTouchingBee(): null | number {
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

    for (const id of ids) {
      if (euclidDist(this.pos, bees.get(id)!.pos) <= 2 * Bee.beeRadius) {
        return id;
      }
    }

    return null;
  }

  draw() {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "hsla(0, 0%, 0%, 0.6)";

    if (this.isAttached) {
      if (this.attachedTo === -1) {
        ctx.fillStyle = "hsla(80, 80%, 40%, 0.6)";
      } else {
        ctx.fillStyle = "hsla(110, 90%, 50%, 0.6)";
      }
    } else {
      ctx.fillStyle = `hsla(${50 - this.isHeated}, 90%, 60%, 0.6)`;
    }

    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, Bee.nodeRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  update() {
    let a: Vector2D;

    const xVelOld = this.vel.x;
    const yVelOld = this.vel.y;

    if (!this.isAttached) {
      if (this.isTouchingBoard()) {
        const toAttachBoard = booleanChance(Bee.attachBoardProb);

        if (toAttachBoard) {
          this.isAttached = true;
        }

        this.vel = {
          x: toAttachBoard ? 0 : -xVelOld,
          y: toAttachBoard ? 0 : -yVelOld,
        };
      } else if (this.isTouchingWall()) {
        this.isReverseNoise = !this.isReverseNoise;

        this.vel = {
          x: -xVelOld,
          y: -yVelOld,
        };
      } else if (this.isTouchingBee() !== null) {
        this.isReverseNoise = !this.isReverseNoise;
        this.isHeated = 50;

        Bee.resolveCollision(this.id, this.isTouchingBee()!);
      } else {
        a = this.getNoiseAcceleration();

        const toToggleAeralState = booleanChance(Bee.aerialStateToggleProb);

        if (toToggleAeralState) {
          this.aerialState = this.aerialState === "hover" ? "attach" : "hover";
        }

        if (this.aerialState === "attach") {
          a.y = -Math.random() / 10;
        }

        this.vel = {
          x: 0.98 * clamp(xVelOld + a.x, -0.7, 0.7),
          y: 0.98 * clamp(yVelOld + a.y, -0.7, 0.7),
        };
      }
    } else if (this.attachedBees.size === 0) {
      let toAdjustVel = false;

      if (this.attachedTo === -1) {
        const toDetachBoard = booleanChance(Bee.detachBoardProb);

        if (toDetachBoard) {
          this.isAttached = false;
          this.aerialState = "hover";
          toAdjustVel = true;
        }
      } else {
        const toDetachBee = booleanChance(Bee.detachBeeProb);

        if (toDetachBee) {
          bees.get(this.attachedTo)!.attachedBees.delete(this.id);
          this.attachedTo = -1;
          this.isAttached = false;
          this.aerialState = "hover";
          toAdjustVel = true;
        }
      }

      if (toAdjustVel) {
        this.pos.y -= 0.5;
        this.vel.x = 1.0 * (Math.random() - 0.5);

        if (!this.isTouchingBee()) {
          this.pos.y += -0.5;
          this.vel.y = -0.5;
        } else {
          this.vel.y = 0.5;
        }
      }
    }

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

    this.isHeated -= this.isHeated ? 1 : 0;
  }
}

const FPS = 60;

let ctx: CanvasRenderingContext2D;

let canvasWidth = 0;
let canvasHeight = 0;

let simulationStatus: Status = "reset";

const rod = new Rod();
const collisionGrid = new CollisionGrid();

let beeCnt = 200;
let bees = new Map<number, Bee>(); // NOTE: (id (unique): number) -> (bee: Bee)

export function resizeSimulation(width: number, height: number) {
  canvasWidth = width;
  canvasHeight = height;
  rod.resetPoints();
}

export function setSimulationStatus(newStatus: Status) {
  /* NOTE: <<- Implementation ->>
   * When the simulation is reset, delete all existing bees and create new
   * ones randomly.
   */
  simulationStatus = newStatus;
  if (simulationStatus === "reset" && bees.size) {
    bees.clear();
    for (let id = 0; id < beeCnt; id++) {
      bees.set(id, new Bee(id));
    }
  }
}

export function initSimulation(c: CanvasRenderingContext2D) {
  ctx = c;

  if (bees.size === 0) {
    for (let id = 0; id < beeCnt; id++) {
      bees.set(id, new Bee(id));
    }
  }

  const animate = () => {
    setTimeout(() => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      rod.draw();
      bees.forEach((bee: Bee, _id: number) => bee.draw());
      if (simulationStatus === "start") {
        bees.forEach((bee: Bee, _id: number) => bee.update());
        collisionGrid.build();
      }
    }, 1000 / FPS);
  };

  animate();
}
