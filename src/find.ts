import { dist, indexVec, minimum } from "./vec";

/**
 * ```raw
 * Return the N ships that are closest to the points in ps.
 *
 * note:
 * 1. N = positions.length
 * 2. Ignores ships with indexes in the vector busy
 * 3. Adds the picked ships indexes to the vector busy
 * 4. The ships are chosen in same ORDER as positions: the first point will get the best match
 * ```
 */
export function ships_at_positions(
  ships: Ships,
  ps: Vec2[],
  busy: Vec = []
): Ships {
  const pickedships: Ships = [];
  let freeships: Ships = [];
  for (const p of ps) {
    freeships = ships_not_in(ships, busy);
    const s = ship_closest(freeships, p);
    busy.push(s.index);
    pickedships.push(s);
  }
  return pickedships;
}

/**
 * ```raw
 * Return the ship that is closest to point p.
 *
 * Note: Will return undefined if the passed ships array is empty.
 * ```
 */
export function ship_closest(ships: Ships, p: Vec2): Ship {
  const d = ships.map((ship) => dist(ship.position, p));
  const i = minimum(d).index;
  return ships[i];
}

/**
 * Return the N ships that is closest to point p.
 */
export function ships_closestN(ships: Ships, p: Vec2, N: number): Ships {
  const sortedships = ships
    .slice()
    .sort((a, b) => dist(a.position, p) - dist(b.position, p));
  return sortedships.slice(0, N);
}

/**
 * Smallest distance first
 */
export function sortByNearestenemyDistance(ships: Ships): Ships {
  return ships
    .slice()
    .sort(
      (a, b) =>
        dist(a.position, a.nearestenemy.position) -
        dist(b.position, b.nearestenemy.position)
    );
}

/**
 * Lowest energy first
 */
export function sortByShipenergy(ships: Ships): Ships {
  return ships.slice().sort((a, b) => a.energy - b.energy);
}

/**
 * Biggest energy first
 */
export function sortByShipenergyReverse(ships: Ships): Ships {
  return ships.slice().sort((a, b) => b.energy - a.energy);
}

/**
 * Return all ships that DOES have a ship.index listed in the vector indexes.
 */
export function ships_in(ships: Ships, indexes: Vec): Ships {
  return ships.filter((ship) => indexes.includes(ship.index));
}

/**
 * Return all ships that does NOT have a ship.index listed in the vector indexes.
 */
export function ships_not_in(ships: Ships, indexes: Vec): Ships {
  return ships.filter((ship) => !indexes.includes(ship.index));
}

/**
 * Return the ship with index i (if it)
 */
export function shipFromIndex(ships: Ships, i: number): Ship {
  for (const ship of ships) {
    if (ship.index === i) {
      return ship;
    }
  }
  console.warn(
    "shipFromIndex: No ship with index i exists in ships. returning first ship"
  );
  return ships[0];
}
