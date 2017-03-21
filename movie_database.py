# -*- coding: utf-8 -*-
from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
import os


app = Flask(__name__)

MONGODB_URI = os.getenv('MONGODB_URI')

# MONGODB_HOST = 'localhost'
# MONGODB_PORT = 27017
DB_NAME = os.getenv('MONGO_DB_NAME')
COLLECTION_NAME = os.getenv('MONGO_COLLECTION_NAME')
FIELDS = {'_id': False,'gross':True, 'budget':True,'title_year':True, 'genres':True, 'movie_title':True, 'imdb_score':True
    }

@app.route('/')
def index():
    return render_template("index.html")

@app.route("/movies/project1")
def movie_project():
  connection = MongoClient(MONGODB_URI)
  collection = connection[DB_NAME][COLLECTION_NAME]
  project1 = collection.find({"title_year": {"$gt": 2005}}, projection=FIELDS)


  json_projects = []
  for project in project1:
      json_projects.append(project)
  json_projects = json.dumps(json_projects, ensure_ascii=False, encoding='utf8')
  connection.close()
  return unicode(json_projects)


if __name__ == '__main__':
    app.run(debug=True)
