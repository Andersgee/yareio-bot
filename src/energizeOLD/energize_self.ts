import collections from "../collections";
import { ships_not_in } from "../find";
import { notFull, sustainableStarSelfers } from "../utils";
import { isWithinDist } from "../vec";

export default function energize_self(
  targets: targets,
  energizing: Vec,
  selfing: Vec
): void {
  const { stars } = collections;

  const ignoresustainable = true;
  for (const star of [stars.big, stars.enemy, stars.me, stars.middle]) {
    energize_self_star(targets, energizing, selfing, star, ignoresustainable);
  }
}

function energize_self_star(
  targets: targets,
  energizing: Vec,
  selfing: Vec,
  star: Star,
  ignoresustainable = false
): void {
  const { myships } = collections;
  const shipsize = myships[0].size;
  const Nsustainableselfers = sustainableStarSelfers(star, shipsize);

  const shipsnearstar = ships_not_in(myships, energizing).filter((s) =>
    isWithinDist(star.position, s.position)
  );

  let nselfers = 0;
  for (const [i, ship] of shipsnearstar.entries()) {
    const t = (tick + i) % 2 == 0;
    if (
      (ignoresustainable && notFull(ship)) ||
      (nselfers < Nsustainableselfers &&
        notFull(ship) &&
        (t || myships.length > 4))
    ) {
      targets[ship.index] = ship;
      energizing.push(ship.index);
      selfing.push(ship.index);
      nselfers += 1;
    }
  }
}
