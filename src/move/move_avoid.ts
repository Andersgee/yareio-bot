import { collections } from "../collections";
import combateval from "../combateval";
import { avoidCircle, avoidEnemy } from "../positioning";
import { dist, isWithinDist, maximum, minimum, offsetmax20 } from "../vec";

export default function move_void(orders: Orders): void {
  //clamp_movement(orders.targetps);
  const COMMON_PLACE_MAX_RANGE = 60; //how far to look for a common avoid place

  const { myships, shapes } = collections;
  const myMovingShips = myships.filter((s) => !s.locked);
  const pickedAvoidPoints: { point: Vec2; count: number }[] = [];

  for (const ship of myMovingShips) {
    const desiredPoint = orders.targetps[ship.index];
    const desiredAvoidPoint = avoidEnemy(ship, desiredPoint, ship.nearestenemy);

    const { myAdvantage } = combateval(
      ship.nearbyfriends20,
      ship.nearbyenemies240
    );
    if (myAdvantage > -1) {
      //can continue as planned
      //TODO: what about triangles exploding? might not be safe to continue maxstep forward.
      orders.targetps[ship.index] = desiredPoint;
      if (shapes.enemy === "triangles" && ship.nearbyenemies240.length > 1) {
        const desired_moved_p = offsetmax20(ship.position, desiredPoint);
        orders.targetps[ship.index] = avoidCircle(
          ship.position,
          desired_moved_p,
          ship.nearestenemy.position,
          160.00001
        );
      }
    } else {
      orders.avoiding.push(ship.index);

      //in danger
      const reachableAvoidPoints2steps = pickedAvoidPoints.filter((p) =>
        isWithinDist(p.point, ship.position, COMMON_PLACE_MAX_RANGE)
      );
      if (reachableAvoidPoints2steps.length === 0) {
        //no common place in range, pick your own avoid point.
        const pickedAvoidPoint = desiredAvoidPoint;
        orders.targetps[ship.index] = pickedAvoidPoint;
        pickedAvoidPoints.push({ point: pickedAvoidPoint, count: 1 });
      } else if (reachableAvoidPoints2steps.length === 1) {
        //only one common place in range, pick it.
        const { point: pickedAvoidPoint } = reachableAvoidPoints2steps[0];
        orders.targetps[ship.index] = pickedAvoidPoint;
        pickedAvoidPoints.push({ point: pickedAvoidPoint, count: 1 });
      } else {
        //pick one of the common places in range.

        //IDEA1: pick the closest one
        //const { index: closestIndex } = minimum(reachableAvoidPoints2steps.map((p) => dist(p.point, ship.position)));
        //const {point: pickedAvoidPoint} = pickedAvoidPoints[closestIndex];
        //pickedAvoidPoints[closestIndex].count += 1
        //orders.targetps[ship.index] = pickedAvoidPoint;

        //IDEA2: pick the most popular one
        const { index: popularIndex } = maximum(
          reachableAvoidPoints2steps.map((p) => p.count)
        );
        const { point: pickedAvoidPoint } = pickedAvoidPoints[popularIndex];
        pickedAvoidPoints[popularIndex].count += 1;
        orders.targetps[ship.index] = pickedAvoidPoint;
      }
    }
  }
}

/**
 * A Ship can only move 20 units. make targetps reflect that.
 */
function clamp_movement(targetps: Vec2[]) {
  const { myships, stars, outposts, bases, pylons } = collections;
  for (const ship of myships) {
    if (targetps[ship.index]) {
      targetps[ship.index] = offsetmax20(ship.position, targetps[ship.index]);
    } else {
      //its possible ship was never assigned at targetp but unlikely
      targetps[ship.index] = ship.position;
    }
  }

  //avoid structures
  for (const ship of myships) {
    for (const structure of [
      stars.big,
      stars.enemy,
      stars.me,
      stars.middle,
      bases.big,
      bases.enemy,
      bases.me,
      bases.middle,
      outposts.middle,
      pylons.middle,
    ]) {
      targetps[ship.index] = avoidCircle(
        ship.position,
        targetps[ship.index],
        structure.position,
        structure.collision_radius
      );
    }
  }
}
