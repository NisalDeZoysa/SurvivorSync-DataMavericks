
import random
import math


# ========== Input Arrays ==========
# Help Requests
requests = [
    {"id": 0, "urgency": 5, "location": (2, 3), "type": "Food", "delay": 1.5, "resource": "Water"},
    {"id": 1, "urgency": 2, "location": (6, 8), "type": "Medical", "delay": 0.5, "resource": "First Aid"},
    {"id": 2, "urgency": 4, "location": (1, 1), "type": "Rescue", "delay": 2.0, "resource": "Drone"},
    {"id": 3, "urgency": 3, "location": (9, 6), "type": "Food", "delay": 0.2, "resource": "Water"},
    {"id": 4, "urgency": 1, "location": (4, 7), "type": "Rescue", "delay": 4.0, "resource": "Drone"},
    {"id": 5, "urgency": 5, "location": (3, 9), "type": "Medical", "delay": 0.7, "resource": "First Aid"},
    {"id": 6, "urgency": 2, "location": (7, 2), "type": "Rescue", "delay": 2.5, "resource": "Drone"},
    {"id": 7, "urgency": 3, "location": (5, 5), "type": "Food", "delay": 1.0, "resource": "Water"},
    {"id": 8, "urgency": 4, "location": (6, 1), "type": "Medical", "delay": 0.3, "resource": "First Aid"},
    {"id": 9, "urgency": 1, "location": (0, 4), "type": "Food", "delay": 3.5, "resource": "Water"},
    {"id": 10, "urgency": 2, "location": (8, 3), "type": "Rescue", "delay": 2.2, "resource": "Drone"},
    {"id": 11, "urgency": 5, "location": (3, 6), "type": "Medical", "delay": 0.1, "resource": "First Aid"},
    {"id": 12, "urgency": 3, "location": (9, 9), "type": "Rescue", "delay": 1.7, "resource": "Drone"},
    {"id": 13, "urgency": 4, "location": (4, 4), "type": "Food", "delay": 1.4, "resource": "Water"},
    {"id": 14, "urgency": 1, "location": (2, 6), "type": "Medical", "delay": 3.8, "resource": "First Aid"},
    {"id": 15, "urgency": 3, "location": (7, 7), "type": "Rescue", "delay": 2.8, "resource": "Drone"},
    {"id": 16, "urgency": 5, "location": (5, 3), "type": "Food", "delay": 0.6, "resource": "Water"},
    {"id": 17, "urgency": 2, "location": (3, 2), "type": "Medical", "delay": 1.9, "resource": "First Aid"},
    {"id": 18, "urgency": 4, "location": (1, 9), "type": "Rescue", "delay": 2.3, "resource": "Drone"},
    {"id": 19, "urgency": 1, "location": (6, 4), "type": "Food", "delay": 3.3, "resource": "Water"},
    {"id": 20, "urgency": 5, "location": (8, 0), "type": "Medical", "delay": 0.4, "resource": "First Aid"},
    {"id": 21, "urgency": 3, "location": (0, 8), "type": "Rescue", "delay": 2.1, "resource": "Drone"},
    {"id": 22, "urgency": 2, "location": (4, 1), "type": "Food", "delay": 3.0, "resource": "Water"},
    {"id": 23, "urgency": 4, "location": (9, 2), "type": "Medical", "delay": 0.9, "resource": "First Aid"},
    {"id": 24, "urgency": 1, "location": (2, 9), "type": "Rescue", "delay": 3.7, "resource": "Drone"}
]


# Responder locations and available resources
responders = [
    {"id": "A", "location": (0, 0), "resources": ["Water", "First Aid"]},
    {"id": "B", "location": (5, 5), "resources": ["Drone", "Food"]},
    {"id": "C", "location": (2, 8), "resources": ["Water", "Drone"]},
    {"id": "D", "location": (7, 3), "resources": ["First Aid", "Food"]},
    {"id": "E", "location": (3, 6), "resources": ["Drone", "First Aid"]},
    {"id": "F", "location": (8, 8), "resources": ["Food", "Water"]},
    {"id": "G", "location": (1, 4), "resources": ["Water", "First Aid"]},
    {"id": "H", "location": (6, 1), "resources": ["Drone", "Water"]},
    {"id": "I", "location": (9, 0), "resources": ["First Aid", "Food"]},
    {"id": "J", "location": (4, 9), "resources": ["Drone", "Water"]}
]



import pulp
import math

# ---------- Helper Functions ----------
def euclidean(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

def calculate_score(request, responder):
    w1, w2, w3, w4 = 0.4, 0.3, 0.2, 0.1
    urgency_score = request["urgency"] / 5.0
    delay_penalty = request["delay"] / 5.0
    distance = euclidean(request["location"], responder["location"])
    proximity_score = 1 - (distance / 10.0)  # assuming max distance 10
    has_resource = 1 if request["resource"] in responder["resources"] else 0
    
    score = w1*urgency_score + w2*proximity_score + w3*has_resource - w4*delay_penalty
    # Add huge negative score if responder cannot provide resource
    if has_resource == 0:
        score -= 10  # ensure infeasible assignments are avoided
    return score

# ---------- ILP Problem ----------
problem = pulp.LpProblem("Disaster_Resource_Allocation", pulp.LpMaximize)

num_requests = len(requests)
num_responders = len(responders)

# Decision Variables
x = [[pulp.LpVariable(f"x_{i}_{j}", cat="Binary") for j in range(num_responders)] for i in range(num_requests)]

# Objective Function: maximize total assignment score
objective = []
for i in range(num_requests):
    for j in range(num_responders):
        score = calculate_score(requests[i], responders[j])
        objective.append(score * x[i][j])

problem += pulp.lpSum(objective)

# Constraints
# 1. Each responder at most one request
for j in range(num_responders):
    problem += pulp.lpSum(x[i][j] for i in range(num_requests)) <= 1

# 2. Each request at most one responder
for i in range(num_requests):
    problem += pulp.lpSum(x[i][j] for j in range(num_responders)) <= 1

# 3. Optional: enforce invalid assignments to 0
for i in range(num_requests):
    for j in range(num_responders):
        if requests[i]["resource"] not in responders[j]["resources"]:
            problem += x[i][j] == 0

# ---------- Solve ----------
problem.solve()

# ---------- Print Results ----------
print("ILP Optimal Assignments:\n")
for i in range(num_requests):
    assigned_responder = None
    for j in range(num_responders):
        if pulp.value(x[i][j]) == 1:
            assigned_responder = responders[j]["id"]
            break
    responder_str = f"Responder {assigned_responder}" if assigned_responder else "No responder assigned"
    print(f"Request {requests[i]['id']} ({requests[i]['type']}, Resource={requests[i]['resource']}) -> {responder_str}")
