from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.dependencies import get_db, get_current_active_user, check_user_role
from app.models.models import Employee, EmployeeFunction, EmployeeStatus, DrivingLicense, User, VehicleAssign, Vehicle
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import os
import shutil

router = APIRouter()

# Directory to store uploaded photos
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Pydantic models for request/response
class EmployeeBase(BaseModel):
    firstname: str
    lastname: str
    email: str
    birth_date: Optional[date] = None
    hire_date: Optional[date] = None
    function_id: Optional[int] = None
    status_id: Optional[int] = None
    line1: Optional[str] = None
    line2: Optional[str] = None
    line3: Optional[str] = None
    postalcode: Optional[str] = None
    town: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    license_id: Optional[int] = None
    photo_file: Optional[str] = None

class EmployeeCreate(BaseModel):
    firstname: str
    lastname: str
    email: str
    birth_date: Optional[date] = None
    hire_date: Optional[date] = None
    function_id: Optional[int] = None
    status_id: Optional[int] = None
    line1: Optional[str] = None
    line2: Optional[str] = None
    line3: Optional[str] = None
    postalcode: Optional[str] = None
    town: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    license_id: Optional[int] = None

class EmployeeUpdate(BaseModel):
    firstname: str
    lastname: str
    email: str
    birth_date: Optional[date] = None
    hire_date: Optional[date] = None
    function_id: Optional[int] = None
    status_id: Optional[int] = None
    line1: Optional[str] = None
    line2: Optional[str] = None
    line3: Optional[str] = None
    postalcode: Optional[str] = None
    town: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    license_id: Optional[int] = None

class EmployeeResponse(EmployeeBase):
    id: int
    function_name: Optional[str] = None
    status_name: Optional[str] = None
    license_name: Optional[str] = None
    assigned_vehicle: Optional[str] = None  # New field for make_license_plate

    class Config:
        orm_mode = True

# Get all employees
@router.get("/employees", response_model=List[EmployeeResponse])
def read_employees(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    employees = db.query(Employee).all()
    return [
        {
            "id": emp.id,
            "firstname": emp.firstname,
            "lastname": emp.lastname,
            "email": emp.email,
            "birth_date": emp.birth_date,
            "hire_date": emp.hire_date,
            "function_id": emp.function_id,
            "status_id": emp.status_id,
            "line1": emp.line1,
            "line2": emp.line2,
            "line3": emp.line3,
            "postalcode": emp.postalcode,
            "town": emp.town,
            "state": emp.state,
            "country": emp.country,
            "license_id": emp.license_id,
            "photo_file": emp.photo_file,
            "function_name": emp.function.name if emp.function else None,
            "status_name": emp.status.name if emp.status else None,
            "license_name": emp.license.driving_license_ame if emp.license else None,
            "assigned_vehicle": (
                f"{emp.vehicle_assigns[0].vehicle.make}_{emp.vehicle_assigns[0].vehicle.license_plate}"
                if emp.vehicle_assigns and any(va.end_date is None for va in emp.vehicle_assigns)
                else None
            )
        }
        for emp in employees
    ]

# Get a single employee by ID
@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
def read_employee(employee_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {
        "id": employee.id,
        "firstname": employee.firstname,
        "lastname": employee.lastname,
        "email": employee.email,
        "birth_date": employee.birth_date,
        "hire_date": employee.hire_date,
        "function_id": employee.function_id,
        "status_id": employee.status_id,
        "line1": employee.line1,
        "line2": employee.line2,
        "line3": employee.line3,
        "postalcode": employee.postalcode,
        "town": employee.town,
        "state": employee.state,
        "country": employee.country,
        "license_id": employee.license_id,
        "photo_file": employee.photo_file,
        "function_name": employee.function.name if employee.function else None,
        "status_name": employee.status.name if employee.status else None,
        "license_name": employee.license.driving_license_ame if employee.license else None,
        "assigned_vehicle": (
            f"{employee.vehicle_assigns[0].vehicle.make}_{employee.vehicle_assigns[0].vehicle.license_plate}"
            if employee.vehicle_assigns and any(va.end_date is None for va in employee.vehicle_assigns)
            else None
        )
    }

# Create a new employee with photo upload
@router.post("/employees", response_model=EmployeeResponse)
async def create_employee(
    firstname: str = Form(...),
    lastname: str = Form(...),
    email: str = Form(...),
    birth_date: Optional[str] = Form(None),
    hire_date: Optional[str] = Form(None),
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
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    check_user_role(current_user, "Admin")
    if db.query(Employee).filter(Employee.email == email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    if function_id and not db.query(EmployeeFunction).filter(EmployeeFunction.id == function_id).first():
        raise HTTPException(status_code=400, detail="Invalid function_id")
    if status_id and not db.query(EmployeeStatus).filter(EmployeeStatus.id == status_id).first():
        raise HTTPException(status_code=400, detail="Invalid status_id")
    if license_id and not db.query(DrivingLicense).filter(DrivingLicense.id == license_id).first():
        raise HTTPException(status_code=400, detail="Invalid license_id")

    birth_date_obj = None
    hire_date_obj = None
    if birth_date:
        try:
            birth_date_obj = date.fromisoformat(birth_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid birth_date format. Use YYYY-MM-DD.")
    if hire_date:
        try:
            hire_date_obj = date.fromisoformat(hire_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid hire_date format. Use YYYY-MM-DD.")

    photo_file_path = None
    if photo:
        photo_file_path = os.path.join(UPLOAD_DIR, photo.filename)
        with open(photo_file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

    db_employee = Employee(
        firstname=firstname,
        lastname=lastname,
        email=email,
        birth_date=birth_date_obj,
        hire_date=hire_date_obj,
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
        photo_file=photo_file_path
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return {
        "id": db_employee.id,
        "firstname": db_employee.firstname,
        "lastname": db_employee.lastname,
        "email": db_employee.email,
        "birth_date": db_employee.birth_date,
        "hire_date": db_employee.hire_date,
        "function_id": db_employee.function_id,
        "status_id": db_employee.status_id,
        "line1": db_employee.line1,
        "line2": db_employee.line2,
        "line3": db_employee.line3,
        "postalcode": db_employee.postalcode,
        "town": db_employee.town,
        "state": db_employee.state,
        "country": db_employee.country,
        "license_id": db_employee.license_id,
        "photo_file": db_employee.photo_file,
        "function_name": db_employee.function.name if db_employee.function else None,
        "status_name": db_employee.status.name if db_employee.status else None,
        "license_name": db_employee.license.driving_license_ame if db_employee.license else None,
        "assigned_vehicle": None  # New employee won't have an assignment yet
    }

# Update an employee with photo upload
@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    firstname: str = Form(...),
    lastname: str = Form(...),
    email: str = Form(...),
    birth_date: Optional[str] = Form(None),
    hire_date: Optional[str] = Form(None),
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
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    check_user_role(current_user, "Admin")
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if email != db_employee.email and db.query(Employee).filter(Employee.email == email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    if function_id and not db.query(EmployeeFunction).filter(EmployeeFunction.id == function_id).first():
        raise HTTPException(status_code=400, detail="Invalid function_id")
    if status_id and not db.query(EmployeeStatus).filter(EmployeeStatus.id == status_id).first():
        raise HTTPException(status_code=400, detail="Invalid status_id")
    if license_id and not db.query(DrivingLicense).filter(DrivingLicense.id == license_id).first():
        raise HTTPException(status_code=400, detail="Invalid license_id")

    birth_date_obj = None
    hire_date_obj = None
    if birth_date:
        try:
            birth_date_obj = date.fromisoformat(birth_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid birth_date format. Use YYYY-MM-DD.")
    if hire_date:
        try:
            hire_date_obj = date.fromisoformat(hire_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid hire_date format. Use YYYY-MM-DD.")

    if photo:
        if db_employee.photo_file and os.path.exists(db_employee.photo_file):
            os.remove(db_employee.photo_file)
        photo_file_path = os.path.join(UPLOAD_DIR, photo.filename)
        with open(photo_file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        db_employee.photo_file = photo_file_path

    db_employee.firstname = firstname
    db_employee.lastname = lastname
    db_employee.email = email
    db_employee.birth_date = birth_date_obj
    db_employee.hire_date = hire_date_obj
    db_employee.function_id = function_id
    db_employee.status_id = status_id
    db_employee.line1 = line1
    db_employee.line2 = line2
    db_employee.line3 = line3
    db_employee.postalcode = postalcode
    db_employee.town = town
    db_employee.state = state
    db_employee.country = country
    db_employee.license_id = license_id

    db.commit()
    db.refresh(db_employee)
    return {
        "id": db_employee.id,
        "firstname": db_employee.firstname,
        "lastname": db_employee.lastname,
        "email": db_employee.email,
        "birth_date": db_employee.birth_date,
        "hire_date": db_employee.hire_date,
        "function_id": db_employee.function_id,
        "status_id": db_employee.status_id,
        "line1": db_employee.line1,
        "line2": db_employee.line2,
        "line3": db_employee.line3,
        "postalcode": db_employee.postalcode,
        "town": db_employee.town,
        "state": db_employee.state,
        "country": db_employee.country,
        "license_id": db_employee.license_id,
        "photo_file": db_employee.photo_file,
        "function_name": db_employee.function.name if db_employee.function else None,
        "status_name": db_employee.status.name if db_employee.status else None,
        "license_name": db_employee.license.driving_license_ame if db_employee.license else None,
        "assigned_vehicle": (
            f"{db_employee.vehicle_assigns[0].vehicle.make}_{db_employee.vehicle_assigns[0].vehicle.license_plate}"
            if db_employee.vehicle_assigns and any(va.end_date is None for va in db_employee.vehicle_assigns)
            else None
        )
    }

# Delete an employee
@router.delete("/employees/{employee_id}", response_model=dict)
def delete_employee(employee_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Check if the employee has an active vehicle assignment
    active_assignment = db.query(VehicleAssign).filter(
        (VehicleAssign.employee_id == employee_id) & 
        (VehicleAssign.end_date.is_(None))
    ).first()
    if active_assignment:
        assigned_vehicle = db.query(Vehicle).filter(Vehicle.id == active_assignment.vehicle_id).first()
        raise HTTPException(
            status_code=403,
            detail=f"Cannot delete employee. They are currently assigned to vehicle {assigned_vehicle.make} {assigned_vehicle.license_plate}."
        )
    
    # Proceed with deletion if no active assignment exists
    if db_employee.photo_file and os.path.exists(db_employee.photo_file):
        os.remove(db_employee.photo_file)
    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted successfully"}

# Serve uploaded photos
@router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# Get all employee functions
@router.get("/employee_functions", response_model=List[dict])
def read_employee_functions(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    functions = db.query(EmployeeFunction).all()
    return [{"id": func.id, "name": func.name} for func in functions]

# Get all employee statuses
@router.get("/employee_statuses", response_model=List[dict])
def read_employee_statuses(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    statuses = db.query(EmployeeStatus).all()
    return [{"id": status.id, "name": status.name} for status in statuses]

# Get all driving licenses
@router.get("/driving_licenses", response_model=List[dict])
def read_driving_licenses(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    licenses = db.query(DrivingLicense).all()
    return [{"id": lic.id, "driving_license_ame": lic.driving_license_ame} for lic in licenses]

# Get employee status distribution for pie chart
@router.get("/employee_status_distribution", response_model=List[dict])
def get_employee_status_distribution(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    # Query to count employees by status_id and join with EmployeeStatus for names
    status_distribution = (
        db.query(EmployeeStatus.name, func.count(Employee.id).label("count"))
        .outerjoin(Employee, Employee.status_id == EmployeeStatus.id)
        .group_by(EmployeeStatus.id, EmployeeStatus.name)
        .all()
    )
    # Convert to list of dictionaries
    return [
        {"status_name": name if name else "No Status", "count": count}
        for name, count in status_distribution
    ]