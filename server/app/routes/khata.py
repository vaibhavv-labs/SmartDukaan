"""
KiranaMind AI — Khata Book & Customer Udhaar Management Routes
Includes Ledger transactions, dynamic risk updates, and AI WhatsApp reminder generators.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Customer, KhataTransaction
from app.schemas import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    KhataTransactionCreate,
    KhataTransactionResponse,
)

router = APIRouter(prefix="/api/v1/khata", tags=["Khata Book"])


@router.get("/summary")
def get_khata_summary(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    total_pending = sum(c.pending_amount for c in customers)
    high_risk_count = sum(1 for c in customers if c.risk_score >= 70)
    moderate_risk = sum(1 for c in customers if 40 <= c.risk_score < 70)

    return {
        "total_customers": len(customers),
        "total_pending_udhaar": round(total_pending, 2),
        "high_risk_count": high_risk_count,
        "moderate_risk_count": moderate_risk,
        "safe_count": len(customers) - high_risk_count - moderate_risk,
    }


@router.get("/customers", response_model=List[CustomerResponse])
def get_customers(
    search: Optional[str] = Query(None, description="Search by name or phone"),
    tier: Optional[str] = Query(None, description="Platinum, Good, Moderate, High Risk"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(Customer)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter((Customer.name.ilike(search_fmt)) | (Customer.phone.ilike(search_fmt)))
    if tier and tier != "All":
        query = query.filter(Customer.trust_tier == tier)

    return query.order_by(Customer.pending_amount.desc()).offset(skip).limit(limit).all()


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(cust_in: CustomerCreate, db: Session = Depends(get_db)):
    customer = Customer(
        name=cust_in.name,
        phone=cust_in.phone,
        address=cust_in.address,
        pending_amount=cust_in.pending_amount or 0.0,
        credit_limit=cust_in.credit_limit,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.put("/customers/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    cust_in: CustomerUpdate,
    db: Session = Depends(get_db),
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    for field, val in cust_in.dict(exclude_unset=True).items():
        setattr(customer, field, val)

    db.commit()
    db.refresh(customer)
    return customer


@router.post("/customers/{customer_id}/transaction", response_model=KhataTransactionResponse)
def add_transaction(
    customer_id: int,
    tx_in: KhataTransactionCreate,
    db: Session = Depends(get_db),
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    now = datetime.utcnow()
    # Update balance
    if tx_in.type == "GIVEN":  # Udhaar Diya (Debit)
        customer.pending_amount += tx_in.amount
    elif tx_in.type == "RECEIVED":  # Jama Kiya (Credit)
        customer.pending_amount = max(0.0, customer.pending_amount - tx_in.amount)
        customer.last_payment_date = now

    # Recalculate risk score
    ratio = customer.pending_amount / (customer.credit_limit or 5000.0)
    customer.risk_score = min(100.0, round(ratio * 70.0, 1))
    if customer.risk_score >= 75:
        customer.trust_tier = "High Risk"
    elif customer.risk_score >= 50:
        customer.trust_tier = "Moderate"
    elif customer.risk_score >= 25:
        customer.trust_tier = "Good"
    else:
        customer.trust_tier = "Platinum"

    tx = KhataTransaction(
        customer_id=customer.id,
        type=tx_in.type,
        amount=tx_in.amount,
        balance_after=customer.pending_amount,
        note=tx_in.note,
        payment_mode=tx_in.payment_mode or "Cash",
        date=now,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.post("/customers/{customer_id}/reminder")
def generate_whatsapp_reminder(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Tone adjusted based on risk score (Polite -> Firm)
    if customer.risk_score >= 75:
        tone = "firm"
        message = (
            f"Namaste {customer.name} ji, Sharma General Store se nivedan hai ki aapka kul udhaar "
            f"₹{customer.pending_amount:,.2f} kaafi samay se baki hai. Kripya aaj shaam tak dukan par aakar "
            f"ya UPI dwara bhugtan karein taaki humari sewayen jari reh sakein. Dhanyawad!"
        )
    elif customer.risk_score >= 45:
        tone = "medium"
        message = (
            f"Namaste {customer.name} ji, Sharma General Store se gentle reminder: aapka baki hisab "
            f"₹{customer.pending_amount:,.2f} hai. Suvidhanusar agle 2 dino me clear kar dein. "
            f"UPI: rajesh.sharma@okhdfcbank. Dhanyawad!"
        )
    else:
        tone = "polite"
        message = (
            f"Namaste {customer.name} ji! Aasha hai aap kushal hain. Sharma General Store me aapka "
            f"halka sa balance ₹{customer.pending_amount:,.2f} baki hai. Agli baar dukan aate waqt jama kar dein. Shubhkamnayein!"
        )

    # Encode whatsapp link
    import urllib.parse
    encoded_msg = urllib.parse.quote(message)
    clean_phone = customer.phone.replace("+", "").replace(" ", "").replace("-", "")
    whatsapp_url = f"https://wa.me/91{clean_phone}?text={encoded_msg}"

    return {
        "customer_id": customer.id,
        "customer_name": customer.name,
        "phone": customer.phone,
        "pending_amount": customer.pending_amount,
        "tone": tone,
        "message": message,
        "whatsapp_url": whatsapp_url,
    }
