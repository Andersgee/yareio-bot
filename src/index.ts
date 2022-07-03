import move from "./move/move";
import energize from "./energize/energize";
import sendcommands from "./sendcommands";
import sendendgamecommands from "./sendendgamecommands";

function main() {
  memory.Npathcalls = 0;
  const targetps = move();
  const targets = energize();
  sendcommands(targetps, targets);
  console.log(`tick ${tick}, Npathcalls: ${memory.Npathcalls}`);
}

//console.log(Object.keys(globalThis));
sendendgamecommands() || main();
