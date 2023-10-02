from ultralytics import YOLO
import glob
import os
model = YOLO("yolov8m.pt")

results = model('try.jpg', conf=0.5, imgsz=256)[0]
for detection in results.boxes.data.tolist():
    x1, y1, x2, y2, score, class_id = detection
    print(int(class_id))
