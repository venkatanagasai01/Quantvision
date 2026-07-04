from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import json

from app.db.database import get_db
from app.models.db_models import ResearchReport, User
from app.api.routers.stocks import analyze_stock
from app.core.security import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])

from pydantic import ConfigDict

class ResearchReportResponse(BaseModel):
    id: int
    symbol: str
    recommendation: str
    confidence_score: float
    generated_at: str
    
    model_config = ConfigDict(from_attributes=True)

class ResearchReportDetail(ResearchReportResponse):
    report_json: dict

@router.post("/generate/{symbol}")
def generate_report(symbol: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Triggers the entire Quantan AI pipeline for a symbol, saves the result as a
    persisted research report, and returns it.
    """
    try:
        # Run full analysis using existing endpoint logic
        analysis_res = analyze_stock(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate analysis: {str(e)}")

    # Convert the pydantic response to a JSON string
    report_dict = analysis_res.dict()
    report_json_str = json.dumps(report_dict)

    # Save to PostgreSQL
    new_report = ResearchReport(
        user_id=current_user.id,
        symbol=symbol.upper(),
        recommendation=analysis_res.recommendation,
        confidence_score=analysis_res.confidence_score,
        report_json=report_json_str
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return {
        "id": new_report.id,
        "symbol": new_report.symbol,
        "recommendation": new_report.recommendation,
        "confidence_score": new_report.confidence_score,
        "generated_at": new_report.generated_at.isoformat(),
        "report_json": report_dict
    }

@router.get("", response_model=dict)
def get_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    recommendation: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Paginated, filtered list of historical research reports.
    """
    query = db.query(ResearchReport).filter(ResearchReport.user_id == current_user.id)
    
    if recommendation and recommendation != "ALL":
        query = query.filter(ResearchReport.recommendation == recommendation)
        
    if search:
        query = query.filter(ResearchReport.symbol.ilike(f"%{search}%"))

    total = query.count()
    reports = query.order_by(ResearchReport.generated_at.desc()) \
                   .offset((page - 1) * limit) \
                   .limit(limit) \
                   .all()

    items = []
    for r in reports:
        items.append({
            "id": r.id,
            "symbol": r.symbol,
            "recommendation": r.recommendation,
            "confidence_score": r.confidence_score,
            "generated_at": r.generated_at.isoformat()
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": items
    }

@router.get("/{report_id}", response_model=ResearchReportDetail)
def get_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(ResearchReport).filter(
        ResearchReport.id == report_id,
        ResearchReport.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return {
        "id": report.id,
        "symbol": report.symbol,
        "recommendation": report.recommendation,
        "confidence_score": report.confidence_score,
        "generated_at": report.generated_at.isoformat(),
        "report_json": json.loads(report.report_json)
    }
