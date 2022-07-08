import { collections } from "../collections";
import combateval from "../combateval";
import { not_in } from "../find";
import { avoidCircle } from "../positioning";
import { enemyShipCost, isEmpty, myShipCost } from "../utils";
import {
  any,
  dist,
  isWithinDist,
  offset,
  offsetmax20,
  weightedmean,
} from "../vec";

export default function move_combat(targetps: Vec2[]): void {
  const alreadyHasOrders: Vec = [];
  clamp_movement(targetps);

  R200(targetps, alreadyHasOrders);
  R220(targetps, alreadyHasOrders);
  R240(targetps, alreadyHasOrders);
}

const MINADVANTAGE = -1;
const ATTACKDIST = 180;
const BACKDIST = 220;

function R200(targetps: Vec2[], alreadyHasOrders: Vec) {
  const { myships, enemyships } = collections;
  const targetps_new: Vec2[] = new Array(targetps.length).fill(null);

  const enemyshipcost = enemyShipCost();
  const myshipcost = myShipCost();

  for (const ship of myships) {
    const nearbyEnemies = ship.nearbyenemies;
    //const nearbyFriends = myships.filter((s) =>isWithinDist(s.position, ship.position, 0.5));
    const nearbyFriends = ship.nearbyfriends20;

    if (nearbyEnemies.length === 0 || alreadyHasOrders.includes(ship.index)) {
      continue;
    }
    const myAdvantage = combateval(nearbyFriends, nearbyEnemies).myAdvantage;

    const friendTargetPositions = ship.nearbyfriends_includingself.map(
      (s) => targetps[s.index]
    );
    const enemyValuePoint = valueWeightedMean(nearbyEnemies, enemyshipcost);
    const friendValuePoint = valueWeightedMean(
      ship.nearbyfriends_includingself,
      myshipcost,
      friendTargetPositions
    );

    const continueAsPlannedisDangerous = any(
      enemyships.map((s) => isWithinDist(s.position, targetps[ship.index], 220))
    );

    if (continueAsPlannedisDangerous) {
      if (myAdvantage >= MINADVANTAGE) {
        //bring friends along in attack order
        for (const friend of nearbyFriends) {
          targetps_new[friend.index] = offset(
            enemyValuePoint,
            friendValuePoint,
            ATTACKDIST
          );
          alreadyHasOrders.push(friend.index); //friend might already be in alreadyHasOrders but that doesnt matter
        }
        ship.shout(`a0 ${myAdvantage}`);
      } else {
        for (const friend of nearbyFriends) {
          if (not_in(friend, alreadyHasOrders)) {
            targetps_new[friend.index] = offset(
              enemyValuePoint,
              friendValuePoint,
              BACKDIST
            );
            alreadyHasOrders.push(friend.index); //friend might already be in alreadyHasOrders but that doesnt matter
          }
        }
        /*
        //back (solo)
        targetps_new[ship.index] = offset(
          enemyValuePoint,
          friendValuePoint,
          BACKDIST
        );
        ship.shout(`b0 ${myAdvantage}`);
        alreadyHasOrders.push(ship.index);
        */
      }
    }
  }

  for (let i = 0; i < targetps.length; i++) {
    if (targetps_new[i]) {
      targetps[i] = targetps_new[i];
    }
  }
  clamp_movement(targetps);
}

function R220(targetps: Vec2[], alreadyHasOrders: Vec) {
  const { myships, enemyships } = collections;
  const targetps_new: Vec2[] = new Array(targetps.length).fill(null);

  const enemyshipcost = enemyShipCost();
  const myshipcost = myShipCost();

  for (const ship of myships) {
    const nearbyEnemies = ship.nearbyenemies220;
    const nearbyFriends = ship.nearbyfriends40;

    if (nearbyEnemies.length === 0 || alreadyHasOrders.includes(ship.index)) {
      continue;
    }
    const myAdvantage = combateval(nearbyFriends, nearbyEnemies).myAdvantage;

    const friendTargetPositions = ship.nearbyfriends_includingself.map(
      (s) => targetps[s.index]
    );
    const enemyValuePoint = valueWeightedMean(nearbyEnemies, enemyshipcost);
    const friendValuePoint = valueWeightedMean(
      ship.nearbyfriends_includingself,
      myshipcost,
      friendTargetPositions
    );

    const continueAsPlannedisDangerous = any(
      enemyships.map((s) => isWithinDist(s.position, targetps[ship.index], 220))
    );

    if (continueAsPlannedisDangerous) {
      if (myAdvantage >= MINADVANTAGE) {
        //bring friends along in attack order
        for (const friend of nearbyFriends) {
          targetps_new[friend.index] = offset(
            enemyValuePoint,
            friendValuePoint,
            ATTACKDIST
          );
          alreadyHasOrders.push(friend.index); //friend might already be in alreadyHasOrders but that doesnt matter
        }
        ship.shout(`a2 ${myAdvantage}`);
      } else {
        for (const friend of nearbyFriends) {
          if (not_in(friend, alreadyHasOrders)) {
            targetps_new[friend.index] = offset(
              enemyValuePoint,
              friendValuePoint,
              BACKDIST + 20
            );
            alreadyHasOrders.push(friend.index);
          }
        }
        /*
        //back (solo)
        targetps_new[ship.index] = offset(
          enemyValuePoint,
          friendValuePoint,
          BACKDIST + 20
        );
        ship.shout(`b2 ${myAdvantage}`);
        alreadyHasOrders.push(ship.index);
        */
      }
    }
  }

  for (let i = 0; i < targetps.length; i++) {
    if (targetps_new[i]) {
      targetps[i] = targetps_new[i];
    }
  }
  clamp_movement(targetps);
}

function R240(targetps: Vec2[], alreadyHasOrders: Vec) {
  const { myships, enemyships } = collections;
  const targetps_new: Vec2[] = new Array(targetps.length).fill(null);

  const enemyshipcost = enemyShipCost();
  const myshipcost = myShipCost();

  for (const ship of myships) {
    const nearbyEnemies = ship.nearbyenemies240;
    const nearbyFriends = ship.nearbyfriends60;

    if (nearbyEnemies.length === 0 || alreadyHasOrders.includes(ship.index)) {
      continue;
    }
    const myAdvantage = combateval(nearbyFriends, nearbyEnemies).myAdvantage;

    const friendTargetPositions = ship.nearbyfriends_includingself.map(
      (s) => targetps[s.index]
    );
    const enemyValuePoint = valueWeightedMean(nearbyEnemies, enemyshipcost);
    const friendValuePoint = valueWeightedMean(
      ship.nearbyfriends_includingself,
      myshipcost,
      friendTargetPositions
    );

    const continueAsPlannedisDangerous = any(
      enemyships.map((s) => isWithinDist(s.position, targetps[ship.index], 220))
    );

    if (continueAsPlannedisDangerous) {
      if (myAdvantage >= MINADVANTAGE) {
        //bring friends along in attack order
        for (const friend of nearbyFriends) {
          targetps_new[friend.index] = offset(
            enemyValuePoint,
            friendValuePoint,
            ATTACKDIST
          );
          alreadyHasOrders.push(friend.index); //friend might already be in alreadyHasOrders but that doesnt matter
        }
        ship.shout(`a4 ${myAdvantage}`);
      } else {
        for (const friend of nearbyFriends) {
          if (not_in(friend, alreadyHasOrders)) {
            targetps_new[friend.index] = offset(
              enemyValuePoint,
              friendValuePoint,
              BACKDIST + 40
            );
            alreadyHasOrders.push(friend.index);
          }
        }
        /*
        //back (solo)
        targetps_new[ship.index] = offset(
          enemyValuePoint,
          friendValuePoint,
          BACKDIST + 40
        );
        ship.shout(`b4 ${myAdvantage}`);
        alreadyHasOrders.push(ship.index);
        */
      }
    }
  }

  for (let i = 0; i < targetps.length; i++) {
    if (targetps_new[i]) {
      targetps[i] = targetps_new[i];
    }
  }
  clamp_movement(targetps);
}

/**
 * A Ship can only move 20 units. make targetps reflect that.
 */
function clamp_movement(targetps: Vec2[]) {
  const { myships, stars, outposts, bases, pylons } = collections;
  for (const [i, ship] of myships.entries()) {
    if (targetps[i]) {
      targetps[i] = offsetmax20(ship.position, targetps[i]);
    } else {
      //its possible ship was never assigned at targetp but unlikely
      targetps[i] = ship.position;
    }
  }

  //avoid structures
  for (const [i, ship] of myships.entries()) {
    for (const structure of [
      stars.big,
      stars.enemy,
      stars.me,
      stars.middle,
      bases.big,
      bases.enemy,
      bases.me,
      bases.middle,
      outposts.middle,
      pylons.middle,
    ]) {
      targetps[i] = avoidCircle(
        ship.position,
        targetps[i],
        structure.position,
        structure.collision_radius
      );
    }
  }
}

/**
 * ```raw
 * Mean positions of ships, weighted by their energy + shipcost
 *
 * note: Use ship.position as default position but can use other positions such as intended future position
 * ```
 */
function valueWeightedMean(
  ships: Ships,
  shipcost: number,
  positions = ships.map((s) => s.position)
) {
  //const positions = ships.map((s) => s.position);
  const valueWeights = ships.map((s) => s.energy + shipcost);
  return weightedmean(positions, valueWeights);
}
