from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.contact import Contact
from app.models.automation import Automation
from app.models.conversation import Conversation
from app.models.message import Message
from app.services.auth_service import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if demo user exists
        demo_user = db.query(User).filter(User.email == "demo@linkplease.com").first()
        if not demo_user:
            demo_user = User(
                name="Alex Morgan",
                email="demo@linkplease.com",
                password_hash=get_password_hash("password123"),
                avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"Created demo user: demo@linkplease.com / password123")

        user_id = demo_user.id

        # Seed Contacts if empty
        if db.query(Contact).filter(Contact.user_id == user_id).count() == 0:
            contacts_data = [
                {
                    "name": "Rahul Sharma",
                    "username": "@rahul_tech",
                    "email": "rahul.sharma@example.com",
                    "phone": "+91 98765 43210",
                    "platform": "Instagram",
                    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
                    "tags": "VIP, Lead"
                },
                {
                    "name": "Priya Verma",
                    "username": "@priya_design",
                    "email": "priya.v@example.com",
                    "phone": "+91 98123 45678",
                    "platform": "Instagram",
                    "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
                    "tags": "Customer, High-Priority"
                },
                {
                    "name": "Aman Gupta",
                    "username": "@aman_founder",
                    "email": "aman@startup.co",
                    "phone": "+91 99887 76655",
                    "platform": "Twitter",
                    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256",
                    "tags": "Investor, VIP"
                },
                {
                    "name": "Sophia Chen",
                    "username": "@chen_sophia",
                    "email": "sophia.c@global.io",
                    "phone": "+1 415 555 0199",
                    "platform": "LinkedIn",
                    "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256",
                    "tags": "B2B Lead"
                },
                {
                    "name": "Marcus Vance",
                    "username": "@marcus_v",
                    "email": "marcus@vance.com",
                    "phone": "+1 212 555 0142",
                    "platform": "WhatsApp",
                    "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256",
                    "tags": "Customer"
                },
                {
                    "name": "Elena Rostova",
                    "username": "@elena_fashion",
                    "email": "elena@mode.fr",
                    "phone": "+33 1 42 68 55 00",
                    "platform": "Instagram",
                    "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=256",
                    "tags": "Influencer, Partnership"
                },
                {
                    "name": "Devon Miller",
                    "username": "@devon_codes",
                    "email": "devon@dev.io",
                    "phone": "+1 650 555 0188",
                    "platform": "Twitter",
                    "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=256",
                    "tags": "Developer"
                },
                {
                    "name": "Jessica Taylor",
                    "username": "@jess_taylor",
                    "email": "jessica@agency.com",
                    "phone": "+1 312 555 0134",
                    "platform": "LinkedIn",
                    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256",
                    "tags": "Agency Partner"
                },
            ]

            created_contacts = []
            for c_data in contacts_data:
                contact = Contact(
                    user_id=user_id,
                    name=c_data["name"],
                    username=c_data["username"],
                    email=c_data["email"],
                    phone=c_data["phone"],
                    platform=c_data["platform"],
                    avatar=c_data["avatar"],
                    tags=c_data["tags"],
                    last_interaction=datetime.utcnow() - timedelta(hours=len(created_contacts)*3)
                )
                db.add(contact)
                created_contacts.append(contact)
            db.commit()
            print("Seeded contacts.")

        # Seed Automations if empty
        if db.query(Automation).filter(Automation.user_id == user_id).count() == 0:
            automations_data = [
                {
                    "name": "Price Inquiry Auto-Responder",
                    "description": "Automatically send pricing package breakdown when incoming message contains 'price' or 'pricing'.",
                    "trigger_type": "keyword_match",
                    "condition": "contains \"price\"",
                    "action_type": "send_reply",
                    "action_value": "Hi! Thanks for reaching out. Our starter plan begins at $29/mo and Growth plan at $79/mo. Check details at linkplease.com/pricing!",
                    "status": "active",
                    "execution_count": 342
                },
                {
                    "name": "Welcome New Instagram DM",
                    "description": "Send a friendly greeting and main link when a contact sends their first direct message.",
                    "trigger_type": "new_message",
                    "condition": "platform == \"Instagram\"",
                    "action_type": "send_reply",
                    "action_value": "Welcome to LinkPlease! 👋 How can our team assist you today?",
                    "status": "active",
                    "execution_count": 890
                },
                {
                    "name": "Demo Request Dispatcher",
                    "description": "Notify sales team and auto-respond when keywords 'demo' or 'schedule' are detected.",
                    "trigger_type": "keyword_match",
                    "condition": "contains \"demo\"",
                    "action_type": "send_reply",
                    "action_value": "Awesome! You can pick a convenient 15-min slot for a live demo here: calendly.com/linkplease-demo",
                    "status": "active",
                    "execution_count": 156
                },
                {
                    "name": "Out of Office Night Reply",
                    "description": "Send off-hours notice for messages received between 8 PM and 8 AM.",
                    "trigger_type": "new_message",
                    "condition": "after_hours",
                    "action_type": "send_reply",
                    "action_value": "Thanks for your message! Our team is currently offline, but we'll respond first thing tomorrow morning.",
                    "status": "paused",
                    "execution_count": 64
                },
                {
                    "name": "VIP Follow-up Tagging",
                    "description": "Add VIP tag to contacts who express high purchase intent.",
                    "trigger_type": "keyword_match",
                    "condition": "contains \"enterprise\"",
                    "action_type": "add_tag",
                    "action_value": "VIP, Enterprise-Lead",
                    "status": "active",
                    "execution_count": 48
                }
            ]

            for a_data in automations_data:
                auto = Automation(
                    user_id=user_id,
                    name=a_data["name"],
                    description=a_data["description"],
                    trigger_type=a_data["trigger_type"],
                    condition=a_data["condition"],
                    action_type=a_data["action_type"],
                    action_value=a_data["action_value"],
                    status=a_data["status"],
                    execution_count=a_data["execution_count"]
                )
                db.add(auto)
            db.commit()
            print("Seeded automations.")

        # Seed Conversations & Messages if empty
        if db.query(Conversation).filter(Conversation.user_id == user_id).count() == 0:
            contacts = db.query(Contact).filter(Contact.user_id == user_id).limit(4).all()
            if contacts:
                # Conversation 1: Rahul
                c1 = Conversation(
                    user_id=user_id,
                    contact_id=contacts[0].id,
                    status="open",
                    last_message="Hi! Could you send me the pricing breakdown?",
                    last_message_at=datetime.utcnow() - timedelta(minutes=15)
                )
                db.add(c1)
                db.commit()
                db.refresh(c1)

                m1_1 = Message(conversation_id=c1.id, sender_type="contact", content="Hello team! Loved your platform preview.", created_at=datetime.utcnow() - timedelta(hours=2))
                m1_2 = Message(conversation_id=c1.id, sender_type="user", content="Hi Rahul! Thanks for connecting. How can we help?", created_at=datetime.utcnow() - timedelta(hours=1, minutes=45))
                m1_3 = Message(conversation_id=c1.id, sender_type="contact", content="Hi! Could you send me the pricing breakdown?", created_at=datetime.utcnow() - timedelta(minutes=15))
                db.add_all([m1_1, m1_2, m1_3])

                # Conversation 2: Priya
                c2 = Conversation(
                    user_id=user_id,
                    contact_id=contacts[1].id,
                    status="open",
                    last_message="Sure, here's the document you requested.",
                    last_message_at=datetime.utcnow() - timedelta(hours=1)
                )
                db.add(c2)
                db.commit()
                db.refresh(c2)

                m2_1 = Message(conversation_id=c2.id, sender_type="contact", content="Hey Alex, do you have the product catalog PDF?", created_at=datetime.utcnow() - timedelta(hours=3))
                m2_2 = Message(conversation_id=c2.id, sender_type="user", content="Sure, here's the document you requested.", created_at=datetime.utcnow() - timedelta(hours=1))
                db.add_all([m2_1, m2_2])

                # Conversation 3: Aman
                c3 = Conversation(
                    user_id=user_id,
                    contact_id=contacts[2].id,
                    status="pending",
                    last_message="Thank you! Will review with our team.",
                    last_message_at=datetime.utcnow() - timedelta(hours=4)
                )
                db.add(c3)
                db.commit()
                db.refresh(c3)

                m3_1 = Message(conversation_id=c3.id, sender_type="contact", content="Would love to schedule a quick 10 min demo.", created_at=datetime.utcnow() - timedelta(hours=6))
                m3_2 = Message(conversation_id=c3.id, sender_type="user", content="Here is our demo link: calendly.com/linkplease-demo", created_at=datetime.utcnow() - timedelta(hours=5))
                m3_3 = Message(conversation_id=c3.id, sender_type="contact", content="Thank you! Will review with our team.", created_at=datetime.utcnow() - timedelta(hours=4))
                db.add_all([m3_1, m3_2, m3_3])

                # Conversation 4: Sophia
                if len(contacts) > 3:
                    c4 = Conversation(
                        user_id=user_id,
                        contact_id=contacts[3].id,
                        status="closed",
                        last_message="All set, ticket resolved.",
                        last_message_at=datetime.utcnow() - timedelta(days=1)
                    )
                    db.add(c4)
                    db.commit()
                    db.refresh(c4)

                    m4_1 = Message(conversation_id=c4.id, sender_type="contact", content="Is API webhook integration supported?", created_at=datetime.utcnow() - timedelta(days=1, hours=2))
                    m4_2 = Message(conversation_id=c4.id, sender_type="user", content="Yes! Webhooks can be configured under Settings > Integrations.", created_at=datetime.utcnow() - timedelta(days=1, hours=1))
                    m4_3 = Message(conversation_id=c4.id, sender_type="system", content="All set, ticket resolved.", created_at=datetime.utcnow() - timedelta(days=1))
                    db.add_all([m4_1, m4_2, m4_3])

                db.commit()
                print("Seeded conversations and messages.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
