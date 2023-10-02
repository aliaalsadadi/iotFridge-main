from ultralytics import YOLO
model = YOLO('best.onnx')
results = model('try.jpg', conf=0.7, task='detect')[0]
for detection in results.boxes.data.tolist():
    x1, y1, x2, y2, score, class_id = detection
    print(int(class_id))
