from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user, check_user_role
from app.models.models import User

router = APIRouter()

@router.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return {
        "username": current_user.username,
        "role": current_user.role.role_name,
        "descript": current_user.descript
    }

@router.get("/users")
def read_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    users = db.query(User).all()
    return [{"username": user.username, "role": user.role.role_name} for user in users]