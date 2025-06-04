# from mcp.server.fastmcp import FastMCP
# import random
# import math
# from typing import List, Dict, Optional, Tuple, Any

# mcp = FastMCP("genetic")

# @mcp.tool()
# def optimize_emergency_response(
#     requests: List[Dict[str, Any]], 
#     responders: List[Dict[str, Any]],
#     population_size: int = 10,
#     generations: int = 30,
#     mutation_rate: float = 0.2,
#     elitism_count: int = 1
# ) -> Dict[str, Any]:
#     """
#     Optimize emergency response using genetic algorithm to prioritize requests and assign responders.
    
#     Args:
#         requests: List of help requests, each containing:
#             - id: unique identifier
#             - urgency: urgency level (1-5)
#             - location: tuple of (x, y) coordinates
#             - type: type of emergency ("Food", "Medical", "Rescue")
#             - delay: delay factor (0-5)
#             - resource: required resource ("Water", "First Aid", "Drone", "Food")
        
#         responders: List of responders, each containing:
#             - id: unique identifier
#             - location: tuple of (x, y) coordinates  
#             - resources: list of available resources
            
#         population_size: Size of GA population (default: 10)
#         generations: Number of GA generations (default: 30)
#         mutation_rate: Mutation probability (default: 0.2)
#         elitism_count: Number of elite individuals to preserve (default: 1)
    
#     Returns:
#         Dictionary containing optimized assignment plan and statistics
#     """
    
#     def euclidean(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
#         """Calculate Euclidean distance between two points."""
#         return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

#     def calculate_scores(request: Dict[str, Any], responder_id: Optional[int]) -> Tuple[float, float, float, float, float]:
#         """Calculate various scores for request-responder assignment."""
#         urgency_score = request["urgency"] / 5.0
#         delay_penalty = request["delay"] / 5.0
        
#         if responder_id is None:
#             # No responder assigned
#             proximity_score = 0
#             has_resource = 0
#             distance = 10  # max distance penalty
#         else:
#             responder = responders[responder_id]
#             distance = euclidean(request["location"], responder["location"])
#             proximity_score = 1 - (distance / 10.0)  # assuming max distance 10
#             has_resource = 1 if request["resource"] in responder["resources"] else 0
        
#         return urgency_score, proximity_score, has_resource, delay_penalty, distance

#     def fitness(chromosome: Tuple[List[int], List[Optional[int]]]) -> float:
#         """Calculate fitness score for a chromosome."""
#         w1, w2, w3, w4, w5 = 0.4, 0.3, 0.2, 0.1, 0.1  # weights
#         request_order, responder_assignment = chromosome
#         score = 0
        
#         for idx, req_id in enumerate(request_order):
#             req = requests[req_id]
#             assigned_responder = responder_assignment[idx]
#             u, p, r, d, dist = calculate_scores(req, assigned_responder)
            
#             # Calculate weighted score
#             score += (w1 * u + w2 * p + w3 * r - w4 * d - w5 * (dist / 10))
            
#             # Extra penalty if assigned responder doesn't have resource
#             if assigned_responder is not None:
#                 if req["resource"] not in responders[assigned_responder]["resources"]:
#                     score -= 0.5
#             else:
#                 # Penalty for no assignment
#                 score -= 0.5
        
#         return score

#     def generate_random_assignment(request_order: List[int]) -> List[Optional[int]]:
#         """Generate random responder assignments for given request order."""
#         assignment = []
#         for req_id in request_order:
#             req = requests[req_id]
#             possible_responders = [i for i, r in enumerate(responders) if req["resource"] in r["resources"]]
#             if possible_responders:
#                 assigned = random.choice(possible_responders)
#             else:
#                 assigned = None
#             assignment.append(assigned)
#         return assignment

#     def crossover(p1: Tuple[List[int], List[Optional[int]]], 
#                   p2: Tuple[List[int], List[Optional[int]]]) -> Tuple[List[int], List[Optional[int]]]:
#         """Perform crossover between two parent chromosomes."""
#         order1, assign1 = p1
#         order2, assign2 = p2
#         size = len(order1)
        
#         cxpoint1 = random.randint(0, size - 2)
#         cxpoint2 = random.randint(cxpoint1 + 1, size - 1)
        
#         temp_order = order1[cxpoint1:cxpoint2]
#         child_order = [item for item in order2 if item not in temp_order]
#         child_order = child_order[:cxpoint1] + temp_order + child_order[cxpoint1:]
        
#         # Build assignment maps
#         assign_map1 = dict(zip(order1, assign1))
#         assign_map2 = dict(zip(order2, assign2))
        
#         child_assign = []
#         for req_id in child_order:
#             # Randomly pick assignment from one of the parents
#             if random.random() < 0.5:
#                 child_assign.append(assign_map1.get(req_id))
#             else:
#                 child_assign.append(assign_map2.get(req_id))
                
#         return (child_order, child_assign)

#     def mutate(chromosome: Tuple[List[int], List[Optional[int]]]) -> Tuple[List[int], List[Optional[int]]]:
#         """Apply mutation to a chromosome."""
#         request_order, responder_assignment = chromosome
#         size = len(request_order)
        
#         # Make copies to avoid modifying original
#         request_order = request_order.copy()
#         responder_assignment = responder_assignment.copy()
        
#         # Mutation on request_order (swap two positions)
#         if random.random() < mutation_rate:
#             i, j = random.sample(range(size), 2)
#             request_order[i], request_order[j] = request_order[j], request_order[i]
#             responder_assignment[i], responder_assignment[j] = responder_assignment[j], responder_assignment[i]
        
#         # Mutation on responder_assignment (randomly change responder)
#         if random.random() < mutation_rate:
#             idx = random.randint(0, size - 1)
#             req_id = request_order[idx]
#             req = requests[req_id]
#             possible_responders = [i for i, r in enumerate(responders) if req["resource"] in r["resources"]]
#             if possible_responders:
#                 responder_assignment[idx] = random.choice(possible_responders)
#             else:
#                 responder_assignment[idx] = None
        
#         return (request_order, responder_assignment)

#     # Validate inputs
#     if not requests or not responders:
#         return {"error": "Both requests and responders lists must be non-empty"}
    
#     # Initialize population
#     population = []
#     for _ in range(population_size):
#         order = random.sample(range(len(requests)), len(requests))
#         assign = generate_random_assignment(order)
#         population.append((order, assign))

#     # GA main loop
#     best_fitness_history = []
    
#     for gen in range(generations):
#         # Evaluate fitness and sort population
#         population.sort(key=fitness, reverse=True)
#         best_fitness_history.append(fitness(population[0]))
        
#         # Keep elite individuals
#         elites = population[:elitism_count]
        
#         # Select top individuals for mating pool
#         top = population[:population_size // 2]
        
#         # Generate new population
#         new_population = elites[:]
        
#         while len(new_population) < population_size:
#             parent1, parent2 = random.sample(top, 2)
#             child = crossover(parent1, parent2)
#             child = mutate(child)
#             new_population.append(child)
        
#         population = new_population

#     # Get best solution
#     best = max(population, key=fitness)
#     best_order, best_assignment = best
#     best_fitness = fitness(best)
    
#     # Format results
#     assignment_plan = []
#     for idx, req_id in enumerate(best_order):
#         req = requests[req_id]
#         assigned_responder_id = best_assignment[idx]
        
#         assignment_info = {
#             "priority": idx + 1,
#             "request_id": req["id"],
#             "request_type": req["type"],
#             "urgency": req["urgency"],
#             "location": req["location"],
#             "required_resource": req["resource"],
#             "delay": req["delay"]
#         }
        
#         if assigned_responder_id is not None:
#             responder = responders[assigned_responder_id]
#             assignment_info.update({
#                 "assigned_responder_id": responder["id"],
#                 "responder_location": responder["location"],
#                 "available_resources": responder["resources"],
#                 "distance": euclidean(req["location"], responder["location"]),
#                 "has_required_resource": req["resource"] in responder["resources"]
#             })
#         else:
#             assignment_info.update({
#                 "assigned_responder_id": None,
#                 "responder_location": None,
#                 "available_resources": None,
#                 "distance": None,
#                 "has_required_resource": False
#             })
        
#         assignment_plan.append(assignment_info)
    
#     # Calculate statistics
#     total_distance = sum(item["distance"] for item in assignment_plan if item["distance"] is not None)
#     assigned_count = sum(1 for item in assignment_plan if item["assigned_responder_id"] is not None)
#     unassigned_count = len(assignment_plan) - assigned_count
    
#     return {
#         "success": True,
#         "assignment_plan": assignment_plan,
#         "statistics": {
#             "total_requests": len(requests),
#             "assigned_requests": assigned_count,
#             "unassigned_requests": unassigned_count,
#             "total_distance": round(total_distance, 2) if total_distance else 0,
#             "average_distance": round(total_distance / assigned_count, 2) if assigned_count > 0 else 0,
#             "best_fitness_score": round(best_fitness, 4),
#             "generations_run": generations,
#             "population_size": population_size
#         },
#         "fitness_history": best_fitness_history
#     }


# if __name__ == "__main__":
#     mcp.run(transport="stdio")
from mcp.server.fastmcp import FastMCP
import math
from typing import List, Dict, Any, Tuple
from collections import defaultdict

mcp = FastMCP("resource_optimizer")

@mcp.tool()
def optimize_resources_for_request(
    request: Dict[str, Any], 
    resources: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Optimize resource assignment for a single emergency request from multiple resource centers.
    
    Args:
        request: Emergency request containing:
            - request_id: unique identifier
            - location: [latitude, longitude]
            - required_resources: list of {'name': str, 'quantity': int}
            - (other fields as defined in DisasterRequestResponseFormat)
            
        resources: List of resource centers, each containing:
            - resource_center_id: unique identifier
            - location: [latitude, longitude]
            - name: resource type
            - quantity: available quantity
    
    Returns:
        Dictionary containing:
            - status: 'completed', 'pending', or 'error'
            - request_id: original request ID
            - assignment: list of resource assignments
            - shortfalls: list of unmet resources
            - total_distance: sum of distances for all assignments
    """
    
    def euclidean_distance(coord1: List[float], coord2: List[float]) -> float:
        """Calculate Euclidean distance between two points."""
        return math.sqrt((coord1[0]-coord2[0])**2 + (coord1[1]-coord2[1])**2)

    # Validate inputs
    if not request:
        return {"status": "error", "message": "Missing emergency request"}
    
    if not resources:
        return {"status": "error", "message": "No resources available"}
    
    # Extract request details
    request_id = request["request_id"]
    request_loc = request["location"]
    required_resources = request.get("required_resources", [])
    
    # Convert required resources to dictionary
    required_dict = defaultdict(int)
    for item in required_resources:
        required_dict[item["name"]] += item["quantity"]
    
    # Aggregate resources by center
    centers = {}
    for res in resources:
        center_id = res["resource_center_id"]
        if center_id not in centers:
            centers[center_id] = {
                "id": center_id,
                "location": res["location"],
                "resources": defaultdict(int),
                "distance": euclidean_distance(request_loc, res["location"])
            }
        centers[center_id]["resources"][res["name"]] += res["quantity"]
    
    center_list = list(centers.values())
    n = len(center_list)
    
    # Helper function to evaluate a solution
    def evaluate_solution(selected_centers: List[Dict]) -> Tuple[float, Dict]:
        """Evaluate a solution and return (total_distance, resource_shortfall)"""
        allocated = defaultdict(int)
        total_distance = 0
        
        for center in selected_centers:
            total_distance += center["distance"]
            for res, qty in center["resources"].items():
                allocated[res] += qty
        
        shortfall = {}
        for res, need in required_dict.items():
            if allocated[res] < need:
                shortfall[res] = need - allocated[res]
                
        return total_distance, shortfall

    # Optimization strategies
    def greedy_optimization() -> List[Dict]:
        """Greedy algorithm for large number of resource centers"""
        selected = []
        remaining_demand = required_dict.copy()
        
        while any(remaining_demand.values()):
            best_center = None
            best_benefit = 0
            
            for center in center_list:
                if center in selected:
                    continue
                    
                benefit = 0
                for res, available in center["resources"].items():
                    if res in remaining_demand:
                        benefit += min(available, remaining_demand[res]) / center["distance"]
                
                if benefit > best_benefit:
                    best_benefit = benefit
                    best_center = center
            
            if not best_center:
                break
                
            selected.append(best_center)
            for res, available in best_center["resources"].items():
                if res in remaining_demand:
                    taken = min(available, remaining_demand[res])
                    remaining_demand[res] -= taken
        
        return selected

    def exhaustive_search() -> List[Dict]:
        """Exhaustive search for small number of resource centers"""
        best_solution = []
        best_distance = float('inf')
        best_shortfall = None
        
        # Generate all possible subsets
        for i in range(1, 1 << n):
            subset = [center_list[j] for j in range(n) if i & (1 << j)]
            distance, shortfall = evaluate_solution(subset)
            
            # Prioritize solutions with less shortfall
            shortfall_score = sum(shortfall.values()) if shortfall else 0
            
            if (not best_shortfall and shortfall) or \
               (shortfall_score < sum(best_shortfall.values())) or \
               (shortfall_score == sum(best_shortfall.values()) and distance < best_distance):
                
                best_solution = subset
                best_distance = distance
                best_shortfall = shortfall
        
        return best_solution

    # Select optimization strategy
    if n <= 20:  # Use exhaustive search for small instances
        selected_centers = exhaustive_search()
    else:  # Use greedy for larger instances
        selected_centers = greedy_optimization()

    # Generate assignment details
    assignment = []
    allocated_resources = defaultdict(int)
    remaining_demand = required_dict.copy()
    
    for center in selected_centers:
        center_assignment = {
            "resource_center_id": center["id"],
            "location": center["location"],
            "distance": center["distance"],
            "resources_assigned": []
        }
        
        for res, available in center["resources"].items():
            if res in remaining_demand and remaining_demand[res] > 0:
                taken = min(available, remaining_demand[res])
                center_assignment["resources_assigned"].append({
                    "resource_type": res,
                    "quantity": taken
                })
                allocated_resources[res] += taken
                remaining_demand[res] -= taken
        
        assignment.append(center_assignment)
    
    # Calculate shortfalls
    shortfalls = []
    for res, need in required_dict.items():
        allocated = allocated_resources[res]
        if allocated < need:
            shortfalls.append({
                "resource_type": res,
                "required": need,
                "allocated": allocated,
                "shortfall": need - allocated
            })
    
    # Calculate total distance
    total_distance = sum(center["distance"] for center in selected_centers)
    
    # Prepare response
    response = {
        "status": "completed" if not shortfalls else "pending",
        "request_id": request_id,
        "assignment": assignment,
        "shortfalls": shortfalls,
        "total_distance": total_distance
    }
    
    # Include original request fields
    for field in ["disaster", "disasterId", "disaster_status", "location", 
                  "time", "affected_count", "contact_info", 
                  "image_description", "voice_description", "text_description"]:
        if field in request:
            response[field] = request[field]
    
    return response

if __name__ == "__main__":
    mcp.run(transport="stdio")