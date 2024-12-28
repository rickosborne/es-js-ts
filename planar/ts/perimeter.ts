import { window2 } from "@rickosborne/foundation";
import { type Polygon } from "@rickosborne/planar";

export const perimeterOfPolygon = (poly: Polygon): number => {
	let sum = 0;
	for (const [ a, b ] of window2(poly.points)) {
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		sum += Math.sqrt(dx * dx + dy * dy);
	}
	return sum;
};
