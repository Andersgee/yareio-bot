import collections from "../collections";
import energize_enemy from "./energize_enemy";
import energize_star from "./energize_star";
import energize_self from "./energize_self";
import energize_friendInNeed from "./energize_friendInNeed";
import energize_star2base from "./energize_star2base";
import energize_basefriend from "./energize_basefriend";
import energize_baseship2base from "./energize_baseship2base";
import energize_outpost from "./energize_outpost";
import energize_base from "./energize_base";
import { isWithinDist } from "../vec";
import { is_in } from "../find";
import { maxStarSelfers } from "../utils";

/**
 * ```raw
 * The general idea is:
 * 1. Energize enemybase (if killable)
 * 2. Energize enemy (2:1)
 * 3. Energize star (if safe etc)
 * 4. Energize self (1:1)
 *    * Energize base (take control of them)
 * 5. Energize friends in need (1:1)
 * 6. Energize base from star (1:5 or something)
 * 7. Energize friends not exactly in need (1:1)
 * 8. energize_baseship2base (1:5 or something)
 * 9. Energize outpost (tricky... when it attacks its 2:1 but when enemy attacks it its 1:2)
 
 * ```
 */
export default function energize(): targets {
  const { myships, stars, bases } = collections;
  const targets: targets = new Array(myships.length).fill(null);

  const energizing: Vec = []; //all
  const attacking: Vec = []; //keep separate lists for the different "types" of energize
  const boosting: Vec = [];
  const selfing: Vec = [];
  const healing: Vec = [];
  const basing: Vec = [];
  const outposting: Vec = [];

  const maxSelfers = maxStarSelfers(stars.me, myships[0].size);
  const stayfull = myships.length > 2 * maxSelfers;
  const stayfullfarmline = myships.length > 4 * maxSelfers;
  const stayalmostfullfnearbase = false;
  const stayfullfnearbase = myships.length > 2 * maxSelfers;

  energize_enemy(targets, energizing, attacking);
  //energize_star(targets, energizing, boosting, stayfull);

  const ships_requireheal = myships.filter(
    (s) => requiredheal(s, attacking) > 0
  );
  const index_requiredheal = new Map(
    ships_requireheal.map((s) => [s.index, requiredheal(s, attacking)])
  );

  energize_self(targets, energizing, selfing);

  for (const base of [bases.me, bases.middle, bases.big, bases.enemy]) {
    energize_base(base, targets, energizing);
  }

  energize_friendInNeed(
    targets,
    energizing,
    healing,
    attacking,
    boosting,
    ships_requireheal,
    index_requiredheal
  );
  energize_star2base(targets, energizing, basing, stayfullfarmline);
  /*
  energize_basefriend(
    targets,
    energizing,
    healing,
    attacking,
    boosting,
    ships_requireheal,
    index_requiredheal,
    stayfull
  );
  */
  energize_baseship2base(
    targets,
    energizing,
    basing,
    stayalmostfullfnearbase,
    stayfullfnearbase
  );
  energize_outpost(targets, energizing, outposting, stayfull);

  return targets;
}

/**
 * Return the amount a ship wants to be healed
 */
function requiredheal(ship: Ship, attacking: Vec): number {
  const { stars } = collections;
  const isNearStar =
    isWithinDist(ship.position, stars.me.position) ||
    isWithinDist(ship.position, stars.middle.position) ||
    isWithinDist(ship.position, stars.enemy.position);
  const isAttacking = is_in(ship, attacking);
  //const defaultheal = ship.energy_capacity - ship.energy;
  const defaultheal =
    Math.floor((ship.energy_capacity - ship.energy) / ship.size) * ship.size;
  if (isAttacking) {
    return defaultheal + ship.size; //an extra
  } else {
    if (isNearStar) {
      return Math.max(0, defaultheal - ship.size); //one less
    } else {
      return defaultheal;
    }
  }
}
