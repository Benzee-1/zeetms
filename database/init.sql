-- Copy the entire SQL script you provided here
-- roles definition
CREATE TABLE roles (
    id serial4 NOT NULL,
    role_name varchar NOT NULL,
    descript varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT roles_name_key UNIQUE (role_name),
    CONSTRAINT roles_pkey PRIMARY KEY (id)
);

-- users definition
CREATE TABLE users (
    id serial4 NOT NULL,
    username varchar NOT NULL,
    hashed_password varchar NOT NULL,
    descript varchar NULL,
    is_active bool NULL DEFAULT true,
    role_id int4 NOT NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Insert roles
INSERT INTO roles (role_name, descript, created_at, updated_at)
VALUES 
    ('Admin', 'Full access to all features', NOW(), NOW()),
    ('Operator', 'Can perform all actions except delete', NOW(), NOW()),
    ('Viewer', 'Read-only access', NOW(), NOW());

-- Insert default users (passwords are "password" hashed with bcrypt)
INSERT INTO users (username, hashed_password, descript, is_active, role_id, created_at, updated_at)
VALUES 
    ('admin', '$2b$12$9VMotmbIb8CT2LUm7WV6I.d7a4MqgQpnyNXTJ7usK85mht7gEmv9a', 'Admin user', true, 1, NOW(), NOW()),
    ('operator', '$2b$12$JZ1vRVAWEEGm.v0DPDASPOmcBu/nI0.PzFawo4fcEb8tw5pxWu/qi', 'Operator user', true, 2, NOW(), NOW()),
    ('viewer', '$2b$12$30Hk6tXnm6HL3FwCZF2VPeXrBVnbaPDBrJyVtreU/9s3YcHlQY9.2', 'Viewer user', true, 3, NOW(), NOW());

-- address definition
CREATE TABLE address (
    id serial4 NOT NULL,
    line1 varchar NULL,
    line2 varchar NULL,
    line3 varchar NULL,
    postalcode varchar NULL,
    town varchar NULL,
    state varchar NULL,
    country varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT address_pkey PRIMARY KEY (id)
);

-- driving_license definition
CREATE TABLE driving_license (
    id serial4 NOT NULL,
    driving_license_ame varchar NOT NULL,
    descript varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT driving_license_name_key UNIQUE (driving_license_ame),
    CONSTRAINT driving_license_pkey PRIMARY KEY (id)
);

-- employee_function definition
CREATE TABLE employee_function (
    id serial4 NOT NULL,
    "name" varchar NOT NULL,
    descript varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT employee_function_name_key UNIQUE (name),
    CONSTRAINT employee_function_pkey PRIMARY KEY (id)
);

-- employee_status definition
CREATE TABLE employee_status (
    id serial4 NOT NULL,
    "name" varchar NOT NULL,
    descript varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT employee_status_name_key UNIQUE (name),
    CONSTRAINT employee_status_pkey PRIMARY KEY (id)
);

-- insurance definition
CREATE TABLE insurance (
    id serial4 NOT NULL,
    insurance_ref varchar NOT NULL,
    insurance_company varchar,
    descript varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT insurance_number_key UNIQUE (insurance_ref),
    CONSTRAINT insurance_pkey PRIMARY KEY (id)
);

-- orders_status definition
CREATE TABLE orders_status (
    id serial4 NOT NULL,
    orde_status_name varchar NOT NULL,
    descript varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT orders_status_name_key UNIQUE (orde_status_name),
    CONSTRAINT orders_status_pkey PRIMARY KEY (id)
);

-- vehicle_status definition
CREATE TABLE vehicle_status (
    id serial4 NOT NULL,
    vehicle_status_name varchar NOT NULL,
    descript varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT vehicle_status_name_key UNIQUE (vehicle_status_name),
    CONSTRAINT vehicle_status_pkey PRIMARY KEY (id)
);

-- vehicle_type definition
CREATE TABLE vehicle_type (
    id serial4 NOT NULL,
    vehicle_type_name varchar NOT NULL,
    descript varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT vehicle_type_pkey PRIMARY KEY (id),
    CONSTRAINT vehicle_type_type_key UNIQUE (vehicle_type_name)
);

-- customer definition
CREATE TABLE customer (
    id serial4 NOT NULL,
    customer_name varchar NULL,
    address_id int4 NULL,
    customer_type varchar NULL,
    phone_number varchar NULL,
    email varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT customer_name_key UNIQUE (customer_name),
    CONSTRAINT customer_pkey PRIMARY KEY (id),
    CONSTRAINT "customer_addressID_fkey" FOREIGN KEY ("address_id") REFERENCES address(id)
);

-- employees definition
CREATE TABLE employees (
    id serial4 NOT NULL,
    firstname varchar NOT NULL,
    lastname varchar NOT NULL,
    email varchar NOT NULL,
    birth_date date NULL,
    hire_date date NULL,
    function_id int4 NULL,
    status_id int4 NULL,
    line1 varchar NULL,
    line2 varchar NULL,
    line3 varchar NULL,
    postalcode varchar NULL,
    town varchar NULL,
    state varchar NULL,
    country varchar NULL,
    license_id int4 NULL,
    photo_file varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT employees_email_key UNIQUE (email),
    CONSTRAINT employees_pkey PRIMARY KEY (id),
    CONSTRAINT employees_function_id_fkey FOREIGN KEY (function_id) REFERENCES employee_function(id),
    CONSTRAINT employees_license_id_fkey FOREIGN KEY (license_id) REFERENCES driving_license(id),
    CONSTRAINT employees_status_id_fkey FOREIGN KEY (status_id) REFERENCES employee_status(id)
);

-- orders definition
CREATE TABLE orders (
    id serial4 NOT NULL,
    order_name varchar NULL,
    order_number int4 NULL,
    customer_id int4 NULL,
    delivery_address int4 NULL,
    order_date date NULL,
    required_date date NULL,
    delivery_date date NULL,
    status_id int4 NULL,
    weight_kg float8 NULL,
    volume_litre float8 NULL,
    created_at timestamp,
    updated_at timestamp,
    notes text NULL,
    CONSTRAINT orders_name_key UNIQUE (order_name),
    CONSTRAINT orders_number_key UNIQUE (order_number),
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_delivery_address_fkey FOREIGN KEY (delivery_address) REFERENCES address(id),
    CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customer(id),
    CONSTRAINT orders_status_id_fkey FOREIGN KEY (status_id) REFERENCES orders_status(id)
);

-- supplier definition
CREATE TABLE supplier (
    id serial4 NOT NULL,
    supplier_name varchar NULL,
    address_id int4 NULL,
    supplier_type varchar NULL,
    phone_number varchar NULL,
    email varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT supplier_name_key UNIQUE (supplier_name),
    CONSTRAINT supplier_pkey PRIMARY KEY (id),
    CONSTRAINT "supplier_addressID_fkey" FOREIGN KEY (address_id) REFERENCES address(id)
);

-- vehicles definition
CREATE TABLE vehicles (
    id serial4 NOT NULL,
    license_plate varchar NOT NULL,
    make varchar NOT NULL,
    model varchar NOT NULL,
    color varchar NULL,
    type_id int4 NULL,
    status_id int4 NULL,
    insurance_id int4 NULL,
    capacity_kg float8 NULL,
    volume_litre float8 NULL,
    photo_file varchar NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT "vehicles_licensePlate_key" UNIQUE ("license_plate"),
    CONSTRAINT vehicles_pkey PRIMARY KEY (id),
    CONSTRAINT "vehicles_insuranceID_fkey" FOREIGN KEY (insurance_id) REFERENCES insurance(id),
    CONSTRAINT "vehicles_statusID_fkey" FOREIGN KEY (status_id) REFERENCES vehicle_status(id),
    CONSTRAINT "vehicles_typeID_fkey" FOREIGN KEY (type_id) REFERENCES vehicle_type(id)
);

-- warehouse definition
CREATE TABLE warehouse (
    id serial4 NOT NULL,
    warehouse_name varchar NULL,
    address_id int4 NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT warehouse_name_key UNIQUE (warehouse_name),
    CONSTRAINT warehouse_pkey PRIMARY KEY (id),
    CONSTRAINT "warehouse_addressID_fkey" FOREIGN KEY (address_id) REFERENCES address(id)
);

-- vehicle_assign definition
CREATE TABLE vehicle_assign (
    id serial4 NOT NULL,
    employee_id int4 NULL,
    vehicle_id int4 NULL,
    created_at timestamp,
    updated_at timestamp,
    end_date timestamp,
    CONSTRAINT vehicle_assign_pkey PRIMARY KEY (id),
    CONSTRAINT vehicle_assign_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    CONSTRAINT vehicle_assign_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- delivery definition
CREATE TABLE delivery (
    id serial4 NOT NULL,
    delivery_name varchar NULL,
    order_id integer,
    created_at timestamp,
    updated_at timestamp,
    employee_id integer,
    notes text NULL,
    CONSTRAINT delivery_name_key UNIQUE (delivery_name),
    CONSTRAINT delivery_pkey PRIMARY KEY (id),
    CONSTRAINT delivery_address_fkey FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Insert data into driving_license
INSERT INTO "driving_license" ("driving_license_ame", "descript")
VALUES 
  ('A1', 'Permis pour motos légères (125cc max, 11kW)'),
  ('A2', 'Permis pour motos de puissance moyenne (35kW max)'),
  ('B', 'Permis pour voitures particulières (jusqu’à 3,5t)'),
  ('C1', 'Permis pour véhicules de marchandises moyens (3,5t à 7,5t)'),
  ('C2', 'Permis pour véhicules de marchandises spécifiques (variante locale)'),
  ('D', 'Permis pour autobus et transports de passagers'),
  ('F', 'Permis pour tracteurs et véhicules spéciaux');

-- Insert data into employee_function
INSERT INTO "employee_function" ("name", "descript", "created_at")
VALUES 
  ('conducteur', 'Chauffeur responsable de la conduite des véhicules', NOW()),
  ('aide-conducteur', 'Assistant du conducteur pour les tâches de soutien', NOW()),
  ('livreur', 'Personne en charge de la livraison des marchandises', NOW()),
  ('mecanicien', 'Technicien responsable de l’entretien et des réparations', NOW()),
  ('manager', 'Responsable de la gestion d’équipe et des opérations', NOW());

-- Insert data into employee_status
INSERT INTO "employee_status" ("name", "descript")
VALUES 
  ('disponible', 'Employé disponible pour travailler'),
  ('conge', 'Employé en congé ou en vacances'),
  ('en_mission', 'Employé actuellement en mission ou déplacement');

-- Insert data into vehicle_status
INSERT INTO "vehicle_status" ("vehicle_status_name", "descript")
VALUES 
  ('disponible', 'Véhicule disponible pour utilisation'),
  ('maintenance', 'Véhicule en cours de maintenance ou réparation'),
  ('assigne', 'Véhicule est assigne a une mission');

-- Insert data into vehicle_type
INSERT INTO "vehicle_type" ("vehicle_type_name", "descript")
VALUES 
  ('citerne', 'Véhicule conçu pour transporter des liquides ou des gaz'),
  ('conteneur', 'Véhicule pour transporter des conteneurs standards'),
  ('frigo', 'Véhicule réfrigéré pour marchandises périssables'),
  ('semi-remorque', 'Véhicule avec remorque pour gros tonnage'),
  ('fourgon', 'Véhicule fermé pour transport de marchandises'),
  ('utilitaire', 'Véhicule léger pour usages divers'),
  ('benne', 'Véhicule avec benne pour matériaux en vrac');

-- Insert data into orders_status
INSERT INTO "orders_status" ("orde_status_name", "descript")
VALUES 
  ('pendng', 'Command en de traitement'),
  ('confirmed', 'Commande confirmee'),
  ('on_hold', 'Commande boquee'),
  ('cancelled', 'Commande confirmee');