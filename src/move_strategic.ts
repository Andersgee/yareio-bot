import { ships_not_in } from "./find";
import collections from "./collections";
import points from "./points_of_interest";
import { offset, sum } from "./vec";

export default function move_strategic(busy: Vec): void {
  const { myships, enemyships, info, outposts, bases } = collections;

  const sumMyEnergy = sum(myships.map((s) => s.energy));
  const sumEnemyEnergy =
    sum(enemyships.map((s) => s.energy)) + bases.enemy.energy;
  const finishHim =
    memory.finshhim || (tick > 500 && sumMyEnergy > sumEnemyEnergy * 3);
  if (finishHim) {
    memory.finshhim = true;
  }

  const meIsStrong = info.outpostcontrolIsMe && outposts.middle.energy > 700;

  //What do with not busy ships?..
  for (const ship of ships_not_in(myships, busy)) {
    if (tick < 100) {
      ship.move(points.homefarm.between);
      ship.shout("s1");
    } else if (meIsStrong) {
      const p = offset(bases.enemy.position, bases.me.position, 199);
      ship.move(p);
      ship.shout("s2");
    } else {
      ship.move(points.middlefarm.star);
      ship.shout("s3");
    }
  }

  if (finishHim) {
    for (const ship of myships) {
      const p = offset(bases.enemy.position, bases.me.position, 199);
      ship.move(p);
      ship.shout("end");
    }
  }
}
