from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import configparser
import os
from dotenv import load_dotenv

load_dotenv()

# Read database configuration from database.ini
config = configparser.ConfigParser()
config.read("app/database/database.ini")
db_config = config["postgresql"]

# Construct DATABASE_URL if not using .env
DATABASE_URL = os.getenv("DATABASE_URL", f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()