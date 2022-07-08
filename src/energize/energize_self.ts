import { collections } from "../collections";
import { ships_not_in, sortByIsMovingToHeal } from "../find";
import {
  canEnergize,
  controlIsEnemy,
  gainFromSelfing,
  maxStarSelfers,
  notFull,
  sustainableStarSelfers,
  sustainableStarSelfingAmount,
  transferamount,
} from "../utils";
import { isWithinDist, sum } from "../vec";

/**
 * note: If a spirit can harvest from a star or from a fragment, it will prioritize the fragment.
 */
export default function energize_self(
  targets: Target[],
  energizing: Vec
): void {
  const { stars, bases } = collections;

  /*
  if (tick < 100) {
    maybeBoostInstead(targets, energizing, stars.me);
  }
  */

  const ignoreSustBigstar = controlIsEnemy(bases.big.control);
  const ignoreSustMeStar = controlIsEnemy(bases.me.control);
  const ignoreSustMiddleStar = controlIsEnemy(bases.middle.control);
  const ignoreSustEnemyStar = controlIsEnemy(bases.enemy.control);

  energize_self_star(targets, energizing, stars.big, ignoreSustBigstar);
  energize_self_star(targets, energizing, stars.middle, ignoreSustMiddleStar);
  energize_self_star(targets, energizing, stars.me, ignoreSustMeStar);
  energize_self_star(targets, energizing, stars.enemy, ignoreSustEnemyStar);

  for (const fragment of fragments) {
    energize_self_fragment(targets, energizing, fragment);
  }
}

function energize_self_fragment(
  targets: Target[],
  energizing: Vec,
  fragment: Fragment
) {
  const { myships, bases } = collections;

  const myshipsnearfragment = ships_not_in(myships, energizing).filter(
    (s) => canEnergize(s, fragment.position) && canEnergize(s, bases.me)
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
  targets: Target[],
  energizing: Vec,
  star: Star,
  ignoreSust = false
): void {
  const { myships, bases } = collections;

  const myshipsInRangeOfStar = sortByIsMovingToHeal(
    ships_not_in(myships, energizing).filter((s) => canEnergize(s, star))
  );

  let currentExtraStarEnergy = sustainableStarSelfingAmount(star);
  //I can actually take more because it will sustain 2 constant farmers at 900 aswell
  //or in the case of big star: 9 constant farmers at 2900 energy
  //however, we still want it to grow.
  //so only 50 for normal stars and 66 for big stars to make sure it grows.
  if (
    star.energy_capacity === 1000 &&
    star.energy > star.energy_capacity - 50
  ) {
    const additionalFarmable = star.energy - (star.energy_capacity - 50);
    currentExtraStarEnergy += additionalFarmable;
  } else if (
    star.energy_capacity === 3000 &&
    star.energy > star.energy_capacity - 66
  ) {
    const additionalFarmable = star.energy - (star.energy_capacity - 66);
    currentExtraStarEnergy += additionalFarmable;
  }
  //some conditions here. in particular early game mid star farming
  const ignoreSustainable = ignoreSust || myshipsInRangeOfStar.length === 1;

  for (const ship of myshipsInRangeOfStar) {
    const transferedEnergy = gainFromSelfing(ship);
    if (
      notFull(ship) &&
      (ignoreSustainable || currentExtraStarEnergy - transferedEnergy > 0)
    ) {
      targets[ship.index] = ship; //energize self
      energizing.push(ship.index);
      currentExtraStarEnergy -= transferedEnergy;
    }
  }
}

function maybeBoostInstead(targets: Target[], energizing: Vec, star: Star) {
  const { myships } = collections;

  const myshipsInRangeOfStar = ships_not_in(myships, energizing).filter((s) =>
    canEnergize(s, star)
  );

  //half the time the ship would not take from the star
  const sumEnergyTakenPerTick =
    0.5 * sum(myshipsInRangeOfStar.map(gainFromSelfing));

  const currentExtraStarEnergy = sustainableStarSelfingAmount(star);
  if (sumEnergyTakenPerTick <= currentExtraStarEnergy) return; //no need

  for (const ship of myshipsInRangeOfStar) {
    targets[ship.index] = star; //boost star
    energizing.push(ship.index);
  }
}
