import { ships_not_in } from "./find";
import { isWithinDist, sum } from "./vec";
import { attackdmg, lossFromAttacking } from "./utils";

export default function energize_combat(
  collections: Collections,
  G: Graph,
  busy: Vec
): void {
  energize_enemybase(collections);
  energize_enemiesinrange(collections);
}

function energize_enemybase(collections: Collections) {
  const { myships, bases } = collections;
  for (const ship of myships) {
    const isNearEnemybase = isWithinDist(
      ship.position,
      bases.enemy.position,
      200
    );
    if (isNearEnemybase) {
      ship.energize(bases.enemy);
    }
  }
}
/**
 * Auto attack enemies in range, but in a way that does not overkill an enemy.
 */
function energize_enemiesinrange(collections: Collections) {
  const { myships, enemyships } = collections;

  const alreadyfiring_indexes: number[] = [];
  for (const enemyship of enemyships) {
    //get all my ships that are in range of this enemyship
    const myshipsInRange = enemyship.nearbyenemies;

    //remove the ones already firing
    const myAvailableships = ships_not_in(
      myshipsInRange,
      alreadyfiring_indexes
    );

    //how much dmg could I do if all available fired on this enemyship
    const myAvailableships_totaldmg = sum(myAvailableships.map(attackdmg));

    //const couldKillEnemyship = myAvailableships_totaldamage > enemyship.energy

    //const enemyshipEnergy = enemyship.energy - lossFromAttacking(enemyship); //assume the enemy is also attacking
    const enemyshipEnergy = enemyship.energy; //enemyship might get healed, so just go with the basic

    //note: ship dies when it hits Negative energy after an attack.
    const couldKillEnemyship = myAvailableships_totaldmg > enemyshipEnergy;

    //now lets select required number of ships and add them to alreadyfiring
    //note I always lose shiplossFromAttacking regardless of target.energy
    //eg: target.energy=1 and ship.erngize(target) would cost ship 10 energy.

    let dmgdealt = 0;
    for (const myship of myAvailableships) {
      if (dmgdealt <= enemyshipEnergy) {
        if (notEmpty(myship)) {
          myship.energize(enemyship);
          dmgdealt += attackdmg(myship);
          alreadyfiring_indexes.push(myship.index);
        }

        //if (couldKillEnemyship) {
        //  myship.shout("k");
        //}
      }
    }
  }
}

function notEmpty(ship: Ship) {
  return ship.energy > 0;
}
