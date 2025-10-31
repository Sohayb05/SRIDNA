from typing import Optional, Tuple, List
import mysql.connector
from mysql.connector import Error

SRIDNA = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'Sohayb2005.',
    'database': 'SRIDNA'
}


def get_connection():
    return mysql.connector.connect(
        host=SRIDNA['host'],
        user=SRIDNA['user'],
        password=SRIDNA['password'],
        database=SRIDNA['database']
    )


USERS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
"""


INVOICES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
) ENGINE=InnoDB;
"""


def create_tables() -> None:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(USERS_TABLE_SQL)
        cursor.execute(INVOICES_TABLE_SQL)
        conn.commit()
        print("Tables 'users' and 'invoices' are ready.")
    except Error as e:
        print(f"Failed to create tables: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


def create_user(first_name: str, last_name: str, email: str, phone: str, password: str) -> Optional[int]:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (first_name, last_name, email, phone, password)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (first_name, last_name, email, phone, password),
        )
        conn.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"Failed to create user: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


def authenticate(email: str, password: str) -> Optional[Tuple[int, str, str]]:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, first_name, last_name
            FROM users
            WHERE email = %s AND password = %s
            """,
            (email, password),
        )
        row = cursor.fetchone()
        if row:
            return row  # (id, first_name, last_name)
        return None
    except Error as e:
        print(f"Login failed: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


def create_invoice(user_id: int, invoice_number: str, invoice_date: str, due_date: str,
                   subtotal: float, tax: float, total: float, status: str = 'DRAFT') -> Optional[int]:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO invoices (invoice_number, user_id, invoice_date, due_date, subtotal, tax, total, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (invoice_number, user_id, invoice_date, due_date, subtotal, tax, total, status),
        )
        conn.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"Failed to create invoice: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


def list_invoices(user_id: int) -> List[Tuple]:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT invoice_number, invoice_date, due_date, subtotal, tax, total, status
            FROM invoices
            WHERE user_id = %s
            ORDER BY invoice_date DESC
            """,
            (user_id,),
        )
        return cursor.fetchall()
    except Error as e:
        print(f"Failed to list invoices: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


if __name__ == "__main__":
    # 1) Create tables
    create_tables()

    # 2) Example usage (uncomment to try):
    # user_id = create_user("Jean", "Dupont", "jean.dupont@example.com", "+33123456789", "monMot2Passe!")
    # print("new user id:", user_id)
    # print("auth:", authenticate("jean.dupont@example.com", "monMot2Passe!"))
    # inv_id = create_invoice(user_id, "INV-2025-001", "2025-10-31", "2025-11-30", 5000.00, 1000.00, 6000.00, "SENT")
    # print("new invoice id:", inv_id)
    # print("invoices:", list_invoices(user_id))


