# flask-app/app.py
from flask import Flask
from pymongo import MongoClient

app = Flask(__name__)

# MongoDB connection
client = MongoClient('mongodb://mongo:27017/')
db = client['mydatabase']

@app.route('/')
def hello_world():
    return 'Hello from Flask!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
