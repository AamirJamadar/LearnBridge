from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
import sqlite3
import database
import os

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app, supports_credentials=True)
app.secret_key = "learnbridge_secret_key_for_session" # In a real app, use a secure random key
app.config.update(SESSION_COOKIE_SAMESITE="None", SESSION_COOKIE_SECURE=True)

# Serve the static SPA index.html
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    return send_from_directory('.', 'index.html')

# API Endpoints
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password') # In production, hash this!
    
    if not username or not email or not password:
        return jsonify({"error": "Missing fields"}), 400
        
    conn = database.get_db_connection()
    try:
        conn.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                     (username, email, password))
        conn.commit()
        user_row = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        
        session['user_id'] = user_row['id']
        session['username'] = user_row['username']
        
        return jsonify({
            "message": "User registered successfully", 
            "user": {"username": username, "email": email}
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username or email already exists"}), 409
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = database.get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ? AND password = ?', 
                        (username, password)).fetchone()
    conn.close()
    
    if user:
        session['user_id'] = user['id']
        session['username'] = user['username']
        return jsonify({
            "message": "Logged in successfully", 
            "user": {"username": user['username'], "email": user['email']}
        }), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/current_user', methods=['GET'])
def current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"user": None}), 200
        
    conn = database.get_db_connection()
    user = conn.execute('SELECT username, email, xp, level FROM users WHERE id = ?', (user_id,)).fetchone()
    badges = conn.execute('SELECT badge_name, badge_icon FROM user_badges WHERE user_id = ?', (user_id,)).fetchall()
    conn.close()
    
    if user:
        user_dict = dict(user)
        user_dict['badges'] = [dict(b) for b in badges]
        return jsonify({"user": user_dict}), 200
    return jsonify({"user": None}), 200

@app.route('/api/badges', methods=['GET'])
def get_badges():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify([]), 200
        
    conn = database.get_db_connection()
    badges = conn.execute('SELECT badge_name, badge_icon, earned_at FROM user_badges WHERE user_id = ?', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(b) for b in badges]), 200

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    conn = database.get_db_connection()
    # Mocking points as XP or total score
    scores = conn.execute('''
        SELECT id, username, xp as points, level 
        FROM users 
        ORDER BY points DESC 
        LIMIT 10
    ''').fetchall()
    
    result = []
    for idx, s in enumerate(scores):
        user_id = s['id']
        badges = conn.execute('SELECT badge_name, badge_icon FROM user_badges WHERE user_id = ?', (user_id,)).fetchall()
        result.append({
            "rank": idx + 1,
            "username": s['username'],
            "points": s['points'],
            "level": s['level'],
            "avatar": "https://via.placeholder.com/80",
            "badges": [{"name": b["badge_name"], "icon": b["badge_icon"]} for b in badges]
        })
    conn.close()
    return jsonify(result), 200

@app.route('/api/quiz_results', methods=['POST'])
def save_quiz_result():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.json
    score = data.get('score', 0)
    quiz_name = data.get('quiz_name', 'General')
    
    conn = database.get_db_connection()
    user_id = session['user_id']
    
    conn.execute('INSERT INTO quiz_scores (user_id, score, quiz_name) VALUES (?, ?, ?)',
                 (user_id, score, quiz_name))
    
    user_row = conn.execute('SELECT xp, level FROM users WHERE id = ?', (user_id,)).fetchone()
    current_xp = user_row['xp']
    current_level = user_row['level']
    
    # Calculate XP and Level
    xp_gained = score * 10
    new_xp = current_xp + xp_gained
    new_level = 1 + (new_xp // 100)
    level_up = new_level > current_level
    
    conn.execute('UPDATE users SET xp = ?, level = ? WHERE id = ?', (new_xp, new_level, user_id))
    
    # Award Badge if passed
    new_badge = None
    if score > 0:
        language_map = {
            'html': {'name': 'HTML Novice', 'icon': 'fab fa-html5'},
            'css': {'name': 'CSS Stylist', 'icon': 'fab fa-css3-alt'},
            'javascript': {'name': 'JS Developer', 'icon': 'fab fa-js'},
            'python': {'name': 'Pythonista', 'icon': 'fab fa-python'},
            'react': {'name': 'React Ranger', 'icon': 'fab fa-react'},
            'java': {'name': 'Java Junkie', 'icon': 'fab fa-java'},
            'sql': {'name': 'Data Diver', 'icon': 'fas fa-database'},
            'environmental': {'name': 'Eco Warrior', 'icon': 'fas fa-leaf'},
            'water': {'name': 'Aqua Expert', 'icon': 'fas fa-water'}
        }
        badge_info = language_map.get(quiz_name, {'name': f'{quiz_name.capitalize()} Explorer', 'icon': 'fas fa-star'})
        
        try:
            conn.execute('INSERT INTO user_badges (user_id, badge_name, badge_icon) VALUES (?, ?, ?)', 
                         (user_id, badge_info['name'], badge_info['icon']))
            new_badge = badge_info
        except sqlite3.IntegrityError:
            pass # Already earned
            
    conn.commit()
    conn.close()
    
    return jsonify({
        "message": "Result saved", 
        "xp_gained": xp_gained,
        "new_xp": new_xp,
        "new_level": new_level,
        "level_up": level_up,
        "new_badge": new_badge
    }), 200

if __name__ == '__main__':
    database.init_db()  # Ensure DB exists
    app.run(debug=False, port=3000, host="0.0.0.0")
