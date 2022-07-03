import collections from "../collections";
import { ships_not_in } from "../find";
import { maxStarSelfers, notFull, sustainableStarSelfers } from "../utils";
import { isWithinDist } from "../vec";

export default function energize_self(targets: targets, energizing: Vec): void {
  const { stars } = collections;
  energize_self_star(targets, energizing, stars.big);
  energize_self_star(targets, energizing, stars.middle);
  energize_self_star(targets, energizing, stars.me);
  energize_self_star(targets, energizing, stars.enemy);
}

function energize_self_star(
  targets: targets,
  energizing: Vec,
  star: Star
): void {
  /*
  if (tick < 23) {
    maybeBoostInstead(targets, energizing, star);
  }
  */

  const { myships } = collections;
  const shipsize = myships[0].size;
  const selfers_max = sustainableStarSelfers(star, shipsize);

  const myshipsnearstar = ships_not_in(myships, energizing).filter((s) =>
    isWithinDist(star.position, s.position)
  );

  let selfers_count = 0;
  for (const ship of myshipsnearstar) {
    if (notFull(ship) && selfers_count < selfers_max) {
      targets[ship.index] = ship; //energize self
      energizing.push(ship.index);
      selfers_count += 1;
    }
  }
}

function maybeBoostInstead(targets: targets, energizing: Vec, star: Star) {
  const { myships } = collections;
  const shipsize = myships[0].size;
  const selfers_sustainable_max = sustainableStarSelfers(star, shipsize);
  const selfers_max = maxStarSelfers(star, shipsize);
  const shipsNearStar = myships.filter((s) =>
    isWithinDist(star.position, s.position)
  );
  const NavailableNearStar = shipsNearStar.length;
  const NavailableSelfers = Math.min(selfers_max, NavailableNearStar);

  if (NavailableSelfers > selfers_sustainable_max) {
    for (const ship of shipsNearStar) {
      targets[ship.index] = star; //energize star
      energizing.push(ship.index);
    }
  }
}
