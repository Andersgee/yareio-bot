import collections from "../collections";
import {
  ships_not_in,
  sortByNearestDistanceReverse,
  sortByNearestenemyDistance,
  sortByNearestenemyDistanceReverse,
} from "../find";
import { constructGraph, path } from "../graph";
import { canTransfer, isFull, transferamount } from "../utils";
import { isWithinDist } from "../vec";

/**
 * 1. Heal nearbase ships (farthest from base first)
 * 2. Heal the rest (closest to enemy first)
 */
export default function energize_basefriend(
  targets: targets,
  energizing: Vec,
  healing: Vec,
  attacking: Vec,
  boosting: Vec,
  ships_requireheal: Ships,
  index_requiredheal: Map<number, number>,
  stayfull = false
): void {
  const { stars, myships, bases } = collections;

  //1. Heal nearbase ships
  let transfercondition = (s: Ship) => canTransfer(s, 3);
  if (stayfull) {
    transfercondition = (s: Ship) => isFull(s);
  }

  const nearbaseships_me = sortByNearestDistanceReverse(
    ships_requireheal.filter((s) =>
      isWithinDist(s.position, bases.me.position)
    ),
    bases.me.position
  );

  const nearbaseships_big = sortByNearestDistanceReverse(
    ships_requireheal.filter((s) =>
      isWithinDist(s.position, bases.big.position)
    ),
    bases.me.position
  );

  const nearbaseships_enemy = sortByNearestDistanceReverse(
    ships_requireheal.filter((s) =>
      isWithinDist(s.position, bases.big.position)
    ),
    bases.me.position
  );

  for (const ship of nearbaseships_me) {
    energize_nearstar2singlefriend(
      targets,
      stars.me,
      energizing,
      healing,
      ship,
      index_requiredheal,
      transfercondition,
      "base_h"
    );
  }

  for (const ship of nearbaseships_big) {
    energize_nearstar2singlefriend(
      targets,
      stars.big,
      energizing,
      healing,
      ship,
      index_requiredheal,
      transfercondition,
      "base_b"
    );
  }

  for (const ship of nearbaseships_enemy) {
    energize_nearstar2singlefriend(
      targets,
      stars.enemy,
      energizing,
      healing,
      ship,
      index_requiredheal,
      transfercondition,
      "base_e"
    );
  }

  for (const ship of nearbaseships_me) {
    energize_notnearstar2singlefriend(
      targets,
      stars.me,
      energizing,
      healing,
      ship,
      index_requiredheal,
      transfercondition,
      "base_h2"
    );
  }

  for (const ship of nearbaseships_big) {
    energize_notnearstar2singlefriend(
      targets,
      stars.me,
      energizing,
      healing,
      ship,
      index_requiredheal,
      transfercondition,
      "base_b2"
    );
  }

  for (const ship of nearbaseships_enemy) {
    energize_notnearstar2singlefriend(
      targets,
      stars.me,
      energizing,
      healing,
      ship,
      index_requiredheal,
      transfercondition,
      "base_e2"
    );
  }

  //2. Heal others
  /*
  const transfercondition2 = (s: Ship) => canTransfer(s, 3);
  const otherships = sortByNearestenemyDistance(
    ships_not_in(ships_requireheal, healing)
  );
  for (const ship of otherships) {
    energize_nearstar2singlefriend(
      targets,
      stars.middle,
      energizing,
      healing,
      ship,
      index_requiredheal,
      transfercondition2,
      "other"
    );
  }

  for (const ship of otherships) {
    energize_nearstar2singlefriend(
      targets,
      stars.me,
      energizing,
      healing,
      ship,
      index_requiredheal,
      transfercondition2,
      "other"
    );
  }
  for (const ship of otherships) {
    energize_notnearstar2singlefriend(
      targets,
      stars.me,
      energizing,
      healing,
      ship,
      index_requiredheal,
      transfercondition2,
      "other"
    );
  }
  */
}

/**
 * ```raw
 * Try to heal ship dest (from ships NOT near star) by amount specified in index_requiredheal.get(dest.index)
 *
 * sortingpoint determines order of sources (allocate ships closer to sortingpoint first)
 * ```
 */
function energize_notnearstar2singlefriend(
  targets: targets,
  star: Star,
  energizing: Vec,
  healing: Vec,
  dest: Ship,
  index_requiredheal: Map<number, number>,
  condition = (s: Ship) => canTransfer(s),
  shoutstr = ""
): void {
  const { myships, bases } = collections;

  const sources = sortByNearestenemyDistanceReverse(
    ships_not_in(myships, energizing.concat(healing)).filter(
      (s) =>
        !isWithinDist(star.position, s.position) &&
        condition(s) &&
        s.index !== dest.index
    )
  );

  for (const src of sources) {
    const requiredheal = index_requiredheal.get(dest.index) || 0; //this will always be defined but to make typescript happy...
    if (requiredheal <= 0) {
      return;
    }
    const graphships = ships_not_in(myships, energizing.concat(healing))
      .filter(condition)
      .concat(dest);

    if (graphships.length > 1) {
      const G = constructGraph(graphships);
      const pathships = path(graphships, G, src, dest);

      if (pathships.length > 1) {
        //src might also want heal, but since its healing someone, make it NOT want heal
        index_requiredheal.set(src.index, 0);
        if (shoutstr) {
          src.shout(shoutstr);
        }

        //make path energize next in path
        for (let i = 0; i < pathships.length - 1; i++) {
          targets[pathships[i].index] = pathships[i + 1];
          energizing.push(pathships[i].index);
          healing.push(pathships[i].index);
        }

        const healamount = transferamount(pathships[pathships.length - 1]);
        index_requiredheal.set(dest.index, requiredheal - healamount);
      }
    }
  }
}

/**
 * Try to heal ship dest (from ships near star) by amount specified in index_requiredheal.get(dest.index)
 */
function energize_nearstar2singlefriend(
  targets: targets,
  star: Star,
  energizing: Vec,
  healing: Vec,
  dest: Ship,
  index_requiredheal: Map<number, number>,
  condition = (s: Ship) => canTransfer(s),
  shoutstr = ""
): void {
  const { myships } = collections;

  const sources = ships_not_in(myships, energizing.concat(healing)).filter(
    (s) =>
      isWithinDist(star.position, s.position) &&
      condition(s) &&
      s.index !== dest.index
  );

  for (const src of sources) {
    const requiredheal = index_requiredheal.get(dest.index) || 0; //this will always be defined but to make typescript happy...
    if (requiredheal <= 0) {
      return;
    }
    const graphships = ships_not_in(myships, energizing.concat(healing))
      .filter(condition)
      .concat(dest);

    if (graphships.length > 1) {
      const G = constructGraph(graphships);
      const pathships = path(graphships, G, src, dest);

      if (pathships.length > 1) {
        //src might also want heal, but since its healing someone, make it NOT want heal
        index_requiredheal.set(src.index, 0);
        if (shoutstr) {
          src.shout(shoutstr);
        }

        //make path energize next in path
        for (let i = 0; i < pathships.length - 1; i++) {
          targets[pathships[i].index] = pathships[i + 1];
          energizing.push(pathships[i].index);
          healing.push(pathships[i].index);
        }

        const healamount = transferamount(pathships[pathships.length - 1]);
        index_requiredheal.set(dest.index, requiredheal - healamount);
      }
    }
  }
}
