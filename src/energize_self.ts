import collections from "./collections";
import { ships_not_in } from "./find";
import { myOutpostEnergy, notFull, sustainableStarEnergy } from "./utils";
import { isWithinDist } from "./vec";

/**
 * energize_self but with guard aginst overfarming 8charge star as function of its energy and nfarmers)
 */
export default function energize_farm(
  targets: targets,
  busy: Vec,
  attacking: Vec,
  nfarmers: number,
  nmidfarmers: number
): void {
  const { stars } = collections;

  //guard against overfarming
  energize_star(targets, stars.me, busy, nfarmers);
  if (myOutpostEnergy() > 600) {
    energize_star(targets, stars.middle, busy, nmidfarmers);
  }

  energize_self(targets, stars.me, busy, attacking);
  energize_self(targets, stars.middle, busy, attacking);
}

/**
 * Take energy from star, every other tick
 */
function energize_self(
  targets: targets,
  star: Star,
  busy: Vec,
  attacking: Vec
) {
  const { myships } = collections;

  const ships = ships_not_in(myships, busy.concat(attacking)).filter((s) =>
    isWithinDist(star.position, s.position)
  );

  for (const [i, ship] of ships.entries()) {
    if ((tick + i) % 2 == 0) {
      if (notFull(ship)) {
        targets[ship.index] = ship;
        if (star.energy > 2) {
          //only make it busy if worthwile not to override
          busy.push(ship.index);
        }
      }
    }
  }
}

function energize_star(
  targets: targets,
  star: Star,
  busy: Vec,
  nfarmers: number
) {
  const { myships } = collections;

  if (star.energy < sustainableStarEnergy(star, nfarmers, myships[0].size)) {
    const ships = myships.filter((s) =>
      isWithinDist(star.position, s.position)
    );

    for (const [i, ship] of ships.entries()) {
      if ((tick + i + 1) % 2 == 0) {
        targets[ship.index] = star;
        busy.push(ship.index);
      }
    }
  }
}
