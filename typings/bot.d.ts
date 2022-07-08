declare type Vec = number[];
declare type Graph = Map<number, Vec>;

declare type Target = Ship | Base | Outpost | Star | Pylon | Vec2;

declare type Orders = {
  moving: Vec;
  farmPositioned: Vec;
  defPositioned: Vec;
  attackPositioned: Vec;
  targetps: Vec2[];
  targets: Target[];
  avoiding: Vec;
};

interface Collections {
  playerids: Playerids;
  shapes: Shapes;
  bases: Bases;
  outposts: Outposts;
  stars: Stars;
  myships: Ships;
  enemyships: Ships;
  info: Info;
  pylons: Pylons;
}

interface Ship_m {
  index: number;
  size: number;
  energy: number;
}

declare type Ships_m = Ship_m[];

interface Ship extends Spirit {
  index: number;

  /**
   * Nearest friend (not necessarily in range).
   */
  nearestfriend: Ship;
  /**
   * Nearest enemy.
   */
  nearestenemy: Ship;

  /**
   * Friendly ships in range 200 (including self).
   */
  nearbyfriends_includingself: Ships;
  /**
   * Friendly ships in range 200 (without self).
   */
  nearbyfriends: Ships;
  /**
   * Friendly ships in range 300 (without self).
   */
  nearbyfriends300: Ships;

  /**
   * Friendly ships in range 20 (including self).
   */
  nearbyfriends20: Ships;

  /**
   * Friendly ships in range 40 (including self).
   */
  nearbyfriends40: Ships;

  /**
   * Friendly ships in range 60 (including self).
   */
  nearbyfriends60: Ships;

  /**
   * Enemy ships in range.
   */
  nearbyenemies: Ships;

  /**
   * Enemy ships in range 220.
   */
  nearbyenemies220: Ships;

  /**
   * Enemy ships in range 240.
   */
  nearbyenemies240: Ships;

  /**
   * Enemy ships in range 260.
   */
  nearbyenemies260: Ships;

  /**
   * Enemy ships in range 300.
   */
  nearbyenemies300: Ships;

  /**
   * Enemy ships in range 320.
   */
  nearbyenemies320: Ships;

  /**
   * Enemy ships in 400 range.
   */
  nearbyenemies400: Ships;
}

declare type Ships = Ship[];

type Info = {
  outpostcontrolIsMe: boolean;
  outpostcontrolIsEnemy: boolean;
  pyloncontrolIsMe: boolean;
  pyloncontrolIsEnemy: boolean;
};

type Shapes = {
  [me: string]: string;
  [enemy: string]: string;
};

type Playerids = {
  me: string;
  enemy: string;
};

type Stars = {
  me: Star;
  enemy: Star;
  middle: Star;
  big: Star;
};

type Bases = {
  me: Base;
  enemy: Base;
  middle: Base;
  big: Base;
};

type Outposts = {
  middle: Outpost;
};

type Pylons = {
  middle: Outpost;
};
