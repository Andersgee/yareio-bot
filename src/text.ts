import { add, mul } from "./vec";
/**
 * Return points forming the string sentence centered around point place
 */
export default function textpoints(
  sentence: string,
  place: Vec2,
  scale: number
): Vec2s {
  const sentencearray = sentence.split("");
  const sentencepoints = sentencearray.map(spaced_and_centered_charpoints);

  //actually make a single list of points for entire sentence,
  //(rather than a list of points for each character)
  const flattened = sentencepoints.flat(1);

  const flipped: Vec2s = flattened.map((p) => [p[0], -p[1]]);

  //scale
  const scaled = flipped.map((p) => mul(p, scale));

  //place
  const placed_sentencepoints = scaled.map((p) => add(p, place));

  return placed_sentencepoints;
}

/**
 * center around origo
 */
function spaced_and_centered_charpoints(
  char: string,
  i: number,
  sentencearray: string[]
): Vec2s {
  const Nchars = sentencearray.length;
  const charWidth = 12.5;
  const charHeight = 14;
  return letter[char].map((p) =>
    add(p, [charWidth * i - (charWidth * Nchars) / 2, -charHeight / 2])
  );
}

interface Letter {
  [key: string]: Vec2s;
}

const letter: Letter = {
  G: [
    [9, 13],
    [6, 14],
    [3, 13],
    [1, 10],
    [0, 7],
    [0.5, 4.2],
    [1.8, 1.8],
    [4, 0],
    [7, 0],
    [8.5, 1],
    [9, 3.75],
    [9, 6.5],
    [6, 6.5],
  ],
};
