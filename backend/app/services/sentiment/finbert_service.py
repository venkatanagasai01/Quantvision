import logging
from typing import Dict

logger = logging.getLogger(__name__)

class FinBERTService:
    """
    Singleton service for FinBERT inference.
    Loads the Hugging Face model once into memory to avoid latency during API requests.
    """
    _pipeline = None

    @classmethod
    def get_pipeline(cls):
        if cls._pipeline is None:
            logger.info("Initializing FinBERT pipeline... This may take a moment on first boot to download weights.")
            try:
                from transformers import pipeline
                # Use ProsusAI/finbert which is specifically trained on financial text
                cls._pipeline = pipeline("text-classification", model="ProsusAI/finbert", top_k=None)
                logger.info("FinBERT initialized successfully.")
            except ImportError:
                logger.error("transformers library not found.")
                raise
            except Exception as e:
                logger.error(f"Failed to load FinBERT: {str(e)}")
                raise
        return cls._pipeline

    @classmethod
    def analyze_text(cls, text: str) -> Dict[str, float]:
        """
        Runs inference on the provided text and returns Positive, Negative, and Neutral probabilities.
        """
        if not text:
            return {"positive": 0.0, "negative": 0.0, "neutral": 1.0}
            
        pipe = cls.get_pipeline()
        
        try:
            # truncation=True ensures we don't crash on texts > 512 tokens
            results = pipe(text, truncation=True, max_length=512)
            
            # pipeline with top_k=None returns a list of lists of dicts
            # Example: [[{'label': 'positive', 'score': 0.8}, {'label': 'negative', 'score': 0.1}, ...]]
            scores = results[0]
            
            # Map into a cleaner dictionary
            mapped = {item['label']: item['score'] for item in scores}
            return {
                "positive": mapped.get("positive", 0.0),
                "negative": mapped.get("negative", 0.0),
                "neutral": mapped.get("neutral", 0.0)
            }
        except Exception as e:
            logger.error(f"FinBERT Inference error: {str(e)}")
            return {"positive": 0.0, "negative": 0.0, "neutral": 1.0}
