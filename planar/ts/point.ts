import { Point } from "./2d.js";

export const point = (x: number, y: number): Point => ({ x, y });

export const ORIGIN: Readonly<{x: 0, y: 0}> = Object.freeze({ x: 0, y: 0 });

export const pointAdd = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });

export const pointEq = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;
