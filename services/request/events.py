import pika
import json
import os

RABBIT_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")

def publish_event(event: dict):
    params = pika.URLParameters(RABBIT_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue='events', durable=True)

    channel.basic_publish(
        exchange='',
        routing_key='events',
        body=json.dumps(event),
        properties=pika.BasicProperties(delivery_mode=2)
    )

    connection.close()
