import move from "./move/move";
import energize from "./energize/energize";
import sendcommands from "./sendcommands";
import sendendgamecommands from "./sendendgamecommands";

function main() {
  memory.Npathcalls = 0;
  memory.movingToHealIds = memory.movingToHealIds ? memory.movingToHealIds : [];

  const orders: Orders = {
    targets: [],
    targetps: [],
    moving: [],
    farmPositioned: [],
    defPositioned: [],
    attackPositioned: [],
    avoiding: [],
  };

  move(orders);
  energize(orders);
  sendcommands(orders.targetps, orders.targets);
  //console.log(`tick ${tick}, Npathcalls ${memory.Npathcalls}`);
}

//console.log(Object.keys(globalThis));
sendendgamecommands() || main();
