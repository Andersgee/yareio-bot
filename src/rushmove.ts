import { offset } from "./vec";
import collections from "./collections";
import move_combat from "./move_combat";
import { isEmpty } from "./utils";

export default function rushmove(): [Vec2s, number, number] {
  const { myships, stars, bases } = collections;
  const targetps: Vec2s = new Array(myships.length).fill(null);
  const busy: Vec = [];
  const nfarmers = 0;
  const nmidfarmers = 0;

  for (const ship of myships) {
    if (tick < 12) {
      targetps[ship.index] = offset(bases.me.position, stars.me.position, 50);
    } else {
      if (tick > 90 && isEmpty(ship)) {
        targetps[ship.index] = offset(
          stars.middle.position,
          bases.enemy.position,
          180
        );
      } else {
        targetps[ship.index] = offset(
          bases.enemy.position,
          stars.enemy.position,
          100
        );
      }
    }
    busy.push(ship.index);
  }

  move_combat(targetps);

  return [targetps, nfarmers, nmidfarmers];
}
