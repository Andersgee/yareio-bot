import { collections } from "./collections";
import { dist, intersectPoint, offset } from "./vec";
import { D } from "./constants";
import { controlIsMe } from "./utils";

const points = pointsOfInterest();
export default points;

function pointsOfInterest() {
  //home star
  const { bases, stars, outposts, pylons } = collections;
  const h1 = intersectPoint(
    bases.me.position,
    199 * 2,
    stars.me.position,
    199,
    stars.middle.position
  );
  const h2 = intersectPoint(
    bases.me.position,
    199,
    h1,
    199,
    stars.middle.position
  );

  //enemy star
  const e1 = intersectPoint(
    bases.enemy.position,
    199 * 2,
    stars.enemy.position,
    199,
    stars.middle.position
  );
  const e2 = intersectPoint(
    bases.enemy.position,
    199,
    e1,
    199,
    stars.middle.position
  );

  //mid star
  const m1 = intersectPoint(
    stars.middle.position,
    D,
    bases.middle.position,
    D,
    controlIsMe(bases.me.control) ? bases.enemy.position : bases.me.position //always "forward"
  );
  //big star
  const b1 = intersectPoint(
    stars.big.position,
    D,
    bases.big.position,
    D * 3,
    controlIsMe(bases.me.control) ? bases.enemy.position : bases.me.position //always "forward"
  ); //forward
  //const b1 = intersectPoint(stars.big.position, D, bases.big.position, D * 3, bases.me.position); //backward

  const b2 = offset(b1, bases.big.position, D);
  const b3 = offset(bases.big.position, b2, D);

  //outpost
  const o1 = offset(outposts.middle.position, stars.middle.position, D);

  //attack
  const a1 = intersectPoint(
    stars.big.position,
    D,
    pylons.middle.position,
    D,
    bases.enemy.position
  );
  const a2 = offset(a1, bases.enemy.position, D);
  const a3 = offset(a2, bases.enemy.position, D);
  const a4 = offset(a3, bases.enemy.position, D);
  const a5 = offset(bases.enemy.position, a4, D);

  return { h1, h2, e1, e2, m1, b1, b2, b3, o1, a1, a2, a3, a4, a5 };
}
