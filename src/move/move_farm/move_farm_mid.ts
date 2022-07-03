import collections from "../../collections";
import { ships_not_in, ship_closest } from "../../find";
import { stayinTwoCircles, staynearstructure } from "../../positioning";
import { maxStarSelfers, sustainableStarSelfers } from "../../utils";
import { offsetmax20 } from "../../vec";
import points from "../../points";
import { D } from "../../constants";

export default function move_farm_mid(
  targetps: Vec2s,
  moving: Vec,
  farming: Vec,
  maxfarmfraction: number //how much of maxfarm should be allocated
): void {
  const { myships, bases, stars } = collections;

  const shipsize = myships[0].size;
  const selfers_max = Math.floor(
    maxfarmfraction * maxStarSelfers(stars.middle, shipsize)
  );

  let nselfers = 0;
  for (let n = 0; n < selfers_max * 2; n++) {
    nselfers += position1ship(
      targetps,
      bases.middle,
      stars.middle,
      moving,
      farming
    );
  }
}

function position1ship(
  targetps: Vec2s,
  base: Base,
  star: Star,
  moving: Vec,
  farming: Vec
): number {
  const { myships } = collections;
  const freeships = ships_not_in(myships, moving);
  if (freeships.length < 1) {
    return 0;
  }

  const s2 = ship_closest(myships, points.m1, moving);

  targetps[s2.index] = stayinTwoCircles(
    s2.position,
    points.m1,
    star.position,
    D,
    base.position,
    D
  );
  //targetps[s2.index] = offsetmax20(s2.position, points.m1);
  moving.push(s2.index);
  farming.push(s2.index);

  return 0.5;
}
