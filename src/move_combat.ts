import getCollections from "./collections";
import { dist, isWithinDist, minimum, mix, offset, sum } from "./vec";
import { attackdmg, lossFromAttacking, weightedmeanposition } from "./utils";
import { ships_not_in } from "./find";

const collections = getCollections();

export default function move_combat(G: Graph): void {
  //override earlier with later
  dont_walk_into_stuff(); //1.
  move_toward_help_if_needed(); //2.
}

function dont_walk_into_stuff() {
  const { myships, enemyships } = collections;
  for (const ship of myships) {
    if (ship.nearbyenemies.length > 0) {
      if (ship.nearbyfriends.length > 0) {
        //just stop
        const p = weightedmeanposition(ship.nearbyfriends);
        ship.move(offset(ship.nearestenemy.position, p, 219));
      } else {
        ship.move(offset(ship.nearestenemy.position, ship.position, 219));
      }
    }
  }
}

function move_toward_help_if_needed() {
  const { myships, enemyships } = collections;
  for (const ship of myships) {
    const nearbyEnemies = enemyships.filter((s) =>
      isWithinDist(s.position, ship.position, 241)
    );
    if (nearbyEnemies.length < 1) {
      continue;
    }

    const veryNearbyFriends = myships.filter((s) =>
      isWithinDist(s.position, ship.position, 1)
    );

    const myPower = evaluateCombat(veryNearbyFriends, nearbyEnemies, 241);
    const enemyPower = evaluateCombat(nearbyEnemies, veryNearbyFriends, 241);
    if (enemyPower > myPower) {
      if (veryNearbyFriends.length > 1) {
        //includes self
        const p1 = weightedmeanposition(veryNearbyFriends);
        const p2 = weightedmeanposition(ship.nearbyfriends);
        const p = mix(p1, p2, 0.5); //move slightly toward p2

        ship.move(p);
        ship.shout("C1");
      } else if (ship.nearbyfriends.length > 0) {
        //doesnt include self
        ship.move(weightedmeanposition(ship.nearbyfriends));
        ship.shout("C2");
      } else {
        ship.move(ship.nearestfriend.position);
        ship.shout("retreat");
      }
    }
  }
}

/**
 * position ships somehow when about to be or is in combat depending on nearbyenemies and such
 */
/*
function hmm() {
  const { myships, enemyships } = collections;

  for (const ship of myships) {
    const inrange_enemies1step = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 220)
    );

    const inrange_enemies2step = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 240)
    );

    if (inrange_enemies2step.length < 1) {
      continue;
    }

    const friends1step = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 20)
    ); //including self

    const myPower = sum(friends1step.map((s) => s.energy));

    const friends2step = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 40)
    ); //including self

    const enemyPower = sum(enemies1step.map((s) => s.energy));
    //const enemyPower2step = sum(enemies2step.map((s) => s.energy));

    if (enemyPower1step > myPower) {
      if (friendsNow.length > 0) {
        ship.move(weightedmeanposition(friendsNow));
        ship.shout("c1");
      } else if (friends1step.length > 0) {
        ship.move(weightedmeanposition(friends1step));
        ship.shout("c2");
      } else if (ship.nearbyfriends.length > 0) {
        ship.move(weightedmeanposition(ship.nearbyfriends));
        ship.shout("c3");
      } else {
        ship.move(offset(nearestenemy.position, ship.position, 201));
        ship.shout("c4");
      }
    }
  }
}
*/

/**
 * Essentially simulate how much damage a group of attackers would do to a ground of defenders.
 *
 * Return a number: Total damage dealt aka energy drained.
 */
function evaluateCombat(
  attackerShips: Ships,
  defenderShips: Ships,
  range = 220
) {
  const alreadyAttackingIndexes: Vec = [];
  let attackerDmgDealtTotal = 0;
  for (const defender of defenderShips) {
    const attackersInRange = attackerShips.filter((s) =>
      isWithinDist(s.position, defender.position, range)
    );

    const availableAttackers = ships_not_in(
      attackersInRange,
      alreadyAttackingIndexes
    );

    const defenderEnergy = defender.energy - lossFromAttacking(defender); //assume the enemy is also attacking
    //const defenderEnergy = ship.energy; //dont assume

    let dmgdealt = 0;
    for (const attacker of availableAttackers) {
      if (dmgdealt <= defenderEnergy) {
        attacker.energize(defender);
        dmgdealt += attackdmg(attacker);
        alreadyAttackingIndexes.push(attacker.index);
      }
    }
    attackerDmgDealtTotal += dmgdealt;
  }
  return attackerDmgDealtTotal;
}

/*
    const nearestenemy =
      enemies1step[
        minimum(enemies1step.map((s) => dist(s.position, ship.position))).index
      ];
*/
