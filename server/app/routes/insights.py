"""
KiranaMind AI — Proactive Insights API Routes
Exposes intelligence alerts, capital-at-risk ranking, and action triggers.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Insight
from app.schemas import InsightResponse
from app.services.intelligence import run_intelligence_engine

router = APIRouter(prefix="/api/v1/insights", tags=["Proactive Insights"])


@router.get("/", response_model=List[InsightResponse])
def get_insights(
    insight_type: Optional[str] = Query(None, description="expiry_risk, dead_stock, cashflow_forecast, smart_reorder, udhaar_risk"),
    severity: Optional[str] = Query(None, description="critical, warning, info, success"),
    db: Session = Depends(get_db),
):
    query = db.query(Insight).filter(Insight.action_taken == False)
    if insight_type:
        query = query.filter(Insight.type == insight_type)
    if severity:
        query = query.filter(Insight.severity == severity)

    # Sort critical first, then highest capital at risk
    return query.order_by(Insight.capital_at_risk.desc()).all()


@router.post("/recalculate", response_model=List[InsightResponse])
def recalculate_insights(db: Session = Depends(get_db)):
    insights = run_intelligence_engine(db)
    return insights


@router.post("/{insight_id}/action", response_model=InsightResponse)
def take_insight_action(insight_id: int, db: Session = Depends(get_db)):
    insight = db.query(Insight).filter(Insight.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")

    insight.action_taken = True
    db.commit()
    db.refresh(insight)
    return insight


@router.delete("/{insight_id}", status_code=status.HTTP_204_NO_CONTENT)
def dismiss_insight(insight_id: int, db: Session = Depends(get_db)):
    insight = db.query(Insight).filter(Insight.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")

    db.delete(insight)
    db.commit()
    return None
