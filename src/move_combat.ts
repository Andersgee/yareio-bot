import collections from "./collections";
import { ships_not_in } from "./find";
import { attackdmg, lossFromAttacking } from "./utils";
import {
  dist,
  distanceWeightedMean,
  isWithinDist,
  mix,
  offset,
  weightedmean,
} from "./vec";

export default function move_combat(targetps: Vec2s): void {
  clamp_movement(targetps);
  gather_before_combat(targetps);
  position_in_combat(targetps);
}

/**
 * A Ship can only move 20 units. make targetps reflect that.
 */
function clamp_movement(targetps: Vec2s) {
  const { myships } = collections;
  for (const [i, ship] of myships.entries()) {
    if (targetps[i]) {
      //its possible ship was never assigned at targetp ut unlikely
      const d = Math.min(20, dist(ship.position, targetps[i]));
      targetps[i] = offset(ship.position, targetps[i], d);
    } else {
      targetps[i] = ship.position;
    }
  }
}

function position_in_combat(targetps: Vec2s) {
  const { myships } = collections;

  const alreadyHasOrders: Vec = [];
  for (const ship of myships) {
    const nearbyEnemies = ship.nearbyenemies;
    if (nearbyEnemies.length < 1 || alreadyHasOrders.includes(ship.index)) {
      continue;
    }

    const veryNearbyFriends = myships.filter((s) =>
      isWithinDist(s.position, ship.position, 1)
    ); //including self ofc

    const myPower = evaluateCombat(veryNearbyFriends, nearbyEnemies, 200);
    const enemyPower = evaluateCombat(nearbyEnemies, veryNearbyFriends, 200);
    if (myPower > enemyPower) {
      const weights = nearbyEnemies.map(
        (s) => s.energy_capacity - s.energy + 1
      ); //low energy enemies have highe weights (also add 1 to avoid zero weights)
      const nearbyEnemiesPositions = nearbyEnemies.map((s) => s.position);
      const desired_diection_point = weightedmean(
        nearbyEnemiesPositions,
        weights
      );
      //const distance_nearest_enemy = dist(ship.position,ship.nearestenemy.position);

      for (const friend of veryNearbyFriends) {
        targetps[friend.index] = offset(
          desired_diection_point,
          ship.position,
          181
        );
        alreadyHasOrders.push(friend.index);
      }
    }
  }
}

function gather_before_combat(targetps: Vec2s) {
  const { myships, enemyships } = collections;

  const targetps_new: Vec2s = new Array(targetps.length).fill(null);
  const newmovestrat: string[] = new Array(targetps.length).fill(null);
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
      if (ship.nearbyfriends_includingself.length > 1) {
        targetps[ship.index] = mix(ship.position, targetps[ship.index], 0.5); //slow down current move
        ship.shout("g");
        newmovestrat[ship.index] = "gather";
      } else {
        //targetps[ship.index] = ship.position; //cancel current move
        ship.shout("escape");
        newmovestrat[ship.index] = "escape";
      }
    }
  }

  for (const [i, ship] of myships.entries()) {
    if (newmovestrat[i] === "gather") {
      const futureFriendPositions = ship.nearbyfriends_includingself.map(
        (s) => targetps[s.index]
      );
      const p = distanceWeightedMean(futureFriendPositions);
      //const weights = ship.nearbyfriends_includingself.map((s) => s.energy + 1); //add 1 to avoid zero weights
      //const p = weightedmean(futureFriendPositions, weights);
      targetps_new[i] = p;
    } else if (newmovestrat[i] === "escape") {
      const p = offset(ship.position, targetps[ship.nearestfriend.index], 20);
      //const p1 = mix(ship.position, p, 0.333)
      targetps_new[i] = p;
    }
  }

  for (let i = 0; i < targetps.length; i++) {
    if (targetps_new[i]) {
      targetps[i] = targetps_new[i];
    }
  }
}

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
