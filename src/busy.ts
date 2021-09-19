import collections from "./collections";
import { ships_not_in, ship_closest } from "./find";

/**
 * ```raw
 * Move closest not busy ship to p and make it busy.
 *
 * return 0 if no ship found. (1 otherwise)
 * ```
 */
export function moveclosest(targetps: Vec2s, p: Vec2, busy: Vec): number {
  const { myships } = collections;
  const ship = ship_closest(ships_not_in(myships, busy), p) || null;
  if (ship) {
    targetps[ship.index] = p;
    busy.push(ship.index);
    return 1;
  }
  return 0;
}
