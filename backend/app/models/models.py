from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text, Date
from sqlalchemy.orm import relationship
from app.database.database import Base
from datetime import datetime

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String, unique=True, nullable=False)
    descript = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    descript = Column(String)
    is_active = Column(Boolean, default=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    role = relationship("Role", back_populates="users")

class Address(Base):
    __tablename__ = "address"
    id = Column(Integer, primary_key=True, index=True)
    line1 = Column(String)
    line2 = Column(String)
    line3 = Column(String)
    postalcode = Column(String)
    town = Column(String)
    state = Column(String)
    country = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DrivingLicense(Base):
    __tablename__ = "driving_license"
    id = Column(Integer, primary_key=True, index=True)
    driving_license_ame = Column(String, unique=True, nullable=False)
    descript = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EmployeeFunction(Base):
    __tablename__ = "employee_function"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    descript = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    employees = relationship("Employee", back_populates="function")

class EmployeeStatus(Base):
    __tablename__ = "employee_status"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    descript = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    employees = relationship("Employee", back_populates="status")

class Insurance(Base):
    __tablename__ = "insurance"
    id = Column(Integer, primary_key=True, index=True)
    insurance_ref = Column(String, unique=True, nullable=False)
    insurance_company = Column(String)
    descript = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    vehicles = relationship("Vehicle", back_populates="insurance")

class OrdersStatus(Base):
    __tablename__ = "orders_status"
    id = Column(Integer, primary_key=True, index=True)
    orde_status_name = Column(String, unique=True, nullable=False)
    descript = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class VehicleStatus(Base):
    __tablename__ = "vehicle_status"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_status_name = Column(String, unique=True, nullable=False)
    descript = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    vehicles = relationship("Vehicle", back_populates="status")

class VehicleType(Base):
    __tablename__ = "vehicle_type"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_type_name = Column(String, unique=True, nullable=False)
    descript = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    vehicles = relationship("Vehicle", back_populates="type")

class Customer(Base):
    __tablename__ = "customer"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, unique=True)
    address_id = Column(Integer, ForeignKey("address.id"))
    customer_type = Column(String)
    phone_number = Column(String)
    email = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    firstname = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    birth_date = Column(Date)
    hire_date = Column(Date)
    function_id = Column(Integer, ForeignKey("employee_function.id"))
    status_id = Column(Integer, ForeignKey("employee_status.id"))
    line1 = Column(String)
    line2 = Column(String)
    line3 = Column(String)
    postalcode = Column(String)
    town = Column(String)
    state = Column(String)
    country = Column(String)
    license_id = Column(Integer, ForeignKey("driving_license.id"))
    photo_file = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    function = relationship("EmployeeFunction", back_populates="employees")
    status = relationship("EmployeeStatus", back_populates="employees")
    license = relationship("DrivingLicense")
    vehicle_assigns = relationship("VehicleAssign", back_populates="employee")  # Added relationship

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_name = Column(String, unique=True)
    order_number = Column(Integer, unique=True)
    customer_id = Column(Integer, ForeignKey("customer.id"))
    delivery_address = Column(Integer, ForeignKey("address.id"))
    order_date = Column(Date)
    required_date = Column(Date)
    delivery_date = Column(Date)
    status_id = Column(Integer, ForeignKey("orders_status.id"))
    weight_kg = Column(Float)
    volume_litre = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text)

class Supplier(Base):
    __tablename__ = "supplier"
    id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String, unique=True)
    address_id = Column(Integer, ForeignKey("address.id"))
    supplier_type = Column(String)
    phone_number = Column(String)
    email = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    license_plate = Column(String, unique=True, nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    color = Column(String)
    type_id = Column(Integer, ForeignKey("vehicle_type.id"))
    status_id = Column(Integer, ForeignKey("vehicle_status.id"))
    insurance_id = Column(Integer, ForeignKey("insurance.id"))
    capacity_kg = Column(Float)
    volume_litre = Column(Float)
    photo_file = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    type = relationship("VehicleType", back_populates="vehicles")
    status = relationship("VehicleStatus", back_populates="vehicles")
    insurance = relationship("Insurance", back_populates="vehicles")
    vehicle_assigns = relationship("VehicleAssign", back_populates="vehicle")  # Added relationship

class Warehouse(Base):
    __tablename__ = "warehouse"
    id = Column(Integer, primary_key=True, index=True)
    warehouse_name = Column(String, unique=True)
    address_id = Column(Integer, ForeignKey("address.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class VehicleAssign(Base):
    __tablename__ = "vehicle_assign"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    end_date = Column(DateTime, nullable=True, default=None)
    employee = relationship("Employee", back_populates="vehicle_assigns")  # Added relationship
    vehicle = relationship("Vehicle", back_populates="vehicle_assigns")  # Added relationship

class Delivery(Base):
    __tablename__ = "delivery"
    id = Column(Integer, primary_key=True, index=True)
    delivery_name = Column(String, unique=True)
    order_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    notes = Column(Text)