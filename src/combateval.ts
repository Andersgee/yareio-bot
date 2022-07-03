import collections from "./collections";
import { ships_not_in } from "./find";
import { sum } from "./vec";

type Combateval = {
  myAdvantage: number;
  meIsLastStanding: boolean;
  myEnergycost: number;
  enemyEnergycost: number;
  myDeadShipsCost: number;
  enemyDeadShipsCost: number;
  myValueLoss: number;
  enemyValueLoss: number;
};
/**
 * ```raw
 * Evaluate (to the end) what happens if ships attack each other.
 *
 * return some metrics. Most importantly "myAdvantage"
 * ```
 */
export default function combateval(
  myships: Ships,
  enemyships: Ships
): Combateval {
  let [myships_m, enemyships_m] = evalBattle1tick(myships, enemyships);

  let someoneCanAttack =
    sum(myships_m.map((s) => s.energy)) +
      sum(enemyships_m.map((s) => s.energy)) >
    0;
  while (someoneCanAttack && myships_m.length > 0 && enemyships_m.length > 0) {
    [myships_m, enemyships_m] = evalBattle1tick(myships_m, enemyships_m);
    someoneCanAttack =
      sum(myships_m.map((s) => s.energy)) +
        sum(enemyships_m.map((s) => s.energy)) >
      0;
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
  ships1: Ships | Ships_m,
  ships2: Ships | Ships_m
): [Ships_m, Ships_m] {
  //first make ships1 (order by LARGEST first) attack ships2 (order by LOWEST first)
  const attackers = sortByShipenergyReverse(ships1); //biggest first
  const defenders = sortByShipenergy(ships2); //lowest first

  const energy_attackers = attackers.map((s) => s.energy);
  const energy_defenders = defenders.map((s) => s.energy);

  const attackers_alreadyattacked = new Array(energy_attackers.length).fill(
    false
  );
  for (const [i, defender] of defenders.entries()) {
    const defloss = lossFromAttacking(defender);
    for (const [j, attacker] of attackers.entries()) {
      if (energy_defenders[i] - defloss >= 0 && !attackers_alreadyattacked[j]) {
        energy_defenders[i] -= attackdmg(attacker);
        energy_attackers[j] -= lossFromAttacking(attacker);
        attackers_alreadyattacked[j] = true;
      }
    }
  }
  const energy_attackers_change = attackers.map(
    (s, i) => energy_attackers[i] - s.energy
  );
  const energy_defenders_change = defenders.map(
    (s, i) => energy_defenders[i] - s.energy
  );
  /////

  const attackers2 = sortByShipenergyReverse(ships2); //biggest first
  const defenders2 = sortByShipenergy(ships1); //lowest first
  const energy_attackers2 = attackers2.map((s) => s.energy);
  const energy_defenders2 = defenders2.map((s) => s.energy);

  const attackers_alreadyattacked2 = new Array(energy_attackers2.length).fill(
    false
  );
  for (const [i, defender] of defenders2.entries()) {
    const defloss = lossFromAttacking(defender);
    for (const [j, attacker] of attackers2.entries()) {
      if (
        energy_defenders2[i] - defloss >= 0 &&
        !attackers_alreadyattacked2[j]
      ) {
        energy_defenders2[i] -= attackdmg(attacker);
        energy_attackers2[j] -= lossFromAttacking(attacker);
        attackers_alreadyattacked2[j] = true;
      }
    }
  }
  const energy_attackers2_change = attackers2
    .map((s, i) => energy_attackers2[i] - s.energy)
    .reverse();
  const energy_defenders2_change = defenders2
    .map((s, i) => energy_defenders2[i] - s.energy)
    .reverse();
  ////

  //energy_attackers_change now corresponds to energy_defenders2_change and same order
  //energy_defenders now corresponds to energy_attackers2_change and same order

  const consolidated_attackerchange = energy_attackers_change.map(
    (x, i) => x + energy_defenders2_change[i]
  );
  const consolidated_defenderchange = energy_defenders_change.map(
    (x, i) => x + energy_attackers2_change[i]
  );

  const resulting_energy_attackers = attackers.map(
    (s, i) => s.energy + consolidated_attackerchange[i]
  );
  const resulting_energy_defenders = defenders.map(
    (s, i) => s.energy + consolidated_defenderchange[i]
  );

  const resulting_attackers = attackers
    .map((s, i) => ({
      index: s.index,
      size: s.size,
      energy: resulting_energy_attackers[i],
    }))
    .filter((s) => s.energy >= 0);
  const resulting_defenders = defenders
    .map((s, i) => ({
      index: s.index,
      size: s.size,
      energy: resulting_energy_defenders[i],
    }))
    .filter((s) => s.energy >= 0);

  return [resulting_attackers, resulting_defenders];
}
