"""
KiranaMind AI — Proactive Intelligence Engine
The core business brain: Expiry Risk Ranking, Dead Stock Detection,
Cash-Flow Forecasting, Smart Reorder Suggestions, and Udhaar Risk Scoring.
"""

from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Product, Customer, Sale, SaleItem, Insight


def run_intelligence_engine(db: Session) -> List[Insight]:
    """
    Runs all proactive analysis algorithms across products, sales, and customers.
    Stores and refreshes actionable insights in the database.
    """
    # Clear previous automated insights so we keep recommendations fresh
    db.query(Insight).delete()
    db.commit()

    generated_insights: List[Insight] = []
    now = datetime.utcnow()
    today = date.today()

    # 1. EXPIRY RISK ALERTS (Ranked by capital-at-risk)
    products = db.query(Product).all()
    expiring_products = []
    for p in products:
        if p.expiry_date and p.stock > 0:
            days_left = (p.expiry_date - today).days
            if days_left <= 30:
                capital_at_risk = round(p.stock * p.cost_price, 2)
                expiring_products.append({
                    "product": p,
                    "days_left": days_left,
                    "capital": capital_at_risk,
                })

    # Sort by capital-at-risk descending
    expiring_products.sort(key=lambda x: x["capital"], reverse=True)

    for item in expiring_products[:4]:
        p = item["product"]
        days = item["days_left"]
        capital = item["capital"]

        if days <= 5:
            severity = "critical"
            title = f"Urgent: {p.name} expiring in {days} days"
            desc = f"{p.stock} {p.unit} expiring soon. ₹{capital} capital at risk of total loss."
            action = f"Put on 30% discount shelf immediately or bundle with high-velocity items"
        else:
            severity = "warning"
            title = f"{p.name} expires in {days} days"
            desc = f"{p.stock} {p.unit} remaining (₹{capital} capital invested). Sell velocity is slow."
            action = f"Offer bundle promo: Buy 2 get 10% off"

        insight = Insight(
            type="expiry_risk",
            severity=severity,
            title=title,
            description=desc,
            capital_at_risk=capital,
            recommended_action=action,
            created_at=now,
        )
        db.add(insight)
        generated_insights.append(insight)

    # 2. DEAD STOCK DETECTION (Items unsold for > 20 days or high stock low movement)
    dead_stock_items = []
    for p in products:
        if p.stock > 10:
            # Check sales in last 20 days
            recent_sold = db.query(SaleItem).join(Sale).filter(
                SaleItem.product_name == p.name,
                Sale.created_at >= now - timedelta(days=20)
            ).count()

            if recent_sold == 0:
                capital_locked = round(p.stock * p.cost_price, 2)
                dead_stock_items.append({"product": p, "capital": capital_locked})

    dead_stock_items.sort(key=lambda x: x["capital"], reverse=True)
    for item in dead_stock_items[:3]:
        p = item["product"]
        capital = item["capital"]
        insight = Insight(
            type="dead_stock",
            severity="warning",
            title=f"Dead Stock: {p.name} has 0 sales in 20+ days",
            description=f"{p.stock} {p.unit} sitting idle in shop. ₹{capital} capital locked without returns.",
            capital_at_risk=capital,
            recommended_action=f"Reduce display space or return {int(p.stock * 0.7)} units to distributor",
            created_at=now,
        )
        db.add(insight)
        generated_insights.append(insight)

    # 3. SMART REORDER SUGGESTIONS (Stock below min_stock)
    low_stock = [p for p in products if p.stock <= p.min_stock]
    for p in low_stock[:3]:
        reorder_qty = max(20, int(p.min_stock * 3))
        estimated_cost = round(reorder_qty * p.cost_price, 2)
        insight = Insight(
            type="smart_reorder",
            severity="warning" if p.stock > 0 else "critical",
            title=f"Stock Depleted: {p.name} ({p.stock} {p.unit} left)",
            description=f"Current stock is below safety threshold ({p.min_stock} {p.unit}). Estimated stockout in 1-2 days.",
            capital_at_risk=estimated_cost,
            recommended_action=f"Reorder {reorder_qty} {p.unit} from distributor (est. ₹{estimated_cost})",
            created_at=now,
        )
        db.add(insight)
        generated_insights.append(insight)

    # 4. UDHAAR (CREDIT) RISK SCORING
    customers = db.query(Customer).all()
    high_risk_customers = []
    total_udhaar = 0.0

    for c in customers:
        total_udhaar += c.pending_amount
        # Compute dynamic risk score (0-100)
        limit_ratio = (c.pending_amount / c.credit_limit) if c.credit_limit > 0 else 1.0
        days_since_payment = 0
        if c.last_payment_date:
            days_since_payment = (now - c.last_payment_date).days

        # Risk formula: base score from limit ratio + penalty for overdue payment delay
        score = min(100.0, round((limit_ratio * 55.0) + (min(days_since_payment, 45) * 1.0), 1))
        c.risk_score = score

        if score >= 75.0:
            c.trust_tier = "High Risk"
            high_risk_customers.append(c)
        elif score >= 50.0:
            c.trust_tier = "Moderate"
        elif score >= 25.0:
            c.trust_tier = "Good"
        else:
            c.trust_tier = "Platinum"

    for c in high_risk_customers[:3]:
        insight = Insight(
            type="udhaar_risk",
            severity="critical",
            title=f"High Udhaar Risk: {c.name} (₹{c.pending_amount})",
            description=f"Pending balance is {int((c.pending_amount/c.credit_limit)*100)}% of limit. Risk score: {c.risk_score}/100.",
            capital_at_risk=c.pending_amount,
            recommended_action=f"Send WhatsApp payment reminder link or pause new credit",
            created_at=now,
        )
        db.add(insight)
        generated_insights.append(insight)

    # 5. CASH-FLOW FORECASTING
    upcoming_supplier_dues = 14500.0  # Estimated wholesaler weekly supply
    projected_recovery = total_udhaar * 0.45  # Expected 45% recovery rate
    if projected_recovery < upcoming_supplier_dues:
        shortfall = round(upcoming_supplier_dues - projected_recovery, 2)
        insight = Insight(
            type="cashflow_forecast",
            severity="info",
            title=f"Weekly Cash-Flow Alert: ₹{shortfall} projected shortfall",
            description=f"Wholesaler delivery due this Friday (₹{upcoming_supplier_dues}). Udhaar recovery projection is ₹{round(projected_recovery, 2)}.",
            capital_at_risk=shortfall,
            recommended_action="Target 5 customer collections today to secure cash reserves",
            created_at=now,
        )
        db.add(insight)
        generated_insights.append(insight)

    db.commit()
    return generated_insights
