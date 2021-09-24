import collections from "../collections";
import { ships_not_in } from "../find";
import { constructGraph, path_byclosestavailabledestination } from "../graph";
import {
  anyShipIsWithinDist,
  canTransfer,
  isFull,
  maxStarFarmers,
} from "../utils";
import { all, isWithinDist } from "../vec";

export default function energize_base(
  targets: targets,
  busy: Vec,
  attacking: Vec,
  nfarmers: number
): void {
  const { stars, myships, enemyships, bases } = collections;

  const enemyIsNearBase = anyShipIsWithinDist(
    enemyships,
    bases.me.position,
    420
  );
  const Nhome_max = maxStarFarmers(stars.me, myships[0].size);

  const shouldHealBeforeTransferring =
    memory.gamestage > 0 || nfarmers >= Nhome_max;

  let transfercondition = (s: Ship) => canTransfer(s);
  if (shouldHealBeforeTransferring) {
    transfercondition = (s: Ship) => isFull(s);
  }

  const shouldEnergizeBase =
    !memory.enemyIsSquareRush ||
    (memory.enemyIsSquareRush && myships.length < 8 && tick < 46) ||
    (memory.enemyIsSquareRush &&
      myships.length < 9 &&
      bases.me.energy <= 87 &&
      tick < 46);

  if (shouldEnergizeBase) {
    energize_nearstar2base(
      targets,
      stars.me,
      busy,
      attacking,
      transfercondition
    );
    energize_nearstar2base(
      targets,
      stars.middle,
      busy,
      attacking,
      transfercondition
    );
  }

  if (!shouldHealBeforeTransferring && shouldEnergizeBase && !enemyIsNearBase) {
    energize_any2base(targets, busy);
  }
}

function energize_nearstar2base(
  targets: targets,
  star: Star,
  busy: Vec,
  attacking: Vec,
  condition = (s: Ship) => isFull(s)
): void {
  const { myships, bases } = collections;
  const base = bases.me;

  const sources = ships_not_in(myships, busy.concat(attacking)).filter(
    (s) => isWithinDist(star.position, s.position, 200) && condition(s)
  );
  const shipsnearbase = ships_not_in(myships, busy.concat(attacking)).filter(
    (s) => isWithinDist(base.position, s.position, 200)
  );

  for (const src of sources) {
    const ships = ships_not_in(myships, busy.concat(attacking));

    if (ships.length > 0) {
      const G = constructGraph(ships);
      const destinations = ships_not_in(shipsnearbase, busy);
      const pathships = path_byclosestavailabledestination(
        ships,
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
            busy.push(pathships[i].index);
          } else {
            break;
          }
        }

        const dest = pathships[pathships.length - 1];
        if (condition(dest)) {
          targets[dest.index] = base;
          busy.push(dest.index);
        }
      }
    }
  }
}

function energize_any2base(targets: targets, busy: Vec) {
  const { myships } = collections;

  //ships with energy and not near base
  const sources = ships_not_in(myships, busy).filter(
    (s) => canTransfer(s) && !isWithinDist(base.position, s.position)
  );

  //ships with energy near base
  const shipsnearbase = ships_not_in(myships, busy).filter((s) =>
    isWithinDist(base.position, s.position)
  );

  for (const src of sources) {
    const graphships = ships_not_in(myships, busy);

    if (graphships.length > 0) {
      const G = constructGraph(graphships);
      const destinations = ships_not_in(shipsnearbase, busy);
      //the way Im doing it now prevents a destination from being healed more than once...
      const pathships = path_byclosestavailabledestination(
        graphships,
        G,
        src,
        destinations
      );

      if (pathships.length > 1) {
        const transferships = pathships.slice(0, -1); //all except destination
        const canReach = all(transferships.map(canTransfer));
        if (canReach) {
          for (let i = 0; i < pathships.length - 1; i++) {
            targets[pathships[i].index] = pathships[i + 1];
            busy.push(pathships[i].index);
          }
          const dest = pathships[pathships.length - 1];
          targets[dest.index] = base;
          busy.push(dest.index);
        }
      }
    }
  }

  for (const ship of shipsnearbase) {
    targets[ship.index] = base;
    busy.push(ship.index);
  }
}