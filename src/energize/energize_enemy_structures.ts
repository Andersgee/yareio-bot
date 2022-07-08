import { collections } from "../collections";
import { ships_not_in } from "../find";
import { notEmpty, controlIsEnemy, canEnergize } from "../utils";
import { isWithinDist } from "../vec";

export default function energize_enemy_structures(
  targets: Target[],
  energizing: Vec
): void {
  const { bases, outposts, pylons } = collections;

  for (const base of [bases.big, bases.enemy, bases.me, bases.middle]) {
    energize_enemy_base(targets, energizing, base);
  }

  for (const outpost of [outposts.middle]) {
    energize_enemy_outpost(targets, energizing, outpost);
  }

  for (const pylon of [pylons.middle]) {
    energize_enemy_pylon(targets, energizing, pylon);
  }
}

function energize_enemy_base(
  targets: Target[],
  energizing: Vec,
  base: Base
): void {
  if (!controlIsEnemy(base.control)) return;

  const { myships } = collections;
  const myshipsNearBase = ships_not_in(myships, energizing).filter((s) =>
    canEnergize(s, base)
  );
  for (const ship of myshipsNearBase) {
    if (notEmpty(ship)) {
      targets[ship.index] = base;
      energizing.push(ship.index);
    }
  }
}

function energize_enemy_outpost(
  targets: Target[],
  energizing: Vec,
  outpost: Outpost
): void {
  if (!controlIsEnemy(outpost.control)) return;

  const { myships } = collections;
  const myshipsNearOutpost = ships_not_in(myships, energizing).filter((s) =>
    canEnergize(s, outpost)
  );

  for (const ship of myshipsNearOutpost) {
    if (notEmpty(ship)) {
      targets[ship.index] = outpost;
      energizing.push(ship.index);
    }
  }
}

function energize_enemy_pylon(
  targets: Target[],
  energizing: Vec,
  pylon: Pylon
): void {
  if (!controlIsEnemy(pylon.control)) return;

  const { myships } = collections;
  const myshipsNearOutpost = ships_not_in(myships, energizing).filter((s) =>
    canEnergize(s, pylon)
  );

  for (const ship of myshipsNearOutpost) {
    if (notEmpty(ship)) {
      targets[ship.index] = pylon;
      energizing.push(ship.index);
    }
  }
}
