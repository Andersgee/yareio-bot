import move_farm from "./move_farm";
import move_strategic from "./move_strategic";
import move_combat from "./move_combat";

import energize_farm from "./energize_farm";
import energize_strategic from "./energize_strategic";
import energize_combat from "./energize_combat";

function main() {
  const farming: Vec = [];
  const preparing = move_farm(farming);
  move_strategic(farming.concat(preparing));
  move_combat();

  const energizing: Vec = [];
  energize_farm(energizing);
  energize_strategic();
  energize_combat();

  //collections.myships.forEach((s) => s.shout(JSON.stringify(energizing)));
}

main();
