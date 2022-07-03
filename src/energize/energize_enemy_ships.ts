import collections from "../collections";
import { sortByShipenergy } from "../find";
import { attackdmg, notEmpty, lossFromAttacking } from "../utils";

/**
 * Attack enemies in range, in a way that does not overkill an enemy.
 */
export default function energize_enemy_ships(
  targets: targets,
  energizing: Vec,
  attacking: Vec
): void {
  const { enemyships } = collections;
  const assumeNheals = 0;
  for (const enemyship of sortByShipenergy(enemyships)) {
    //get all my ships that are in range of this enemyship
    const myshipsInRange = enemyship.nearbyenemies;
    //const potentialHeal = sum(enemyship.nearbyfriends.map(transferamount));

    const enemyHealth = enemyship.energy - lossFromAttacking(enemyship);
    const enemyshipEnergy = enemyHealth + assumeNheals * enemyship.size;

    let dmgdealt = 0;
    for (const myship of myshipsInRange) {
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
