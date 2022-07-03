import collections from "../collections";
import { ships_not_in } from "../find";
import { canTransfer, isFull } from "../utils";
import { isWithinDist } from "../vec";

export default function energize_base(
  base: Base,
  targets: targets,
  energizing: Vec,
  stayfull = false
): void {
  const { myships, bases, playerids } = collections;
  if (base.control !== playerids.me) {
    return;
  }

  let condition = (s: Ship) => canTransfer(s);
  if (stayfull) {
    condition = (s: Ship) => isFull(s);
  }

  const ships = ships_not_in(myships, energizing).filter(
    (s) => isWithinDist(s.position, base.position) && condition(s)
  );

  for (const ship of ships) {
    targets[ship.index] = base;
    energizing.push(ship.index);
  }
}
