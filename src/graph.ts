import { falses, newVec, popfirst, pushfirst, dist, minimum } from "./vec";
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
  const prev = solve(G, srcship.index, destship.index);
  const path = reconstructPath(prev, srcship.index, destship.index);
  return path.map((i) => shipFromIndex(ships, i));
}

function solve(G: Graph, src: number, dest: number) {
  const visited = falses(G.size);
  visited[src] = true;

  const prev = newVec(G.size, -1);

  const q = [src];
  while (q.length > 0) {
    const node = popfirst(q); //remove first from q

    const neighbors = G.get(node) || []; //if src isnt even in G

    for (const i of neighbors) {
      if (!visited[i]) {
        q.push(i); //add at end
        visited[i] = true;
        prev[i] = node;
      }
    }
    if (node === dest) {
      break;
    }
  }
  return prev;
}

function reconstructPath(prev: Vec, src: number, dest: number): Vec {
  const path = [dest];
  let i = dest;
  while (i !== src) {
    if (prev[i] > -1) {
      pushfirst(path, prev[i]);
      i = prev[i];
    } else {
      break;
    }
  }

  if (path[0] === src) {
    //If there is a path between src and dest, first item will be equal to src
    //However, dont actually keep self as first...
    //return path.slice(1);
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
  /*
  const positions = ships.map((s) => s.position);

  //nodes
  const indexes = ships.map((s) => s.index);
  //const indexes = ships.map((s, i) => i);

  

  //edges for each node
  const G = indexes.map((a, i) => {
    const node = positions[i];
    const edges = indexes.filter(
      (b, j) => i !== j && isWithinDist(node, positions[j])
    ); //ship.index of all nearby nodes except self
    return edges;
  });

  //instead of a simple array such as [[5,7], [1,7], [1,5]]
  //make it a Map (with ship.index as keys)
  //1=>[5,7]
  //5=>[1,7]
  //7=>[1,5]
  //M.get(5) gives [1,7]
  const M = new Map(G.map((edges, i) => [indexes[i], edges]));
  return M;
  */
}
