from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

API_KEY = "d5ac6fa71998399205bcd624f92c8438"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/get-weather")
def get_weather():
    city = request.args.get("city")

    if not city:
        return jsonify({"cod": 400, "message": "City required"})

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"

    try:
        res = requests.get(url, timeout=5)
        data = res.json()
        print("WEATHER:", data)
        return jsonify(data)
    except:
        return jsonify({"cod": 500, "message": "Error fetching weather"})


@app.route("/get-forecast")
def get_forecast():
    city = request.args.get("city")

    url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"

    try:
        res = requests.get(url, timeout=5)
        data = res.json()
        print("FORECAST:", data)
        return jsonify(data)
    except:
        return jsonify({"cod": 500, "message": "Error fetching forecast"})


@app.route("/get-suggestions")
def get_suggestions():
    query = request.args.get("q")

    url = f"http://api.openweathermap.org/geo/1.0/direct?q={query}&limit=5&appid={API_KEY}"

    res = requests.get(url)
    return jsonify(res.json())


@app.route("/get-air")
def get_air():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"
    res = requests.get(url)
    return jsonify(res.json())


@app.route("/get-weather-coords")
def get_weather_coords():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"

    try:
        res = requests.get(url, timeout=5)
        data = res.json()
        print("COORDS:", data)
        return jsonify(data)
    except:
        return jsonify({"cod": 500, "message": "Error fetching location"})


if __name__ == "__main__":
    app.run(debug=True)
