import getCollections from "./collections";
import energize_farm from "./energize_farm";
import { constructGraph } from "./graph";

import move_farm from "./move_farm";
import move_strategic from "./move_strategic";
import move_combat from "./move_combat";

import energize_strategic from "./energize_strategic";
import energize_combat from "./energize_combat";

import getPoints from "./points_of_interest";

const collections = getCollections();
//const points = getPoints();

function main() {
  const G = constructGraph(collections.myships);
  //const { myships, stars, bases } = collections;

  const farming: Vec = [];
  const preparing = move_farm(G, farming);
  move_strategic(G, farming.concat(preparing));
  move_combat(G);

  const energizing: Vec = [];
  energize_farm(collections, G, energizing);
  energize_strategic();
  energize_combat(collections, G, energizing);

  //collections.myships.forEach((s) => s.shout(JSON.stringify(energizing)));
}

main();
