import os
from launch import LaunchDescription
from launch.actions import ExecuteProcess

def generate_launch_description():
    pkg_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    world_file = os.path.join(pkg_dir, 'worlds', 'swarm_arena.sdf')
    gui_config = os.path.join(pkg_dir, 'minimal_gui.config')

    # Use minimal GUI (no entity tree / model panel) if config exists
    gz_cmd = ['gz', 'sim', '-r', world_file]
    if os.path.exists(gui_config):
        gz_cmd += ['--gui-config', gui_config]

    return LaunchDescription([
        # Launch Gazebo with the arena world (robots are inline, no model path needed)
        ExecuteProcess(
            cmd=gz_cmd,
            output='screen',
        ),

        # Bridge Gazebo topics to ROS2 for each robot
        ExecuteProcess(
            cmd=[
                'ros2', 'run', 'ros_gz_bridge', 'parameter_bridge',
                '/robot_a/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
                '/robot_a/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry',
                '/robot_b/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
                '/robot_b/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry',
                '/robot_c/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
                '/robot_c/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry',
                '/robot_d/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
                '/robot_d/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry',
            ],
            output='screen',
        ),
    ])
