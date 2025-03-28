from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.dependencies import get_db, get_current_active_user, check_user_role
from app.models.models import Vehicle, VehicleType, VehicleStatus, Insurance, User, VehicleAssign, Employee
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from datetime import datetime

router = APIRouter()

# Directory to store uploaded photos (same as employees)
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Pydantic models for request/response
class VehicleBase(BaseModel):
    license_plate: str
    make: str
    model: str
    color: Optional[str] = None
    type_id: Optional[int] = None
    status_id: Optional[int] = None
    insurance_id: Optional[int] = None
    capacity_kg: Optional[float] = None
    volume_litre: Optional[float] = None
    photo_file: Optional[str] = None

class VehicleCreate(BaseModel):
    license_plate: str
    make: str
    model: str
    color: Optional[str] = None
    type_id: Optional[int] = None
    status_id: Optional[int] = None
    insurance_id: Optional[int] = None
    capacity_kg: Optional[float] = None
    volume_litre: Optional[float] = None

class VehicleUpdate(BaseModel):
    license_plate: str
    make: str
    model: str
    color: Optional[str] = None
    type_id: Optional[int] = None
    status_id: Optional[int] = None
    insurance_id: Optional[int] = None
    capacity_kg: Optional[float] = None
    volume_litre: Optional[float] = None

class VehicleResponse(VehicleBase):
    id: int
    vehicle_type_name: Optional[str] = None
    vehicle_status_name: Optional[str] = None
    insurance_ref: Optional[str] = None

    class Config:
        orm_mode = True

# Pydantic model for vehicle assignment
class VehicleAssignCreate(BaseModel):
    employee_id: int
    vehicle_id: int

# Pydantic model for vehicle unassignment
class VehicleUnassignRequest(BaseModel):
    vehicle_id: int

# Get all vehicles
@router.get("/vehicles", response_model=List[VehicleResponse])
def read_vehicles(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    vehicles = db.query(Vehicle).all()
    return [
        {
            "id": veh.id,
            "license_plate": veh.license_plate,
            "make": veh.make,
            "model": veh.model,
            "color": veh.color,
            "type_id": veh.type_id,
            "status_id": veh.status_id,
            "insurance_id": veh.insurance_id,
            "capacity_kg": veh.capacity_kg,
            "volume_litre": veh.volume_litre,
            "photo_file": veh.photo_file,
            "vehicle_type_name": veh.type.vehicle_type_name if veh.type else None,
            "vehicle_status_name": veh.status.vehicle_status_name if veh.status else None,
            "insurance_ref": veh.insurance.insurance_ref if veh.insurance else None
        }
        for veh in vehicles
    ]

# Get a single vehicle by ID
@router.get("/vehicles/{vehicle_id}", response_model=VehicleResponse)
def read_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {
        "id": vehicle.id,
        "license_plate": vehicle.license_plate,
        "make": vehicle.make,
        "model": vehicle.model,
        "color": vehicle.color,
        "type_id": vehicle.type_id,
        "status_id": vehicle.status_id,
        "insurance_id": vehicle.insurance_id,
        "capacity_kg": vehicle.capacity_kg,
        "volume_litre": vehicle.volume_litre,
        "photo_file": vehicle.photo_file,
        "vehicle_type_name": vehicle.type.vehicle_type_name if vehicle.type else None,
        "vehicle_status_name": vehicle.status.vehicle_status_name if vehicle.status else None,
        "insurance_ref": vehicle.insurance.insurance_ref if vehicle.insurance else None
    }

# Create a new vehicle with photo upload
@router.post("/vehicles", response_model=VehicleResponse)
async def create_vehicle(
    license_plate: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    color: Optional[str] = Form(None),
    type_id: Optional[int] = Form(None),
    status_id: Optional[int] = Form(None),
    insurance_id: Optional[int] = Form(None),
    capacity_kg: Optional[float] = Form(None),
    volume_litre: Optional[float] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    check_user_role(current_user, "Admin")
    if db.query(Vehicle).filter(Vehicle.license_plate == license_plate).first():
        raise HTTPException(status_code=400, detail="License plate already exists")
    if type_id and not db.query(VehicleType).filter(VehicleType.id == type_id).first():
        raise HTTPException(status_code=400, detail="Invalid type_id")
    if status_id and not db.query(VehicleStatus).filter(VehicleStatus.id == status_id).first():
        raise HTTPException(status_code=400, detail="Invalid status_id")
    if insurance_id and not db.query(Insurance).filter(Insurance.id == insurance_id).first():
        raise HTTPException(status_code=400, detail="Invalid insurance_id")

    photo_file_path = None
    if photo:
        photo_file_path = os.path.join(UPLOAD_DIR, photo.filename)
        with open(photo_file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

    db_vehicle = Vehicle(
        license_plate=license_plate,
        make=make,
        model=model,
        color=color,
        type_id=type_id,
        status_id=status_id,
        insurance_id=insurance_id,
        capacity_kg=capacity_kg,
        volume_litre=volume_litre,
        photo_file=photo_file_path
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return {
        "id": db_vehicle.id,
        "license_plate": db_vehicle.license_plate,
        "make": db_vehicle.make,
        "model": db_vehicle.model,
        "color": db_vehicle.color,
        "type_id": db_vehicle.type_id,
        "status_id": db_vehicle.status_id,
        "insurance_id": db_vehicle.insurance_id,
        "capacity_kg": db_vehicle.capacity_kg,
        "volume_litre": db_vehicle.volume_litre,
        "photo_file": db_vehicle.photo_file,
        "vehicle_type_name": db_vehicle.type.vehicle_type_name if db_vehicle.type else None,
        "vehicle_status_name": db_vehicle.status.vehicle_status_name if db_vehicle.status else None,
        "insurance_ref": db_vehicle.insurance.insurance_ref if db_vehicle.insurance else None
    }

# Update a vehicle with photo upload
@router.put("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: int,
    license_plate: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    color: Optional[str] = Form(None),
    type_id: Optional[int] = Form(None),
    status_id: Optional[int] = Form(None),
    insurance_id: Optional[int] = Form(None),
    capacity_kg: Optional[float] = Form(None),
    volume_litre: Optional[float] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    check_user_role(current_user, "Admin")
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if license_plate != db_vehicle.license_plate and db.query(Vehicle).filter(Vehicle.license_plate == license_plate).first():
        raise HTTPException(status_code=400, detail="License plate already exists")
    if type_id and not db.query(VehicleType).filter(VehicleType.id == type_id).first():
        raise HTTPException(status_code=400, detail="Invalid type_id")
    if status_id and not db.query(VehicleStatus).filter(VehicleStatus.id == status_id).first():
        raise HTTPException(status_code=400, detail="Invalid status_id")
    if insurance_id and not db.query(Insurance).filter(Insurance.id == insurance_id).first():
        raise HTTPException(status_code=400, detail="Invalid insurance_id")

    if photo:
        if db_vehicle.photo_file and os.path.exists(db_vehicle.photo_file):
            os.remove(db_vehicle.photo_file)
        photo_file_path = os.path.join(UPLOAD_DIR, photo.filename)
        with open(photo_file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        db_vehicle.photo_file = photo_file_path

    db_vehicle.license_plate = license_plate
    db_vehicle.make = make
    db_vehicle.model = model
    db_vehicle.color = color
    db_vehicle.type_id = type_id
    db_vehicle.status_id = status_id
    db_vehicle.insurance_id = insurance_id
    db_vehicle.capacity_kg = capacity_kg
    db_vehicle.volume_litre = volume_litre

    db.commit()
    db.refresh(db_vehicle)
    return {
        "id": db_vehicle.id,
        "license_plate": db_vehicle.license_plate,
        "make": db_vehicle.make,
        "model": db_vehicle.model,
        "color": db_vehicle.color,
        "type_id": db_vehicle.type_id,
        "status_id": db_vehicle.status_id,
        "insurance_id": db_vehicle.insurance_id,
        "capacity_kg": db_vehicle.capacity_kg,
        "volume_litre": db_vehicle.volume_litre,
        "photo_file": db_vehicle.photo_file,
        "vehicle_type_name": db_vehicle.type.vehicle_type_name if db_vehicle.type else None,
        "vehicle_status_name": db_vehicle.status.vehicle_status_name if db_vehicle.status else None,
        "insurance_ref": db_vehicle.insurance.insurance_ref if db_vehicle.insurance else None
    }

# Delete a vehicle
@router.delete("/vehicles/{vehicle_id}", response_model=dict)
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Check if the vehicle is currently assigned to an employee
    active_assignment = db.query(VehicleAssign).filter(
        (VehicleAssign.vehicle_id == vehicle_id) & 
        (VehicleAssign.end_date.is_(None))
    ).first()
    if active_assignment:
        assigned_employee = db.query(Employee).filter(Employee.id == active_assignment.employee_id).first()
        raise HTTPException(
            status_code=403,
            detail=f"Cannot delete vehicle. It is currently assigned to {assigned_employee.firstname} {assigned_employee.lastname}."
        )
    
    # Clean up any orphaned assignments (historical data fix)
    orphaned_assignments = db.query(VehicleAssign).filter(VehicleAssign.vehicle_id == vehicle_id).all()
    for assignment in orphaned_assignments:
        db.delete(assignment)
    
    # Proceed with deletion
    if db_vehicle.photo_file and os.path.exists(db_vehicle.photo_file):
        os.remove(db_vehicle.photo_file)
    db.delete(db_vehicle)
    db.commit()
    return {"message": "Vehicle deleted successfully"}

# Get all vehicle types
@router.get("/vehicle_types", response_model=List[dict])
def read_vehicle_types(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    types = db.query(VehicleType).all()
    return [{"id": type_.id, "vehicle_type_name": type_.vehicle_type_name} for type_ in types]

# Get all vehicle statuses
@router.get("/vehicle_statuses", response_model=List[dict])
def read_vehicle_statuses(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    statuses = db.query(VehicleStatus).all()
    return [{"id": status.id, "vehicle_status_name": status.vehicle_status_name} for status in statuses]

# Get all insurances
@router.get("/insurances", response_model=List[dict])
def read_insurances(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    insurances = db.query(Insurance).all()
    return [{"id": ins.id, "insurance_ref": ins.insurance_ref} for ins in insurances]

# Assign a vehicle to an employee
@router.post("/vehicle_assign", response_model=dict)
def assign_vehicle(
    assignment: VehicleAssignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    check_user_role(current_user, "Admin")

    # Check if vehicle and employee exist
    vehicle = db.query(Vehicle).filter(Vehicle.id == assignment.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    employee = db.query(Employee).filter(Employee.id == assignment.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Check for existing active assignment for this vehicle
    active_assignment = db.query(VehicleAssign).filter(
        (VehicleAssign.vehicle_id == assignment.vehicle_id) & 
        (VehicleAssign.end_date.is_(None))
    ).first()

    if active_assignment:
        assigned_employee = db.query(Employee).filter(Employee.id == active_assignment.employee_id).first()
        raise HTTPException(
            status_code=403,
            detail=f"This vehicle is already assigned to {assigned_employee.firstname} {assigned_employee.lastname}. This operation is not permitted."
        )

    current_time = datetime.utcnow()

    # Create new assignment
    new_assignment = VehicleAssign(
        employee_id=assignment.employee_id,
        vehicle_id=assignment.vehicle_id,
        created_at=current_time,
        updated_at=current_time,
        end_date=None  # Active assignment
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return {"message": "Vehicle assigned successfully"}

# Unassign a vehicle from an employee
@router.post("/vehicle_unassign", response_model=dict)
def unassign_vehicle(
    request: VehicleUnassignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    check_user_role(current_user, "Admin")

    # Check if vehicle exists
    vehicle = db.query(Vehicle).filter(Vehicle.id == request.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Find active assignment for this vehicle
    active_assignment = db.query(VehicleAssign).filter(
        (VehicleAssign.vehicle_id == request.vehicle_id) & 
        (VehicleAssign.end_date.is_(None))
    ).first()

    if not active_assignment:
        raise HTTPException(status_code=400, detail="Vehicle is not currently assigned to any employee")

    # Set end_date to current time to mark assignment as inactive
    current_time = datetime.utcnow()
    active_assignment.end_date = current_time
    active_assignment.updated_at = current_time

    db.commit()
    db.refresh(active_assignment)

    return {"message": "Vehicle unassigned successfully"}

# Get vehicle status distribution for pie chart
@router.get("/vehicle_status_distribution", response_model=List[dict])
def get_vehicle_status_distribution(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    check_user_role(current_user, "Admin")
    
    # Get status IDs for "disponible" and "maintenance" (lowercase to match DB)
    disponible_status = db.query(VehicleStatus).filter(VehicleStatus.vehicle_status_name == "disponible").first()
    maintenance_status = db.query(VehicleStatus).filter(VehicleStatus.vehicle_status_name == "maintenance").first()
    
    if not disponible_status or not maintenance_status:
        missing = []
        if not disponible_status:
            missing.append("'disponible'")
        if not maintenance_status:
            missing.append("'maintenance'")
        raise HTTPException(
            status_code=500,
            detail=f"Required status names {', '.join(missing)} not found in database"
        )
        
    disponible_status_id = disponible_status.id  # 1
    maintenance_status_id = maintenance_status.id  # 2

    # Count assigned vehicles (active assignments in VehicleAssign OR status_id = "assigne")
    assigned_count = (
        db.query(Vehicle)
        .outerjoin(VehicleAssign, (VehicleAssign.vehicle_id == Vehicle.id) & (VehicleAssign.end_date.is_(None)))
        .filter(
            (VehicleAssign.vehicle_id.isnot(None)) |  # Active assignment
            (Vehicle.status_id == 3)  # OR status_id = "assigne"
        )
        .distinct()  # Avoid double-counting if a vehicle is both assigned and has status "assigne"
        .count()
    )

    # Count available vehicles (status_id = "disponible" and no active assignment)
    available_count = (
        db.query(Vehicle)
        .filter(Vehicle.status_id == disponible_status_id)
        .outerjoin(VehicleAssign, (VehicleAssign.vehicle_id == Vehicle.id) & (VehicleAssign.end_date.is_(None)))
        .filter(VehicleAssign.vehicle_id.is_(None))  # No active assignment
        .count()
    )
    
# Count maintenance vehicles (status_id = "maintenance")
    maintenance_count = db.query(Vehicle).filter(Vehicle.status_id == maintenance_status_id).count()

    # Return distribution with user-friendly labels
    return [
        {"status_name": "Available", "count": available_count},
        {"status_name": "In Maintenance", "count": maintenance_count},
        {"status_name": "Assigned", "count": assigned_count}
    ]

