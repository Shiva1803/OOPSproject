from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)

# Database setup
def init_db():
    conn = sqlite3.connect('youtube_videos.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS videos(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            time TEXT NOT NULL,
            url TEXT,
            date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect('youtube_videos.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/videos', methods=['GET'])
def get_videos():
    conn = get_db_connection()
    videos = conn.execute('SELECT * FROM videos ORDER BY date_added DESC').fetchall()
    conn.close()
    
    return jsonify([dict(video) for video in videos])

@app.route('/api/videos', methods=['POST'])
def add_video():
    data = request.get_json()
    name = data.get('name')
    time = data.get('time')
    url = data.get('url', '')
    
    if not name or not time:
        return jsonify({'error': 'Name and time are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO videos (name, time, url) VALUES (?, ?, ?)', 
                   (name, time, url))
    video_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'id': video_id, 'message': 'Video added successfully'})

@app.route('/api/videos/<int:video_id>', methods=['PUT'])
def update_video(video_id):
    data = request.get_json()
    name = data.get('name')
    time = data.get('time')
    url = data.get('url', '')
    
    if not name or not time:
        return jsonify({'error': 'Name and time are required'}), 400
    
    conn = get_db_connection()
    conn.execute('UPDATE videos SET name = ?, time = ?, url = ? WHERE id = ?',
                 (name, time, url, video_id))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Video updated successfully'})

@app.route('/api/videos/<int:video_id>', methods=['DELETE'])
def delete_video(video_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM videos WHERE id = ?', (video_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Video deleted successfully'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)