"""
KiranaMind AI — Multi-Modal AI Endpoints
Voice Billing, Wholesaler Bill Scanner, Khata Handwritten OCR, and Conversational Copilot.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, Customer, KhataTransaction, BillScanRecord
from app.schemas import (
    VoiceParseRequest,
    VoiceParseResponse,
    BillScanResponse,
    AIChatRequest,
    AIChatResponse,
)
from app.services.ai_service import (
    parse_voice_to_bill,
    parse_wholesaler_bill,
    parse_khata_sheet,
    answer_store_query,
)

router = APIRouter(prefix="/api/v1/ai", tags=["AI Multi-Modal"])


@router.post("/voice-billing", response_model=VoiceParseResponse)
def voice_billing_parse(payload: VoiceParseRequest, db: Session = Depends(get_db)):
    """
    Parses natural Hindi/Hinglish/English spoken input into structured bill items.
    """
    if not payload.audio_text or not payload.audio_text.strip():
        raise HTTPException(status_code=400, detail="Voice transcript cannot be empty")

    result = parse_voice_to_bill(payload.audio_text, db)
    return result


@router.post("/scan-bill", response_model=BillScanResponse)
async def scan_wholesaler_bill(
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """
    Uploads or parses a wholesaler printed invoice via VLM OCR.
    """
    file_name = file.filename if file else "sample_wholesaler_bill.jpg"
    parsed_data = parse_wholesaler_bill(file_name, db)

    # Save scan record in DB
    scan_rec = BillScanRecord(
        scan_type="wholesaler_bill",
        file_name=file_name,
        supplier_name=parsed_data["supplier_name"],
        bill_number=parsed_data["bill_number"],
        total_amount=parsed_data["total_amount"],
        status="completed",
        created_at=datetime.utcnow(),
    )
    db.add(scan_rec)
    db.commit()

    return parsed_data


@router.post("/scan-bill/apply")
def apply_bill_to_inventory(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Applies the scanned bill items directly into the store's inventory:
    increments stock and updates cost prices.
    """
    items = payload.get("items", [])
    updated_count = 0
    created_count = 0

    for item in items:
        name = item.get("product_name")
        qty = float(item.get("quantity", 0))
        cost_price = float(item.get("cost_price", 0))
        mrp = float(item.get("mrp", cost_price * 1.2))
        category = item.get("category", "General Grocery")

        # Check existing product
        product = db.query(Product).filter(Product.name.ilike(name)).first()
        if product:
            product.stock += qty
            product.cost_price = cost_price
            product.sell_price = mrp
            product.updated_at = datetime.utcnow()
            updated_count += 1
        else:
            new_p = Product(
                name=name,
                category=category,
                stock=qty,
                cost_price=cost_price,
                sell_price=mrp,
                min_stock=5.0,
                created_at=datetime.utcnow(),
            )
            db.add(new_p)
            created_count += 1

    db.commit()
    return {
        "status": "success",
        "message": f"Inventory updated! {updated_count} products updated, {created_count} new products created.",
        "updated_count": updated_count,
        "created_count": created_count,
    }


@router.post("/scan-khata")
async def scan_handwritten_khata(
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """
    Parses messy handwritten Khata page photo into structured ledger entries.
    """
    file_name = file.filename if file else "handwritten_khata.jpg"
    return parse_khata_sheet(file_name, db)


@router.post("/chat", response_model=AIChatResponse)
def store_copilot_chat(payload: AIChatRequest, db: Session = Depends(get_db)):
    """
    Conversational Store Copilot (Speech-to-SQL & Business Advisor)
    Answers questions about profits, sales, dead stock, and pending khata.
    """
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    response = answer_store_query(payload.message, db)
    return response
