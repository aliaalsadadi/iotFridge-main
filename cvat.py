from http import HTTPStatus
from zipfile import ZipFile
from cvat_sdk.api_client import Configuration, ApiClient, models, exceptions
from time import sleep
import os
classes = []
labels = []
with open("classes.txt", 'rb') as file:
    classes = file.readlines()
for label in classes:
    labels.append({"name": label.decode().strip('\n')})
print(labels)
images = []
for file in os.listdir("images/train"):
    images.append(os.path.join('images/train/', file))

configuration = Configuration(
    host="http://localhost:8080/",
    username='ali',
    password='alooi999',
)
client_files = []
for img in images:
    client_files.append(open(img, 'rb'))
with ApiClient(configuration) as api_client:
    task_spec = models.TaskWriteRequest(name="train", labels=labels)
    try:
        (task, response) = api_client.tasks_api.create(task_spec)
    except exceptions.ApiException as e:
        print("Exception when trying to create a task: %s\n" % e)
    task_data = models.DataRequest(
        image_quality=70,
        client_files=client_files
    )
    (_, response) = api_client.tasks_api.create_data(task.id,
                                                     data_request=task_data,
                                                     _content_type="multipart/form-data",
                                                     _check_status=False, _parse_response=False
                                                     )
    (data, response) = api_client.jobs_api.list()
    stage = "annotation"
    for result in data.results:
        if result.task_id == task.id:
            print(result.stage)
            stage = result.stage
    while stage != "acceptance":
        with ApiClient(configuration) as api_client:
            (data, response) = api_client.jobs_api.list()
            for result in data.results:
                if result.task_id == task.id:
                    stage = result.stage
            print(stage)
            sleep(2)
            # Export a task as a dataset
    while True:
        (_, response) = api_client.tasks_api.retrieve_dataset(
            id=task.id,
            format='YOLO 1.1',
            _parse_response=False,
        )
        if response.status == HTTPStatus.CREATED:
            break

        sleep(1)
    (_, response) = api_client.tasks_api.retrieve_dataset(
        id=task.id,
        format='YOLO 1.1',
        action="download",
        _parse_response=False,
    )
    # Save the resulting file
    with open('output_file.zip', 'wb') as output_file:
        output_file.write(response.data)

    try:
        api_client.jobs_api.destroy(
            task.id, )
    except exceptions.ApiException as e:
        print("Exception when calling JobsApi.destroy(): %s\n" % e)
    try:
        api_client.tasks_api.destroy(
            task.id,)
    except exceptions.ApiException as e:
        print("Exception when calling TasksApi.destroy(): %s\n" % e)
with ZipFile('output_file.zip', 'r') as zip:
    zip.extractall()
    for file in os.listdir("obj_train_data"):
        if file.endswith(".txt"):
            with open(f"obj_train_data/{file}", 'r') as file_data:
                with open("labels/train/" + file, 'w') as f_train:
                    f_train.write(file_data.read())
                with open("labels/val/" + file, 'w') as f_val:
                    f_val.write(file_data.read())
        os.remove("obj_train_data/" + file)
    os.remove("obj.data")
    os.remove("obj.names")
    os.rmdir("obj_train_data")
    os.remove("train.txt")
os.remove("output_file.zip")
