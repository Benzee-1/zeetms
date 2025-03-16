# ZeeTMS/backend/app/crud.py
from database import get_db_connection
from schemas import UserCreate, EmployeeCreate, VehicleCreate

def create_user(username: str, hashed_password: str, role_id: int, descript: str = None):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO users (username, hashed_password, descript, is_active, role_id) VALUES (%s, %s, %s, %s, %s) RETURNING id",
        (username, hashed_password, descript, True, role_id)
    )
    user_id = cur.fetchone()["id"]
    conn.commit()
    cur.close()
    conn.close()
    return user_id

def get_user_by_username(username: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def get_employees():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM employee")
    employees = cur.fetchall()
    cur.close()
    conn.close()
    return employees

def get_employee_by_id(employee_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM employee WHERE id = %s", (employee_id,))
    employee = cur.fetchone()
    cur.close()
    conn.close()
    return employee

def create_address(address_data: dict):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO address (name, line1, line2, line3, postalcode, town, state, country, latitude, longitude)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """,
        (
            address_data.get("name"), address_data.get("line1"), address_data.get("line2"),
            address_data.get("line3"), address_data.get("postalcode"), address_data.get("town"),
            address_data.get("state"), address_data.get("country"), address_data.get("latitude"),
            address_data.get("longitude")
        )
    )
    address_id = cur.fetchone()["id"]
    conn.commit()
    cur.close()
    conn.close()
    return address_id

def create_employee(employee: EmployeeCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        address_id = None
        address_data = {
            "name": None,
            "line1": employee.line1,
            "line2": employee.line2,
            "line3": employee.line3,
            "postalcode": employee.postalcode,
            "town": employee.town,
            "state": employee.state,
            "country": employee.country,
            "latitude": None,
            "longitude": None
        }
        if any(value is not None for value in address_data.values()):
            address_id = create_address(address_data)

        cur.execute(
            """
            INSERT INTO employee (firstname, lastname, "birthDate", "hireDate", email, function_id, status_id, address_id, license_id, "photoFile")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            """,
            (
                employee.firstname, employee.lastname, employee.birthDate, employee.hireDate, employee.email,
                employee.function_id, employee.status_id, address_id, employee.license_id, employee.photoFile
            )
        )
        employee_id = cur.fetchone()["id"]
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()
    return employee_id

def update_employee(employee_id: int, employee: EmployeeCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE employee SET firstname = %s, lastname = %s, "birthDate" = %s, "hireDate" = %s, email = %s,
        function_id = %s, status_id = %s, address_id = %s, license_id = %s, "photoFile" = %s, updated_at = NOW()
        WHERE id = %s RETURNING id
        """,
        (employee.firstname, employee.lastname, employee.birthDate, employee.hireDate, employee.email,
         employee.function_id, employee.status_id, employee.address_id, employee.license_id, employee.photoFile, employee_id)
    )
    updated_id = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return updated_id is not None

def delete_employee(employee_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM employee WHERE id = %s RETURNING id", (employee_id,))
    deleted_id = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return deleted_id is not None

def get_employee_functions():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM employee_function")
    functions = cur.fetchall()
    cur.close()
    conn.close()
    return functions

def get_employee_statuses():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM employee_status")
    statuses = cur.fetchall()
    cur.close()
    conn.close()
    return statuses

def get_driving_licenses():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM driving_license")
    licenses = cur.fetchall()
    cur.close()
    conn.close()
    return licenses

# New Vehicle CRUD Functions
def create_vehicle(vehicle: VehicleCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO vehicle ("licensePlate", "make", "model", "color", "typeID", "statusID", "insuranceID", "capacity_kg", "volume_litre", "photoFile")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """,
        (
            vehicle.licensePlate, vehicle.make, vehicle.model, vehicle.color, vehicle.typeID,
            vehicle.statusID, vehicle.insuranceID, vehicle.capacity_kg, vehicle.volume_litre, vehicle.photoFile
        )
    )
    vehicle_id = cur.fetchone()["id"]
    conn.commit()
    cur.close()
    conn.close()
    return vehicle_id

def get_vehicles():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM vehicle")
    vehicles = cur.fetchall()
    cur.close()
    conn.close()
    return vehicles

def get_vehicle_by_id(vehicle_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM vehicle WHERE id = %s", (vehicle_id,))
    vehicle = cur.fetchone()
    cur.close()
    conn.close()
    return vehicle

def update_vehicle(vehicle_id: int, vehicle: VehicleCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE vehicle SET "licensePlate" = %s, "make" = %s, "model" = %s, "color" = %s, "typeID" = %s,
        "statusID" = %s, "insuranceID" = %s, "capacity_kg" = %s, "volume_litre" = %s, "photoFile" = %s
        WHERE id = %s RETURNING id
        """,
        (
            vehicle.licensePlate, vehicle.make, vehicle.model, vehicle.color, vehicle.typeID,
            vehicle.statusID, vehicle.insuranceID, vehicle.capacity_kg, vehicle.volume_litre, vehicle.photoFile, vehicle_id
        )
    )
    updated_id = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return updated_id is not None

def delete_vehicle(vehicle_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM vehicle WHERE id = %s RETURNING id", (vehicle_id,))
    deleted_id = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return deleted_id is not None

def get_vehicle_types():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM vehicle_type")
    types = cur.fetchall()
    cur.close()
    conn.close()
    return types

def get_vehicle_statuses():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM vehicle_status")
    statuses = cur.fetchall()
    cur.close()
    conn.close()
    return statuses

def get_insurances():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM insurance")
    insurances = cur.fetchall()
    cur.close()
    conn.close()
    return insurances