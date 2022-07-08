import { collections } from "../collections";
import { ships_not_in, sortByShipenergy } from "../find";
import { attackdmg, notEmpty, lossFromAttacking, canEnergize } from "../utils";

/**
 * Attack enemies in range, in a way that does not overkill an enemy.
 */
export default function energize_enemy_ships(
  targets: Target[],
  energizing: Vec,
  attacking: Vec
): void {
  const { enemyships } = collections;
  const assumeNheals = 0;
  for (const enemyship of sortByShipenergy(enemyships)) {
    const myshipsInRange300 = ships_not_in(
      enemyship.nearbyenemies300,
      energizing
    );

    const myshipsInRange = myshipsInRange300.filter((myship) =>
      canEnergize(myship, enemyship)
    );
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
