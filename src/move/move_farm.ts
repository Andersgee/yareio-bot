import move_farm_home from "./move_farm/move_farm_home";
import move_farm_mid from "./move_farm/move_farm_mid";
import move_farm_big from "./move_farm/move_farm_big";
import move_farm_enemy from "./move_farm/move_farm_enemy";

export default function move_farm(
  targetps: Vec2s,
  moving: Vec,
  farming: Vec,
  farmfraction_home = 1, //how much of maxfarm should be allocated
  farmfraction_mid = 1,
  farmfraction_big = 1,
  farmfraction_enemy = 1
): void {
  move_farm_home(targetps, moving, farming, farmfraction_home);
  move_farm_mid(targetps, moving, farming, farmfraction_mid);
  move_farm_enemy(targetps, moving, farming, farmfraction_enemy);
  move_farm_big(targetps, moving, farming, farmfraction_big);
}
