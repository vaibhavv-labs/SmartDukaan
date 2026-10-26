"""
KiranaMind AI — SQLAlchemy Database Models
Includes User/Store, Product Inventory, Customers, Khata Transactions, Sales, Insights, and Scans.
"""

from datetime import datetime, date
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), default="Rajesh Sharma")
    store_name = Column(String(150), default="Sharma General Store")
    phone = Column(String(20), default="9876543210")
    address = Column(String(255), default="Shop #4, Main Market, Delhi")
    upi_id = Column(String(100), default="rajesh.sharma@okhdfcbank")
    created_at = Column(DateTime, default=datetime.utcnow)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    name_hindi = Column(String(150), nullable=True)
    category = Column(String(50), nullable=False, index=True)
    stock = Column(Float, nullable=False, default=0.0)
    unit = Column(String(20), nullable=False, default="pcs")  # kg, pcs, pkt, ltr, gm, dozen
    cost_price = Column(Float, nullable=False, default=0.0)
    sell_price = Column(Float, nullable=False, default=0.0)
    min_stock = Column(Float, nullable=False, default=5.0)
    expiry_date = Column(Date, nullable=True)
    barcode = Column(String(50), nullable=True, index=True)
    last_sold_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sale_items = relationship("SaleItem", back_populates="product")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    phone = Column(String(20), nullable=False, index=True)
    address = Column(String(255), nullable=True)
    pending_amount = Column(Float, nullable=False, default=0.0)
    credit_limit = Column(Float, nullable=False, default=5000.0)
    risk_score = Column(Float, nullable=False, default=15.0)  # 0-100 (higher = riskier)
    trust_tier = Column(String(30), nullable=False, default="Good")  # Platinum, Good, Moderate, High Risk
    last_payment_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    transactions = relationship("KhataTransaction", back_populates="customer", cascade="all, delete-orphan")
    sales = relationship("Sale", back_populates="customer")


class KhataTransaction(Base):
    __tablename__ = "khata_transactions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    type = Column(String(20), nullable=False)  # "GIVEN" (Udhaar added) or "RECEIVED" (Jama paid)
    amount = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False, default=0.0)
    note = Column(String(255), nullable=True)
    payment_mode = Column(String(30), default="Cash")  # Cash, UPI
    date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="transactions")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer_name = Column(String(100), nullable=True)
    total_amount = Column(Float, nullable=False, default=0.0)
    payment_mode = Column(String(30), nullable=False, default="Cash")  # Cash, UPI, Udhaar
    items_count = Column(Integer, default=1)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String(150), nullable=False)
    quantity = Column(Float, nullable=False, default=1.0)
    unit = Column(String(20), default="pcs")
    unit_price = Column(Float, nullable=False, default=0.0)
    subtotal = Column(Float, nullable=False, default=0.0)

    # Relationships
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")


class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False, index=True)  # expiry_risk, dead_stock, cashflow_forecast, smart_reorder, udhaar_risk
    severity = Column(String(20), nullable=False, default="warning")  # critical, warning, info, success
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    capital_at_risk = Column(Float, default=0.0)
    recommended_action = Column(String(255), nullable=True)
    action_taken = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class BillScanRecord(Base):
    __tablename__ = "bill_scans"

    id = Column(Integer, primary_key=True, index=True)
    scan_type = Column(String(50), nullable=False)  # wholesaler_bill, khata_sheet
    file_name = Column(String(255), nullable=True)
    supplier_name = Column(String(150), nullable=True)
    bill_number = Column(String(50), nullable=True)
    bill_date = Column(Date, nullable=True)
    total_amount = Column(Float, default=0.0)
    parsed_data_json = Column(Text, nullable=True)
    status = Column(String(30), default="completed")  # completed, pending, failed
    created_at = Column(DateTime, default=datetime.utcnow)
