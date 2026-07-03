import os
import shap
import pandas as pd
import numpy as np
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'xgboost_alpha_model.pkl')
DATASET_PATH = os.path.join(BASE_DIR, 'models', 'alpha_dataset.csv') # Global baseline if needed

class SHAPExplainabilityService:
    def __init__(self):
        self.model = None
        self.explainer = None
        self.global_importance = []
        self._load_model_and_explainer()

    def _load_model_and_explainer(self):
        """Loads the XGBoost model and initializes the SHAP TreeExplainer."""
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
            # Initialize TreeExplainer
            self.explainer = shap.TreeExplainer(self.model)
            
            # If we want true global importance, we'd load the dataset and compute avg(|SHAP|)
            # For performance, we'll extract it from the model's built-in feature importances 
            # as a proxy for global SHAP importance if the full dataset isn't loaded into memory.
            from app.ml.train_model import FEATURES
            if hasattr(self.model, 'feature_importances_'):
                importances = self.model.feature_importances_
                
                # Create ranking
                ranking = sorted(zip(FEATURES, importances), key=lambda x: x[1], reverse=True)
                self.global_importance = [{"feature": f, "importance": round(float(imp), 4)} for f, imp in ranking]

    def explain_prediction(self, feature_df: pd.DataFrame) -> dict:
        """
        Takes a 1-row DataFrame of features and returns local SHAP attributions.
        """
        if self.explainer is None:
            self._load_model_and_explainer()
            if self.explainer is None:
                raise RuntimeError("XGBoost Alpha model not available for SHAP explanation.")

        # Compute SHAP values for the specific row
        shap_values = self.explainer.shap_values(feature_df)
        
        # TreeExplainer returns a numpy array. For a single row, it's 1D.
        if isinstance(shap_values, list): # Some multi-class outputs return lists
            shap_values = shap_values[0]
            
        if len(shap_values.shape) == 2:
            shap_values = shap_values[0]

        features = feature_df.columns.tolist()
        
        # Map features to their SHAP values
        attributions = []
        for i, feature in enumerate(features):
            attributions.append({
                "feature": feature,
                "contribution": round(float(shap_values[i]), 3),
                "feature_value": round(float(feature_df.iloc[0, i]), 3)
            })
            
        # Sort into positive and negative drivers
        positive_features = sorted([f for f in attributions if f['contribution'] > 0], key=lambda x: x['contribution'], reverse=True)
        negative_features = sorted([f for f in attributions if f['contribution'] < 0], key=lambda x: x['contribution'])
        
        return {
            "top_positive_features": positive_features[:5], # Top 5 bullish drivers
            "top_negative_features": negative_features[:5], # Top 5 bearish drivers
            "global_feature_importance": self.global_importance,
            "base_value": round(float(self.explainer.expected_value), 3) # The model's baseline prediction
        }

shap_service = SHAPExplainabilityService()
