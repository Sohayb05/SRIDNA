from flask import Flask, request, redirect, send_from_directory, url_for, jsonify, session
from init_db import create_tables, create_user, authenticate, create_invoice, list_invoices
import os


APP_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
app.secret_key = "dev-secret-change-me"
create_tables()


# ---------- Static pages ----------
@app.get('/')
def root():
    return send_from_directory(APP_DIR, 'login.html')


@app.get('/login')
def login_page():
    return send_from_directory(APP_DIR, 'login.html')


@app.get('/register')
def register_page():
    return send_from_directory(APP_DIR, 'register.html')


@app.get('/facture')
def facture_page():
    return send_from_directory(APP_DIR, 'facture.html')


# ---------- Static assets ----------
@app.get('/login.css')
def login_css():
    return send_from_directory(APP_DIR, 'login.css')


@app.get('/register.css')
def register_css():
    return send_from_directory(APP_DIR, 'register.css')


@app.get('/facture.css')
def facture_css():
    return send_from_directory(APP_DIR, 'facture.css')


@app.get('/facture.js')
def facture_js():
    return send_from_directory(APP_DIR, 'facture.js')


# ---------- Auth & Register ----------
@app.post('/login')
def do_login():
    email = request.form.get('email', '')
    password = request.form.get('password', '')
    user = authenticate(email, password)
    if user:
        session['user_id'] = user[0]
        session['user_name'] = f"{user[1]} {user[2]}"
        session['email'] = email
        return redirect(url_for('facture_page'))
    # Simple fallback: redirect back to login on failure
    return redirect(url_for('login_page'))


@app.post('/register')
def do_register():
    first_name = request.form.get('firstName', '')
    last_name = request.form.get('lastName', '')
    email = request.form.get('email', '')
    phone = request.form.get('phone', '')
    password = request.form.get('password', '')

    user_id = create_user(first_name, last_name, email, phone, password)
    if user_id:
        return redirect(url_for('login_page'))
    return redirect(url_for('register_page'))


# ---------- Invoices API ----------
@app.post('/invoice')
def add_invoice():
    user_id = request.form.get('user_id') or session.get('user_id')
    invoice_number = request.form.get('invoice_number')
    invoice_date = request.form.get('invoice_date')
    due_date = request.form.get('due_date')
    subtotal = request.form.get('subtotal')
    tax = request.form.get('tax')
    total = request.form.get('total')
    status = request.form.get('status', 'DRAFT')

    if not all([user_id, invoice_number, invoice_date, due_date, subtotal, tax, total]):
        return jsonify({"ok": False, "error": "missing fields"}), 400

    inv_id = create_invoice(
        int(user_id),
        invoice_number,
        invoice_date,
        due_date,
        float(subtotal),
        float(tax),
        float(total),
        status
    )
    if inv_id:
        return jsonify({"ok": True, "invoice_id": inv_id})
    return jsonify({"ok": False}), 500


@app.get('/invoices')
def get_invoices():
    user_id = request.args.get('user_id') or session.get('user_id')
    if not user_id:
        return jsonify({"ok": False, "error": "user_id required"}), 400
    rows = list_invoices(int(user_id))
    data = [
        {
            "invoice_number": r[0],
            "invoice_date": str(r[1]),
            "due_date": str(r[2]),
            "subtotal": float(r[3]),
            "tax": float(r[4]),
            "total": float(r[5]),
            "status": r[6],
        }
        for r in rows
    ]
    return jsonify({"ok": True, "invoices": data})


# ---------- Current user ----------
@app.get('/me')
def me():
    if 'user_id' not in session:
        return jsonify({"ok": False}), 401
    return jsonify({
        "ok": True,
        "user_id": session['user_id'],
        "name": session.get('user_name', ''),
        "email": session.get('email', ''),
    })

if __name__ == '__main__':
    # Run: python3 app.py  (server reachable on your LAN)
    app.run(host='0.0.0.0', port=5001, debug=True)


