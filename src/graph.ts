import { falses, newVec, popfirst, pushfirst, dist, minimum, any } from "./vec";
import { shipFromIndex } from "./find";

import collections from "./collections";
const G = constructGraph(collections.myships);
export default G;

/**
 * ```raw
 * Get the ships that make the shortest transfer path from src
 * to the FIRST reachable destination of destinations.
 *
 *
 * Return a vector [src,ship1, ship2, dest]
 * or empty vector [] if no path exist to any of the desinations
 * ```
 */
export function path_firstavailable(
  ships: Ships,
  G: Graph,
  src: Ship,
  destinations: Ships
): Ships {
  const emptypathships: Ships = [];
  for (const dest of destinations) {
    const pathships = path(ships, G, src, dest);
    if (pathships.length > 0) {
      return pathships;
    }
  }
  return emptypathships;
}

/**
 * ```raw
 * Get the ships that make the shortest transfer path from src
 * to the CLOSEST reachable destination of destinations.
 * (as compared by distance from src to destination)
 *
 *
 * Return a vector [src,ship1, ship2, dest]
 * or empty vector [] if no path exist to any of the desinations
 * ```
 */
export function path_byclosestavailabledestination(
  ships: Ships,
  G: Graph,
  src: Ship,
  destinations: Ships
): Ships {
  const empty_pathships: Ships = [];
  const available_pathships: Ships[] = [];

  for (const dest of destinations) {
    const pathships = path(ships, G, src, dest);
    if (pathships.length > 0) {
      available_pathships.push(pathships);
    }
  }

  if (available_pathships.length > 0) {
    const dest_distances: Vec = [];
    for (const pathships of available_pathships) {
      const dest = pathships[pathships.length - 1];
      dest_distances.push(dist(src.position, dest.position));
    }

    const i = minimum(dest_distances).index;
    return available_pathships[i];
  }
  return empty_pathships;
}

/**
 * ```raw
 * Get the ships that make the shortest transfer path from src to dest
 *
 * Return a vector [src, ship1, ship2, dest]
 * or empty vector [] if no path exist to dest
 * ```
 */
export function path(
  ships: Ships,
  G: Graph,
  srcship: Ship,
  destship: Ship
): Ships {
  memory.Npathcalls += 1;
  const prev = shortestPathBfs(G, srcship.index, destship.index);
  const path = pathFromPrevious(prev, srcship.index, destship.index);

  /*
  console.log("src: ", srcship.index);
  console.log("dest: ", destship.index);
  console.log("prev: ", [...prev.entries()]);
  console.log("path: ", path);
*/
  const pathShips = path.map((index) => shipFromIndex(ships, index));
  if (pathShips.some((s) => s === undefined)) {
    console.log("fallback, undefined ship from index");
    return [];
  } else {
    return pathShips as Ships;
  }
}

function shortestPathBfs(G: Graph, src: number, dest: number) {
  const previous = new Map<number, number>();
  const visited = new Set();
  const queue: number[] = [];
  queue.push(src);
  visited.add(src);

  while (queue.length > 0) {
    const node = queue.shift();
    if (node === undefined) {
      break;
    }

    if (node === dest) {
      return previous;
    }

    const neighbors = G.get(node);

    if (neighbors === undefined) {
      // "node" (someones neighbor) might be outside G.
      // notes to self:
      // because of the way I construct the graph, a node might have physical
      // neighbors outside the graph G which im interested in.
      // example: a ship near a star, it has many neighbors also near the same star,
      // we dont include those neighbors in G but they will be listed as neighbor to the node
      // main takeaway:
      // continue here instead of break.
      // additional note:
      // one could prune away the unwanted neighbors but its so nice to just use neighbors = precalculated "nearbyfriends"
      continue;
    }
    for (const neighbour of neighbors) {
      if (!visited.has(neighbour)) {
        previous.set(neighbour, node);
        queue.push(neighbour);
        visited.add(neighbour);
      }
    }
  }
  return previous;
}

function pathFromPrevious(
  previous: Map<number, number>,
  src: number,
  dest: number
) {
  const path = [dest];
  let i = dest;
  while (i !== src) {
    const p = previous.get(i);
    if (p === undefined) {
      break;
    }
    path.unshift(p);
    i = p;
  }
  if (path[0] === src) {
    return path;
  } else {
    return [];
  }
}

/**
 * ```raw
 * construct a graph (Map) of indexes connecting ships.
 *
 * For example: G.get(0) is a list [2,3,5] of which ship indexes are within range of index 0
 * ```
 */
export function constructGraph(ships: Ships): Graph {
  return new Map(
    ships.map((s) => [s.index, s.nearbyfriends.map((friend) => friend.index)])
  );
}
