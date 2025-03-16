# ZeeTMS/backend/app/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class UserCreate(BaseModel):
    username: str
    password: str
    descript: Optional[str] = None
    role_id: int

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AddressBase(BaseModel):
    name: Optional[str] = None
    line1: Optional[str] = None
    line2: Optional[str] = None
    line3: Optional[str] = None
    postalcode: Optional[str] = None
    town: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AddressCreate(AddressBase):
    pass

class Address(AddressBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    firstname: str
    lastname: str
    email: str
    birthDate: Optional[date] = None
    hireDate: Optional[date] = None
    function_id: Optional[int] = None
    status_id: Optional[int] = None
    address_id: Optional[int] = None
    license_id: Optional[int] = None
    photoFile: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    line1: Optional[str] = None
    line2: Optional[str] = None
    line3: Optional[str] = None
    postalcode: Optional[str] = None
    town: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

class Employee(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EmployeeFunction(BaseModel):
    id: int
    name: str
    descript: Optional[str] = None

class EmployeeStatus(BaseModel):
    id: int
    name: str
    descript: Optional[str] = None

class DrivingLicense(BaseModel):
    id: int
    name: str
    descript: Optional[str] = None

# New Vehicle Schemas
class VehicleBase(BaseModel):
    licensePlate: str
    make: str
    model: str
    color: Optional[str] = None
    typeID: Optional[int] = None
    statusID: Optional[int] = None
    insuranceID: Optional[int] = None
    capacity_kg: Optional[float] = None
    volume_litre: Optional[float] = None
    photoFile: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class Vehicle(VehicleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True