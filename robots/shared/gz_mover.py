"""Publishes cmd_vel to move robots in Gazebo via the ROS2-Gz bridge.

Uses subprocess to call `ros2 topic pub` since the robot agents
run outside of a ROS2 node context. This keeps the architecture simple —
no need to spin up a full rclpy node per robot.
"""

import subprocess
import time
import math
import threading


# Robot spawn positions (must match swarm_arena.sdf)
ROBOT_POSITIONS = {
    "robot_a": (-3.0, 3.0),
    "robot_b": (-1.0, 3.0),
    "robot_c": (3.0, 0.0),
    "robot_d": (1.0, -3.0),
}

# Key waypoints
PASSAGE_ENTRANCE_NORTH = (0.0, 1.0)
PASSAGE_CENTER = (0.0, 0.0)
PASSAGE_ENTRANCE_SOUTH = (0.0, -1.0)
YIELD_ZONE_NORTH = (0.8, 0.8)
YIELD_ZONE_SOUTH = (0.8, -0.8)


def _pub_cmd_vel(robot_name: str, linear_x: float, angular_z: float, duration: float):
    """Publish cmd_vel for a duration then stop."""
    topic = f"/{robot_name}/cmd_vel"
    msg = f"{{linear: {{x: {linear_x}}}, angular: {{z: {angular_z}}}}}"

    # Start publishing
    proc = subprocess.Popen(
        ["ros2", "topic", "pub", "--rate", "10", topic,
         "geometry_msgs/msg/Twist", msg],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(duration)
    proc.terminate()
    proc.wait()

    # Send stop command
    stop_proc = subprocess.Popen(
        ["ros2", "topic", "pub", "--once", topic,
         "geometry_msgs/msg/Twist",
         "{linear: {x: 0.0}, angular: {z: 0.0}}"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    stop_proc.wait()


def move_forward(robot_name: str, duration: float = 2.0, speed: float = 0.5):
    """Drive robot forward."""
    print(f"  [Gazebo] {robot_name} moving forward...")
    _pub_cmd_vel(robot_name, speed, 0.0, duration)


def rotate(robot_name: str, angle_deg: float, speed: float = 1.0):
    """Rotate robot by approximate angle in degrees."""
    duration = abs(math.radians(angle_deg)) / abs(speed)
    direction = speed if angle_deg > 0 else -speed
    print(f"  [Gazebo] {robot_name} rotating {angle_deg}°...")
    _pub_cmd_vel(robot_name, 0.0, direction, duration)


def move_to_yield_zone(robot_name: str):
    """Move robot to the nearest yield zone."""
    print(f"  [Gazebo] {robot_name} moving to yield zone...")
    # Back up slightly
    _pub_cmd_vel(robot_name, -0.3, 0.0, 1.5)
    # Strafe to yield zone (rotate + forward + rotate back)
    _pub_cmd_vel(robot_name, 0.0, 1.0, 0.8)
    _pub_cmd_vel(robot_name, 0.3, 0.0, 1.0)


def navigate_b_to_passage():
    """Move Robot B from spawn toward the narrow passage."""
    # B starts at (-1, 3), passage is at (0, 0)
    # Rotate to face south (down)
    rotate("robot_b", -90)
    # Drive south toward passage
    move_forward("robot_b", duration=3.5, speed=0.8)


def navigate_b_through_passage():
    """Move Robot B through the narrow passage."""
    move_forward("robot_b", duration=2.0, speed=0.4)


def navigate_b_to_d():
    """Move Robot B from passage area to Robot D's position."""
    # D is at (1, -3), B is near (0, 0) after passage
    # Continue south then adjust east
    move_forward("robot_b", duration=2.5, speed=0.6)
    rotate("robot_b", -30)
    move_forward("robot_b", duration=1.5, speed=0.5)


def navigate_c_toward_passage():
    """Move Robot C from spawn toward the passage (from the right)."""
    # C starts at (3, 0), passage is at (0, 0)
    rotate("robot_c", 180)
    move_forward("robot_c", duration=2.0, speed=0.5)


def navigate_c_resume():
    """Robot C resumes patrol after yielding."""
    move_forward("robot_c", duration=1.0, speed=0.3)
