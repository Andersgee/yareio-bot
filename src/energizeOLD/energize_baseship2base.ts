import collections from "../collections";
import { ships_not_in } from "../find";
import { canTransfer, isFull } from "../utils";
import { isWithinDist } from "../vec";

export default function energize_baseship2base(
  targets: targets,
  energizing: Vec,
  basing: Vec,
  stayalmostfullfnearbase = false, //do energize base if full
  stayfullfnearbase = false //dont energize base even if full
): void {
  const { bases } = collections;
  let transfercondition = (s: Ship) => canTransfer(s, 1);
  if (stayalmostfullfnearbase) {
    transfercondition = (s: Ship) => isFull(s);
  }

  for (const base of [bases.big, bases.enemy, bases.me, bases.middle]) {
    energize_nearbase2base(
      base,
      targets,
      energizing,
      basing,
      transfercondition
    );
  }
}

function energize_nearbase2base(
  base: Base,
  targets: targets,
  energizing: Vec,
  basing: Vec,
  condition = (s: Ship) => canTransfer(s)
) {
  const { myships, bases } = collections;
  const shipsnearbase = ships_not_in(myships, energizing.concat(basing)).filter(
    (s) => isWithinDist(base.position, s.position) && condition(s)
  );
  for (const ship of shipsnearbase) {
    targets[ship.index] = base;
    energizing.push(ship.index);
    basing.push(ship.index);
  }
}
