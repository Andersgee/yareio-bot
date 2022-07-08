import energize_enemy_ships from "./energize_enemy_ships";
import energize_self from "./energize_self";
import energize_enemy_structures from "./energize_enemy_structures";
import energize_neutral_structures from "./energize_neutral_structures";
import energize_bases_from_starships from "./energize_bases_from_starships";
import energize_friends_in_need from "./energize_friends_in_need";
import { collections } from "../collections";
/**
 * ```raw
 * The general idea is:
 *
 * 1. energize enemy ships (2:1)
 * 2. energize self
 *
 * 3. energize friends in need
 *  3.1. from starships (chain)
 *  3.2. from nearbyfriend (but as close to a star as possible)
 *
 * 4. energize enemy structures
 *  4.1. bases
 *  4.2. outpost
 *  4.3. pylon
 * 5. energize neutral structures
 *  5.1. bases
 *  5.2. outpost
 *  5.3. pylon
 * 6. energize bases from from starships (chain)
 * ```
 */
export default function energize(orders: Orders): void {
  const energizing: Vec = [];
  const attacking: Vec = [];
  if (tick < 27) {
    special_earlygame(orders);
    return;
  }
  energize_self(orders.targets, energizing);
  energize_enemy_ships(orders.targets, energizing, attacking);
  energize_friends_in_need(orders.targets, energizing, attacking);

  energize_enemy_structures(orders.targets, energizing);
  energize_neutral_structures(orders.targets, energizing);
  energize_bases_from_starships(orders.targets, energizing);
}

function special_earlygame(orders: Orders) {
  const { myships, stars } = collections;
  for (const ship of myships) {
    orders.targets[ship.index] = stars.me;
  }
}
