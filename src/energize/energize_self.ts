import collections from "../collections";
import { ships_not_in } from "../find";
import {
  canTransfer,
  maxStarFarmers,
  myOutpostEnergy,
  notFull,
  sustainableStarEnergy,
  sustainableStarFarmers,
  transferamount,
} from "../utils";
import { isWithinDist } from "../vec";

/**
 * energize_self but with guard aginst overfarming 8charge star as function of its energy and nfarmers)
 */
export default function energize_starOrSelf(
  targets: targets,
  busy: Vec,
  attacking: Vec,
  nfarmers: number,
  nmidfarmers: number
): void {
  const { stars, myships } = collections;

  const Nhome = sustainableStarFarmers(stars.me, myships[0].size);
  const Nhome_max = maxStarFarmers(stars.me, myships[0].size);

  const Nmid = sustainableStarFarmers(stars.me, myships[0].size);
  const Nmid_max = maxStarFarmers(stars.me, myships[0].size);

  //guard against overfarming
  energize_star(targets, stars.me, busy, nfarmers, attacking);

  if (myOutpostEnergy() > 600 && nmidfarmers >= Nmid_max) {
    energize_star(targets, stars.middle, busy, nmidfarmers, attacking);
  }

  const stayfullhomestar = memory.enemyIsSquareRush;
  energize_self(targets, stars.me, busy, attacking, stayfullhomestar);

  const stayfullmidstar =
    memory.enemyIsSquareRush ||
    (memory.gamestage === 0 && myOutpostEnergy() > 30) ||
    (memory.gamestage === 1 && myOutpostEnergy() > 200 && nfarmers < Nmid); //meant for the early controlmid() ships
  energize_self(targets, stars.middle, busy, attacking, stayfullmidstar);

  const stayfullenemystar = true;
  energize_self(targets, stars.enemy, busy, attacking, stayfullenemystar);
}

/**
 * Take energy from star, every other tick
 */
function energize_self(
  targets: targets,
  star: Star,
  busy: Vec,
  attacking: Vec,
  stayfull = false
): void {
  const { myships, bases } = collections;

  const ships = ships_not_in(myships, busy.concat(attacking)).filter((s) =>
    isWithinDist(star.position, s.position)
  );

  const N_max =
    myOutpostEnergy() > 600 ? maxStarFarmers(star, myships[0].size) : 999;
  const maxselfers = memory.enemyIsSquareRush ? 999 : N_max / 2;
  let nselfers = 0;

  const shoulEven = (s: Ship) => notFull(s) && nselfers < maxselfers;
  const shouldOdd = (s: Ship) =>
    notFull(s) && (stayfull || s.nearbyenemies400.length > 0);

  const haveEssentially9ships = essentially9();
  for (const [i, ship] of ships.entries()) {
    if ((tick + i) % 2 == 0) {
      if (shoulEven(ship)) {
        targets[ship.index] = ship;
        nselfers += 1;
        if (star.energy > 2 || stayfull) {
          //only make it busy if worthwile not to override
          busy.push(ship.index);
        }
      }
    } else {
      //actually still energize self if enemy nearbyish
      if (shouldOdd(ship)) {
        targets[ship.index] = ship;
        nselfers += 1;
        if (star.energy > 2 || stayfull) {
          //only make the odd busy if on square rush specific scenario
          if (memory.enemyIsSquareRush && haveEssentially9ships) {
            busy.push(ship.index);
          }
        }
      }
    }
  }
}

function essentially9(): boolean {
  const { myships, bases } = collections;
  return (
    myships.length === 9 || (myships.length === 8 && bases.me.energy >= 87)
  );
}

function energize_star(
  targets: targets,
  star: Star,
  busy: Vec,
  nfarmers: number,
  attacking: Vec
): void {
  const { myships } = collections;
  if (memory.enemyIsSquareRush) {
    return;
  }

  const sustainableEnergy = sustainableStarEnergy(
    star,
    nfarmers,
    myships[0].size
  );
  let currentEnergy = star.energy;
  if (currentEnergy < sustainableEnergy) {
    const ships = myships.filter(
      (s) =>
        isWithinDist(star.position, s.position) &&
        s.nearbyenemies400.length === 0 &&
        canTransfer(s)
    );

    for (const [i, ship] of ships.entries()) {
      if (currentEnergy < sustainableEnergy) {
        targets[ship.index] = star;
        busy.push(ship.index);
        attacking.push(ship.index);
        currentEnergy += transferamount(ship);
        ship.shout("c");
      }
    }
  }
}
