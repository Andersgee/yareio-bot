import { dist, isWithinDist, minimum } from "./vec";

const collections = getCollections();
export { collections };

function getCollections(): Collections {
  const playerids = getPlayerIds();
  const shapes = getShapes();
  const bases = getBases();
  const outposts = getOutposts();
  const stars = getStars();
  const { myships, enemyships } = getShips();
  const pylons = getPylons();
  const info = getInfo(playerids, outposts, pylons);

  return {
    playerids,
    shapes,
    bases,
    outposts,
    stars,
    myships,
    enemyships,
    info,
    pylons,
  };
}

function getShapes(): Shapes {
  const bases = getBases();

  //const me = base.shape;
  //const enemy = enemy_base.shape;
  return { me: bases.me.shape, enemy: bases.enemy.shape };
}

function getBases(): Bases {
  const playerids = getPlayerIds();

  //base_zxq.player_id
  //base_a2c.player_id
  const myBase = base_zxq.player_id === playerids.me ? base_zxq : base_a2c;
  const notMyBase = base_zxq.player_id === playerids.me ? base_a2c : base_zxq;
  //console.log("base_zxq.player_id", base_zxq.player_id);

  return {
    me: myBase,
    enemy: notMyBase,
    middle: base_p89,
    big: base_nua,
  };
}

function getOutposts(): Outposts {
  return {
    middle: outpost_mdo,
  };
}

function getPylons(): Pylons {
  return {
    middle: pylon_u3p,
  };
}

function getPlayerIds(): Playerids {
  const me = this_player_id;
  const enemy = players.p1 === me ? players.p2 : players.p1;
  return { me, enemy };
}

function getShips() {
  //work with arrays instead of objects
  const playerids = getPlayerIds();
  const ships = Array.from(Object.values(spirits)) as Ships;
  const myships = ships.filter(
    (ship) => ship.id.startsWith(playerids.me) && ship.hp > 0
  );
  const enemyships = ships.filter(
    (ship) => ship.id.startsWith(playerids.enemy) && ship.hp > 0
  );

  //myships
  for (const [index, ship] of myships.entries()) {
    ship.index = index;

    ship.nearbyfriends_includingself = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 200)
    );
    ship.nearbyfriends = myships.filter(
      (s) => isWithinDist(ship.position, s.position, 200) && index !== s.index
    );
    ship.nearbyfriends300 = myships.filter(
      (s) => isWithinDist(ship.position, s.position, 300) && index !== s.index
    );
    ship.nearbyfriends20 = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 20)
    );
    ship.nearbyfriends40 = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 40)
    );
    ship.nearbyfriends60 = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 60)
    );

    ship.nearbyenemies = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 200)
    );
    ship.nearbyenemies220 = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 220)
    );
    ship.nearbyenemies240 = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 240)
    );
    ship.nearbyenemies260 = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 260)
    );
    ship.nearbyenemies300 = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 300)
    );
    ship.nearbyenemies320 = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 320)
    );
    ship.nearbyenemies400 = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 400)
    );

    const allfriends = myships.filter((s) => s.index !== index); //all myships except self
    ship.nearestfriend =
      allfriends[
        minimum(allfriends.map((s) => dist(s.position, ship.position))).index
      ];

    ship.nearestenemy =
      enemyships[
        minimum(enemyships.map((s) => dist(s.position, ship.position))).index
      ];
  }

  //enemyships
  for (const [index, ship] of enemyships.entries()) {
    ship.index = index;

    ship.nearbyfriends_includingself = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 200)
    );
    ship.nearbyfriends = enemyships.filter(
      (s) => isWithinDist(ship.position, s.position, 200) && index !== s.index
    );
    ship.nearbyfriends300 = myships.filter(
      (s) => isWithinDist(ship.position, s.position, 300) && index !== s.index
    );

    ship.nearbyfriends20 = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 20)
    );
    ship.nearbyfriends40 = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 40)
    );
    ship.nearbyfriends60 = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 60)
    );

    ship.nearbyenemies = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 200)
    );
    ship.nearbyenemies220 = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 220)
    );
    ship.nearbyenemies240 = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 240)
    );
    ship.nearbyenemies260 = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 260)
    );
    ship.nearbyenemies300 = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 300)
    );
    ship.nearbyenemies400 = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 400)
    );

    const allfriends = enemyships.filter((s) => s.index !== index); //all myships except self
    ship.nearestfriend =
      allfriends[
        minimum(allfriends.map((s) => dist(s.position, ship.position))).index
      ];

    ship.nearestenemy =
      myships[
        minimum(myships.map((s) => dist(s.position, ship.position))).index
      ];
  }

  return { myships, enemyships };
}

function getStars(): Stars {
  const bases = getBases();
  const dist_base2zxq = dist(bases.me.position, star_zxq.position);
  const dist_base2a2c = dist(bases.me.position, star_a2c.position);
  //const dist_base2p89 = vec.dist(base.position, star_p89.position)

  const stars = {
    me: star_zxq,
    middle: star_p89,
    enemy: star_a2c,
    big: star_nua,
  };

  if (dist_base2a2c < dist_base2zxq) {
    stars.me = star_a2c;
    stars.enemy = star_zxq;
  }
  return stars;
}

function getInfo(
  playerids: Playerids,
  outposts: Outposts,
  pylons: Pylons
): Info {
  const outpostcontrolIsMe = playerids.me === outposts.middle.control;
  const outpostcontrolIsEnemy = playerids.enemy === outposts.middle.control;

  const pyloncontrolIsMe = playerids.me === pylons.middle.control;
  const pyloncontrolIsEnemy = playerids.enemy === pylons.middle.control;
  return {
    outpostcontrolIsMe,
    outpostcontrolIsEnemy,
    pyloncontrolIsMe,
    pyloncontrolIsEnemy,
  };
}
