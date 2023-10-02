from ultralytics import YOLO
import sqlite3
connection = sqlite3.connect("groceries.db")
model = YOLO('best.onnx', task='detect')
classes = []

results = model('try.jpg', conf=0.8)[0]
for detection in results.boxes.data.tolist():
    x1, y1, x2, y2, score, class_id = detection
    classes.append(int(class_id))
items = []
for item in classes:
    command = f'SELECT name FROM record WHERE id={item}'
    crsr = connection.cursor()
    crsr.execute(command)
    ans = crsr.fetchone()
    items.append([ans[0], classes.count(item)])
print(items)
