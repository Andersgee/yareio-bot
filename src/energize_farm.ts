import { isWithinDist } from "./vec";
import { constructGraph, path_byclosestavailabledestination } from "./graph";
import { ships_not_in } from "./find";

function notEmpty(ship: Ship) {
  return ship.energy > 0;
}

function notFull(ship: Ship) {
  return ship.energy < ship.energy_capacity;
}

function isFull(s: Ship | Star) {
  return s.energy === s.energy_capacity;
}

function isEmpty(ship: Ship) {
  return ship.energy === 0;
}

export default function energize_farm(
  collections: Collections,
  G: Graph,
  busy: Vec
): void {
  const { stars } = collections;

  //start ships trying to stay full at some point
  //a good time is probably when my star has full energy
  const stayfull_home = isFull(stars.me);
  //const stayfull_home = tick > 200;
  const stayfull_mid = true;

  energize_star2base(collections, stars.me, busy, stayfull_home);
  energize_star2base(collections, stars.middle, busy, stayfull_mid);
  //energize_star2base(collections, stars.enemy, busy, stayfull_mid);

  if (tick < 123) {
    energize_any2base(collections, stars.enemy, busy);
  }
}

function energize_any2base(
  collections: Collections,
  star: Star,
  busy: Vec
): void {
  const { myships, bases } = collections;
  const base = bases.me;

  const shipsnearbase = myships.filter((s) =>
    isWithinDist(base.position, s.position, 200)
  );

  const sources = myships.filter(notEmpty);

  for (const src of sources) {
    const ships = ships_not_in(myships, busy);
    if (ships.length > 0) {
      const G = constructGraph(ships);
      const destinations = ships_not_in(shipsnearbase, busy);
      const pathships = path_byclosestavailabledestination(
        ships,
        G,
        src,
        destinations
      );

      if (pathships.length > 0) {
        const dest = pathships[pathships.length - 1]; //pathships[end]
        //there is be a path by using only notbusy ships
        src.energize(pathships[0]);
        //src.shout("anysrc");
        busy.push(src.index);

        //make path energize next in path
        for (let i = 0; i < pathships.length - 1; i++) {
          pathships[i].energize(pathships[i + 1]);
          //pathships[i].shout(`any${i}`);
          busy.push(pathships[i].index);
        }

        //make destination aka pathships[end] energize base
        dest.energize(bases.me);
        //dest.shout("anydest");
        busy.push(dest.index);
      }
    }
  }

  for (const ship of shipsnearbase) {
    ship.energize(base);
    //ship.shout("override");
  }
}

function energize_star2base(
  collections: Collections,
  star: Star,
  busy: Vec,
  stayfull = false
): void {
  const { myships, bases } = collections;
  const base = bases.me;

  const shipsnearstar = myships.filter((s) =>
    isWithinDist(star.position, s.position, 200)
  );
  const shipsnearbase = myships.filter((s) =>
    isWithinDist(base.position, s.position, 200)
  );

  for (const [i, src] of shipsnearstar.entries()) {
    const Nsources = i + 1;
    const ships = ships_not_in(myships, busy);

    //first of all energize self regardless of existing path to base (override if path exist)
    if (stayfull && notFull(src)) {
      src.energize(src);
    }

    if (ships.length > 0) {
      const G = constructGraph(ships);
      const destinations = ships_not_in(shipsnearbase, busy);
      const pathships = path_byclosestavailabledestination(
        ships,
        G,
        src,
        destinations
      );

      if (pathships.length > 0) {
        const dest = pathships[pathships.length - 1]; //pathships[end]
        //Path exist
        //(there is a path by using only notbusy ships)

        //make src toggle between energizing self and first in path
        //also flip the toggle order (+Nsources) for every other src
        if ((tick + Nsources) % 2 == 0) {
          src.energize(src);
        } else {
          if (stayfull && notFull(src)) {
            src.energize(src);
          } else {
            src.energize(pathships[0]);
          }
        }
        busy.push(src.index);
        //src.shout(`src${Nsources}`);

        //make path energize next in path
        for (const [i, pathship] of pathships.entries()) {
          if (i < pathships.length - 1) {
            if (stayfull && notFull(pathship)) {
              //pathship.shout(`${i}heal`);
            } else {
              pathship.energize(pathships[i + 1]);
              //pathship.shout(`${i}`);
            }
            //make every ship in path busy, but only for every 2 src
            if (Nsources % 2 == 0) {
              busy.push(pathship.index);
            }
          }
        }

        //make destination aka pathships[end] energize base
        if (stayfull && notFull(dest)) {
          //dest.shout("destheal");
        } else {
          dest.energize(bases.me);
        }

        if (Nsources % 2 == 0) {
          busy.push(dest.index);
        }
      }
    }
  }
}
