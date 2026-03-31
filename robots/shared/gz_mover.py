"""Waypoint navigation for Gazebo robots.

All movements are straight lines only — no diagonal.
Uses persistent ROS2 node for fast odom reads and cmd_vel publishing.
"""

import math
import time
from robots.shared import ros_node


ROTATE_SPEED = 1.2   # rad/s
DRIVE_SPEED = 0.5    # m/s
CONTROL_DT = 0.3     # control loop period — fast enough for smooth tracking
MAX_WAYPOINT_SECONDS = 40.0


def _ensure_node():
    """Start the ROS2 node if not already running."""
    ros_node.start()


def get_world_pose(robot_name: str):
    """Return cached (x, y, yaw) in world coordinates."""
    _ensure_node()
    return ros_node.get_pose(robot_name)


def _send_cmd(robot_name: str, linear_x: float, angular_z: float):
    """Publish a single cmd_vel."""
    ros_node.send_cmd(robot_name, linear_x, angular_z)


def _stop(robot_name: str):
    """Send zero velocity."""
    _send_cmd(robot_name, 0.0, 0.0)


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _norm_angle(angle: float) -> float:
    return (angle + math.pi) % (2 * math.pi) - math.pi


def navigate_to_waypoint(robot_name: str, target_x: float, target_y: float,
                          speed: float = DRIVE_SPEED) -> bool:
    """Navigate to (target_x, target_y) using continuous closed-loop control."""
    _ensure_node()

    TOLERANCE = 0.15
    YAW_ALIGN_THRESHOLD = 0.35   # rad (~20 deg) — rotate in place if yaw off by more
    K_YAW_ROTATE = 2.2           # proportional gain for pure rotation
    K_YAW_DRIVE = 1.8            # proportional gain for yaw correction while driving

    pose = get_world_pose(robot_name)
    if pose is None:
        print(f"  [Nav] Cannot read odom for {robot_name}, skipping")
        return False

    x, y, yaw = pose
    dx = target_x - x
    dy = target_y - y
    initial_dist = math.sqrt(dx * dx + dy * dy)

    print(f"  [Nav] {robot_name} at ({x:.2f}, {y:.2f}) yaw={math.degrees(yaw):.0f}\u00b0"
          f" -> ({target_x}, {target_y}) dist={initial_dist:.2f}m")

    if initial_dist < TOLERANCE:
        print(f"  [Nav] {robot_name} already at target")
        return True

    start = time.time()
    last_status = 0.0

    while time.time() - start < MAX_WAYPOINT_SECONDS:
        pose = get_world_pose(robot_name)
        if pose is None:
            time.sleep(CONTROL_DT)
            continue

        x, y, yaw = pose
        dx = target_x - x
        dy = target_y - y
        dist = math.sqrt(dx * dx + dy * dy)

        if dist < TOLERANCE:
            _stop(robot_name)
            print(f"  [Nav] {robot_name} reached target")
            return True

        desired_yaw = math.atan2(dy, dx)
        yaw_error = _norm_angle(desired_yaw - yaw)

        if abs(yaw_error) > YAW_ALIGN_THRESHOLD:
            # Pure rotation — face the target first
            angular = _clamp(K_YAW_ROTATE * yaw_error, -ROTATE_SPEED, ROTATE_SPEED)
            linear = 0.0
        else:
            # Drive with yaw correction
            angular = _clamp(K_YAW_DRIVE * yaw_error, -ROTATE_SPEED * 0.8, ROTATE_SPEED * 0.8)
            linear = min(speed, max(0.18, dist * 0.8))

        _send_cmd(robot_name, linear, angular)
        time.sleep(CONTROL_DT)

        now = time.time()
        if now - last_status > 3.0:
            print(f"  [Nav] {robot_name} tracking: dist={dist:.2f}m yaw_err={math.degrees(yaw_error):.0f}\u00b0")
            last_status = now

    _stop(robot_name)
    print(f"  [Nav] {robot_name} timeout before reaching ({target_x}, {target_y})")
    return False


def follow_waypoints(robot_name: str, waypoints: list, speed: float = DRIVE_SPEED):
    """Follow a list of (x, y) waypoints in sequence."""
    _ensure_node()
    for i, (wx, wy) in enumerate(waypoints):
        print(f"  [Nav] {robot_name} -> waypoint {i + 1}/{len(waypoints)} ({wx}, {wy})")
        navigate_to_waypoint(robot_name, wx, wy, speed=speed)
    _stop(robot_name)


# ============ Hardcoded straight-line paths ============
#
# Arena:  A(-3,3)  B(-1,3)  C(0,-1)  D(2,-3)
# Gap at (0, 0), 1.0m wide
#
# ALL movements are axis-aligned (horizontal or vertical only).
#
# Robot B full path:
#   1. (-1,3) -> (-3,3)    go left to A (pickup)
#   2. (-3,3) -> (0,3)     go right, align with gap
#   3. (0,3)  -> (0,1)     go down, approach passage from north — STOP here
#      --- negotiation: C yields ---
#   4. (0,1)  -> (0,-3)    go down through passage, continue south
#   5. (0,-3) -> (2,-3)    go right to D (deliver)
#
# Robot C path:
#   1. (0,-1) -> (0,-0.5)  go up, approach passage from south
#      --- negotiation: C yields ---
#   2. (0,-0.5) -> (-1,-1) go left then down to yield zone
#      (broken into straight lines: left first, then down)

PATH_B_TO_A = [
    (-2.0, 3.0),       # straight left, stop next to A (not on top of it)
]

PATH_B_TO_PASSAGE = [
    (0.0, 3.0),        # straight right, align with gap x=0
    (0.0, 1.0),        # straight down, approach passage
]

PATH_B_THROUGH_AND_TO_D = [
    (0.0, -3.0),       # straight down through gap, continue to y=-3
    (1.0, -3.0),       # straight right, stop next to D (not on top of it)
]

PATH_C_TO_PASSAGE = [
    (0.0, -0.5),       # straight up toward gap
]

PATH_C_YIELD = [
    (-1.0, -0.5),      # straight left (away from gap)
    (-1.0, -1.0),      # straight down (back to patrol height)
]

PATH_C_RESUME = [
    (0.0, -1.0),       # straight right back to start
]


def navigate_b_to_a():
    """B goes left to A for package pickup."""
    print("  [Nav] Robot B [BLUE] heading to Robot A [GREEN] for pickup...")
    follow_waypoints("robot_b", PATH_B_TO_A, speed=0.5)


def navigate_b_to_passage():
    """B goes right then down to approach passage."""
    print("  [Nav] Robot B [BLUE] heading to passage...")
    follow_waypoints("robot_b", PATH_B_TO_PASSAGE, speed=0.6)


def navigate_b_through_and_to_d():
    """B goes down through passage then right to D."""
    print("  [Nav] Robot B [BLUE] through passage to Robot D [RED]...")
    follow_waypoints("robot_b", PATH_B_THROUGH_AND_TO_D, speed=0.5)


def navigate_c_toward_passage():
    """C moves up toward the passage from south."""
    print("  [Nav] Robot C [ORANGE] approaching passage...")
    follow_waypoints("robot_c", PATH_C_TO_PASSAGE, speed=0.4)


def move_to_yield_zone(robot_name: str):
    """C moves left then down to yield zone."""
    print(f"  [Nav] {robot_name} [ORANGE] moving to yield zone...")
    follow_waypoints(robot_name, PATH_C_YIELD, speed=0.4)


def navigate_c_resume():
    """C goes back right to original position."""
    print("  [Nav] Robot C [ORANGE] resuming patrol...")
    follow_waypoints("robot_c", PATH_C_RESUME, speed=0.3)
