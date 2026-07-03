from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.db_models import User
from app.core.security import get_current_user
from app.ml.alpha_prediction_service import alpha_service

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

class MLPredictionResponse(BaseModel):
    symbol: str
    predicted_return: float
    recommendation: str
    confidence_score: float
    probability_positive: float

@router.get("/predict/{symbol}", response_model=MLPredictionResponse)
def get_ml_prediction(symbol: str, current_user: User = Depends(get_current_user)):
    """
    Returns the 30-Day Forward Return prediction from the XGBoost Alpha model.
    """
    try:
        prediction = alpha_service.predict(symbol.upper())
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/explain/{symbol}")
def explain_ml_prediction(symbol: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns the base XGBoost prediction along with the local SHAP explainability breakdown.
    Persists the explanation to the database as a JSON blob.
    """
    from app.ml.explainability.shap_service import shap_service
    import json
    import uuid
    from app.models.db_models import PredictionExplanation
    from app.ml.train_model import FEATURES

    try:
        # 1. Base Prediction
        prediction = alpha_service.predict(symbol.upper())
        
        # 2. Extract live features
        features_df = alpha_service.get_features(symbol.upper())
        X = features_df[FEATURES]
        
        # 3. Generate SHAP Explanation
        explanation = shap_service.explain_prediction(X)
        
        # Merge payload
        response_payload = {
            "prediction_id": str(uuid.uuid4()),
            "symbol": prediction["symbol"],
            "recommendation": prediction["recommendation"],
            "predicted_return": prediction["predicted_return"],
            "confidence_score": prediction["confidence_score"],
            "top_positive_features": explanation["top_positive_features"],
            "top_negative_features": explanation["top_negative_features"],
            "feature_importance": explanation["global_feature_importance"]
        }
        
        # 4. Asynchronously or synchronously store in DB
        db_expl = PredictionExplanation(
            user_id=current_user.id,
            symbol=prediction["symbol"],
            prediction_id=response_payload["prediction_id"],
            explanation_json=json.dumps(explanation)
        )
        db.add(db_expl)
        db.commit()
        
        return response_payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
