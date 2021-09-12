import collections from "./collections";
import { maxStarFarmers } from "./utils";

export default function gamestage(): void {
  const { stars, myships } = collections;
  const shipsize = myships[0].size;
  const Nhome_max = maxStarFarmers(stars.me, shipsize);

  memory.gamestage = memory.gamestage || 0;
  if (memory.gamestage < 1 && myships.length > Nhome_max * 2 + 4) {
    memory.gamestage = 1;
  }
  if (memory.gamestage < 2 && myships.length > Nhome_max * 2 * 2) {
    memory.gamestage = 2;
  }
}
