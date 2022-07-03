import collections from "../collections";
import { ships_not_in } from "../find";
import { notEmpty, controlIsNeutral } from "../utils";
import { isWithinDist } from "../vec";

export default function energize_neutral_structures(
  targets: targets,
  energizing: Vec
): void {
  energize_neutral_bases(targets, energizing);
  energize_neutral_outposts(targets, energizing);
  //energize_neutral_pylons(targets, energizing);
}

function energize_neutral_bases(targets: targets, energizing: Vec): void {
  const { myships, bases } = collections;
  for (const base of [bases.big, bases.enemy, bases.me, bases.middle]) {
    if (!controlIsNeutral(base.control)) continue;
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

function energize_neutral_outposts(targets: targets, energizing: Vec): void {
  const { myships, outposts } = collections;
  for (const outpost of [outposts.middle]) {
    if (!controlIsNeutral(outpost.control)) continue;

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

function energize_neutral_pylons(targets: targets, energizing: Vec): void {
  const { myships, pylons } = collections;
  for (const pylon of [pylons.middle]) {
    if (!controlIsNeutral(pylon.control)) continue;

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
