import collections from "./collections";
import energize_enemy from "./energize_enemy";
import energize_self from "./energize_self";
import energize_outpost from "./energize_outpost";
import energize_friend from "./energize_friend";
import energize_base from "./energize_base";
/**
 * ```raw
 * The general idea is:
 * 1. Energize enemy and enemybase(2:1)
 * 2. Energize self (1:1)
 * 3. Energize outpost (tricky... when it attacks its 2:1 but when enemy attacks it its 1:2)
 * 4. Energize friends (1:1)
 * 5. Energize base (1:5 or something)
 * ```
 */
export default function energize(
  nfarmers: number,
  nmidfarmers: number
): targets {
  const { myships } = collections;
  const targets: targets = new Array(myships.length);

  const busy: Vec = [];
  const attacking: Vec = [];
  energize_enemy(targets, attacking);
  energize_self(targets, busy, attacking, nfarmers, nmidfarmers);
  energize_outpost(targets, busy, attacking);
  energize_friend(targets, busy, attacking, nfarmers);
  energize_base(targets, busy, attacking, nfarmers);

  return targets;
}
