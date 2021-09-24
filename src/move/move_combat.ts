import collections from "../collections";
import combateval from "../combateval";
import { not_in } from "../find";
import { enemyShipCost, isEmpty, myShipCost } from "../utils";
import {
  any,
  avoidCircle,
  dist,
  isWithinDist,
  offset,
  weightedmean,
} from "../vec";

export default function move_combat(targetps: Vec2s): void {
  const alreadyHasOrders: Vec = [];
  clamp_movement(targetps);

  R200(targetps, alreadyHasOrders);
  R220(targetps, alreadyHasOrders);
  R240(targetps, alreadyHasOrders);
}

//const MINADVANTAGE = memory.enemyIsSquareRush ? -55 : -1;
const MINADVANTAGE = -1;
const ATTACKDIST = memory.enemyIsSquareRush ? 179 : 180;
const BACKDIST = memory.enemyIsSquareRush && tick < 76 ? 201 : 220;
//const BACKDIST = 220;

function R200(targetps: Vec2s, alreadyHasOrders: Vec) {
  const { myships, enemyships } = collections;
  const targetps_new: Vec2s = new Array(targetps.length).fill(null);

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
        //back (solo)
        targetps_new[ship.index] = offset(
          enemyValuePoint,
          friendValuePoint,
          BACKDIST
        );
        ship.shout(`b0 ${myAdvantage}`);
        alreadyHasOrders.push(ship.index);
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

function R220(targetps: Vec2s, alreadyHasOrders: Vec) {
  const { myships, enemyships } = collections;
  const targetps_new: Vec2s = new Array(targetps.length).fill(null);

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
        //back (solo)
        targetps_new[ship.index] = offset(
          enemyValuePoint,
          friendValuePoint,
          BACKDIST + 20
        );
        ship.shout(`b2 ${myAdvantage}`);
        alreadyHasOrders.push(ship.index);
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

function R240(targetps: Vec2s, alreadyHasOrders: Vec) {
  const { myships, enemyships } = collections;
  const targetps_new: Vec2s = new Array(targetps.length).fill(null);

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
        //back (solo)
        targetps_new[ship.index] = offset(
          enemyValuePoint,
          friendValuePoint,
          BACKDIST + 40
        );
        ship.shout(`b4 ${myAdvantage}`);
        alreadyHasOrders.push(ship.index);
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
function clamp_movement(targetps: Vec2s) {
  const { myships, stars, outposts, bases } = collections;
  for (const [i, ship] of myships.entries()) {
    if (targetps[i]) {
      //its possible ship was never assigned at targetp ut unlikely
      const d = Math.min(20, dist(ship.position, targetps[i]));
      targetps[i] = offset(ship.position, targetps[i], d);
    } else {
      targetps[i] = ship.position;
    }
  }

  //avoid structures
  for (const [i, ship] of myships.entries()) {
    targetps[i] = avoidCircle(
      ship.position,
      targetps[i],
      stars.middle.position,
      stars.middle.collision_radius
    );

    targetps[i] = avoidCircle(
      ship.position,
      targetps[i],
      stars.enemy.position,
      stars.enemy.collision_radius
    );

    targetps[i] = avoidCircle(
      ship.position,
      targetps[i],
      stars.me.position,
      stars.me.collision_radius
    );

    targetps[i] = avoidCircle(
      ship.position,
      targetps[i],
      outposts.middle.position,
      outposts.middle.collision_radius
    );

    targetps[i] = avoidCircle(
      ship.position,
      targetps[i],
      bases.me.position,
      bases.me.collision_radius
    );

    targetps[i] = avoidCircle(
      ship.position,
      targetps[i],
      bases.enemy.position,
      bases.enemy.collision_radius
    );
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