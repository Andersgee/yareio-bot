import { collections } from "../collections";
import combateval from "../combateval";
import { controlIsEnemy } from "../utils";
import { dist, isWithinDist, offset } from "../vec";
import { positionClosestShipAtPoint } from "./positioning";

export default function move_strategic(orders: Orders): void {
  const { bases, myships, stars } = collections;

  const goFrontMid = shouldPositionInFrontOfStar(stars.middle, bases.middle);
  const goFrontMe = shouldPositionInFrontOfStar(stars.me, bases.me);
  const goFrontEnemy = shouldPositionInFrontOfStar(stars.enemy, bases.enemy);

  for (let i = 0; i < 10; i++) {
    //middle
    if (controlIsEnemy(bases.middle.control)) {
      if (goFrontMid) {
        put4infrontofstar(orders, bases.middle, stars.middle);
      } else {
        put4behindstar(orders, bases.middle, stars.middle);
      }
    }

    //me
    if (controlIsEnemy(bases.me.control)) {
      if (goFrontMe) {
        put4infrontofstar(orders, bases.me, stars.me);
      } else {
        put4behindstar(orders, bases.me, stars.me);
      }
    }

    //enemy
    if (controlIsEnemy(bases.enemy.control)) {
      if (goFrontEnemy) {
        put4infrontofstar(orders, bases.enemy, stars.enemy);
      } else {
        put4behindstar(orders, bases.enemy, stars.enemy);
      }
    }
  }

  positionClosestShipAtPoint(orders, bases.big.position);
  //positionClosestShipAtPoint(orders, bases.big.position);
  for (let i = 0; i < 10; i++) {
    //big

    if (controlIsEnemy(bases.big.control)) {
      put4behindstar(orders, bases.big, stars.big);
      put4infrontofstar(orders, bases.big, stars.big);
      /*
      if (enemyHasAnyWithinCircle(stars.big.position, 200)) {
        
      } else {
        
      }
      */
    }
  }
}

function shouldPositionInFrontOfStar(star: Star, base: Base): boolean {
  const frontPosition = offset(
    star.position,
    base.position,
    star.collision_radius + 0.0000001
  );

  const { myships, enemyships } = collections;
  const myShipsAtStar = myships.filter((s) =>
    isWithinDist(s.position, frontPosition, 300)
  );
  const enemyShipsNearby = enemyships.filter((s) =>
    isWithinDist(s.position, frontPosition, 300)
  );

  if (enemyShipsNearby.length < 1) {
    return true;
  }

  const { myAdvantage } = combateval(myShipsAtStar, enemyShipsNearby);
  return myAdvantage > 0;
}

/**
 * true if any enemy ship is within this circle
 */
export function enemyHasAnyWithinCircle(c: Vec2, r: number): boolean {
  return enemiesWithinCircle(c, r).length > 0;
}
function enemiesWithinCircle(c: Vec2, r: number) {
  const { enemyships } = collections;
  return enemyships.filter((s) => isWithinDist(c, s.position, r));
}

function put4behindstar(orders: Orders, base: Base, star: Star) {
  const p = offset(
    star.position,
    base.position,
    -(star.collision_radius + 0.0000001)
  ); //negative
  const c = star.position;
  const r = 200;
  positionClosestShipAtPoint(orders, p);
  positionClosestShipAtPoint(orders, p);
  positionClosestShipAtPoint(orders, p);
  positionClosestShipAtPoint(orders, p);
}

function put4infrontofstar(orders: Orders, base: Base, star: Star) {
  const p = offset(
    star.position,
    base.position,
    star.collision_radius + 0.0000001
  ); //positive
  const c = star.position;
  const r = 200;
  positionClosestShipAtPoint(orders, p);
  positionClosestShipAtPoint(orders, p);
  positionClosestShipAtPoint(orders, p);
  positionClosestShipAtPoint(orders, p);
}
