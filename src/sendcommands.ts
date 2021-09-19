import collections from "./collections";

export default function sendcommands(
  ps: Vec2[],
  ts: targets,
  explodeindexes: Vec = []
): void {
  const { myships } = collections;
  for (const [i, ship] of myships.entries()) {
    if (ps[i]) {
      if (isNaN(ps[i][0]) || isNaN(ps[i][1])) {
        ship.shout("NaN move");
      }
      ship.move(ps[i]); //maybe teleport?
    }
    if (ts[i]) {
      ship.energize(ts[i]);
    }
    if (explodeindexes.includes(i)) {
      ship.explode();
    }
  }
}
