declare type Vec = number[];
declare type Graph = Map<number, Vec>;

declare const collections: Collections;
declare const points: Points;

interface Points {
  homefarm: Vec2[];
  middlefarm: Vec2[];
  middlefarm_outside: Vec2[];
  middle: {
    me: Vec2;
    between: Vec2;
    enemy: Vec2;
  };
  middle_outside: {
    me: Vec2;
    between: Vec2;
    enemy: Vec2;
  };
}

interface Collections {
  playerids: Playerids;
  shapes: Shapes;
  bases: Bases;
  outposts: Outposts;
  stars: Stars;
  myships: Ships;
  enemyships: Ships;
  info: Info;
}

interface Collections {
  playerids: Playerids;
  shapes: Shapes;
  bases: Bases;
  outposts: Outposts;
  stars: Stars;
  myships: Ships;
  enemyships: Ships;
  info: Info;
}

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
   * Friendly ships in range (without self).
   */
  nearbyfriends: Ships;

  /**
   * Enemy ships in range.
   */
  nearbyenemies: Ships;
}

declare type Ships = Ship[];

interface Info {
  outpostcontrolIsMe: boolean;
  outpostcontrolIsEnemy: boolean;
}

interface Shapes {
  me: string;
  enemy: string;
}

interface Playerids {
  me: string;
  enemy: string;
}

interface Stars {
  me: Star;
  middle: Star;
  enemy: Star;
}

interface Bases {
  me: Base;
  enemy: Base;
}

interface Outposts {
  middle: Outpost;
}
