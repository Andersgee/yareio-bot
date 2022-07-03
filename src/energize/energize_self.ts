import collections from "../collections";
import { ships_not_in } from "../find";
import {
  gainFromSelfing,
  maxStarSelfers,
  notFull,
  sustainableStarSelfers,
  sustainableStarSelfingAmount,
  transferamount,
} from "../utils";
import { isWithinDist } from "../vec";

/**
 * If a spirit can harvest from a star or from a fragment, it will prioritize the fragment.
 */
export default function energize_self(targets: targets, energizing: Vec): void {
  const { stars } = collections;
  energize_self_star(targets, energizing, stars.big);
  energize_self_star(targets, energizing, stars.middle);
  energize_self_star(targets, energizing, stars.me);
  energize_self_star(targets, energizing, stars.enemy);

  for (const fragment of fragments) {
    energize_self_fragment(targets, energizing, fragment);
  }
}

function energize_self_fragment(
  targets: targets,
  energizing: Vec,
  fragment: Fragment
) {
  const { myships } = collections;

  const myshipsnearfragment = ships_not_in(myships, energizing).filter((s) =>
    isWithinDist(fragment.position, s.position)
  );

  let currentFragmentEnergy = fragment.energy * 1;

  for (const ship of myshipsnearfragment) {
    if (notFull(ship) && currentFragmentEnergy > 0) {
      targets[ship.index] = ship; //energize self
      energizing.push(ship.index);
      currentFragmentEnergy -= gainFromSelfing(ship);
    }
  }
}

function energize_self_star(
  targets: targets,
  energizing: Vec,
  star: Star
): void {
  /*
  if (tick < 23) {
    maybeBoostInstead(targets, energizing, star);
  }
  */

  const { myships } = collections;

  const myshipsnearstar = ships_not_in(myships, energizing).filter((s) =>
    isWithinDist(star.position, s.position)
  );

  let currentExtraStarEnergy = sustainableStarSelfingAmount(star);

  for (const ship of myshipsnearstar) {
    const transferedEnergy = gainFromSelfing(ship);
    if (notFull(ship) && currentExtraStarEnergy - transferedEnergy > 0) {
      targets[ship.index] = ship; //energize self
      energizing.push(ship.index);
      currentExtraStarEnergy -= transferedEnergy;
    }
  }
}

function maybeBoostInstead(targets: targets, energizing: Vec, star: Star) {
  const { myships } = collections;
  const shipsize = myships[0].size;
  const selfers_sustainable_max = sustainableStarSelfers(star, shipsize);
  const selfers_max = maxStarSelfers(star, shipsize);
  const shipsNearStar = myships.filter((s) =>
    isWithinDist(star.position, s.position)
  );
  const NavailableNearStar = shipsNearStar.length;
  const NavailableSelfers = Math.min(selfers_max, NavailableNearStar);

  if (NavailableSelfers > selfers_sustainable_max) {
    for (const ship of shipsNearStar) {
      targets[ship.index] = star; //energize star
      energizing.push(ship.index);
    }
  }
}
