"""
KiranaMind AI — Inventory Management Routes
"""

from typing import List, Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Product
from app.schemas import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])


@router.get("/", response_model=List[ProductResponse])
def get_products(
    search: Optional[str] = Query(None, description="Search by name or category"),
    category: Optional[str] = Query(None, description="Filter by category"),
    stock_status: Optional[str] = Query(None, description="all, low, out, expiring"),
    sort_by: Optional[str] = Query("name", description="name, stock, sell_price, expiry_date"),
    sort_dir: Optional[str] = Query("asc", description="asc, desc"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_fmt),
                Product.category.ilike(search_fmt),
                Product.barcode.ilike(search_fmt),
            )
        )

    if category and category != "All":
        query = query.filter(Product.category == category)

    if stock_status == "low":
        query = query.filter(Product.stock > 0, Product.stock <= Product.min_stock)
    elif stock_status == "out":
        query = query.filter(Product.stock <= 0)
    elif stock_status == "expiring":
        threshold = date.today() + timedelta(days=15)
        query = query.filter(Product.expiry_date != None, Product.expiry_date <= threshold)

    # Sort
    sort_col = getattr(Product, sort_by, Product.name)
    if sort_dir == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    return query.offset(skip).limit(limit).all()


@router.get("/summary/stats")
def get_inventory_stats(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    total_products = len(products)
    total_value = sum(p.stock * p.cost_price for p in products)
    low_stock = sum(1 for p in products if p.stock > 0 and p.stock <= p.min_stock)
    out_of_stock = sum(1 for p in products if p.stock <= 0)
    today = date.today()
    expiring = sum(
        1 for p in products if p.expiry_date and 0 <= (p.expiry_date - today).days <= 15
    )

    return {
        "total_products": total_products,
        "total_inventory_value": round(total_value, 2),
        "low_stock_count": low_stock,
        "out_of_stock_count": out_of_stock,
        "expiring_soon_count": expiring,
    }


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**product_in.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, val in product_in.dict(exclude_unset=True).items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return None
