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


# GA Hyperparameters
POPULATION_SIZE = 10
GENERATIONS = 30
MUTATION_RATE = 0.2
ELITISM_COUNT = 1

# Assuming requests and responders are defined globally

def euclidean(p1, p2):
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def calculate_scores(request, responder_id):
    urgency_score = request["urgency"] / 5.0
    delay_penalty = request["delay"] / 5.0
    
    if responder_id is None:
        # No responder assigned
        proximity_score = 0
        has_resource = 0
        distance = 10  # max distance penalty
    else:
        responder = responders[responder_id]
        distance = euclidean(request["location"], responder["location"])
        proximity_score = 1 - (distance / 10.0)  # assuming max distance 10
        has_resource = 1 if request["resource"] in responder["resources"] else 0
    
    return urgency_score, proximity_score, has_resource, delay_penalty, distance

def fitness(chromosome):
    w1, w2, w3, w4, w5 = 0.4, 0.3, 0.2, 0.1, 0.1  # added w5 for assignment distance penalty
    request_order, responder_assignment = chromosome
    score = 0
    for idx, req_id in enumerate(request_order):
        req = requests[req_id]
        assigned_responder = responder_assignment[idx]
        u, p, r, d, dist = calculate_scores(req, assigned_responder)
        # Penalize distance too, encourage closer responders
        score += (w1 * u + w2 * p + w3 * r - w4 * d - w5 * (dist / 10))
        
        # Extra penalty if assigned responder doesn't have resource
        if assigned_responder is not None:
            if req["resource"] not in responders[assigned_responder]["resources"]:
                score -= 0.5  # arbitrary penalty
        else:
            # Penalty for no assignment
            score -= 0.5
    return score

def generate_random_assignment(request_order):
    assignment = []
    for req_id in request_order:
        req = requests[req_id]
        possible_responders = [i for i, r in enumerate(responders) if req["resource"] in r["resources"]]
        if possible_responders:
            assigned = random.choice(possible_responders)
        else:
            assigned = None
        assignment.append(assigned)
    return assignment

def crossover(p1, p2):
    # Crossover request order
    order1, assign1 = p1
    order2, assign2 = p2
    size = len(order1)
    
    cxpoint1 = random.randint(0, size - 2)
    cxpoint2 = random.randint(cxpoint1 + 1, size - 1)
    
    temp_order = order1[cxpoint1:cxpoint2]
    child_order = [item for item in order2 if item not in temp_order]
    child_order = child_order[:cxpoint1] + temp_order + child_order[cxpoint1:]
    
    # Crossover responder assignment accordingly:
    # Assign responder according to child_order indexes from parent assignments
    # Build a map from request_id to responder assignment
    assign_map1 = dict(zip(order1, assign1))
    assign_map2 = dict(zip(order2, assign2))
    
    child_assign = []
    for req_id in child_order:
        # randomly pick assignment from one of the parents
        if random.random() < 0.5:
            child_assign.append(assign_map1.get(req_id))
        else:
            child_assign.append(assign_map2.get(req_id))
            
    return (child_order, child_assign)

def mutate(chromosome):
    request_order, responder_assignment = chromosome
    size = len(request_order)
    
    # Mutation on request_order (swap two positions)
    if random.random() < MUTATION_RATE:
        i, j = random.sample(range(size), 2)
        request_order[i], request_order[j] = request_order[j], request_order[i]
        responder_assignment[i], responder_assignment[j] = responder_assignment[j], responder_assignment[i]
    
    # Mutation on responder_assignment (randomly change responder for a request)
    if random.random() < MUTATION_RATE:
        idx = random.randint(0, size - 1)
        req_id = request_order[idx]
        req = requests[req_id]
        possible_responders = [i for i, r in enumerate(responders) if req["resource"] in r["resources"]]
        if possible_responders:
            responder_assignment[idx] = random.choice(possible_responders)
        else:
            responder_assignment[idx] = None
    
    return (request_order, responder_assignment)

# ========== GA Main Flow ==========

population = []
for _ in range(POPULATION_SIZE):
    order = random.sample(range(len(requests)), len(requests))
    assign = generate_random_assignment(order)
    population.append((order, assign))


ELITISM_COUNT = 1  # Number of top individuals to carry over directly

for gen in range(GENERATIONS):
    # Step 2: Evaluate fitness
    population.sort(key=fitness, reverse=True)

    # Keep the elite individuals unchanged
    elites = population[:ELITISM_COUNT]

    # Step 3: Select top individuals for mating pool (excluding elites)
    top = population[:POPULATION_SIZE // 2]

    # Step 4: Generate new population via crossover and mutation
    new_population = elites[:]  # Start new population with elites

    while len(new_population) < POPULATION_SIZE:
        parent1, parent2 = random.sample(top, 2)
        child = crossover(parent1, parent2)
        child = mutate(child)
        new_population.append(child)

    population = new_population


best = max(population, key=fitness)
best_order, best_assignment = best

print("Best prioritization order and assignments:")
for idx, req_id in enumerate(best_order):
    req = requests[req_id]
    assigned_responder = best_assignment[idx]
    responder_str = f"Responder {responders[assigned_responder]['id']}" if assigned_responder is not None else "No responder assigned"
    print(f"Request {req['id']} ({req['type']}) assigned to {responder_str}")
