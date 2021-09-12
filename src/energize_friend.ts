import collections from "./collections";
import { ships_in, ships_not_in } from "./find";
import { constructGraph, path_byclosestavailabledestination } from "./graph";
import {
  anyShipIsWithinDist,
  canTransfer,
  hasRoom,
  hasRoomLess,
  maxStarFarmers,
} from "./utils";
import { all, isWithinDist } from "./vec";

export default function energize_friend(
  targets: targets,
  busy: Vec,
  attacking: Vec
): boolean {
  const { myships, stars, enemyships, bases } = collections;

  const enemyIsNearBase = anyShipIsWithinDist(
    enemyships,
    bases.me.position,
    1050
  );

  const Nhome_max = maxStarFarmers(stars.me, myships[0].size);

  const shouldHeal =
    memory.gamestage > 0 || enemyIsNearBase || myships.length > Nhome_max * 2;

  //primary heal
  //first of all, heal all ships currently attacking
  const myshipsattacking = ships_in(myships, attacking);
  energize_nearstar2friends(targets, myshipsattacking, stars.middle, busy, "+");
  energize_nearstar2friends(targets, myshipsattacking, stars.me, busy, "+");

  //secondary heal
  //heal anyone not full if they are NOT near homestar or middlestar
  //also heal those near homestar or middlestar if they have room for more than 1 heal

  if (shouldHeal) {
    const shipswantsheal1 = myships.filter(wantsHeal1);
    energize_nearstar2friends(
      targets,
      shipswantsheal1,
      stars.middle,
      busy,
      "1"
    );
    energize_nearstar2friends(targets, shipswantsheal1, stars.me, busy, "1");

    const shipswantsheal2 = myships.filter(wantsHeal2);
    energize_nearstar2friends(
      targets,
      shipswantsheal2,
      stars.middle,
      busy,
      "2"
    );
    energize_nearstar2friends(targets, shipswantsheal2, stars.me, busy, "2");

    const shipswantsheal3 = myships.filter(wantsHeal3);
    energize_nearstar2friends(
      targets,
      shipswantsheal3,
      stars.middle,
      busy,
      "3"
    );
    energize_nearstar2friends(targets, shipswantsheal3, stars.me, busy, "3");
  }

  return shouldHeal;
}

/**
 * Primary healing targets
 */
function wantsHeal1(s: Ship): boolean {
  const enemyisnearby = s.nearbyenemies400.length > 0;
  return enemyisnearby && hasRoom(s);
}

/**
 * Secondary healing targets
 */
function wantsHeal2(s: Ship): boolean {
  const { stars } = collections;

  //not near star
  const A =
    !isWithinDist(s.position, stars.me.position) &&
    !isWithinDist(s.position, stars.middle.position) &&
    hasRoomLess(s, 2);

  return A;
}

/**
 * Tertiary healing targets
 */
function wantsHeal3(s: Ship): boolean {
  const { stars } = collections;

  //not near star
  const A =
    !isWithinDist(s.position, stars.me.position) &&
    !isWithinDist(s.position, stars.middle.position) &&
    hasRoomLess(s);

  return A;
}

function energize_nearstar2friends(
  targets: targets,
  shipsrequiringheal: Ships,
  star: Star,
  busy: Vec,
  strmsg = "+"
) {
  if (shipsrequiringheal.length < 1) {
    return;
  }
  const { myships } = collections;

  const sources = ships_not_in(myships, busy).filter(
    (s) => isWithinDist(star.position, s.position) && canTransfer(s)
  );

  for (const src of sources) {
    const graphships = ships_not_in(myships, busy);

    if (graphships.length > 0) {
      const G = constructGraph(graphships);
      const destinations = ships_not_in(shipsrequiringheal, busy);
      //the way Im doing it now prevents a destination from being healed more than once...
      const pathships = path_byclosestavailabledestination(
        graphships,
        G,
        src,
        destinations
      );

      if (pathships.length > 1) {
        const transferships = pathships.slice(0, -1); //all except destination
        const canReach = all(transferships.map(canTransfer));
        if (canReach) {
          for (let i = 0; i < pathships.length - 1; i++) {
            targets[pathships[i].index] = pathships[i + 1];
            busy.push(pathships[i].index);
          }
          const dest = pathships[pathships.length - 1];
          busy.push(dest.index);
          dest.shout(strmsg);
        }
      }
    }
  }
}
