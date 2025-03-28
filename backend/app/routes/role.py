from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user, check_user_role
from app.models.models import Role, User  
router = APIRouter()

@router.get("/roles")
def read_roles(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    roles = db.query(Role).all()
    return [{"id": role.id, "role_name": role.role_name, "descript": role.descript} for role in roles]