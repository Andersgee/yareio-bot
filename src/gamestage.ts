import collections from "./collections";
import { enemyOutpostEnergy, maxStarFarmers } from "./utils";
import { all, any, isWithinDist, sum } from "./vec";

export default function gamestage(): void {
  const { stars, myships } = collections;
  const shipsize = myships[0].size;
  const Nhome_max = maxStarFarmers(stars.me, shipsize);

  memory.gamestage = memory.gamestage || 0;
  if (memory.gamestage < 1 && myships.length > Nhome_max * 2 + 4) {
    memory.gamestage = 1;
  }

  if (memory.gamestage < 2 && tick > 200 && shouldAllIn()) {
    memory.gamestage = 2;
  }

  memory.enemyIsSquareRush = memory.enemyIsSquareRush || enemyIsSquareRushing();
  //memory.gamestage = 0;
  //debug:
  /*
  if (myships.length === 8) {
    memory.enemyIsSquareRush = true;
  }
*/
  memory.enemyWasNearMyBase = memory.enemyWasNearMyBase || enemyNearMyBase();
}

function shouldAllIn(): boolean {
  const { myships, enemyships, bases } = collections;
  const myPower = sum(myships.map((s) => s.energy));
  const enemyPower =
    sum(enemyships.map((s) => s.energy)) +
    enemyOutpostEnergy() +
    bases.enemy.energy +
    500;
  if (myPower > enemyPower * 2.5) {
    return true;
  } else {
    return false;
  }
}

/**
 * Return true if enemy is probably doing a 3ship square rush
 */
function enemyIsSquareRushing() {
  const { enemyships, shapes, bases, myships } = collections;

  const enemyAbandonedBase = all(
    enemyships.map((s) => !isWithinDist(s.position, bases.enemy.position, 240))
  );

  //const enemyShipsEnergy = sum(enemyships.map((s) => s.energy));

  const enemyIsRushing =
    shapes.enemy === "squares" &&
    enemyAbandonedBase &&
    enemyships.length <= 3 &&
    bases.enemy.energy <= 10 &&
    myships.length === 8 &&
    tick < 100;

  return enemyIsRushing;
}

/**
 * Return true if enemy is near my base
 */
function enemyNearMyBase() {
  const { enemyships, bases } = collections;

  return any(
    enemyships.map((s) => isWithinDist(s.position, bases.me.position, 590))
  );
}
