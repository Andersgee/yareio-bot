import collections from "./collections";
import { moveclosest } from "./busy";
import { ships_not_in } from "./find";
import points from "./points_of_interest";
import {
  anyShipIsWithinDist,
  maxStarFarmers,
  myOutpostEnergy,
  sustainableStarFarmers,
} from "./utils";

export default function move_farm(
  targetps: Vec2s,
  busy: Vec
): [number, number] {
  const { myships, stars, enemyships, bases, info } = collections;

  const shipsize = myships[0].size;

  const Nhome = sustainableStarFarmers(stars.me, shipsize);
  const Nhome_max = maxStarFarmers(stars.me, shipsize);

  //const Nmid = sustainableStarFarmers(stars.middle, shipsize);
  //const Nmid_max = maxStarFarmers(stars.middle, shipsize); //always same as Nhome_max ofc

  const enemyIsNearBase = anyShipIsWithinDist(
    enemyships,
    bases.me.position,
    600
  );
  const shouldforwardposition = enemyIsNearBase || memory.gamestage > 0;

  let nfarmers = 0;
  let nmidfarmers = 0;

  if (memory.gamestage === 0) {
    //low shipcount / earlygame
    const fp = shouldforwardposition
      ? points.homefarm.forward
      : points.homefarm.backward;
    if (myships.length <= 7 && tick < 18) {
      moveclosest(targetps, fp.star, busy);
      moveclosest(targetps, fp.star, busy);
      moveclosest(targetps, fp.between, busy);
      moveclosest(targetps, fp.between, busy);
      moveclosest(targetps, fp.base, busy);
      moveclosest(targetps, fp.base, busy);
      moveclosest(targetps, fp.star, busy);
    } else {
      for (let n = 0; n < Nhome_max / 2; n++) {
        moveclosest(targetps, fp.star, busy);
        moveclosest(targetps, fp.between, busy);
        nfarmers += moveclosest(targetps, fp.base, busy); //connect
        nfarmers += moveclosest(targetps, fp.star, busy); //double up
      }

      for (const ship of ships_not_in(myships, busy)) {
        targetps[ship.index] = points.star2middlefarm.mid.base;
        busy.push(ship.index);
      }
    }
  }

  if (memory.gamestage === 1) {
    //medium shipcount / midgame
    for (let n = 0; n < Nhome / 2; n++) {
      //home
      const fph = points.star2middlefarm.home;
      moveclosest(targetps, fph.star, busy);
      moveclosest(targetps, fph.between, busy);
      nfarmers += moveclosest(targetps, fph.base, busy); //connect
      nfarmers += moveclosest(targetps, fph.star, busy); //double up

      //mid
      const fpm = points.star2middlefarm.mid;
      nmidfarmers += moveclosest(targetps, fpm.star, busy);
      if (
        myOutpostEnergy() < 100 ||
        (myOutpostEnergy() > 590 && stars.middle.energy > 500)
      ) {
        moveclosest(targetps, fpm.between, busy);
        moveclosest(targetps, fpm.base, busy); //connect
      }
      nmidfarmers += moveclosest(targetps, fpm.star, busy); //double up
      //moveclosest(targetps, points.star2middlefarm.mid.starforward, busy);
      //moveclosest(targetps, points.star2middlefarm.mid.starforward, busy);
    }
  }

  return [nfarmers, nmidfarmers];
}
