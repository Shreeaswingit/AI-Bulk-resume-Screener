from app.models.database import SessionLocal
from app.models.db_models import User
from passlib.context import CryptContext

db = SessionLocal()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Clean up
db.query(User).filter(User.username == "admin").delete()

# Create
hashed = pwd_context.hash("admin")
new_admin = User(username="admin", password_hash=hashed, full_name="System Admin")
db.add(new_admin)
db.commit()

print("Admin user created properly. Hash length:", len(hashed))
