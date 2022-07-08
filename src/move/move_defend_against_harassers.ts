import { collections } from "../collections";
import { pointsLong } from "../pointsLong";
import { controlIsMe } from "../utils";
import { position_at_points } from "./positioning";

export default function move_defend_against_harassers(orders: Orders): void {
  const { bases, myships } = collections;
  const shouldDefMeOverride = false;
  const shouldDefMiddleOverride = false;
  const shouldDefEnemyOverride = false;

  //me
  const shouldDefMe =
    shouldDefMeOverride ||
    (controlIsMe(bases.me.control) && couldSpawnNships(bases.me, 2));

  //middle
  const shouldDefMiddle =
    shouldDefMiddleOverride ||
    (controlIsMe(bases.middle.control) && couldSpawnNships(bases.middle, 2));

  //enemy
  const shouldDefEnemy =
    shouldDefEnemyOverride ||
    (controlIsMe(bases.enemy.control) && couldSpawnNships(bases.enemy, 2));

  if (shouldDefMe) {
    const points = [
      pointsLong.h_def_front,
      pointsLong.h_def_side,
      pointsLong.h_def_back,
    ];
    position_at_points(orders, points);
  }
  if (shouldDefMiddle) {
    const points = [
      pointsLong.m_def_front,
      pointsLong.m_def_side,
      pointsLong.m_def_back,
    ];
    position_at_points(orders, points);
  }
  if (shouldDefEnemy) {
    const points = [
      pointsLong.e_def_front,
      pointsLong.e_def_side,
      pointsLong.e_def_back,
    ];
    position_at_points(orders, points);
  }
}

/**
 * True if base is full or could make N ships
 *
 * note: Will actually only return true if it is currently blocked because ships are auto spawned if could make 1 ship.
 */
function couldSpawnNships(base: Base, N: number) {
  return (
    base.energy >= Math.min(base.energy_capacity, N * base.current_spirit_cost)
  );
}
