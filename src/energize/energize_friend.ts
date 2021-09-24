import collections from "../collections";
import { ships_in, ships_not_in, sortByNearestenemyDistance } from "../find";
import { constructGraph, path_byclosestavailabledestination } from "../graph";
import {
  anyShipIsWithinDist,
  canTransfer,
  hasRoom,
  maxStarFarmers,
  notNearStar,
} from "../utils";
import { all, isWithinDist } from "../vec";

/**
 * 1. heal my attacking ships (they always have room for 1 heal if they attack)
 *  1.1 from star source
 *  1.2 from non-star source
 * 2. heal my attacking ships again (if they had room for 1 heal right now it means they can be healed twice)
 *  1.1 from star source
 *  1.2 from non-star source
 * 3. heal my non-attacking ships if they are not near star
 *  3.1 sorted by distance to its nearest enemy and heal fully.
 */
export default function energize_friend(
  targets: targets,
  busy: Vec,
  attacking: Vec,
  nfarmers: number
): void {
  const { myships, stars, enemyships, bases } = collections;

  if (!memory.enemyIsSquareRush) {
    //actually dont heal attackers in square rush scenario
    const healed_once_indexes: Vec = [];
    const myshipsattacking = ships_in(myships, attacking);
    //1.
    energize_fromStar(targets, busy, myshipsattacking, healed_once_indexes);
    energize_fromNonstar(targets, busy, myshipsattacking, healed_once_indexes);

    //2
    const healed_twice_indexes: Vec = [];
    const myshipsattacking2 = myshipsattacking.filter(hasRoom);
    energize_fromStar(targets, busy, myshipsattacking2, healed_twice_indexes);
    energize_fromNonstar(
      targets,
      busy,
      myshipsattacking2,
      healed_twice_indexes
    );
  }

  //3.
  const shouldHeal = shouldHealNonattackers(nfarmers);

  const myshipsNotattackingNotNearstar = sortByNearestenemyDistance(
    ships_not_in(myships, attacking).filter(notNearStar)
  );
  const Nhealsrequired = myshipsNotattackingNotNearstar.map(requestedHeals);
  if (shouldHeal) {
    //console.log(`N: ${JSON.stringify(Nhealsrequired)}`);
    //console.log(Nhealsrequired);
    for (const [i, ship] of myshipsNotattackingNotNearstar.entries()) {
      for (let n = 0; n < Nhealsrequired[i]; n++) {
        const dontheal_indexes: Vec = []; //reset each time...
        energize_fromStar(targets, busy, [ship], dontheal_indexes);
        /*
        energize_fromNonstar(
          targets,
          busy,
          myshipsNotattacking,
          dontheal_indexes
        );
        */
      }
    }
  }
}

function shouldHealNonattackers(nfarmers: number): boolean {
  const { enemyships, stars, myships, bases } = collections;
  const enemyIsNearBase = anyShipIsWithinDist(
    enemyships,
    bases.me.position,
    600
  );
  const Nhome_max = maxStarFarmers(stars.me, myships[0].size);
  const shouldHealFriends =
    memory.gamestage > 0 ||
    enemyIsNearBase ||
    nfarmers >= Nhome_max ||
    memory.enemyIsSquareRush;
  return shouldHealFriends;
}

function energize_fromStar(
  targets: targets,
  busy: Vec,
  shipsrequiringheal: Ships,
  dontheal_indexes: Vec
): void {
  const { stars } = collections;

  energize_nearstar2friends(
    targets,
    shipsrequiringheal,
    stars.enemy,
    busy,
    dontheal_indexes,
    ""
  );
  energize_nearstar2friends(
    targets,
    shipsrequiringheal,
    stars.middle,
    busy,
    dontheal_indexes,
    ""
  );
  energize_nearstar2friends(
    targets,
    shipsrequiringheal,
    stars.me,
    busy,
    dontheal_indexes,
    ""
  );
}

function energize_fromNonstar(
  targets: targets,
  busy: Vec,
  shipsrequiringheal: Ships,
  dontheal_indexes: Vec
): void {
  energize_NOTnearstar2friends(
    targets,
    shipsrequiringheal,
    busy,
    dontheal_indexes,
    ""
  );
}

/**
 * Primary healing targets (enemyisnearby and hasRoom(1))
 */
function wantsHeal1(s: Ship): boolean {
  const enemyisnearby = s.nearbyenemies400.length > 0;
  return enemyisnearby && hasRoom(s);
}

/**
 * Secondary healing targets (not near star and hasRoom(1))
 */
function wantsHeal2(s: Ship): boolean {
  const { stars } = collections;

  //not near star
  const A =
    !isWithinDist(s.position, stars.me.position) &&
    !isWithinDist(s.position, stars.middle.position) &&
    hasRoom(s);

  return A;
}

/**
 * Tertiary healing targets (Near star and rasRoom(2))
 */
function wantsHeal3(s: Ship): boolean {
  const { stars } = collections;

  //near star
  const A =
    (isWithinDist(s.position, stars.me.position) ||
      isWithinDist(s.position, stars.middle.position)) &&
    hasRoom(s, 2);

  return A;
}

/**
 * The number of times a ship wants to be healed
 */
function requestedHeals(s: Ship): number {
  return Math.floor((s.energy_capacity - s.energy) / s.size);
}

function energize_nearstar2friends(
  targets: targets,
  shipsrequiringheal: Ships,
  star: Star,
  busy: Vec,
  dontheal_indexes: Vec = [],
  strmsg = ""
) {
  if (shipsrequiringheal.length < 1) {
    return;
  }
  const { myships } = collections;

  const shipsrequiringheal_indexes = shipsrequiringheal.map((s) => s.index);

  const sources = ships_not_in(
    myships,
    busy.concat(shipsrequiringheal_indexes)
  ).filter((s) => isWithinDist(star.position, s.position) && canTransfer(s));
  for (const src of sources) {
    const graphships = ships_not_in(myships, busy.concat(dontheal_indexes));

    if (graphships.length > 0) {
      const G = constructGraph(graphships);
      const destinations = ships_not_in(
        shipsrequiringheal,
        busy.concat(dontheal_indexes)
      );
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
          dontheal_indexes.push(dest.index);
          if (strmsg !== "") {
            dest.shout(strmsg);
          }
        }
      }
    }
  }
}

function energize_NOTnearstar2friends(
  targets: targets,
  shipsrequiringheal: Ships,
  busy: Vec,
  dontheal_indexes: Vec = [],
  strmsg = ""
) {
  if (shipsrequiringheal.length < 1) {
    return;
  }
  const { myships, stars } = collections;
  const shipsrequiringheal_indexes = shipsrequiringheal.map((s) => s.index);

  const sources = ships_not_in(
    myships,
    busy.concat(shipsrequiringheal_indexes)
  ).filter(
    (s) =>
      !isWithinDist(stars.me.position, s.position) &&
      !isWithinDist(stars.middle.position, s.position) &&
      canTransfer(s)
  );
  for (const src of sources) {
    const graphships = ships_not_in(myships, busy.concat(dontheal_indexes));

    if (graphships.length > 0) {
      const G = constructGraph(graphships);
      const destinations = ships_not_in(
        shipsrequiringheal,
        busy.concat(dontheal_indexes)
      );
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
          dontheal_indexes.push(dest.index);
          if (strmsg !== "") {
            dest.shout(strmsg);
          }
        }
      }
    }
  }
}
