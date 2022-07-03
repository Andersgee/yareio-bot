import collections from "../collections";
import { ships_not_in } from "../find";
import { canTransfer, isFull, myOutpostEnergy, notEmpty } from "../utils";
import { isWithinDist } from "../vec";

export default function energize_outpost(
  targets: targets,
  energizing: Vec,
  outposting: Vec,
  stayfull = false
): void {
  const { myships, outposts, stars } = collections;
  const outpost = outposts.middle;

  const shouldEnergizeOutpost = myOutpostEnergy() < 20;

  let condition = (s: Ship) => canTransfer(s);
  if (stayfull) {
    condition = (s: Ship) => isFull(s);
  }

  const ships = ships_not_in(myships, energizing).filter(
    (s) => isWithinDist(s.position, outpost.position) && condition(s)
  );

  for (const ship of ships) {
    if (
      shouldEnergizeOutpost ||
      (myOutpostEnergy() < 500 && stars.middle.energy > 500)
    ) {
      targets[ship.index] = outpost;
      energizing.push(ship.index);
      outposting.push(ship.index);
    }
  }
}
