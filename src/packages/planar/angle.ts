import type { Angle, Orientation } from "./2d.js";

export const angle = (area: number, orientation: Orientation, rad: number): Angle => ({ area, orientation, rad });
