import collections from "../collections";
import { ships_not_in } from "../find";
import { constructGraph, path_byclosestavailabledestination } from "../graph";
import { canTransfer, isFull, myShipCost } from "../utils";
import { isWithinDist } from "../vec";

export default function energize_star2base(
  targets: targets,
  energizing: Vec,
  basing: Vec,
  stayfullfarmline = false
): void {
  const { stars, bases, myships } = collections;

  let transfercondition = (s: Ship) =>
    myships.length > 4 ? canTransfer(s, 1) : canTransfer(s, 2);
  if (stayfullfarmline) {
    transfercondition = (s: Ship) => isFull(s);
  }
  /*
  energize_nearstar2base(
    targets,
    stars.middle,
    energizing,
    basing,
    transfercondition
  );
  */

  energize_nearstar2base(
    targets,
    stars.me,
    bases.me,
    energizing,
    basing,
    transfercondition
  );

  energize_nearstar2base(
    targets,
    stars.big,
    bases.big,
    energizing,
    basing,
    transfercondition
  );

  energize_nearstar2base(
    targets,
    stars.enemy,
    bases.enemy,
    energizing,
    basing,
    transfercondition
  );
}

function energize_nearstar2base(
  targets: targets,
  star: Star,
  base: Base,
  energizing: Vec,
  basing: Vec,
  condition = (s: Ship) => canTransfer(s)
): void {
  const { myships, bases, playerids } = collections;
  if (base.control !== playerids.me) {
    return;
  }

  const sources = ships_not_in(myships, energizing.concat(basing)).filter(
    (s) => isWithinDist(star.position, s.position) && condition(s)
  );
  const shipsnearbase = ships_not_in(myships, energizing.concat(basing)).filter(
    (s) => isWithinDist(base.position, s.position)
  );

  for (const src of sources) {
    const graphships = ships_not_in(myships, energizing.concat(basing));

    if (graphships.length > 0) {
      const G = constructGraph(graphships);
      const destinations = ships_not_in(
        shipsnearbase,
        energizing.concat(basing)
      );
      const pathships = path_byclosestavailabledestination(
        graphships,
        G,
        src,
        destinations
      );

      if (pathships.length > 1) {
        //make path energize next in path
        for (let i = 0; i < pathships.length - 1; i++) {
          //pathships[i].energize(pathships[i + 1]);
          if (condition(pathships[i])) {
            targets[pathships[i].index] = pathships[i + 1];
            energizing.push(pathships[i].index);
            basing.push(pathships[i].index);
          } else {
            break;
          }
        }
        const dest = pathships[pathships.length - 1];
        if (condition(dest)) {
          targets[dest.index] = base;
          energizing.push(dest.index);
          basing.push(dest.index);
        }
      }
    }
  }
}
