IoT Fridge

As the name suggests, my project revolve around fridges. This project aims to build a fridge with the following features:
1. Check fridge items on demand
2. generate a grocery list
3. suggest recipes for available resources
4. learn objects using object-recognition algorithims

IoT Fridge uses the YOLO (you only look once) algorithm to both classify items according to user's needs. The model used is the yolov8m.pt and for each new class it is trained for 40 epochs with 10 images for train and 10 for val. Now since the camera is stable it would not create a adequate dataset since all pictures will look the same. In other words, the camera's staticity prevents it from making a diverse dataset which is essential for the accuracy and quality of the machine learning algorithm. The camera used is esp32-CAM with its open-sourced firmware that comes in with its board manager in the arduino IDE. You can find the firmware in the examples of esp32 AI THINKER board called "camera web server".

What are the underlying mechanisms for the learning mode feature?
To begin with, 2 web servers will be hosted. Thanks to the open-sourced cvat docker containers, this project was made possible. The first web server will host the Iot Fridge website, while the second will host cvat via docker. Once that is set up, you can plug and play. To break down the process, the first server will request images from the esp32-CAM via http and allocate them to specific folders. Until the annotations are done, the first webserver will be waitin. When they are done and sent the training proces starts.

by what method is the getting fridge items feature made possible?
Now that we trained our model to recognise 1 or 2 objects we can test it out. A live picture is sent from the esp32-CAM to the Iot Fridge web server where it is processed. Then the output will be returned to the user.

As for the suggest recipes feature. As complex as it sounds, it is quite simple. The Iot Fridge app utilizes the mealsdb API such that when available ingerdients are sent to the API it returns a list of possible dishes.

Moving on to the file structure of the project. 
The project consists of an images folder for train and validation datasets. Similarly, a labels folder contains train and validation subfolders. Now because the langauge used was nodejs with express, a 'public' folder holds most of the styling sheets and some javascript. Regarding the "views" folder, it holds .njk (nunjucks) files. node_modules is a directory created by npm to track each package or dependecy I installed.


app.js:

This file is where all the helpers function are assembled and used to create the nice user interface.

groceries.db:
stores 2 tables: record and groceries. record contains each class and its corresponding id. On the other hand, groceries holds a column for items and its quantity. 

items.db:
This database stores an items table which consists of an id and item name. 

classes.txt:
contains the names of all objects learned until this moment

config.yaml:
a yaml file used in the training procedure for the yolo model where it helps it locate the images and the id for each class.

cvat.py:
creates a task with images in the cvat server then waits for its stage to switch from annotation to acceptance then sends the labels to the IoT Fridge server for training.

get_list.js:
send grocery list via whatsapp. the npm package used for this function is wbm. how it generates the grocery list is quite simple. remeber the record table in groceries.db. We will simply search in the table for the names of ids that are not present in the image.

train.js uses the child_process package to run a python file to resume training the model with the new images.

sql.js:
Frankly speaking, I over complicated this too much. Here rather than searching in the record table for the name of an item whose id is so and so, I used the config.yaml file to get the id equivalent which is the items name. In addition, at the end of each process, the table's data is deleted As its sole purpose is to display current items and if items were to be stacked it would firstly take up space and secondly might show items in the previous take.

update_yaml.js:
The name does not fully represent its function. This file takes user input from the web and uses it to update the config, classes and the record table in groceries.db
resume.py:
does a training session on a new yolov8m.pt with both old and new images to prevent "Catastrophic Forgetting" a phenomenon that occurs when a neural network or machine learning model "forgets", or dramatically reduces its performance on previously learned tasks after learning a new task.

get_items.py:
searches for the newest trained model using time as its reference. Then uses it to infer from the image available items then print their id.




