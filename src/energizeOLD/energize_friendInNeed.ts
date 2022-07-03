import collections from "../collections";
import {
  ships_in,
  ships_not_in,
  sortByNearestenemyDistance,
  sortByNearestenemyDistanceReverse,
} from "../find";
import { constructGraph, path } from "../graph";
import { canTransfer, transferamount } from "../utils";
import { isWithinDist } from "../vec";

/**
 * 1. Heal attacker ships (not sure about order, maybe closest to enemy first)
 * 2. Heal friends with enemies sort of nearby
 * 3. Heal booster ships (not sure about order, maybe doesnt matter)
 */
export default function energize_friendInNeed(
  targets: targets,
  energizing: Vec,
  healing: Vec,
  attacking: Vec,
  boosting: Vec,
  ships_requireheal: Ships,
  index_requiredheal: Map<number, number>
): void {
  const { stars, bases } = collections;

  const transfercondition = (s: Ship) => canTransfer(s, 1);

  //1. Heal attacker ships
  const attackerships = sortByNearestenemyDistance(
    ships_in(ships_requireheal, attacking)
  );
  for (const star of [stars.enemy, stars.big, stars.middle, stars.me]) {
    for (const ship of attackerships) {
      energize_nearstar2singlefriend(
        targets,
        star,
        energizing,
        healing,
        ship,
        index_requiredheal,
        transfercondition,
        "attacker"
      );
    }
  }

  //Heal exposed ships
  const almostindangerships = ships_requireheal.filter(
    (s) => s.nearbyenemies400.length > 0
  );

  for (const star of [stars.enemy, stars.big, stars.middle, stars.me]) {
    for (const ship of almostindangerships) {
      energize_nearstar2singlefriend(
        targets,
        star,
        energizing,
        healing,
        ship,
        index_requiredheal,
        transfercondition,
        "exposed"
      );
    }
  }

  //3. Heal booster ships
  //const boosterships = ships_in(ships_requireheal, boosting);
  /*
  //dont actually use ships near star to heal boosters
  for (const ship of boosterships) {
    energize_nearstar2singlefriend(
      targets,
      stars.me,
      energizing,
      healing,
      ship,
      index_requiredheal,
      transfercondition
    );
  }
  */
  /*
  for (const ship of boosterships) {
    energize_notnearstar2singlefriend(
      targets,
      energizing,
      healing,
      ship,
      index_requiredheal,
      transfercondition,
      "booster"
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
  energizing: Vec,
  healing: Vec,
  dest: Ship,
  index_requiredheal: Map<number, number>,
  condition = (s: Ship) => canTransfer(s),
  shoutmsg = ""
): void {
  const { myships, stars } = collections;

  const sources = sortByNearestenemyDistanceReverse(
    ships_not_in(myships, energizing.concat(healing)).filter(
      (s) =>
        !isWithinDist(stars.me.position, s.position) &&
        !isWithinDist(stars.middle.position, s.position) &&
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
        if (shoutmsg) {
          src.shout(shoutmsg);
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
  shoutmsg = ""
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
        if (shoutmsg) {
          src.shout(shoutmsg);
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
