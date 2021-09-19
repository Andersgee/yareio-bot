import collections from "./collections";
import { ships_not_in } from "./find";
import { sum } from "./vec";

/**
 * Lowest energy first
 */
function sortByShipenergy(ships: Ships | Ships_m): Ships_m {
  return ships.slice().sort((a, b) => a.energy - b.energy);
}

/**
 * Biggest energy first
 */
function sortByShipenergyReverse(ships: Ships | Ships_m): Ships_m {
  return ships.slice().sort((a, b) => b.energy - a.energy);
}
/*
function shipcost(ship: Ship | Ship_m, player = "enemy"): number {
  const { bases, shapes } = collections;
  const cost = bases[player].current_spirit_cost;
  if (shapes[player] === "squares") {
    return cost - 100;
  } else if (shapes[player] === "circles") {
    return cost * ship.size - 10 * ship.size;
  } else if (shapes[player] === "triangles") {
    return cost - 30;
  }
  return cost;
}
*/
function shipcost(ship: Ship | Ship_m, player = "enemy"): number {
  const { bases, shapes } = collections;
  //const cost = bases[player].current_spirit_cost;

  if (shapes[player] === "squares") {
    return 360 - 100;
  } else if (shapes[player] === "circles") {
    return (25 - 10) * ship.size; //for circles, ship.size effectively is NUMBER of ships (single ship has size 1)
  } else {
    //if (shapes[player] === "triangles") {
    return 90 - 30;
  }
}

function lossFromAttacking(ship: Ship_m): number {
  //ship.size, but only as much energy as it has.
  return Math.min(ship.size, ship.energy);
}

function attackdmg(ship: Ship_m): number {
  //2*ship.size, but only as much energy as it has.
  return 2 * Math.min(ship.size, ship.energy);
}

function evalBattle1tick(
  attackers: Ships | Ships_m,
  defenders: Ships | Ships_m
): [Ships_m, Ships_m] {
  //attackers->defenders
  const sortedAttackers = sortByShipenergyReverse(attackers); //biggest first
  const sortedDefenders = sortByShipenergy(defenders); //lowest first
  const sortedAttackersEnergies = sortedAttackers.map((s) => s.energy);
  const sortedDefendersEnergies = sortedDefenders.map((s) => s.energy);
  const alreadyAttackingIndexes: Vec = [];
  const defenderDeadShipindexes = [];

  for (const [i, defender] of sortedDefenders.entries()) {
    const deflossTaken = lossFromAttacking(defender);
    const defenderEnergy = defender.energy - deflossTaken;
    //sortedDefendersEnergies[i] -= deflossTaken;
    let dmgdealt = 0;
    for (const [j, attacker] of sortedAttackers.entries()) {
      if (
        dmgdealt <= defenderEnergy &&
        !alreadyAttackingIndexes.includes(attacker.index)
      ) {
        const dmgGiven = attackdmg(attacker);
        const lossTaken = lossFromAttacking(attacker);
        sortedAttackersEnergies[j] -= lossTaken;
        sortedDefendersEnergies[i] -= dmgGiven;
        alreadyAttackingIndexes.push(attacker.index);
        dmgdealt += dmgGiven;
      }
    }
    if (sortedDefendersEnergies[i] < 0) {
      defenderDeadShipindexes.push(defender.index);
    }
  }

  //////////
  //defenders->attackers
  const sortedAttackers1 = sortByShipenergyReverse(defenders); //biggest first
  const sortedDefenders1 = sortByShipenergy(attackers); //lowest first
  const sortedAttackersEnergies1 = sortedAttackers1.map((s) => s.energy);
  const sortedDefendersEnergies1 = sortedDefenders1.map((s) => s.energy);
  const alreadyAttackingIndexes1: Vec = [];
  const defenderDeadShipindexes1 = [];

  for (const [i, defender] of sortedDefenders1.entries()) {
    const deflossTaken = lossFromAttacking(defender);
    const defenderEnergy = defender.energy - deflossTaken;
    //sortedDefendersEnergies1[i] -= deflossTaken;
    let dmgdealt = 0;
    for (const [j, attacker] of sortedAttackers1.entries()) {
      if (
        dmgdealt <= defenderEnergy &&
        !alreadyAttackingIndexes1.includes(attacker.index)
      ) {
        const dmgGiven = attackdmg(attacker);
        const lossTaken = lossFromAttacking(attacker);
        sortedAttackersEnergies1[j] -= lossTaken;
        sortedDefendersEnergies1[i] -= dmgGiven;
        alreadyAttackingIndexes1.push(attacker.index);
        dmgdealt += dmgGiven;
      }
    }
    if (sortedDefendersEnergies1[i] < 0) {
      defenderDeadShipindexes1.push(defender.index);
    }
  }

  //LOWEST FIRST
  const attackerEnergies_new = sortedAttackersEnergies
    .reverse()
    .map((x, i) => Math.min(x, sortedDefendersEnergies1[i])); //attackers
  const defenderEnergies_new = sortedAttackersEnergies1
    .reverse()
    .map((x, i) => Math.min(x, sortedDefendersEnergies[i])); //defenders

  const A = sortedDefenders1
    .map((x, i) => ({
      index: x.index,
      size: x.size,
      energy: attackerEnergies_new[i],
    }))
    .filter((s) => s.energy > -1);
  const D = sortedDefenders
    .map((x, i) => ({
      index: x.index,
      size: x.size,
      energy: defenderEnergies_new[i],
    }))
    .filter((s) => s.energy > -1);
  return [A, D];
}

/**
 * ```raw
 * Evaluate (to the end or up to Nticks) what happens if ships attack each other.
 *
 * return some metrics. Most importantly "myAdvantage"
 * ```
 */
export function evalCombat2(
  myships: Ships,
  enemyships: Ships,
  Nticks = 999
): {
  myAdvantage: number;
  meIsLastStanding: boolean;
  myEnergycost: number;
  enemyEnergycost: number;
  myDeadShipsCost: number;
  enemyDeadShipsCost: number;
  myValueLoss: number;
  enemyValueLoss: number;
} {
  //initial tick
  let [myships_m, enemyships_m] = evalBattle1tick(myships, enemyships);
  console.log("myships_m", myships_m);
  console.log("enemyships_m", enemyships_m);
  console.log("------");

  //the rest of the ticks
  let t = 1;
  while (myships_m.length > 0 && enemyships_m.length > 0 && t < Nticks) {
    [myships_m, enemyships_m] = evalBattle1tick(myships_m, enemyships_m);
    console.log("myships_m", myships_m);
    console.log("enemyships_m", enemyships_m);
    console.log("------");
    t += 1;
  }
  const meIsLastStanding = myships_m.length > enemyships_m.length;

  const myEnergycost =
    sum(myships.map((s) => s.energy)) - sum(myships_m.map((s) => s.energy));
  const enemyEnergycost =
    sum(enemyships.map((s) => s.energy)) -
    sum(enemyships_m.map((s) => s.energy));

  const myAliveIndexes = myships_m.map((s) => s.index);
  const myDeadShips = ships_not_in(myships, myAliveIndexes);
  const myDeadShipsCost = sum(myDeadShips.map((s) => shipcost(s, "me")));

  const enemyAliveIndexes = enemyships_m.map((s) => s.index);
  const enemyDeadShips = ships_not_in(enemyships, enemyAliveIndexes);
  const enemyDeadShipsCost = sum(
    enemyDeadShips.map((s) => shipcost(s, "enemy"))
  );

  const myValueLoss = myEnergycost + myDeadShipsCost;
  const enemyValueLoss = enemyEnergycost + enemyDeadShipsCost;

  const myAdvantage = enemyValueLoss - myValueLoss;

  return {
    myAdvantage,
    meIsLastStanding,
    myEnergycost,
    enemyEnergycost,
    myDeadShipsCost,
    enemyDeadShipsCost,
    myValueLoss,
    enemyValueLoss,
  };
}
