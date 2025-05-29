# import os
# import subprocess
# import time
# import multiprocessing
# from watchdog.observers import Observer
# from watchdog.events import FileSystemEventHandler

# SERVERS = {
#     "gateway": "disaster_agent_system.server.gateway_server",
#     "request_intake_agent": "disaster_agent_system.agents.request_intake_agent",
#     "request_verify_agent": "disaster_agent_system.agents.request_verify_agent",
#     "task_prioritize_agent": "disaster_agent_system.agents.task_prioritize_agent",
#     "math_mcp": "disaster_agent_system.mcps.math",
#     "request_count_mcp": "disaster_agent_system.mcps.request_count",
#     "brave_mcp": "disaster_agent_system.mcps.brave_search_mcp_server"
# }

# processes = {}

# def start_process(name, module_path):
#     print(f"Starting {name} as module {module_path}")
#     process = subprocess.Popen([sys.executable, "-m", module_path])
#     processes[name] = process
#     return process

# def restart_process(name, module_path):
#     print(f"Restarting {name}")
#     processes[name].terminate()
#     processes[name].wait()
#     start_process(name, module_path)

# class ChangeHandler(FileSystemEventHandler):
#     def __init__(self, folder_to_watch, name, module_path):
#         self.folder = folder_to_watch
#         self.name = name
#         self.module_path = module_path

#     def on_modified(self, event):
#         if event.src_path.endswith(".py"):
#             print(f"Change detected in {self.folder}, restarting {self.name}")
#             restart_process(self.name, self.module_path)

# def monitor_changes():
#     observer = Observer()
#     for name, module_path in SERVERS.items():
#         folder = os.path.join(*module_path.split('.')[:-1])
#         if not os.path.exists(folder):
#             print(f"Warning: Folder {folder} does not exist. Cannot watch {name}.")
#             continue
#         handler = ChangeHandler(folder, name, module_path)
#         observer.schedule(handler, path=folder, recursive=True)
#     observer.start()
#     try:
#         while True:
#             time.sleep(1)
#     except KeyboardInterrupt:
#         observer.stop()
#     observer.join()

# def monitor_processes():
#     while True:
#         for name, process in list(processes.items()):
#             if process.poll() is not None:
#                 print(f"{name} crashed. Restarting...")
#                 start_process(name, SERVERS[name])
#         time.sleep(2)

# if __name__ == "__main__":
#     import sys
#     for name, module_path in SERVERS.items():
#         start_process(name, module_path)

#     process_monitor = multiprocessing.Process(target=monitor_processes)
#     process_monitor.start()

#     monitor_changes()


import sys
import subprocess
import time
import multiprocessing
import os

SERVERS = {
    # gateway
    "gateway": "disaster_agent_system.server.gateway_server",
    # agents
    "request_intake_agent": "disaster_agent_system.agents.request_intake_agent",
    "request_verify_agent": "disaster_agent_system.agents.request_verify_agent",
    #mcps
    "math_mcp": "disaster_agent_system.mcps.math",
    "request_count_mcp": "disaster_agent_system.mcps.request_count",
    "brave_mcp": "disaster_agent_system.mcps.brave_search_mcp_server"
}

processes = {}

def start_process(name, module_path):
    print(f"Starting {name} as module {module_path} in new terminal")
    python_executable = sys.executable
    command = f'start cmd /k "{python_executable} -m {module_path}"'
    process = subprocess.Popen(command, shell=True)
    processes[name] = process
    return process

def restart_process(name, module_path):
    print(f"Restarting {name}")
    processes[name].terminate()
    processes[name].wait()
    start_process(name, module_path)

if __name__ == "__main__":
    for name, module_path in SERVERS.items():
        start_process(name, module_path)
