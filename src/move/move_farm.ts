import { collections } from "../collections";
import { controlIsEnemy, maxStarSelfers } from "../utils";
import { pointsLong } from "../pointsLong";
import { positionClosestShipAtPoint } from "./positioning";
import { enemyHasAnyWithinCircle } from "./move_strategic";

export default function move_farm(orders: Orders): void {
  const { bases } = collections;
  //how much of maxfarm should be allocated
  let ff_home = 1;
  if (tick < 85) {
    ff_home = 0.5;
  } else if (tick < 120) {
    ff_home = 0.75;
  } else {
    ff_home = 1;
  }
  const ff_mid = 1;
  const ff_big = 1;
  const ff_enemy = 1;

  const { stars } = collections;

  //me
  if (
    !controlIsEnemy(bases.me.control) ||
    !enemyHasAnyWithinCircle(stars.me.position, 220)
  ) {
    move_farm_longrange_single_point(orders, stars.me, pointsLong.h1, ff_home);
  }

  //mid
  if (
    !controlIsEnemy(bases.middle.control) ||
    !enemyHasAnyWithinCircle(stars.middle.position, 220)
  ) {
    move_farm_longrange_single_point(orders, stars.middle, pointsLong.m1);
  }

  //enemy

  if (
    !controlIsEnemy(bases.enemy.control) ||
    !enemyHasAnyWithinCircle(stars.enemy.position, 220)
  ) {
    move_farm_longrange_single_point(orders, stars.enemy, pointsLong.e1);
  }

  //big
  /*
  move_farm_longrange_two_points(
    orders,
    stars.big,
    pointsLong.b1,
    pointsLong.b3
  );
  */
}

function move_farm_longrange_single_point(
  orders: Orders,
  star: Star,
  point: Vec2,
  maxfarmfraction = 1 //how much of maxfarm should be allocated,
): void {
  const { myships } = collections;

  const shipsize = myships[0].size;
  const selfers_max = maxfarmfraction * maxStarSelfers(star, shipsize);
  //const selfers_sustainable = sustainableStarSelfers(stars.middle, shipsize);

  let nselfers = 0;
  while (nselfers < selfers_max) {
    const addedSelfersPerTick = positionClosestShipAtPoint(orders, point);
    if (addedSelfersPerTick === 0) {
      //couldnt find any free ship
      break;
    }
    nselfers += addedSelfersPerTick;
  }
}

function move_farm_longrange_two_points(
  orders: Orders,
  star: Star,
  point1: Vec2,
  point2: Vec2,
  maxfarmfraction = 1 //how much of maxfarm should be allocated,
): void {
  const { myships } = collections;

  const shipsize = myships[0].size;
  const selfers_max = maxfarmfraction * maxStarSelfers(star, shipsize);
  //const selfers_sustainable = sustainableStarSelfers(stars.middle, shipsize);

  let nselfers = 0;
  while (nselfers < selfers_max) {
    const addedSelfersPerTick = positionClosestShipAtPoint(orders, point1);
    if (addedSelfersPerTick === 0) break;
    nselfers += addedSelfersPerTick;

    const addedSelfersPerTick2 = positionClosestShipAtPoint(orders, point2);
    if (addedSelfersPerTick2 === 0) break;
  }
}
