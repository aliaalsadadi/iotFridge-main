from ultralytics import YOLO
import sqlite3

connection = sqlite3.connect("groceries.db")
model = YOLO('best.onnx')
classes = set()

results = model('try.jpg', conf=0.7, task='detect')[0]
for detection in results.boxes.data.tolist():
    x1, y1, x2, y2, score, class_id = detection
    classes.add(int(class_id))

class_ids_str = ', '.join(str(class_id) for class_id in classes)
command = f'SELECT name FROM record WHERE id NOT IN ({class_ids_str})'
crsr = connection.cursor()
crsr.execute(command)
ans = crsr.fetchall()
groceries = []
for grocery in ans:
    groceries.append(grocery[0])
print(groceries)
