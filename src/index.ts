import move from "./move";
import energize from "./energize";
import sendcommands from "./sendcommands";
import gamestage from "./gamestage";
import explode from "./explode";
import sendendgamecommands from "./sendendgamecommands";
import collections from "./collections";

function main() {
  if (collections.enemyships.length === 0 || collections.myships.length === 0) {
    sendendgamecommands();
  } else {
    gamestage();
    const [targetpositions, nfarmers, nmidfarmers] = move();
    const targets = energize(nfarmers, nmidfarmers);
    const explodeindexes = explode();
    sendcommands(targetpositions, targets, explodeindexes);
  }
}

//console.log(Object.keys(globalThis));
main();
