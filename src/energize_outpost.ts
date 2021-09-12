import collections from "./collections";
import { ships_not_in } from "./find";
import { myOutpostEnergy, notEmpty } from "./utils";
import { isWithinDist } from "./vec";

export default function energize_outpost(
  targets: targets,
  busy: Vec,
  attacking: Vec
): void {
  const { myships, outposts, info } = collections;
  const outpost = outposts.middle;

  const shouldEnergizeOutpost = myOutpostEnergy() <= 600;

  if (shouldEnergizeOutpost) {
    const ships = ships_not_in(myships, attacking.concat(busy)).filter(
      (s) => isWithinDist(s.position, outpost.position) && notEmpty(s)
    );
    for (const ship of ships) {
      targets[ship.index] = outpost;
      if (!info.outpostcontrolIsMe) {
        attacking.push(ship.index);
      }
    }
  }
}