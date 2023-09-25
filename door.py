from pymongo import MongoClient
from gpiozero import Button
import pytz
from time import sleep
from datetime import datetime
uri = "mongodb+srv://alialsadadi:alooi999@sensors.if8yehy.mongodb.net/mydatabase?retryWrites=true&w=majority"

# Create a new client and connect to the server
client = MongoClient(uri)
db = client.door

door_state1 = 2
button = Button(2)
while True:
    if button.is_pressed:
        if door_state1 != 0:
            door_state1 = 0
            try:
                print("close")
                now = datetime.now(pytz.timezone('Asia/Bahrain'))
                db.door.insert_one({'action': 'Close', 'day': now.day, 'month': now.month, 'time': now.strftime("%H:%M:%S")})
            except Exception as e:
                print(e)
    else:
        if door_state1 != 1:
            door_state1 = 1
            try:
                print("open")
                now = datetime.now(pytz.timezone('Asia/Bahrain'))
                db.door.insert_one(
                    {'action': 'Open', 'day': now.day, 'month': now.month, 'time': now.strftime("%H:%M:%S")})
            except Exception as e:
                print(e)
    sleep(1)
