import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import requests
import logging
from typing import List, Dict, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class AgriculturalRAG:
    def __init__(self):
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.documents = []
        self._initialize_knowledge_base()

    def _initialize_knowledge_base(self):
        # Sample agricultural knowledge base
        self.documents = [
            "Rice requires consistent water supply and grows best in warm, humid conditions.",
            "Wheat is a cool-season crop that needs well-drained soil and moderate rainfall.",
            "Cotton needs hot, dry weather and well-drained soil for optimal growth.",
            "Tomatoes require full sun, warm temperatures, and regular watering.",
            "Pests like aphids can be controlled with neem oil or insecticidal soap.",
            "Fertilizers should be applied based on soil test results to avoid over-fertilization.",
            "Crop rotation helps maintain soil fertility and reduces pest problems.",
            "Drip irrigation is more efficient than flood irrigation for water conservation.",
            "Organic farming uses natural methods to improve soil health and reduce chemical use.",
            "Weather forecasting helps farmers plan planting and harvesting activities.",
            "Soil pH affects nutrient availability; most crops prefer slightly acidic to neutral soil.",
            "Companion planting can help control pests naturally, like planting marigolds with tomatoes.",
            "Mulching helps retain soil moisture and suppress weed growth.",
            "Integrated Pest Management combines biological, cultural, and chemical methods.",
            "Sustainable agriculture focuses on long-term soil health and environmental protection."
        ]
        self._build_index()

    def _build_index(self):
        embeddings = self.encoder.encode(self.documents)
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity
        faiss.normalize_L2(embeddings)  # Normalize for cosine similarity
        self.index.add(embeddings)

    def search_offline(self, query: str, top_k: int = 3) -> List[Dict]:
        query_embedding = self.encoder.encode([query])
        faiss.normalize_L2(query_embedding)
        distances, indices = self.index.search(query_embedding, top_k)

        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.documents):
                results.append({
                    "document": self.documents[idx],
                    "score": float(distances[0][i])
                })
        return results

    def generate_ai_response(self, query: str, offline_results: List[Dict]) -> Optional[str]:
        if not all([settings.watsonx_api_key, settings.watsonx_url, settings.watsonx_project_id]):
            logger.warning("Watsonx credentials not configured, skipping AI response")
            return None

        context = "\n".join([result["document"] for result in offline_results])

        prompt = f"""You are an agricultural expert assistant. Based on the following context and the user's query, provide a helpful, accurate response.

Context:
{context}

User Query: {query}

Please provide a comprehensive answer that addresses the user's agricultural question."""

        try:
            response = requests.post(
                f"{settings.watsonx_url}/ml/v1/text/generation?version=2023-05-29",
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.watsonx_api_key}"
                },
                json={
                    "input": prompt,
                    "parameters": {
                        "decoding_method": "greedy",
                        "max_new_tokens": 300,
                        "min_new_tokens": 50,
                        "temperature": 0.7,
                        "repetition_penalty": 1.1
                    },
                    "model_id": "ibm/granite-3-8b-instruct",
                    "project_id": settings.watsonx_project_id
                },
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                return result["results"][0]["generated_text"]
            else:
                logger.error(f"Watsonx API error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            logger.error(f"Error calling Watsonx API: {str(e)}")
            return None

# Global RAG instance
rag_system = AgriculturalRAG()
