import os
from launch import LaunchDescription
from launch.actions import ExecuteProcess, SetEnvironmentVariable

def generate_launch_description():
    pkg_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    world_file = os.path.join(pkg_dir, 'worlds', 'swarm_arena.sdf')
    models_dir = os.path.join(pkg_dir, 'models')

    # Build GZ_SIM_RESOURCE_PATH
    gz_resource = os.environ.get('GZ_SIM_RESOURCE_PATH', '')
    resource_path = models_dir + (':' + gz_resource if gz_resource else '')

    return LaunchDescription([
        # Set env var BEFORE Gazebo launches
        SetEnvironmentVariable('GZ_SIM_RESOURCE_PATH', resource_path),

        # Launch Gazebo with the arena world
        ExecuteProcess(
            cmd=['gz', 'sim', '-r', world_file],
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
