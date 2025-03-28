from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    role_id: int
    descript: str = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str