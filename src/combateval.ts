import collections from "./collections";
import {
  ships_not_in,
  sortByShipenergy,
  sortByShipenergyReverse,
} from "./find";
import { attackdmg, lossFromAttacking } from "./utils";
import { maximum } from "./vec";

function shipcost(ship: Ship, player = "enemy"): number {
  const { bases, shapes } = collections;
  const cost = bases[player].current_spirit_cost;
  if (shapes[player] === "squares") {
    return cost - 100;
  } else if (shapes[player] === "circles") {
    return (cost - 10) * ship.size; //for circles, ship.size effectively is NUMBER of ships (single ship has size 1)
  } else if (shapes[player] === "triangles") {
    return cost - 30;
  }
  return cost;
}

function evalAttack(
  attackers: Ships,
  defenders: Ships,
  defenderplayer: string
): [number, Vec] {
  const sortedAttackers = sortByShipenergyReverse(attackers);
  const sortedDefenders = sortByShipenergy(defenders);

  const alreadyAttackingIndexes = [];
  let attackerDmgDealtTotal = 0;
  const deadDefenderIndexes = [];
  for (const defender of sortedDefenders) {
    const availableAttackers = ships_not_in(
      sortedAttackers,
      alreadyAttackingIndexes
    );

    //const defenderEnergy = defender.energy
    const defenderEnergy = defender.energy - lossFromAttacking(defender);

    let dmgdealt = 0;
    for (const attacker of availableAttackers) {
      if (dmgdealt <= defenderEnergy) {
        dmgdealt += attackdmg(attacker);
        alreadyAttackingIndexes.push(attacker.index);
      }
    }
    dmgdealt = Math.min(dmgdealt, defenderEnergy + 1);
    if (dmgdealt > defenderEnergy) {
      //defender dies, this has to have some cost
      dmgdealt += shipcost(defender, defenderplayer);
      deadDefenderIndexes.push(defender.index);
    }
    attackerDmgDealtTotal += dmgdealt;
  }
  return [attackerDmgDealtTotal, deadDefenderIndexes];
}

/**
 * ```raw
 * A function that returns [advantage, indexesThatShouldBackOff]
 *
 * note: Only looks at a single tick.
 * 1. if advantage is zero: probably equal number of ships and no ship can be killed.
 * 2. if advantage is positive: go forward with everyone except the ones in indexesThatShouldBackOff
 * 3. if advantage is negative: ideally ALL ships should back off regardless of indexesThatShouldBackOff,
 * but most importantly the ones in indexesThatShouldBackOff since 1 tick can be survived without dying ships even though advantage is negative.
 * ```
 */
export function evalCombat(myships: Ships, enemyships: Ships): [number, Vec] {
  //first of all, try without excluding any of my ships
  const basic: [number, Vec][] = [
    [
      evalAttack(myships, enemyships, "enemy")[0] -
        evalAttack(enemyships, myships, "me")[0],
      [],
    ],
  ];

  //exclude ships until no ship can die in a single tick
  let myDeadIndexes_all: Vec = [];
  let [valueDrainedFromMe, myDeadIndexes] = evalAttack(
    enemyships,
    myships,
    "me"
  );
  myDeadIndexes_all = myDeadIndexes_all.concat(myDeadIndexes);
  while (myDeadIndexes.length > 0) {
    [valueDrainedFromMe, myDeadIndexes] = evalAttack(
      enemyships,
      ships_not_in(myships, myDeadIndexes_all),
      "me"
    );
    myDeadIndexes_all = myDeadIndexes_all.concat(myDeadIndexes);
  }

  //console.log("myDeadIndexes_all: ",myDeadIndexes_all)

  //now remove some (or all) of myDeadIndexes from my attack and find the MAXIMUM possible
  // difference valueDrainedFromEnemy-valueDrainedFromMe
  const excluding: [number, Vec][] = myDeadIndexes_all.map((x, i, v) => {
    const excluded = v.slice(0, i + 1);
    const myships_some_excluded = ships_not_in(myships, excluded);
    const mydmg = evalAttack(myships_some_excluded, enemyships, "enemy")[0];
    const enemydmg = evalAttack(enemyships, myships_some_excluded, "me")[0];
    return [mydmg - enemydmg, excluded];
  });

  //we now have a list of [advantage, [excludedindexes] pairs
  const advantage_excludedindexes = basic.concat(excluding);
  //console.log(advantage_excludedindexes)
  //find the maximum advantage and return the best [advantage, [excludedindexes] pair
  const advantages = advantage_excludedindexes.map((ae) => ae[0]);
  return advantage_excludedindexes[maximum(advantages).index];
}
