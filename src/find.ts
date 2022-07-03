import { dist, minimum } from "./vec";

/**
 * ```raw
 * Return the ship (not in busy) that is closest to point p.
 *
 * Note: Will return undefined if the passed ships array is empty or none not busy ships.
 * ```
 */
export function ship_closest(ships: Ships, p: Vec2, busy: Vec = []): Ship {
  const freeships = ships_not_in(ships, busy);
  const distances = freeships.map((s) => dist(s.position, p));
  const ship = freeships[minimum(distances).index];
  return ship;
}

export function ship_closest_to_point(ships: Ships, p: Vec2): Ship {
  const distances = ships.map((s) => dist(s.position, p));
  const ship = ships[minimum(distances).index];
  return ship;
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
 * Smallest distance first, as compared to ship.position to ship.nearestenemy.position (which is different for each ship)
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
 * Biggest distance first, as compared to ship.position to ship.nearestenemy.position (which is different for each ship)
 */
export function sortByNearestenemyDistanceReverse(ships: Ships): Ships {
  return ships
    .slice()
    .sort(
      (a, b) =>
        dist(b.position, b.nearestenemy.position) -
        dist(a.position, a.nearestenemy.position)
    );
}

/**
 * Smallest distance first, as compared to ship.position to targetpoint
 */
export function sortByNearestDistance(ships: Ships, targetpoint: Vec2): Ships {
  return ships
    .slice()
    .sort(
      (a, b) => dist(a.position, targetpoint) - dist(b.position, targetpoint)
    );
}

/**
 * Biggest distance first, as compared to ship.position to targetpoint
 */
export function sortByNearestDistanceReverse(
  ships: Ships,
  targetpoint: Vec2
): Ships {
  return ships
    .slice()
    .sort(
      (a, b) => dist(b.position, targetpoint) - dist(a.position, targetpoint)
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
 * Return true if ship.index is in indexes
 */
export function is_in(ship: Ship, indexes: Vec): boolean {
  return indexes.includes(ship.index);
}

/**
 * Return true if ship.index is NOT in indexes
 */
export function not_in(ship: Ship, indexes: Vec): boolean {
  return !indexes.includes(ship.index);
}

/**
 * Return the ship with index i (if it exists)
 */
export function shipFromIndex(ships: Ships, i: number): Ship | undefined {
  return ships.find((s) => s.index === i);
}

/**
 * Return true if ship exist in array ships
 */
export function ship_is_in_ships(ship: Ship, ships: Ships): boolean {
  const foundShip = ships.find((s) => s.index === ship.index);
  if (foundShip === undefined) {
    return false;
  } else {
    return true;
  }
}

/**
 * Return true if ship.index is NOT in any of ships indexes
 */
export function ship_is_not_in_ships(ship: Ship, ships: Ships): boolean {
  return !ship_is_in_ships(ship, ships);
}
