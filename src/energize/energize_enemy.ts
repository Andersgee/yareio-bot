import collections from "../collections";
import { ships_not_in, sortByShipenergy } from "../find";
import {
  attackdmg,
  transferamount,
  notEmpty,
  lossFromAttacking,
} from "../utils";
import { all, isWithinDist, sum } from "../vec";

export default function energize_enemy(targets: targets, attacking: Vec): void {
  //const assumeNheals = memory.enemyIsSquareRush ? 0 : 1;
  const assumeNheals = assumedHeals();
  energize_enemyship(targets, attacking, assumeNheals);
  energize_enemybase(targets, attacking);
}

function assumedHeals() {
  const { enemyships } = collections;
  if (memory.enemyIsSquareRush) {
    const e1 = enemyships[0];
    const enemyisgathered = all(
      enemyships.map((s) => isWithinDist(e1.position, s.position, 180))
    );
    if (enemyisgathered) {
      return 0;
    } else {
      return 1;
    }
  } else {
    //default
    return 1;
  }
}

/**
 * Attack enemies in range, in a way that does not overkill an enemy.
 */
function energize_enemyship(
  targets: targets,
  attacking: Vec,
  assumeNheals = 1
) {
  const { enemyships } = collections;

  for (const enemyship of sortByShipenergy(enemyships)) {
    //get all my ships that are in range of this enemyship
    const myshipsInRange = enemyship.nearbyenemies;

    //remove the ones already attacking
    const myAvailableships = ships_not_in(myshipsInRange, attacking);

    //const enemyshipEnergy = enemyship.energy - lossFromAttacking(enemyship); //assume the enemy is also attacking
    //const enemyshipEnergy = enemyship.energy; //enemyship might get healed, so just go with the basic
    const en = enemyship.energy - lossFromAttacking(enemyship);
    const enemyshipEnergy = en + assumeNheals * enemyship.size;

    let dmgdealt = 0;
    for (const myship of myAvailableships) {
      if (dmgdealt <= enemyshipEnergy) {
        if (notEmpty(myship)) {
          targets[myship.index] = enemyship;
          dmgdealt += attackdmg(myship);

          attacking.push(myship.index);
          //myship.shout(`a: ${myship.index}`);
        }
      }
    }
  }
}

/**
 * ```raw
 * Energize enemy base, in a way that does not overkill the base.
 *
 * Base only need to go below 0 energy for a total of 8 ticks over the course of the game.
 * ```
 */
function energize_enemybase(targets: targets, attacking: Vec) {
  const { myships, enemyships, bases } = collections;
  const nearbyEnemyships = enemyships.filter((s) =>
    isWithinDist(s.position, bases.enemy.position)
  );
  const potentialBaseHeal = sum(nearbyEnemyships.map(transferamount));
  //const potentialBaseHeal = 0; //assume enemy wont energize base

  const baseattackerShips = ships_not_in(myships, attacking).filter((s) =>
    isWithinDist(s.position, bases.enemy.position)
  );

  let dmgdealt = 0;
  for (const ship of baseattackerShips) {
    if (dmgdealt <= bases.enemy.energy + potentialBaseHeal) {
      targets[ship.index] = bases.enemy;
      dmgdealt += attackdmg(ship);

      attacking.push(ship.index);
    }
  }
}
