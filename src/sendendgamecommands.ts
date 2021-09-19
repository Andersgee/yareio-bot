import collections from "./collections";

export default function sendendgamecommands(): void {
  const { myships, bases, stars } = collections;
  for (const ship of myships) {
    if (ship.energy === 0) {
      ship.move(stars.middle.position);
      ship.energize(ship);
    } else {
      ship.move(bases.enemy.position);
      ship.energize(bases.enemy);
    }
  }
}
