import pika
import json
import os
import time

RABBIT_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")

def callback(ch, method, properties, body):
    try:
        message = json.loads(body)
        event_type = message.get("event")

        print(f"[Notification Worker] Received event: {event_type}")
        print(f"Payload: {message}")

        # Simulate actions (email/push notification)
        if event_type == "booking.created":
            print("-> Sending booking confirmation notification...")

        elif event_type == "hostel.allocation":
            print("-> Sending hostel allocation notification...")

        elif event_type == "hostel.maintenance":
            print("-> Sending maintenance ticket notification...")

        elif event_type == "request.created":
            print("-> Sending new service request notification...")

        elif event_type == "request.updated":
            print("-> Sending service request status update...")

        print("-> Notification processed.\n")

    except Exception as e:
        print("Error processing event:", e)


def main():
    print("Notification worker starting...")

    while True: 
        try:
            params = pika.URLParameters(RABBIT_URL)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            # Declare queue
            channel.queue_declare(queue="events", durable=True)

            print("[Notification Worker] Listening for events...")

            channel.basic_consume(
                queue="events",
                on_message_callback=callback,
                auto_ack=True
            )

            channel.start_consuming()

        except pika.exceptions.AMQPConnectionError:
            print("[Notification Worker] Lost connection to RabbitMQ. Retrying in 5 sec...")
            time.sleep(5)


if __name__ == "__main__":
    main()
