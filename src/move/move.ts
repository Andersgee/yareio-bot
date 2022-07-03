import collections from "../collections";
import { ships_not_in } from "../find";
import move_combat from "./move_combat";
import move_farm from "./move_farm";
import move_defend_structures from "./move_defend_structures";
import { D } from "../constants";
import points from "../points";
import { offset } from "../vec";
/**
 * ```raw
 * The general idea is:
 * 1. Farm (but with )
 * 2. defend structures
 * 2. Strategic orders
 * 3. Combat (override any previous but use the desired movement as input)
 * ```
 */
export default function move(): Vec2s {
  const { myships } = collections;
  const targetps: Vec2s = new Array(myships.length).fill(null);
  const moving: Vec = [];
  const prestrating: Vec = [];
  const farming: Vec = [];
  const poststrating: Vec = [];

  const farmfraction_home = tick < 300 ? 1 / 4 : 1;
  const farmfraction_mid = 1;
  const farmfraction_big = tick > 800 ? 1 / 8 : 0;
  const farmfraction_enemy = 1;
  //move_prestrat(targetps, moving, prestrating);

  move_farm(
    targetps,
    moving,
    farming,
    farmfraction_home,
    farmfraction_mid,
    farmfraction_big,
    farmfraction_enemy
  );

  move_poststrat(targetps, moving, poststrating);
  move_defend_structures(targetps, moving);
  move_combat(targetps);

  return targetps;
}

function move_poststrat(targetps: Vec2s, moving: Vec, poststrating: Vec) {
  const { myships, stars, bases, outposts } = collections;
  for (const ship of ships_not_in(myships, moving)) {
    targetps[ship.index] = offset(ship.position, points.a5, D);
    moving.push(ship.index);
    poststrating.push(ship.index);
  }
}
