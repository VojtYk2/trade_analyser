from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os

app = Flask(__name__)
CORS(app)
load_dotenv()

RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY')

@app.route('/search')
def search():
    text = request.args.get('text')
    response =  requests.get('https://cardmarket-api-tcg.p.rapidapi.com/pokemon/cards/search',
          headers={
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'cardmarket-api-tcg.p.rapidapi.com',
            'Content-Type': 'application/json'
          },
          params={
            'search': text,
            'sort': 'relevance'
          })

    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True)
