import collections from "../collections";
import { moveclosest } from "../busy";
import { ships_not_in } from "../find";
import points from "../points_of_interest";
import {
  almostEmpty,
  almostFull,
  anyShipIsWithinDist,
  isEmpty,
  isFull,
  maxStarFarmers,
  myOutpostEnergy,
  notEmpty,
  sustainableStarFarmers,
} from "../utils";
import { isWithinDist, offset } from "../vec";

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

  let nfarmers = 0;
  let nmidfarmers = 0;

  const freeships = ships_not_in(myships, busy);
  if (memory.gamestage === 0) {
    //low shipcount / earlygame
    const fp = memory.enemyWasNearMyBase
      ? points.homefarm.forward
      : points.homefarm.backward;
    if (freeships.length <= 2) {
      walking_farm(targetps, busy);
    } else if (freeships.length <= 4) {
      lowship_farm(targetps, busy);
    } else if (myships.length <= 7 && tick < 18) {
      starting_farm(targetps, busy);
    } else {
      for (let n = 0; n < Nhome_max / 2; n++) {
        moveclosest(targetps, fp.star, busy);
        moveclosest(targetps, fp.between, busy);
        nfarmers += moveclosest(targetps, fp.base, busy); //connect
        nfarmers += moveclosest(targetps, fp.star, busy); //double up
      }

      //stand here with rest
      for (const ship of ships_not_in(myships, busy)) {
        targetps[ship.index] = points.homefarm.forward.base;
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
        (myOutpostEnergy() > 600 && stars.middle.energy > 500)
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

/**
 * for 1 or 2 ships
 */
function walking_farm(targetps: Vec2s, busy: Vec): void {
  const { myships, bases, stars } = collections;
  const starpoint = points.homefarm.forward.star;
  const basepoint = points.homefarm.forward.base_towardstar;
  //const starpoint = offset(stars.me.position, bases.me.position, 199.9);
  //const basepoint = offset(bases.me.position, starpoint, 199.9);
  for (const ship of ships_not_in(myships, busy)) {
    const isnearhomestar = isWithinDist(ship.position, stars.me.position);
    const isnearbase = isWithinDist(ship.position, bases.me.position);
    if (isnearhomestar) {
      if (almostFull(ship)) {
        targetps[ship.index] = basepoint;
      } else {
        targetps[ship.index] = starpoint;
      }
    } else if (isnearbase) {
      if (almostEmpty(ship)) {
        targetps[ship.index] = starpoint;
      } else {
        targetps[ship.index] = basepoint;
      }
    } else {
      if (isFull(ship)) {
        targetps[ship.index] = basepoint;
      } else {
        targetps[ship.index] = starpoint;
      }
    }
    busy.push(ship.index);
  }
}

/**
 * For 3 or 4 ships
 */
function lowship_farm(targetps: Vec2s, busy: Vec): void {
  const fp = points.homefarm.forward;
  moveclosest(targetps, fp.star, busy);
  moveclosest(targetps, fp.between, busy);
  moveclosest(targetps, fp.base, busy);
  moveclosest(targetps, fp.star, busy);
}

/**
 * For starting ships (6-7)farming slightly better
 */
function starting_farm(targetps: Vec2s, busy: Vec): void {
  const fp = points.homefarm.backward;
  moveclosest(targetps, fp.star, busy);
  moveclosest(targetps, fp.star, busy);
  moveclosest(targetps, fp.between, busy);
  moveclosest(targetps, fp.between, busy);
  moveclosest(targetps, fp.base, busy);
  moveclosest(targetps, fp.base, busy);
  moveclosest(targetps, fp.star, busy);
}
