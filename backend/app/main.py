# ZeeTMS/backend/app/main.py
import sys
sys.path.append("/app")
import logging
import os
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse  # New import for serving files
from schemas import UserCreate, Token, EmployeeCreate, Employee, EmployeeFunction, EmployeeStatus, DrivingLicense, VehicleCreate, Vehicle
from auth import hash_password, verify_password, create_access_token, get_current_user
from crud import (
    create_user, get_user_by_username, get_employees, get_employee_by_id,
    create_employee, update_employee, delete_employee, get_employee_functions,
    get_employee_statuses, get_driving_licenses, create_vehicle, get_vehicles,
    get_vehicle_by_id, update_vehicle, delete_vehicle, get_vehicle_types,
    get_vehicle_statuses, get_insurances
)
from datetime import timedelta
from typing import Optional
from pathlib import Path
from datetime import date

print("Current working directory:", os.getcwd())
print("Files in /app:", os.listdir("/app"))
print("Python sys.path:", sys.path)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

PHOTO_DIR = Path("/app/photos")
PHOTO_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {"status": "healthy"}

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(data={"sub": user["username"]}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=dict)
async def create_new_user(user: UserCreate):
    hashed_password = hash_password(user.password)
    user_id = create_user(user.username, hashed_password, user.role_id, user.descript)
    return {"id": user_id, "username": user.username}

@app.get("/me")
async def read_users_me(current_user: str = Depends(get_current_user)):
    user = get_user_by_username(current_user)
    return {"username": user["username"], "role_id": user["role_id"]}

@app.get("/employees", response_model=list[Employee])
async def read_employees(current_user: str = Depends(get_current_user)):
    employees = get_employees()
    return employees

@app.get("/employees/{employee_id}", response_model=Employee)
async def read_employee(employee_id: int, current_user: str = Depends(get_current_user)):
    employee = get_employee_by_id(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@app.post("/employees", response_model=Employee)
async def create_new_employee(
    firstname: str = Form(...),
    lastname: str = Form(...),
    email: str = Form(...),
    birthDate: Optional[date] = Form(None),
    hireDate: Optional[date] = Form(None),
    function_id: Optional[int] = Form(None),
    status_id: Optional[int] = Form(None),
    line1: Optional[str] = Form(None),
    line2: Optional[str] = Form(None),
    line3: Optional[str] = Form(None),
    postalcode: Optional[str] = Form(None),
    town: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    license_id: Optional[int] = Form(None),
    photo: UploadFile = File(None),
    current_user: str = Depends(get_current_user)
):
    employee_data = EmployeeCreate(
        firstname=firstname,
        lastname=lastname,
        email=email,
        birthDate=birthDate,
        hireDate=hireDate,
        function_id=function_id,
        status_id=status_id,
        line1=line1,
        line2=line2,
        line3=line3,
        postalcode=postalcode,
        town=town,
        state=state,
        country=country,
        license_id=license_id,
        photoFile=None
    )
    logger.debug(f"Received employee: {employee_data.dict()}")
    try:
        photo_path = None
        if photo:
            photo_filename = f"{employee_data.email}_{photo.filename}"
            photo_path = PHOTO_DIR / photo_filename
            with photo_path.open("wb") as f:
                f.write(await photo.read())
            employee_data.photoFile = str(photo_path)

        employee_id = create_employee(employee_data)
        response = get_employee_by_id(employee_id)
        logger.debug(f"Returning employee: {response}")
        return response
    except Exception as e:
        logger.error(f"Error in create_new_employee: {str(e)}", exc_info=True)
        raise

@app.put("/employees/{employee_id}", response_model=Employee)
async def update_existing_employee(
    employee_id: int,
    firstname: str = Form(...),
    lastname: str = Form(...),
    email: str = Form(...),
    birthDate: Optional[date] = Form(None),
    hireDate: Optional[date] = Form(None),
    function_id: Optional[int] = Form(None),
    status_id: Optional[int] = Form(None),
    line1: Optional[str] = Form(None),
    line2: Optional[str] = Form(None),
    line3: Optional[str] = Form(None),
    postalcode: Optional[str] = Form(None),
    town: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    license_id: Optional[int] = Form(None),
    photo: UploadFile = File(None),
    current_user: str = Depends(get_current_user)
):
    employee_data = EmployeeCreate(
        firstname=firstname,
        lastname=lastname,
        email=email,
        birthDate=birthDate,
        hireDate=hireDate,
        function_id=function_id,
        status_id=status_id,
        line1=line1,
        line2=line2,
        line3=line3,
        postalcode=postalcode,
        town=town,
        state=state,
        country=country,
        license_id=license_id,
        photoFile=None
    )
    photo_path = None
    if photo:
        photo_filename = f"{employee_data.email}_{photo.filename}"
        photo_path = PHOTO_DIR / photo_filename
        with photo_path.open("wb") as f:
            f.write(await photo.read())
        employee_data.photoFile = str(photo_path)
    updated = update_employee(employee_id, employee_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return get_employee_by_id(employee_id)

@app.delete("/employees/{employee_id}")
async def delete_existing_employee(employee_id: int, current_user: str = Depends(get_current_user)):
    deleted = delete_employee(employee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted"}

@app.get("/employee_functions", response_model=list[EmployeeFunction])
async def read_employee_functions(current_user: str = Depends(get_current_user)):
    return get_employee_functions()

@app.get("/employee_statuses", response_model=list[EmployeeStatus])
async def read_employee_statuses(current_user: str = Depends(get_current_user)):
    return get_employee_statuses()

@app.get("/driving_licenses", response_model=list[DrivingLicense])
async def read_driving_licenses(current_user: str = Depends(get_current_user)):
    return get_driving_licenses()

@app.get("/vehicles", response_model=list[Vehicle])
async def read_vehicles(current_user: str = Depends(get_current_user)):
    vehicles = get_vehicles()
    return vehicles

@app.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def read_vehicle(vehicle_id: int, current_user: str = Depends(get_current_user)):
    vehicle = get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@app.post("/vehicles", response_model=Vehicle)
async def create_new_vehicle(
    licensePlate: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    color: Optional[str] = Form(None),
    typeID: Optional[int] = Form(None),
    statusID: Optional[int] = Form(None),
    insuranceID: Optional[int] = Form(None),
    capacity_kg: Optional[float] = Form(None),
    volume_litre: Optional[float] = Form(None),
    photo: UploadFile = File(None),
    current_user: str = Depends(get_current_user)
):
    vehicle_data = VehicleCreate(
        licensePlate=licensePlate,
        make=make,
        model=model,
        color=color,
        typeID=typeID,
        statusID=statusID,
        insuranceID=insuranceID,
        capacity_kg=capacity_kg,
        volume_litre=volume_litre,
        photoFile=None
    )
    photo_path = None
    if photo:
        photo_filename = f"{vehicle_data.licensePlate}_{photo.filename}"
        photo_path = PHOTO_DIR / photo_filename
        with photo_path.open("wb") as f:
            f.write(await photo.read())
        vehicle_data.photoFile = str(photo_path)
    vehicle_id = create_vehicle(vehicle_data)
    return get_vehicle_by_id(vehicle_id)

@app.put("/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_existing_vehicle(
    vehicle_id: int,
    licensePlate: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    color: Optional[str] = Form(None),
    typeID: Optional[int] = Form(None),
    statusID: Optional[int] = Form(None),
    insuranceID: Optional[int] = Form(None),
    capacity_kg: Optional[float] = Form(None),
    volume_litre: Optional[float] = Form(None),
    photo: UploadFile = File(None),
    current_user: str = Depends(get_current_user)
):
    vehicle_data = VehicleCreate(
        licensePlate=licensePlate,
        make=make,
        model=model,
        color=color,
        typeID=typeID,
        statusID=statusID,
        insuranceID=insuranceID,
        capacity_kg=capacity_kg,
        volume_litre=volume_litre,
        photoFile=None
    )
    photo_path = None
    if photo:
        photo_filename = f"{vehicle_data.licensePlate}_{photo.filename}"
        photo_path = PHOTO_DIR / photo_filename
        with photo_path.open("wb") as f:
            f.write(await photo.read())
        vehicle_data.photoFile = str(photo_path)
    updated = update_vehicle(vehicle_id, vehicle_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return get_vehicle_by_id(vehicle_id)

@app.delete("/vehicles/{vehicle_id}")
async def delete_existing_vehicle(vehicle_id: int, current_user: str = Depends(get_current_user)):
    deleted = delete_vehicle(vehicle_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"message": "Vehicle deleted"}

@app.get("/vehicle_types", response_model=list[dict])
async def read_vehicle_types(current_user: str = Depends(get_current_user)):
    return get_vehicle_types()

@app.get("/vehicle_statuses", response_model=list[dict])
async def read_vehicle_statuses(current_user: str = Depends(get_current_user)):
    return get_vehicle_statuses()

@app.get("/insurances", response_model=list[dict])
async def read_insurances(current_user: str = Depends(get_current_user)):
    return get_insurances()

# New Endpoint to Serve Photos
@app.get("/photos/{filename}")
async def get_photo(filename: str, current_user: str = Depends(get_current_user)):
    photo_path = PHOTO_DIR / filename
    if not photo_path.exists():
        raise HTTPException(status_code=404, detail="Photo not found")
    return FileResponse(photo_path)