import collections from "./collections";
import { ships_not_in } from "./find";
import { attackdmg, notEmpty } from "./utils";
import { isWithinDist } from "./vec";

export default function energize_enemy(targets: targets, attacking: Vec): void {
  energize_enemyship(targets, attacking);
  energize_enemybase(targets, attacking);
}

/**
 * Attack enemies in range, in a way that does not overkill an enemy.
 */
function energize_enemyship(targets: targets, attacking: Vec) {
  const { enemyships } = collections;

  for (const enemyship of enemyships) {
    //get all my ships that are in range of this enemyship
    const myshipsInRange = enemyship.nearbyenemies;

    //remove the ones already attacking
    const myAvailableships = ships_not_in(myshipsInRange, attacking);

    //const enemyshipEnergy = enemyship.energy - lossFromAttacking(enemyship); //assume the enemy is also attacking
    const enemyshipEnergy = enemyship.energy; //enemyship might get healed, so just go with the basic

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

function energize_enemybase(targets: targets, attacking: Vec) {
  const { myships, bases } = collections;
  for (const ship of ships_not_in(myships, attacking)) {
    const isNearEnemybase = isWithinDist(ship.position, bases.enemy.position);
    if (isNearEnemybase) {
      targets[ship.index] = bases.enemy;
      attacking.push(ship.index);
    }
  }
}
