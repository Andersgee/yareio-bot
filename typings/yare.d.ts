//based on https://yare.io/documentation

declare type Vec2 = [x: number, y: number];

//Game's global variables
declare const memory: { gamestage: number }; //Empty object. Use it to store values across ticks
declare const base: Base; //object, Your base
declare const enemy_base: Base; //object, Enemy base
declare const star_zxq: Star; //object, Top-left corner star
declare const star_a1c: Star; //object, Bottom-right corner star
declare const star_p89: Star; //object, Star in the middle
declare const outpost: Outpost; //object,
declare const my_spirits: Spirit[]; //array,
declare const spirits: Record<string, Spirit>; //object, Contains all spirits. Access them by their id – spirits[‘jane_7’]
declare const tick: number; //Current game tick (e.g. 75). 1 tick = 600ms

//these not mentioned in documentation. yep. they DO exist.
//but seems to exist according to https://github.com/Jules-Bertholet/yareio-typescript-typings
declare const this_player_id: string;
declare const players: { p1: string; p2: string };

//declare const CODE_VERSION: string;

//Spirit
declare interface Spirit {
  /**
   * ```raw
   * username_number
   * for example: "jane_7"
   * ```
   */
  id: string;

  /**
   * ```raw
   * spirit’s [x, y] coordinates
   * for example: [750, 900]
   * ```
   * */
  position: Vec2;

  /**
   * ```raw
   * squares: 10
   * triangles: 3
   * circles: 1-100 (circles can merge, increasing size)
   * ```
   */
  size: number;

  /**energy_capacity is always size*10 */
  energy_capacity: number;

  /**
   * ```raw
   * spirit’s current energy
   * ```
   * */
  energy: number;

  /**
   * ```raw
   * when alive: 1
   * when dead: 0
   * ```
   */
  hp: number;
  /**Custom string assignable via set_mark() method.*/
  mark: string;
  /**id of most recently energized object */
  last_energized: string;
  /**
   * Sight
   */
  sight: Sight;

  /**
   * ```raw
   * transfers energy to target.
   * range: 200 units.
   * one of three things can happen:
   *
   * #1. target is self:
   * Self gain spirit.size (from a star).
   *
   * #2. target is friendly spirit or base:
   * Self lose spirit.size.
   * Target gain spirit.size.
   *
   * #3. target is enemy spirit or base:
   * Self lose spirit.size.
   * Target lose spirit.size*2.
   * ```
   */
  energize: (target: Spirit | Base | Outpost | Star) => void;

  /**
   * ```raw
   * Moves spirit to target.
   * speed: 20 units per tick.
   * ```
   */
  move: (target: Vec2) => void;

  /**
   * ```raw
   * Only for circles.
   * Merges a spirit into another friendly spirit.
   * range: 10 units.
   * ```
   */
  merge: (target: Spirit) => void;
  /**
   * ```raw
   * Only for circles.
   * Divides spirit back into all the spirits that were merged into it.
   * ```
   */
  divide: () => void;
  /**
   * ```raw
   * Only for squares.
   * Teleports spirit to target location.
   * cost: distance/5.
   *
   * target can not be (in either x or y)
   * - within 50 distance from base/outpost
   * - withing 100 distance from star.
   * ```
   */
  jump: (target: Vec2) => void;
  /**
   * ```raw
   * Only for triangles.
   * Spirit explodes, killing itself.
   * Deal 10 damage to enemy spirits within 160 radius.
   * ```
   */
  explode: () => void;
  /**
   * display a message above the spirit
   */
  shout: (message: string) => void;
  /**
   * custom string (that stays) on this spirit
   */
  set_mark: (label: string) => void;
}

declare interface Sight {
  friends: string[];
  enemies: string[];
  structures: string[];
}

//Base
declare interface Base {
  /**
   * ```raw
   * base_username
   * for example: "base_jane"
   * ```
   */
  id: string;

  /**always "base" */
  structure_type: string;

  /**
   * ```raw
   * player1: [1600, 700]
   * player2: [2600, 1700]
   * ```
   */
  position: Vec2;

  /** always 40 */
  size: number;

  /**
   * ```raw
   * the energy_capacity of a base is different depending on spirit types used:
   * circles: 400
   * squares: 1000
   * triangles: 600
   * ```
   */
  energy_capacity: number;

  /**base's current energy */
  energy: number;

  /**
   * ```raw
   * starts at 5.
   * Decreases by 1 if not enough energy to "tank" attacks.
   * Game ends when base has 0 hp.
   * ```
   */
  hp: number;

  /**
   * Sight
   * radius: 400
   */
  sight: Sight;

  /**
   * not mentioned in docs.
   */
  collision_radius: number;

  /**
   * not mentioned in docs.
   */
  player_id: string;

  /**
   * not mentioned in docs. but "circles", "squares" or "triangles"
   */
  shape: string;
}

//Outpost
declare interface Outpost {
  /**always "outpost_mdo" */
  id: string;

  /** always “outpost“*/
  structure_type: string;

  /** [2200, 1100]*/
  position: Vec2;

  /** always 20*/
  size: number;

  /** 1000*/
  energy_capacity: number;

  /**
   * ```raw
   * starts at 0
   * can be energized
   * ```
   */
  energy: number;

  /**
   * ```raw
   * The outpost will energize(random target) within its range (every tick???)
   * range: 400
   *
   * if (outpost.energy >= 500) then
   * range: 600
   * ```
   */
  range: number;
  /**
   * ```raw
   * id of the player controlling the outpost
   * for example: "jane"
   * ```
   */
  control: string;

  /**Sight */
  sight: Sight;

  /**
   * not mentioned in docs.
   */
  collision_radius: number;
}

//Star
declare interface Star {
  /**
   * ```raw
   * “star_zxq“, “star_a1c” or "star_p89"
   *
   * ```
   */
  id: string;

  /**always "star" */
  structure_type: string;

  /**stars current energy */
  energy: number;

  /**1000 */
  energy_capacity: number;

  /**
   * ```raw
   * star_zxq: [1000,1000]
   * star_a1c: [3200,1400]
   * star_p89: [2000,1300]
   * ```
   */
  position: Vec2;

  /**
   * ```raw
   * Ticks until star starts generating energy.
   * Middle star "star_p89" only starts generating energy after 100 ticks
   * ```
   */
  active_in: number;

  /**
   * ```raw
   * star_p89: 80
   * star_a1c and star_zxq: 220
   * ```
   */
  size: number;

  /**
   * not mentioned in docs.
   */
  collision_radius: number;
}
