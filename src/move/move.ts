import { collections } from "../collections";
import { ships_not_in } from "../find";

import move_defend_against_harassers from "./move_defend_against_harassers";
import move_farm from "./move_farm";
import move_avoid from "./move_avoid";
import move_heal from "./move_heal";

import { D, D_LONG } from "../constants";
import { pointsLong } from "../pointsLong";
import { dist, isWithinDist, offset } from "../vec";
import { canEnergize, controlIsEnemy, controlIsMe } from "../utils";
import move_strategic from "./move_strategic";

/**
 * ```raw
 * The general idea is:
 * - Farm and prevent spawn blocking
 * - Strategic orders
 * - Avoid bad movements (combat eval)
 * - go and heal - some sort of "go heal before you can be useful again"
 * ```
 */
export default function move(orders: Orders): void {
  move_defend_against_harassers(orders);
  move_farm(orders);

  move_strategic(orders);
  move_avoid(orders);
  move_heal(orders);
}

function move_poststrat(orders: Orders) {
  const { stars, bases, outposts, pylons } = collections;
  /*
  for (const star of [stars.big]) {
    goToStar(orders, star);
  }
*/
  //for (const structure of [bases.big]) {
  for (const structure of [
    bases.middle,
    bases.me,
    bases.enemy,
    bases.big,
    outposts.middle,
    pylons.middle,
  ]) {
    goToStructureIfUncontrolled(orders, structure);
  }
}

function goToStructureIfUncontrolled(
  orders: Orders,
  base: Base | Outpost | Pylon
) {
  if (!controlIsEnemy(base.control)) return;

  const { myships } = collections;
  for (const ship of ships_not_in(myships, orders.moving)) {
    orders.targetps[ship.index] = base.position;
    orders.moving.push(ship.index);
    if (isWithinDist(ship.position, base.position, D_LONG)) {
      //ship.lock();
      ship.unlock();
    }
  }
}

function goToStar(orders: Orders, star: Star) {
  const { myships } = collections;
  for (const ship of ships_not_in(myships, orders.moving)) {
    orders.targetps[ship.index] = star.position;
    orders.moving.push(ship.index);
    if (isWithinDist(ship.position, star.position, D_LONG)) {
      //ship.lock();
      ship.unlock();
    }
  }
}
