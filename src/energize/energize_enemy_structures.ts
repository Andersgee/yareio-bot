import collections from "../collections";
import { ships_not_in } from "../find";
import { notEmpty, controlIsEnemy } from "../utils";
import { isWithinDist } from "../vec";

export default function energize_enemy_structures(
  targets: targets,
  energizing: Vec
): void {
  energize_enemy_bases(targets, energizing);
  energize_enemy_outposts(targets, energizing);
  energize_enemy_pylons(targets, energizing);
}

function energize_enemy_bases(targets: targets, energizing: Vec): void {
  const { myships, bases, playerids } = collections;
  for (const base of [bases.big, bases.enemy, bases.me, bases.middle]) {
    if (!controlIsEnemy(base.control)) continue;

    const myshipsNearBase = myships.filter((s) =>
      isWithinDist(s.position, base.position)
    );
    for (const ship of ships_not_in(myshipsNearBase, energizing)) {
      if (notEmpty(ship)) {
        targets[ship.index] = base;
        energizing.push(ship.index);
      }
    }
  }
}

function energize_enemy_outposts(targets: targets, energizing: Vec): void {
  const { myships, outposts, playerids } = collections;
  for (const outpost of [outposts.middle]) {
    if (!controlIsEnemy(outpost.control)) continue;

    const myshipsNearBase = myships.filter((s) =>
      isWithinDist(s.position, outpost.position)
    );
    for (const ship of ships_not_in(myshipsNearBase, energizing)) {
      if (notEmpty(ship)) {
        targets[ship.index] = outpost;
        energizing.push(ship.index);
      }
    }
  }
}

function energize_enemy_pylons(targets: targets, energizing: Vec): void {
  const { myships, pylons, playerids } = collections;
  for (const pylon of [pylons.middle]) {
    if (!controlIsEnemy(pylon.control)) continue;

    const myshipsNearBase = myships.filter((s) =>
      isWithinDist(s.position, pylon.position)
    );
    for (const ship of ships_not_in(myshipsNearBase, energizing)) {
      if (notEmpty(ship)) {
        targets[ship.index] = pylon;
        energizing.push(ship.index);
      }
    }
  }
}
