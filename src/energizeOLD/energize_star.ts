import collections from "../collections";
import { ships_not_in } from "../find";
import { isFull, sustainableStarEnergy, transferamount } from "../utils";
import { isWithinDist } from "../vec";

export default function energize_star(
  targets: targets,
  energizing: Vec,
  boosting: Vec,
  stayfull = false
): void {
  const { myships, stars } = collections;
  const shipsize = myships[0].size;
  //const Nsustainableselfers = sustainableStarFarmers(stars.me, shipsize);
  //const Nmaxselfers = maxStarFarmers(stars.me, myships[0].size);

  let condition = (s: Ship) => s.energy >= 0;
  if (stayfull) {
    condition = (s: Ship) => isFull(s);
  }

  const shipsnearstar = ships_not_in(myships, energizing).filter((s) =>
    isWithinDist(s.position, stars.me.position)
  ); //note this might not actually be the amount of farmers.. should do this after I know number of selfers...

  const Nselfers = shipsnearstar.length / 2; //they only farm every other tick
  const sustainableEnergy = sustainableStarEnergy(stars.me, Nselfers, shipsize);
  let currentEnergy = stars.me.energy;

  for (const ship of shipsnearstar) {
    if ((currentEnergy < sustainableEnergy && condition(ship)) || tick < 21) {
      currentEnergy += transferamount(ship);
      targets[ship.index] = stars.me;
      energizing.push(ship.index);
      boosting.push(ship.index);
    }
  }
}
