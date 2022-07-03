import { dist } from "../vec";

/**
 * all shapes can use jump() . Formula: jump cost = distance/4 + (size^2) / 4
 */
export function jumpCost(ship: Ship, point: Vec2): number {
  return dist(ship.position, point) / 4 + Math.pow(ship.size, 2) / 4;
}

export function canJump(ship: Ship, point: Vec2): boolean {
  return ship.energy >= jumpCost(ship, point);
}
