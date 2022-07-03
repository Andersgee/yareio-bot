import collections from "./collections";
import { isWithinDist, offset } from "./vec";
import { D } from "./constants";

export default function sendendgamecommands(): boolean {
  const { myships, enemyships, bases, stars, playerids, outposts, pylons } =
    collections;
  if (enemyships.length === 0 || myships.length === 0) {
    for (const ship of myships) {
      if (ship.energy > 0) {
        for (const base of [
          bases.me,
          bases.middle,
          bases.enemy,
          bases.big,
          outposts.middle,
        ]) {
          if (base.control === playerids.enemy) {
            ship.move(base.position);
            ship.energize(base);
          } else {
            continue;
          }
        }
      } else {
        ship.move(offset(stars.middle.position, outposts.middle.position, D));
        ship.energize(ship);
      }
    }
    return true;
  } else {
    return false;
  }
}
