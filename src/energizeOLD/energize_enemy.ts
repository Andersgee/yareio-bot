import collections from "../collections";
import { ships_not_in, sortByShipenergy } from "../find";
import {
  attackdmg,
  transferamount,
  notEmpty,
  lossFromAttacking,
} from "../utils";
import { isWithinDist, sum } from "../vec";

export default function energize_enemy(
  targets: targets,
  energizing: Vec,
  attacking: Vec
): void {
  const { bases } = collections;
  energize_enemyship(targets, energizing, attacking);
  for (const base of [bases.big, bases.enemy, bases.me, bases.middle]) {
    energize_enemybase(base, targets, energizing, attacking);
  }
}

/**
 * Attack enemies in range, in a way that does not overkill an enemy.
 */
function energize_enemyship(targets: targets, energizing: Vec, attacking: Vec) {
  const { enemyships } = collections;
  const assumeNheals = 1;
  for (const enemyship of sortByShipenergy(enemyships)) {
    //get all my ships that are in range of this enemyship
    const myshipsInRange = enemyship.nearbyenemies;
    const myAvailableships = ships_not_in(myshipsInRange, attacking);

    //const potentialHeal = sum(enemyship.nearbyfriends.map(transferamount));

    const en = enemyship.energy - lossFromAttacking(enemyship);
    const enemyshipEnergy = en + assumeNheals * enemyship.size;

    let dmgdealt = 0;
    for (const myship of myAvailableships) {
      if (dmgdealt <= enemyshipEnergy) {
        if (notEmpty(myship)) {
          targets[myship.index] = enemyship;
          dmgdealt += attackdmg(myship);

          energizing.push(myship.index);
          attacking.push(myship.index);
        }
      }
    }
  }
}

/**
 * ```raw
 * Energize enemy base, in a way that does not overkill the base.
 *
 * Base only need to go below 0 energy for it to change hands.
 * ```
 */
function energize_enemybase(
  base: Base,
  targets: targets,
  energizing: Vec,
  attacking: Vec
) {
  const { myships, enemyships, playerids } = collections;
  if (base.control === playerids.me) {
    return;
  }
  const nearbyEnemyships = enemyships.filter((s) =>
    isWithinDist(s.position, base.position)
  );
  //const potentialBaseHeal = sum(nearbyEnemyships.map(transferamount));
  const potentialBaseHeal = 0; //assume enemy wont energize base

  const baseattackerShips = ships_not_in(myships, attacking).filter((s) =>
    isWithinDist(s.position, base.position)
  );

  let dmgdealt = 0;
  for (const ship of baseattackerShips) {
    if (dmgdealt <= base.energy + potentialBaseHeal) {
      targets[ship.index] = base;
      dmgdealt += attackdmg(ship);

      energizing.push(ship.index);
      attacking.push(ship.index);
    }
  }
}
