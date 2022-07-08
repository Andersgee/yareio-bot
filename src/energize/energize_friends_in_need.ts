import { collections } from "../collections";
import { ships_in, ships_not_in } from "../find";
import { canEnergize, transferamount } from "../utils";

export default function energize_friends_in_need(
  targets: Target[],
  energizing: Vec,
  attacking: Vec
): void {
  //heal_attackers_from_star_ships(targets, energizing, attacking);
  heal_attackers_from_nearby_friends(targets, energizing, attacking);
}

function heal_attackers_from_nearby_friends(
  targets: Target[],
  energizing: Vec,
  attacking: Vec
): void {
  const { myships } = collections;

  const myAttackingShips = ships_in(myships, attacking);

  for (const myAttacker of myAttackingShips) {
    const shipFriends300 = ships_not_in(
      myAttacker.nearbyfriends300,
      energizing
    );
    const shipFriends = shipFriends300.filter((s) =>
      canEnergize(s, myAttacker)
    );
    let requiredHeal =
      myAttacker.energy_capacity -
      myAttacker.energy +
      transferamount(myAttacker);

    for (const myHealer of shipFriends) {
      const healAmount = transferamount(myHealer);
      if (requiredHeal < healAmount) break;

      targets[myHealer.index] = myAttacker;
      energizing.push(myHealer.index);
      requiredHeal -= healAmount;
    }
  }
}
