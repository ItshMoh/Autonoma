"""Persistent ROS2 node — odom cache + cmd_vel publishers for all swarm robots.

Runs rclpy.spin in a daemon thread so odom is always fresh.
Call start() once before using get_pose() or send_cmd().
"""

import math
import threading
import time
import rclpy
from rclpy.node import Node
from nav_msgs.msg import Odometry
from geometry_msgs.msg import Twist


SPAWN_POSITIONS = {
    "robot_a": (-3.0, 3.0, 0.0),
    "robot_b": (-1.0, 3.0, 0.0),
    "robot_c": (0.0, -1.0, 0.0),
    "robot_d": (2.0, -3.0, 0.0),
}

ROBOT_NAMES = list(SPAWN_POSITIONS.keys())


class SwarmNavNode(Node):
    """Subscribes to /robot_X/odom, publishes to /robot_X/cmd_vel."""

    def __init__(self):
        super().__init__("swarm_nav")
        self._lock = threading.Lock()
        self._poses = {}
        self._cmd_pubs = {}

        for name in ROBOT_NAMES:
            self.create_subscription(
                Odometry, f"/{name}/odom",
                lambda msg, n=name: self._odom_cb(n, msg), 10,
            )
            self._cmd_pubs[name] = self.create_publisher(
                Twist, f"/{name}/cmd_vel", 10,
            )

    def _odom_cb(self, robot_name: str, msg: Odometry):
        pos = msg.pose.pose.position
        ori = msg.pose.pose.orientation
        qz = ori.z
        qw = ori.w
        odom_yaw = math.atan2(2.0 * qw * qz, 1.0 - 2.0 * qz * qz)

        sx, sy, syaw = SPAWN_POSITIONS.get(robot_name, (0.0, 0.0, 0.0))
        with self._lock:
            self._poses[robot_name] = (sx + pos.x, sy + pos.y, syaw + odom_yaw)

    def get_pose(self, robot_name: str):
        with self._lock:
            return self._poses.get(robot_name)

    def publish_cmd(self, robot_name: str, linear_x: float, angular_z: float):
        pub = self._cmd_pubs.get(robot_name)
        if pub is None:
            return
        twist = Twist()
        twist.linear.x = linear_x
        twist.angular.z = angular_z
        pub.publish(twist)


# ── Singleton ──────────────────────────────────────────────

_node = None
_spin_thread = None
_started = False


def start():
    """Initialize rclpy and spin the node in a background thread."""
    global _node, _spin_thread, _started
    if _started:
        return
    _started = True
    rclpy.init()
    _node = SwarmNavNode()
    _spin_thread = threading.Thread(target=rclpy.spin, args=(_node,), daemon=True)
    _spin_thread.start()
    # Give DDS time to discover and receive first odom messages
    time.sleep(1.5)
    print("  [ROS] Odom listener ready")


def get_pose(robot_name: str):
    """Return cached (x, y, yaw) in world coords, or None if no data yet."""
    if _node is None:
        return None
    return _node.get_pose(robot_name)


def send_cmd(robot_name: str, linear_x: float, angular_z: float):
    """Publish a single cmd_vel Twist."""
    if _node is not None:
        _node.publish_cmd(robot_name, linear_x, angular_z)


def shutdown():
    """Clean up ROS2 resources."""
    global _node, _spin_thread, _started
    if _node is not None:
        _node.destroy_node()
        rclpy.shutdown()
        _node = None
        _spin_thread = None
        _started = False
