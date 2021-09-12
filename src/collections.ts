import { dist, isWithinDist, minimum } from "./vec";

const collections = getCollections();
export default collections;

function getCollections(): Collections {
  const playerids = getPlayerIds();
  const shapes = getShapes();
  const bases = getBases();
  const outposts = getOutposts();
  const stars = getStars();
  const { myships, enemyships } = getShips();
  const info = getInfo(playerids, outposts);

  return {
    playerids,
    shapes,
    bases,
    outposts,
    stars,
    myships,
    enemyships,
    info,
  };
}

function getShapes(): Shapes {
  const me = base.shape;
  const enemy = enemy_base.shape;
  return { me, enemy };
}

function getBases(): Bases {
  return {
    me: base,
    enemy: enemy_base,
  };
}

function getOutposts(): Outposts {
  return {
    middle: outpost,
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

    ship.nearbyfriends = myships.filter(
      (s) => s.index !== index && isWithinDist(ship.position, s.position, 200)
    );
    ship.nearbyfriends_includingself = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 200)
    );

    ship.nearbyenemies = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 200)
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

    ship.nearbyfriends = enemyships.filter(
      (s) => s.index !== index && isWithinDist(ship.position, s.position, 200)
    );
    ship.nearbyfriends_includingself = enemyships.filter((s) =>
      isWithinDist(ship.position, s.position, 200)
    );

    ship.nearbyenemies = myships.filter((s) =>
      isWithinDist(ship.position, s.position, 200)
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
  const dist_base2zxq = dist(base.position, star_zxq.position);
  const dist_base2a1c = dist(base.position, star_a1c.position);
  //const dist_base2p89 = vec.dist(base.position, star_p89.position)

  const stars = {
    me: star_zxq,
    middle: star_p89,
    enemy: star_a1c,
  };

  if (dist_base2a1c < dist_base2zxq) {
    stars.me = star_a1c;
    stars.enemy = star_zxq;
  }
  return stars;
}

function getInfo(playerids: Playerids, outposts: Outposts) {
  const outpostcontrolIsMe = playerids.me === outposts.middle.control;
  const outpostcontrolIsEnemy = playerids.enemy === outposts.middle.control;
  return { outpostcontrolIsMe, outpostcontrolIsEnemy };
}
