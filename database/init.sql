-- ZeeTMS/database/init.sql
-- Existing Tables (unchanged)
CREATE TABLE "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "username" varchar UNIQUE NOT NULL,
  "hashed_password" varchar NOT NULL,
  "descript" varchar,
  "is_active" boolean DEFAULT 'true',
  "role_id" integer NOT NULL,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp
);

CREATE TABLE "roles" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar UNIQUE NOT NULL,
  "descript" varchar,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp
);

CREATE TABLE "employee_function" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar UNIQUE NOT NULL,
  "descript" varchar,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp
);

CREATE TABLE "employee_status" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar UNIQUE NOT NULL,
  "descript" varchar,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp
);

CREATE TABLE "driving_license" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar UNIQUE NOT NULL,
  "descript" varchar,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp
);

CREATE TABLE "address" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar UNIQUE,
  "line1" varchar,
  "line2" varchar,
  "line3" varchar,
  "postalcode" varchar,
  "town" varchar,
  "state" varchar,
  "country" varchar,
  "latitude" float,
  "longitude" float,
  "created_at" timestamp DEFAULT NOW()
);

CREATE TABLE "employee" (
  "id" serial PRIMARY KEY NOT NULL,
  "firstname" varchar NOT NULL,
  "lastname" varchar NOT NULL,
  "birthDate" date,
  "hireDate" date,
  "email" varchar UNIQUE,
  "function_id" integer,
  "status_id" integer,
  "address_id" integer,
  "license_id" integer,
  "photoFile" varchar,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp
);

-- New Vehicle-Related Tables
CREATE TABLE "vehicle" (
  "id" serial PRIMARY KEY NOT NULL,
  "licensePlate" varchar UNIQUE,
  "make" varchar,
  "model" varchar,
  "color" varchar,
  "typeID" integer,
  "statusID" integer,
  "insuranceID" integer,
  "capacity_kg" float,
  "volume_litre" float,
  "photoFile" varchar,
  "created_at" timestamp DEFAULT NOW()
);

CREATE TABLE "insurance" (
  "id" serial PRIMARY KEY NOT NULL,
  "number" varchar UNIQUE,
  "company" varchar,
  "stardate" date,
  "enddate" date,
  "type" varchar,
  "created_at" timestamp DEFAULT NOW()
);

CREATE TABLE "vehicle_type" (
  "id" serial PRIMARY KEY NOT NULL,
  "type" varchar UNIQUE,
  "descript" varchar
);

CREATE TABLE "vehicle_status" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar,
  "descript" varchar
);

CREATE TABLE "vehicle_assign" (
  "id" serial PRIMARY KEY NOT NULL,
  "employee_id" integer,
  "vehicle_id" integer
);

-- Foreign Keys (existing)
ALTER TABLE "users" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id");
ALTER TABLE "employee" ADD FOREIGN KEY ("function_id") REFERENCES "employee_function" ("id");
ALTER TABLE "employee" ADD FOREIGN KEY ("status_id") REFERENCES "employee_status" ("id");
ALTER TABLE "employee" ADD FOREIGN KEY ("license_id") REFERENCES "driving_license" ("id");
ALTER TABLE "employee" ADD FOREIGN KEY ("address_id") REFERENCES "address" ("id");

-- Foreign Keys (new)
ALTER TABLE "vehicle" ADD FOREIGN KEY ("typeID") REFERENCES "vehicle_type" ("id");
ALTER TABLE "vehicle" ADD FOREIGN KEY ("statusID") REFERENCES "vehicle_status" ("id");
ALTER TABLE "vehicle" ADD FOREIGN KEY ("insuranceID") REFERENCES "insurance" ("id");
ALTER TABLE "vehicle_assign" ADD FOREIGN KEY ("employee_id") REFERENCES "employee" ("id");
ALTER TABLE "vehicle_assign" ADD FOREIGN KEY ("vehicle_id") REFERENCES "vehicle" ("id");

-- Initial Data (existing)
INSERT INTO "roles" ("name", "descript") 
VALUES 
  ('Admin', 'Administrator Role'),
  ('Manager', 'Manager Role'),
  ('Employee', 'Employee Role');

INSERT INTO "users" ("username", "hashed_password", "role_id", "descript") 
VALUES 
  ('admin', '$2b$12$X9g7k2j5m8n3p4q6r9t2v.t5u8v2w4x6y8z0a2b4c6d8e0f2g4h6i', 1, 'Default Admin User');

INSERT INTO "driving_license" ("name", "descript")
VALUES 
  ('A1', 'Permis pour motos légères (125cc max, 11kW)'),
  ('A2', 'Permis pour motos de puissance moyenne (35kW max)'),
  ('B', 'Permis pour voitures particulières (jusqu’à 3,5t)'),
  ('C1', 'Permis pour véhicules de marchandises moyens (3,5t à 7,5t)'),
  ('C2', 'Permis pour véhicules de marchandises spécifiques (variante locale)'),
  ('D', 'Permis pour autobus et transports de passagers'),
  ('F', 'Permis pour tracteurs et véhicules spéciaux');

INSERT INTO "employee_function" ("name", "descript", "created_at")
VALUES 
  ('conducteur', 'Chauffeur responsable de la conduite des véhicules', NOW()),
  ('aide-conducteur', 'Assistant du conducteur pour les tâches de soutien', NOW()),
  ('livreur', 'Personne en charge de la livraison des marchandises', NOW()),
  ('mecanicien', 'Technicien responsable de l’entretien et des réparations', NOW()),
  ('manager', 'Responsable de la gestion d’équipe et des opérations', NOW());

INSERT INTO "employee_status" ("name", "descript")
VALUES 
  ('disponible', 'Employé disponible pour travailler'),
  ('congé', 'Employé en congé ou en vacances'),
  ('en_mission', 'Employé actuellement en mission ou déplacement');

-- Initial Data (new for vehicles)
INSERT INTO "vehicle_type" ("type", "descript")
VALUES 
  ('Car', 'Standard passenger vehicle'),
  ('Van', 'Cargo van for deliveries'),
  ('Truck', 'Heavy goods vehicle'),
  ('Bus', 'Passenger transport vehicle');

INSERT INTO "vehicle_status" ("name", "descript")
VALUES 
  ('Available', 'Vehicle ready for use'),
  ('In Use', 'Vehicle currently assigned or on mission'),
  ('Maintenance', 'Vehicle under repair or servicing');

INSERT INTO "insurance" ("number", "company", "stardate", "enddate", "type")
VALUES 
  ('INS12345', 'Allianz', '2023-01-01', '2024-01-01', 'Comprehensive'),
  ('INS67890', 'AXA', '2023-06-01', '2024-06-01', 'Third Party'),
  ('INS54321', 'Generali', '2023-03-01', '2024-03-01', 'Comprehensive');

INSERT INTO "vehicle" ("licensePlate", "make", "model", "color", "typeID", "statusID", "insuranceID", "capacity_kg", "volume_litre", "photoFile")
VALUES 
  ('ABC123', 'Toyota', 'Camry', 'Blue', 1, 1, 1, 500, 400, '/app/photos/abc123.jpg'),
  ('XYZ789', 'Ford', 'Transit', 'White', 2, 2, 2, 1000, 2000, NULL),
  ('LMN456', 'Volvo', 'FH16', 'Red', 3, 3, 3, 20000, 5000, '/app/photos/lmn456.jpg');