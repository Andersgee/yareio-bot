import { collections } from "./collections";

export default function sendcommands(
  targetps: Vec2[],
  targets: Target[]
): void {
  const { myships } = collections;
  for (const [i, ship] of myships.entries()) {
    targetps[i] && ship.move(targetps[i]); //maybe jump if targetps is out of range?
    targets[i] && ship.energize(targets[i]);
  }
}
