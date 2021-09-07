import collections from "./collections";
import { isWithinDist } from "./vec";
import { isFull } from "./utils";

export default function energize_strategic(): void {
  const { myships, outposts, info } = collections;

  for (const ship of myships) {
    const isNearOutpost = isWithinDist(
      ship.position,
      outposts.middle.position,
      200
    );
    if (isNearOutpost && info.outpostcontrolIsEnemy) {
      ship.energize(outposts.middle);
    } else if (isNearOutpost && isFull(ship) && outposts.middle.energy <= 700) {
      ship.energize(outposts.middle);
    }
  }
}
