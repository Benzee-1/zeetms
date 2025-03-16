# ZeeTMS/backend/app/config.py
import configparser

def config(filename='database.ini', section='postgresql'):
    parser = configparser.ConfigParser()
    parser.read(filename)
    db = {}
    if section in parser:
        for key in parser[section]:
            db[key] = parser[section][key]
    else:
        raise Exception(f'Section {section} not found in {filename}')
    return db