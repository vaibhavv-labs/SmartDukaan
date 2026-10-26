"""
KiranaMind AI — Database Seeder Script
Populates the SQLite database with realistic Kirana store inventory, customers,
transactions, sales history, and default admin user.
"""

import json
from datetime import datetime, date, timedelta
from app.database import SessionLocal, create_tables, engine, Base
from app.models import User, Product, Customer, KhataTransaction, Sale, SaleItem, Insight
from app.auth import get_password_hash
from app.services.intelligence import run_intelligence_engine


def seed_database():
    print("[INIT] Re-creating database tables...")
    Base.metadata.drop_all(bind=engine)
    create_tables()

    db = SessionLocal()

    try:
        # 1. Seed Shop Owner / Admin User
        print("[USER] Creating admin shop owner user...")
        admin = User(
            username="admin",
            email="rajesh@kiranamind.ai",
            hashed_password=get_password_hash("admin123"),
            full_name="Rajesh Sharma",
            store_name="Sharma General Store",
            phone="9876543210",
            address="Shop #4, Main Market, Delhi",
            upi_id="rajesh.sharma@okhdfcbank",
        )
        db.add(admin)

        # 2. Seed Products
        print("[INVENTORY] Seeding inventory products...")
        products_data = [
            {"name": "Parle-G Biscuit", "category": "Biscuits", "stock": 45, "cost_price": 5.0, "sell_price": 10.0, "unit": "pkt", "expiry_date": date(2026, 11, 15), "min_stock": 20},
            {"name": "Kurkure Masala Munch", "category": "Snacks", "stock": 32, "cost_price": 8.0, "sell_price": 10.0, "unit": "pkt", "expiry_date": date(2027, 2, 10), "min_stock": 15},
            {"name": "Amul Butter (100g)", "category": "Dairy", "stock": 8, "cost_price": 52.0, "sell_price": 57.0, "unit": "pkt", "expiry_date": date(2026, 11, 5), "min_stock": 5},
            {"name": "Tata Salt (1kg)", "category": "Grocery", "stock": 18, "cost_price": 22.0, "sell_price": 28.0, "unit": "pkt", "expiry_date": date(2028, 6, 1), "min_stock": 10},
            {"name": "Surf Excel (500g)", "category": "Detergent", "stock": 12, "cost_price": 95.0, "sell_price": 120.0, "unit": "pkt", "expiry_date": date(2028, 1, 1), "min_stock": 5},
            {"name": "Maggi Noodles", "category": "Instant Food", "stock": 60, "cost_price": 12.0, "sell_price": 14.0, "unit": "pkt", "expiry_date": date(2027, 3, 20), "min_stock": 25},
            {"name": "Vim Bar", "category": "Cleaning", "stock": 25, "cost_price": 10.0, "sell_price": 15.0, "unit": "pcs", "expiry_date": date(2028, 12, 1), "min_stock": 10},
            {"name": "Amul Milk (500ml)", "category": "Dairy", "stock": 20, "cost_price": 27.0, "sell_price": 30.0, "unit": "pkt", "expiry_date": date.today() + timedelta(days=2), "min_stock": 15},
            {"name": "Britannia Bread", "category": "Bakery", "stock": 6, "cost_price": 35.0, "sell_price": 45.0, "unit": "pkt", "expiry_date": date.today() + timedelta(days=3), "min_stock": 5},
            {"name": "Red Label Tea (250g)", "category": "Beverages", "stock": 14, "cost_price": 105.0, "sell_price": 130.0, "unit": "pkt", "expiry_date": date(2027, 8, 15), "min_stock": 5},
            {"name": "Fortune Oil (1L)", "category": "Grocery", "stock": 7, "cost_price": 140.0, "sell_price": 170.0, "unit": "bottle", "expiry_date": date(2027, 6, 1), "min_stock": 4},
            {"name": "Colgate MaxFresh", "category": "Personal Care", "stock": 15, "cost_price": 55.0, "sell_price": 72.0, "unit": "pcs", "expiry_date": date(2027, 12, 1), "min_stock": 5},
            {"name": "Haldiram Namkeen (200g)", "category": "Snacks", "stock": 20, "cost_price": 40.0, "sell_price": 50.0, "unit": "pkt", "expiry_date": date(2027, 1, 15), "min_stock": 8},
            {"name": "Clinic Plus Shampoo", "category": "Personal Care", "stock": 30, "cost_price": 3.0, "sell_price": 5.0, "unit": "pcs", "expiry_date": date(2028, 3, 1), "min_stock": 20},
            {"name": "Ghee (Patanjali 500g)", "category": "Dairy", "stock": 4, "cost_price": 250.0, "sell_price": 295.0, "unit": "pcs", "expiry_date": date(2027, 4, 10), "min_stock": 3},
            {"name": "Good Day Cashew", "category": "Biscuits", "stock": 22, "cost_price": 18.0, "sell_price": 25.0, "unit": "pkt", "expiry_date": date(2027, 5, 20), "min_stock": 10},
            {"name": "Lifebuoy Soap", "category": "Personal Care", "stock": 18, "cost_price": 28.0, "sell_price": 38.0, "unit": "pcs", "expiry_date": date(2028, 9, 1), "min_stock": 8},
            {"name": "Aashirvaad Atta (5kg)", "category": "Grocery", "stock": 3, "cost_price": 250.0, "sell_price": 310.0, "unit": "pcs", "expiry_date": date(2027, 2, 28), "min_stock": 4},
            {"name": "Pen (Cello)", "category": "Stationery", "stock": 50, "cost_price": 5.0, "sell_price": 10.0, "unit": "pcs", "expiry_date": None, "min_stock": 20},
            {"name": "Notebook (200 pages)", "category": "Stationery", "stock": 15, "cost_price": 30.0, "sell_price": 45.0, "unit": "pcs", "expiry_date": None, "min_stock": 5},
            {"name": "Thums Up (750ml)", "category": "Beverages", "stock": 24, "cost_price": 32.0, "sell_price": 40.0, "unit": "bottle", "expiry_date": date(2027, 4, 1), "min_stock": 10},
            {"name": "Lays Classic Salted", "category": "Snacks", "stock": 28, "cost_price": 8.0, "sell_price": 10.0, "unit": "pkt", "expiry_date": date(2027, 1, 20), "min_stock": 12},
            {"name": "Sugar (1kg)", "category": "Grocery", "stock": 10, "cost_price": 42.0, "sell_price": 50.0, "unit": "pkt", "expiry_date": date(2028, 1, 1), "min_stock": 8},
            {"name": "Hajmola Candy", "category": "Confectionery", "stock": 40, "cost_price": 1.0, "sell_price": 2.0, "unit": "pcs", "expiry_date": date(2027, 7, 1), "min_stock": 20},
            {"name": "Dove Shampoo (180ml)", "category": "Personal Care", "stock": 6, "cost_price": 130.0, "sell_price": 165.0, "unit": "bottle", "expiry_date": date(2028, 2, 1), "min_stock": 3},
            {"name": "Dettol Soap", "category": "Personal Care", "stock": 35, "cost_price": 30.0, "sell_price": 42.0, "unit": "pcs", "expiry_date": date(2028, 6, 15), "min_stock": 10},
            {"name": "Nescafe Sachet", "category": "Beverages", "stock": 50, "cost_price": 2.0, "sell_price": 4.0, "unit": "pcs", "expiry_date": date(2027, 9, 1), "min_stock": 25},
            {"name": "Cadbury Dairy Milk", "category": "Confectionery", "stock": 18, "cost_price": 18.0, "sell_price": 25.0, "unit": "pcs", "expiry_date": date(2027, 3, 15), "min_stock": 10},
            {"name": "Harpic (500ml)", "category": "Cleaning", "stock": 8, "cost_price": 72.0, "sell_price": 95.0, "unit": "bottle", "expiry_date": date(2028, 8, 1), "min_stock": 3},
            {"name": "Parachute Coconut Oil (200ml)", "category": "Personal Care", "stock": 10, "cost_price": 85.0, "sell_price": 110.0, "unit": "bottle", "expiry_date": date(2027, 11, 1), "min_stock": 4},
        ]

        for p in products_data:
            prod = Product(**p, created_at=datetime.utcnow() - timedelta(days=30))
            db.add(prod)

        # 3. Seed Customers
        print("[CUSTOMERS] Seeding customers...")
        customers_data = [
            {"name": "Rahul Sharma", "phone": "9876543210", "pending_amount": 850.0, "risk_score": 25.0, "trust_tier": "Good"},
            {"name": "Sunita Devi", "phone": "9812345678", "pending_amount": 1200.0, "risk_score": 40.0, "trust_tier": "Good"},
            {"name": "Ramesh Kaka", "phone": "9998765432", "pending_amount": 3200.0, "risk_score": 75.0, "trust_tier": "High Risk"},
            {"name": "Priya Patel", "phone": "9887654321", "pending_amount": 450.0, "risk_score": 15.0, "trust_tier": "Platinum"},
            {"name": "Vikram Singh", "phone": "9776543210", "pending_amount": 2800.0, "risk_score": 82.0, "trust_tier": "High Risk"},
            {"name": "Anjali Gupta", "phone": "9665432109", "pending_amount": 600.0, "risk_score": 10.0, "trust_tier": "Platinum"},
            {"name": "Deepak Yadav", "phone": "9554321098", "pending_amount": 1800.0, "risk_score": 55.0, "trust_tier": "Moderate"},
            {"name": "Meena Kumari", "phone": "9443210987", "pending_amount": 200.0, "risk_score": 5.0, "trust_tier": "Platinum"},
            {"name": "Ajay Thakur", "phone": "9332109876", "pending_amount": 4500.0, "risk_score": 90.0, "trust_tier": "High Risk"},
            {"name": "Kavita Joshi", "phone": "9221098765", "pending_amount": 950.0, "risk_score": 35.0, "trust_tier": "Good"},
            {"name": "Raju Chaiwala", "phone": "9110987654", "pending_amount": 5200.0, "risk_score": 95.0, "trust_tier": "High Risk"},
            {"name": "Shalini Mishra", "phone": "9009876543", "pending_amount": 350.0, "risk_score": 8.0, "trust_tier": "Platinum"},
            {"name": "Manoj Kumar", "phone": "9898765432", "pending_amount": 1500.0, "risk_score": 48.0, "trust_tier": "Moderate"},
            {"name": "Pooja Rawat", "phone": "9787654321", "pending_amount": 750.0, "risk_score": 20.0, "trust_tier": "Platinum"},
            {"name": "Suresh Bhai", "phone": "9676543210", "pending_amount": 2100.0, "risk_score": 65.0, "trust_tier": "Moderate"},
        ]

        customer_objs = []
        for c in customers_data:
            cust = Customer(**c, credit_limit=5000.0, created_at=datetime.utcnow() - timedelta(days=45))
            db.add(cust)
            customer_objs.append(cust)

        db.commit()

        # 4. Seed Khata Transactions for some customers
        print("[LEDGER] Seeding ledger transactions...")
        for c in customer_objs[:5]:
            tx1 = KhataTransaction(
                customer_id=c.id,
                type="GIVEN",
                amount=c.pending_amount + 300.0,
                balance_after=c.pending_amount + 300.0,
                note="Monthly grocery purchase",
                payment_mode="Udhaar",
                date=datetime.utcnow() - timedelta(days=12),
            )
            tx2 = KhataTransaction(
                customer_id=c.id,
                type="RECEIVED",
                amount=300.0,
                balance_after=c.pending_amount,
                note="UPI payment received",
                payment_mode="UPI",
                date=datetime.utcnow() - timedelta(days=3),
            )
            db.add_all([tx1, tx2])

        # 5. Seed Sales History
        print("[SALES] Seeding recent sales bills...")
        recent_sales_data = [
            {"inv": "INV-20261023-1021", "cust": "Walk-in Customer", "total": 120.0, "mode": "Cash", "items": [("Parle-G Biscuit", 2, 10.0), ("Kurkure Masala Munch", 1, 10.0), ("Tata Salt (1kg)", 1, 28.0), ("Maggi Noodles", 5, 14.0)]},
            {"inv": "INV-20261023-1022", "cust": "Rahul Sharma", "total": 350.0, "mode": "Udhaar", "items": [("Aashirvaad Atta (5kg)", 1, 310.0), ("Thums Up (750ml)", 1, 40.0)]},
            {"inv": "INV-20261023-1023", "cust": "Sunita Devi", "total": 284.0, "mode": "UPI", "items": [("Amul Butter (100g)", 2, 57.0), ("Fortune Oil (1L)", 1, 170.0)]},
            {"inv": "INV-20261023-1024", "cust": "Walk-in Customer", "total": 45.0, "mode": "Cash", "items": [("Britannia Bread", 1, 45.0)]},
            {"inv": "INV-20261023-1025", "cust": "Pooja Rawat", "total": 195.0, "mode": "UPI", "items": [("Red Label Tea (250g)", 1, 130.0), ("Good Day Cashew", 2, 25.0), ("Vim Bar", 1, 15.0)]},
        ]

        offset_mins = 15
        for s in recent_sales_data:
            offset_mins += 20
            sale = Sale(
                invoice_no=s["inv"],
                customer_name=s["cust"],
                total_amount=s["total"],
                payment_mode=s["mode"],
                items_count=len(s["items"]),
                created_at=datetime.utcnow() - timedelta(minutes=offset_mins),
            )
            db.add(sale)
            db.flush()

            for item_name, qty, price in s["items"]:
                s_item = SaleItem(
                    sale_id=sale.id,
                    product_name=item_name,
                    quantity=qty,
                    unit_price=price,
                    subtotal=qty * price,
                )
                db.add(s_item)

        db.commit()

        # 6. Run Initial Intelligence Pass
        print("[AI] Running Proactive Intelligence Engine...")
        insights = run_intelligence_engine(db)
        print(f"[OK] Generated {len(insights)} proactive business insights!")

        print("[SUCCESS] Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
