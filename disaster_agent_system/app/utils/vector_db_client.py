import requests

VECTOR_DB_URL = None

def init_vector_db(url):
    global VECTOR_DB_URL
    VECTOR_DB_URL = url

def upsert_embedding(id, vector, metadata):
    # Example REST API call to vector DB
    payload = {
        "id": id,
        "vector": vector,
        "metadata": metadata
    }
    response = requests.post(f"{VECTOR_DB_URL}/vectors/upsert", json=payload)
    return response.json()

def query_similar_vectors(vector, top_k=5):
    payload = {
        "vector": vector,
        "top_k": top_k
    }
    response = requests.post(f"{VECTOR_DB_URL}/vectors/query", json=payload)
    return response.json()
