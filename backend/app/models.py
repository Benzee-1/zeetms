from pydantic import BaseModel

class User(BaseModel):
    id: int
    username: str
    hashed_password: str
    descript: str | None = None
    is_active: bool
    role_id: int
    created_at: str

class Role(BaseModel):
    id: int
    name: str
    descript: str | None = None
    created_at: str