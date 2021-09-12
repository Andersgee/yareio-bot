import move from "./move";
import energize from "./energize";
import sendcommands from "./sendcommands";
import gamestage from "./gamestage";

function main() {
  gamestage();
  const [targetpositions, nfarmers, nmidfarmers] = move();
  const targets = energize(nfarmers, nmidfarmers);
  sendcommands(targetpositions, targets);
}

main();
