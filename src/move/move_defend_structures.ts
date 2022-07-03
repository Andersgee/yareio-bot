import collections from "../collections";
import { controlIsMe, meanposition, notEmpty } from "../utils";
import { dist, isWithinDist, offset } from "../vec";
import { D, BLOCK_RANGE } from "../constants";
import { ships_not_in, ship_closest, ship_closest_to_point } from "../find";
import { avoidCircle } from "../positioning";

export default function move_defend_structures(
  targetps: Vec2s,
  moving: Vec
): void {
  const { bases, myships } = collections;

  for (const base of [bases.big, bases.enemy, bases.me, bases.middle]) {
    move_unblock_base_spawning(targetps, moving, base);
  }
}

function move_unblock_base_spawning(
  targetps: Vec2s,
  moving: Vec,
  base: Base
): void {
  const { enemyships, myships } = collections;
  if (!controlIsMe(base.control)) return;

  //dont bother chasing unless I can make 2 ships.
  if (
    base.energy < Math.min(base.energy_capacity, 2 * base.current_spirit_cost)
  )
    return;

  const enemyshipsBlockingSpawn = enemyships.filter(
    (s) => isWithinDist(s.position, base.position, BLOCK_RANGE + 1) //a small margin
  );

  const possibleDefenders = myships.filter(
    (s) => notEmpty(s) && isWithinDist(s.position, base.position, 600)
  );

  const defending: Vec = [];
  for (const enemy of enemyshipsBlockingSpawn) {
    let defenderTotalEnergy = 0;
    while (enemy.energy >= defenderTotalEnergy) {
      const availableDefenders = ships_not_in(possibleDefenders, defending);
      if (availableDefenders.length < 1) break;

      const point = interceptPoint(base, enemy);
      const defender = ship_closest_to_point(availableDefenders, point);

      targetps[defender.index] = avoidCircle(
        defender.position,
        point,
        base.position,
        base.collision_radius
      );
      moving.push(defender.index);
      defenderTotalEnergy += defender.energy;
      defending.push(defender.index);
    }
  }

  return;
}

/** an appropriate point for defending base from a blocking enemy ship */
function interceptPoint(base: Base, enemy: Ship) {
  const enemyDistFromBaseRadius =
    dist(base.position, enemy.position) - base.collision_radius;
  if (enemyDistFromBaseRadius > D) {
    return offset(enemy.position, base.position, D);
  } else {
    return offset(base.position, enemy.position, base.collision_radius + 1);
  }
}
