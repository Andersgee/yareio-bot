import { collections } from "../collections";
import { isWithinDist, sum } from "../vec";

const EXPLODE_RANGE = 160;

export default function explode(): Vec {
  const { myships, enemyships } = collections;

  const explodeindexes: Vec = [];
  for (const ship of myships) {
    const enemiesInExplodeRange = enemyships.filter((s) =>
      isWithinDist(s.position, ship.position, EXPLODE_RANGE)
    );

    const dmgdealt = sum(
      enemiesInExplodeRange.map((s) => Math.min(s.energy, 10))
    );

    if (ship.energy === 0 && dmgdealt >= 10) {
      explodeindexes.push(ship.index);
    }
  }
  return explodeindexes;
}
