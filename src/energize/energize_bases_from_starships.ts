import collections from "../collections";
import { ships_not_in, ship_is_in_ships, ship_is_not_in_ships } from "../find";
import { constructGraph, path_firstavailable } from "../graph";
import {
  canTransfer,
  isFull,
  controlIsMe,
  notEmpty,
  transferamount,
  isEmpty,
} from "../utils";
import { isWithinDist } from "../vec";

export default function energize_bases_from_starships(
  targets: targets,
  energizing: Vec
): void {
  const { stars, bases, myships } = collections;

  energize_base_from_star_chain(targets, energizing, stars.me, bases.me);
  energize_base_from_star_chain(targets, energizing, stars.big, bases.big);
  energize_base_from_star_chain(targets, energizing, stars.enemy, bases.enemy);

  energize_base_from_midfarm_point(
    targets,
    energizing,
    stars.middle,
    bases.middle
  );

  //targets[myships[0].index] = myships[2];
}

function energize_base_from_star_chain(
  targets: targets,
  energizing: Vec,
  star: Star,
  base: Base
): void {
  const { myships } = collections;
  if (!controlIsMe(base.control)) return;

  const sourceShips = ships_not_in(myships, energizing).filter((s) =>
    isWithinDist(star.position, s.position)
  );
  const sourceShipsIndexes = sourceShips.map((s) => s.index);

  const destinationShips = ships_not_in(myships, energizing).filter((s) =>
    isWithinDist(base.position, s.position)
  );
  if (destinationShips.length < 1) return;
  const destinationShipsIndexes = destinationShips.map((s) => s.index);

  const graphShips = ships_not_in(myships, energizing);

  const sending: Vec = [];
  const recieving: Vec = [];
  sources: for (const sourceShip of sourceShips) {
    /** destination ships that can recieve at least one more transfer */
    const availableDestinationShips = ships_not_in(destinationShips, recieving);
    if (availableDestinationShips.length < 1) return;

    /** prune away sources, desinations and those already sending or recieving */
    const ignoreIndexes = sourceShipsIndexes
      .concat(destinationShipsIndexes)
      .concat(sending)
      .concat(recieving);
    let availableGraphShips = ships_not_in(graphShips, ignoreIndexes);
    availableGraphShips.push(sourceShip); //add back current sourceShip
    availableGraphShips = availableGraphShips.concat(availableDestinationShips); //add back available desinationships

    const G = constructGraph(availableGraphShips);
    const chainShips = path_firstavailable(
      graphShips,
      G,
      sourceShip,
      availableDestinationShips
    );

    //console.log(`chain: ${chainShips.map((s) => s.index + 1)}`);

    if (chainShips.length < 2) return;

    //we now know there is a chain from star to base.
    //but a ship in between might be empty

    for (let i = 0; i < chainShips.length - 1; i++) {
      if (isEmpty(chainShips[i])) continue sources;

      const sender = chainShips[i];
      const reciever = chainShips[i + 1]; //next in chain
      targets[sender.index] = reciever;
      energizing.push(sender.index);

      sending.push(sender.index);
      recieving.push(reciever.index);

      //sender.shout("s");
    }

    const destinationShip = chainShips[chainShips.length - 1];
    if (notEmpty(destinationShip)) {
      targets[destinationShip.index] = base; //energize base
      recieving.push(destinationShip.index); //might not actually want to make this "busy" in case I want to send more to it...

      //destinationShip.shout("d");
    }
  }

  return;
}

function energize_base_from_midfarm_point(
  targets: targets,
  energizing: Vec,
  star: Star,
  base: Base
): void {
  const { myships } = collections;
  if (!controlIsMe(base.control)) return;

  const ships = ships_not_in(myships, energizing).filter(
    (s) =>
      isWithinDist(star.position, s.position) &&
      isWithinDist(base.position, s.position)
  );

  for (const ship of ships) {
    if (isFull(ship)) {
      targets[ship.index] = base; //energize base
      energizing.push(ship.index);
    }
  }

  return;
}
