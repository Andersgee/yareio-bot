import { collections } from "../collections";
import { ships_not_in, ship_is_in_ships, ship_is_not_in_ships } from "../find";
import { constructGraph, path_firstavailable } from "../graph";
import {
  canTransfer,
  isFull,
  controlIsMe,
  notEmpty,
  transferamount,
  isEmpty,
  canEnergize,
} from "../utils";
import { isWithinDist } from "../vec";
import { pointsLong } from "../pointsLong";

export default function energize_bases_from_starships(
  targets: Target[],
  energizing: Vec
): void {
  const { stars, bases, myships } = collections;

  energize_base_when_in_both_base_and_star_range(
    targets,
    energizing,
    bases.me,
    stars.me
  );
  energize_base_when_in_both_base_and_star_range(
    targets,
    energizing,
    bases.enemy,
    stars.enemy
  );
  energize_base_when_in_both_base_and_star_range(
    targets,
    energizing,
    bases.middle,
    stars.middle
  );

  //"star.big -> ship -> fragment -> ship -> base.me" chain
  energize_fragment_when_in_both_fragment_and_star_range(
    targets,
    energizing,
    stars.big,
    pointsLong.b2 //fragment point
  );
  energize_base_when_in_both_base_and_fragment_range(
    targets,
    energizing,
    bases.me,
    pointsLong.b2 //fragment point
  );
}

function energize_base_when_in_both_base_and_fragment_range(
  targets: Target[],
  energizing: Vec,
  base: Base,
  fragmentPoint: Vec2
): void {
  const { myships } = collections;

  const myshipsInRange = ships_not_in(myships, energizing).filter(
    (s) => canEnergize(s, fragmentPoint) && canEnergize(s, base)
  );

  for (const ship of myshipsInRange) {
    if (isFull(ship)) {
      targets[ship.index] = base;
      energizing.push(ship.index);
    }
  }

  return;
}

function energize_fragment_when_in_both_fragment_and_star_range(
  targets: Target[],
  energizing: Vec,
  star: Star,
  fragmentPoint: Vec2
): void {
  const { myships } = collections;

  const myshipsInRange = ships_not_in(myships, energizing).filter(
    (s) => canEnergize(s, fragmentPoint) && canEnergize(s, star)
  );

  for (const ship of myshipsInRange) {
    if (isFull(ship)) {
      //energize position on "ground", will "merge" with any existing fragment around this general area
      //TODO: find out what size this "area" is where it auto merges with existing fragment
      targets[ship.index] = fragmentPoint;
      energizing.push(ship.index);
    }
  }

  return;
}

function energize_base_when_in_both_base_and_star_range(
  targets: Target[],
  energizing: Vec,
  base: Base,
  star: Star
): void {
  if (!controlIsMe(base.control)) return;
  const { myships } = collections;

  const myshipsInRange = ships_not_in(myships, energizing).filter(
    (s) => canEnergize(s, base) && canEnergize(s, star)
  );

  for (const ship of myshipsInRange) {
    if (isFull(ship)) {
      targets[ship.index] = base; //energize base
      energizing.push(ship.index);
    }
  }

  return;
}

/*

function energize_base_from_star_chain(
  targets: Target[],
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
    // destination ships that can recieve at least one more transfer
    const availableDestinationShips = ships_not_in(destinationShips, recieving);
    if (availableDestinationShips.length < 1) return;

    // prune away sources, desinations and those already sending or recieving
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
*/
