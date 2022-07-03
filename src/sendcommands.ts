import collections from "./collections";

export default function sendcommands(targetps: Vec2s, targets: targets): void {
  const { myships } = collections;
  for (const [i, ship] of myships.entries()) {
    targetps[i] && ship.move(targetps[i]); //maybe teleport?
    targets[i] && ship.energize(targets[i]);
  }
}
