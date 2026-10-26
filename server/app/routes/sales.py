"""
KiranaMind AI — Sales & Billing API Routes
Handles bill generation, stock auto-deduction, and auto-Khata debit for udhaar purchases.
"""

from typing import List, Optional
from datetime import datetime, date
import random
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Sale, SaleItem, Product, Customer, KhataTransaction
from app.schemas import SaleCreate, SaleResponse

router = APIRouter(prefix="/api/v1/sales", tags=["Sales"])


@router.get("/", response_model=List[SaleResponse])
def get_sales(
    payment_mode: Optional[str] = Query(None, description="Cash, UPI, Udhaar"),
    limit: int = 50,
    skip: int = 0,
    db: Session = Depends(get_db),
):
    query = db.query(Sale).order_by(Sale.created_at.desc())
    if payment_mode:
        query = query.filter(Sale.payment_mode == payment_mode)
    return query.offset(skip).limit(limit).all()


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale invoice not found")
    return sale


@router.post("/", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(sale_in: SaleCreate, db: Session = Depends(get_db)):
    # 1. Generate unique invoice number
    now = datetime.utcnow()
    rand_suffix = random.randint(1000, 9999)
    invoice_no = f"INV-{now.strftime('%Y%m%d')}-{rand_suffix}"

    # 2. Resolve customer if provided
    customer = None
    customer_name = sale_in.customer_name or "Walk-in Customer"
    if sale_in.customer_id:
        customer = db.query(Customer).filter(Customer.id == sale_in.customer_id).first()
        if customer:
            customer_name = customer.name

    # 3. Create Sale Record
    sale = Sale(
        invoice_no=invoice_no,
        customer_id=customer.id if customer else None,
        customer_name=customer_name,
        total_amount=sale_in.total_amount,
        payment_mode=sale_in.payment_mode,
        items_count=len(sale_in.items),
        notes=sale_in.notes,
        created_at=now,
    )
    db.add(sale)
    db.flush()  # get sale.id

    # 4. Process line items & auto-deduct stock
    for item_data in sale_in.items:
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=item_data.product_id,
            product_name=item_data.product_name,
            quantity=item_data.quantity,
            unit=item_data.unit,
            unit_price=item_data.unit_price,
            subtotal=item_data.subtotal,
        )
        db.add(sale_item)

        # Deduct product inventory if found
        product = None
        if item_data.product_id:
            product = db.query(Product).filter(Product.id == item_data.product_id).first()
        elif item_data.product_name:
            product = db.query(Product).filter(Product.name == item_data.product_name).first()

        if product:
            product.stock = max(0.0, product.stock - item_data.quantity)
            product.last_sold_date = now

    # 5. If Udhaar (Credit) sale, automatically update Khata ledger
    if sale_in.payment_mode == "Udhaar" and customer:
        customer.pending_amount += sale_in.total_amount
        transaction = KhataTransaction(
            customer_id=customer.id,
            type="GIVEN",
            amount=sale_in.total_amount,
            balance_after=customer.pending_amount,
            note=f"Voice/POS Bill #{invoice_no}",
            payment_mode="Udhaar",
            date=now,
        )
        db.add(transaction)

        # Update customer risk score
        ratio = customer.pending_amount / (customer.credit_limit or 5000.0)
        customer.risk_score = min(100.0, round(ratio * 70.0, 1))
        if customer.risk_score >= 75:
            customer.trust_tier = "High Risk"
        elif customer.risk_score >= 50:
            customer.trust_tier = "Moderate"
        else:
            customer.trust_tier = "Good"

    db.commit()
    db.refresh(sale)
    return sale
