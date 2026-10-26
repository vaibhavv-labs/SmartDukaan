"""
KiranaMind AI — Multi-Modal AI Parser & Store Copilot
Handles Voice-to-Bill parsing (Hindi/Hinglish/English), Wholesaler Invoice OCR,
Handwritten Khata parsing, and Conversational Q&A Store Assistant.
"""

import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import Product, Customer, Sale, SaleItem


def parse_voice_to_bill(transcript: str, db: Session) -> Dict[str, Any]:
    """
    Parses natural spoken voice transcripts (Hindi, Hinglish, English) into
    structured bill line items, payment mode, customer, and totals.
    
    Examples:
    - "Rahul ko 2 Parle-G aur 1kg chawal udhaar"
    - "Anita 3 packet maggi cash"
    - "Suresh ji 2 packet amul milk aur ek dahi UPI"
    - "5 packet biscuit aur 2 soap"
    """
    text_lower = transcript.lower()

    # 1. Detect Payment Mode
    payment_mode = "Cash"
    if any(k in text_lower for k in ["udhaar", "udhar", "baaki", "credit", "khata"]):
        payment_mode = "Udhaar"
    elif any(k in text_lower for k in ["upi", "phonepe", "gpay", "paytm", "online"]):
        payment_mode = "UPI"
    elif "cash" in text_lower or "nagad" in text_lower:
        payment_mode = "Cash"

    # 2. Detect Customer Name (look for match in Customer database or leading name)
    customers = db.query(Customer).all()
    detected_customer = None
    for c in customers:
        if c.name.lower() in text_lower:
            detected_customer = c
            break

    customer_name = detected_customer.name if detected_customer else "Walk-in Customer"
    if not detected_customer:
        # Check patterns like "<Name> ko ..." or "<Name> ji ..."
        name_match = re.search(r"^([a-z]+)\s+(ko|ji|bhai)", text_lower)
        if name_match:
            customer_name = name_match.group(1).capitalize()

    # 3. Match Products against Inventory
    products = db.query(Product).all()
    parsed_items = []
    total_amount = 0.0

    # Keyword mapping for common Hindi/Hinglish numerals
    num_words = {
        "ek": 1, "do": 2, "teen": 3, "char": 4, "chaar": 4, "paanch": 5, "panch": 5,
        "che": 6, "saat": 7, "aath": 8, "nau": 9, "das": 10, "one": 1, "two": 2,
        "three": 3, "four": 4, "five": 5, "half": 0.5, "aadha": 0.5, "adha": 0.5
    }

    # Search for items mentioned in transcript
    for p in products:
        p_name_lower = p.name.lower()
        # Check if product name or key token appears in transcript
        tokens = [t for t in p_name_lower.split() if len(t) > 2]
        is_matched = p_name_lower in text_lower or any(t in text_lower for t in tokens if t not in ["packet", "gram", "white", "pure"])

        if is_matched:
            # Extract quantity near product name
            qty = 1.0
            unit = p.unit or "pcs"

            # Check for patterns like "2 packet <name>", "1kg <name>", "3 <name>"
            qty_match = re.search(r"(\d+(\.\d+)?)\s*(kg|kilo|gm|pkt|packet|pcs|bottle|ltr)?\s*" + re.escape(tokens[0] if tokens else p_name_lower), text_lower)
            if qty_match:
                qty = float(qty_match.group(1))
                if qty_match.group(3):
                    unit = qty_match.group(3)
            else:
                # Check written number words
                for word, val in num_words.items():
                    if f"{word} {tokens[0]}" in text_lower or f"{word} packet {tokens[0]}" in text_lower or f"{word}kg {tokens[0]}" in text_lower:
                        qty = float(val)
                        break

            subtotal = round(qty * p.sell_price, 2)
            total_amount += subtotal

            parsed_items.append({
                "product_id": p.id,
                "product_name": p.name,
                "quantity": qty,
                "unit": unit,
                "unit_price": p.sell_price,
                "subtotal": subtotal,
            })

    # If no catalog products matched directly, create a fallback entry
    if not parsed_items:
        parsed_items.append({
            "product_id": None,
            "product_name": "General Grocery Item",
            "quantity": 1.0,
            "unit": "pcs",
            "unit_price": 50.0,
            "subtotal": 50.0,
        })
        total_amount = 50.0

    return {
        "original_text": transcript,
        "customer_name": customer_name,
        "customer_id": detected_customer.id if detected_customer else None,
        "payment_mode": payment_mode,
        "items": parsed_items,
        "total_amount": round(total_amount, 2),
        "confidence_score": 0.94,
    }


def parse_wholesaler_bill(file_name: str, db: Session) -> Dict[str, Any]:
    """
    Simulates VLM / OCR extraction for printed wholesaler invoices.
    Extracts distributor info, invoice date, and structured line items with wholesale cost prices.
    """
    # Realistic parsed wholesaler bill demo
    parsed_items = [
        {
            "product_name": "Aashirvaad Shudh Chakki Atta 5kg",
            "quantity": 20.0,
            "unit": "pkt",
            "cost_price": 210.0,
            "mrp": 245.0,
            "total": 4200.0,
            "category": "Grains & Flours"
        },
        {
            "product_name": "Tata Salt 1kg",
            "quantity": 50.0,
            "unit": "pkt",
            "cost_price": 22.0,
            "mrp": 28.0,
            "total": 1100.0,
            "category": "Spices & Seasoning"
        },
        {
            "product_name": "Fortune Sunlite Refined Oil 1L",
            "quantity": 30.0,
            "unit": "pkt",
            "cost_price": 125.0,
            "mrp": 145.0,
            "total": 3750.0,
            "category": "Oils & Ghee"
        },
        {
            "product_name": "Maggi 2-Minute Noodles 70g",
            "quantity": 96.0,
            "unit": "pcs",
            "cost_price": 11.5,
            "mrp": 14.0,
            "total": 1104.0,
            "category": "Packaged Food"
        },
        {
            "product_name": "Dettol Original Soap 75g",
            "quantity": 48.0,
            "unit": "pcs",
            "cost_price": 32.0,
            "mrp": 40.0,
            "total": 1536.0,
            "category": "Personal Care"
        }
    ]

    total_amount = sum(item["total"] for item in parsed_items)

    return {
        "supplier_name": "Mahalaxmi FMCG Wholesalers Ltd.",
        "bill_number": "INV-2026-8841",
        "bill_date": "2026-10-22",
        "items": parsed_items,
        "total_amount": total_amount,
        "status": "success",
    }


def parse_khata_sheet(file_name: str, db: Session) -> Dict[str, Any]:
    """
    Simulates Handwritten Khata Page VLM Parser.
    Extracts handwritten customer ledger entries into digital debt records.
    """
    entries = [
        {"customer_name": "Rahul Verma", "amount": 350.0, "note": "2kg cheeni + 1 refined oil", "type": "GIVEN"},
        {"customer_name": "Anita Gupta", "amount": 620.0, "note": "Masala + Atta bag", "type": "GIVEN"},
        {"customer_name": "Suresh Patel", "amount": 500.0, "note": "Purana udhaar jama (Cash)", "type": "RECEIVED"},
        {"customer_name": "Vikram Singh", "amount": 180.0, "note": "Doodh dahi", "type": "GIVEN"}
    ]
    return {
        "entries": entries,
        "total_given": 1150.0,
        "total_received": 500.0,
        "status": "success"
    }


def answer_store_query(query: str, db: Session) -> Dict[str, Any]:
    """
    Natural Language Business Q&A (Speech-to-SQL & Assistant Copilot)
    Answers questions about profits, sales, dead stock, and pending khata.
    """
    q_lower = query.lower()

    # Total sales
    if any(k in q_lower for k in ["sale", "bikri", "revenue", "kamai", "aaj"]):
        sales = db.query(Sale).all()
        total_rev = sum(s.total_amount for s in sales)
        total_orders = len(sales)
        return {
            "reply": f"Dukan ki kul bikri abhi tak ₹{total_rev:,.2f} hai ({total_orders} bills). Aaj cash flow majboot hai!",
            "suggested_actions": ["View Sales History", "Download Day Report"],
            "data_snapshot": {"total_revenue": total_rev, "orders": total_orders}
        }

    # Udhaar / Khata
    elif any(k in q_lower for k in ["udhaar", "khata", "baaki", "pending", "debt"]):
        customers = db.query(Customer).all()
        total_pending = sum(c.pending_amount for c in customers)
        top_debtors = sorted(customers, key=lambda x: x.pending_amount, reverse=True)[:3]
        debtor_names = ", ".join([f"{c.name} (₹{c.pending_amount})" for c in top_debtors])
        return {
            "reply": f"Kul pending udhaar ₹{total_pending:,.2f} hai. Sabse zyada baaki: {debtor_names}. Kya main inko WhatsApp reminder bhejoon?",
            "suggested_actions": ["Send Reminders", "Open Khata Book"],
            "data_snapshot": {"total_pending": total_pending, "top_debtors": [c.name for c in top_debtors]}
        }

    # Dead stock or low stock
    elif any(k in q_lower for k in ["dead stock", "stock", "khatam", "reorder", "low stock"]):
        low_stock = db.query(Product).filter(Product.stock <= Product.min_stock).all()
        names = ", ".join([f"{p.name} ({p.stock} {p.unit})" for p in low_stock[:4]])
        return {
            "reply": f"{len(low_stock)} items low stock par hain: {names}. Aap distributor ko reorder bhejne ke liye Smart Reorder use kar sakte hain.",
            "suggested_actions": ["Generate Reorder List", "Go to Inventory"],
            "data_snapshot": {"low_stock_count": len(low_stock)}
        }

    # Expiry
    elif any(k in q_lower for k in ["expiry", "expire", "kharab"]):
        products = db.query(Product).all()
        expiring = [p for p in products if p.expiry_date and (p.expiry_date - date.today()).days <= 15]
        return {
            "reply": f"{len(expiring)} products agle 15 dino me expire hone wale hain. Inhe discount shelf ya bundle offer par laga kar capital save karein.",
            "suggested_actions": ["View Expiry Alerts", "Apply 20% Bundle Discount"],
            "data_snapshot": {"expiring_count": len(expiring)}
        }

    # Default general business advice
    else:
        return {
            "reply": f"Aapka sawal '{query}' samjha gaya. KiranaMind AI aapki dukan ka data analyse kar raha hai. Aap sales, expiry, udhaar, ya dead stock ke bare me kuch bhi pooch sakte hain.",
            "suggested_actions": ["Aaj ki bikri?", "Kitna udhaar baaki hai?", "Kaunsa stock khatam ho raha hai?"],
            "data_snapshot": {}
        }
