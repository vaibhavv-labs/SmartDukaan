"""
KiranaMind AI — Pydantic Schemas for Request & Response validation
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ==========================================
# AUTH / USER SCHEMAS
# ==========================================
class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = "Rajesh Sharma"
    store_name: Optional[str] = "Sharma General Store"
    phone: Optional[str] = "9876543210"
    address: Optional[str] = "Shop #4, Main Market, Delhi"
    upi_id: Optional[str] = "rajesh.sharma@okhdfcbank"


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    store_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    upi_id: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# ==========================================
# INVENTORY / PRODUCT SCHEMAS
# ==========================================
class ProductBase(BaseModel):
    name: str
    name_hindi: Optional[str] = None
    category: str
    stock: float = 0.0
    unit: str = "pcs"
    cost_price: float = 0.0
    sell_price: float = 0.0
    min_stock: float = 5.0
    expiry_date: Optional[date] = None
    barcode: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    name_hindi: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[float] = None
    unit: Optional[str] = None
    cost_price: Optional[float] = None
    sell_price: Optional[float] = None
    min_stock: Optional[float] = None
    expiry_date: Optional[date] = None
    barcode: Optional[str] = None


class ProductResponse(ProductBase):
    id: int
    last_sold_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# KHATA / CUSTOMER SCHEMAS
# ==========================================
class CustomerBase(BaseModel):
    name: str
    phone: str
    address: Optional[str] = None
    credit_limit: float = 5000.0


class CustomerCreate(CustomerBase):
    pending_amount: Optional[float] = 0.0


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    credit_limit: Optional[float] = None


class KhataTransactionCreate(BaseModel):
    type: str  # "GIVEN" (Udhaar added) or "RECEIVED" (Jama paid)
    amount: float
    note: Optional[str] = None
    payment_mode: Optional[str] = "Cash"


class KhataTransactionResponse(BaseModel):
    id: int
    customer_id: int
    type: str
    amount: float
    balance_after: float
    note: Optional[str] = None
    payment_mode: str
    date: datetime

    class Config:
        from_attributes = True


class CustomerResponse(CustomerBase):
    id: int
    pending_amount: float
    risk_score: float
    trust_tier: str
    last_payment_date: Optional[datetime] = None
    created_at: datetime
    transactions: List[KhataTransactionResponse] = []

    class Config:
        from_attributes = True


# ==========================================
# SALES & BILLING SCHEMAS
# ==========================================
class SaleItemCreate(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    quantity: float = 1.0
    unit: str = "pcs"
    unit_price: float
    subtotal: float


class SaleItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: str
    quantity: float
    unit: str
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True


class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: Optional[str] = "Walk-in Customer"
    payment_mode: str = "Cash"  # "Cash", "UPI", "Udhaar"
    items: List[SaleItemCreate]
    total_amount: float
    notes: Optional[str] = None


class SaleResponse(BaseModel):
    id: int
    invoice_no: str
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    total_amount: float
    payment_mode: str
    items_count: int
    notes: Optional[str] = None
    created_at: datetime
    items: List[SaleItemResponse] = []

    class Config:
        from_attributes = True


# ==========================================
# INSIGHT SCHEMAS
# ==========================================
class InsightResponse(BaseModel):
    id: int
    type: str
    severity: str
    title: str
    description: str
    capital_at_risk: float
    recommended_action: Optional[str] = None
    action_taken: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# AI / MULTI-MODAL SCHEMAS
# ==========================================
class VoiceParseRequest(BaseModel):
    audio_text: str  # e.g. "Rahul ko 2 Parle-G aur 1kg chawal udhaar"
    language: Optional[str] = "hinglish"


class ParsedVoiceItem(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    quantity: float = 1.0
    unit: str = "pcs"
    unit_price: float = 0.0
    subtotal: float = 0.0


class VoiceParseResponse(BaseModel):
    original_text: str
    customer_name: Optional[str] = None
    customer_id: Optional[int] = None
    payment_mode: str = "Cash"  # "Cash", "UPI", "Udhaar"
    items: List[ParsedVoiceItem] = []
    total_amount: float = 0.0
    confidence_score: float = 0.95


class BillScanItem(BaseModel):
    product_name: str
    quantity: float
    unit: str
    cost_price: float
    mrp: float
    total: float
    category: str


class BillScanResponse(BaseModel):
    supplier_name: str
    bill_number: str
    bill_date: str
    items: List[BillScanItem]
    total_amount: float
    status: str = "success"


class AIChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []


class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []
    data_snapshot: Optional[Dict[str, Any]] = None


# ==========================================
# DASHBOARD OVERVIEW SCHEMA
# ==========================================
class DashboardStats(BaseModel):
    today_sales: float
    today_orders: int
    pending_udhaar: float
    critical_alerts: int
    low_stock_count: int
    expiring_soon_count: int
    weekly_sales_chart: List[Dict[str, Any]]
    top_selling_products: List[Dict[str, Any]]
    recent_transactions: List[Dict[str, Any]]
