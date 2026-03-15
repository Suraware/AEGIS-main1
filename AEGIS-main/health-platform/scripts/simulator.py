import time
import json
import random
from kafka import KafkaProducer

PRODUCER = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

COUNTRIES = ['US', 'GB', 'FR', 'DE', 'IN', 'CN', 'BR', 'ZA']
ALERT_TYPES = ['OUTBREAK', 'CAPACITY_WARNING', 'AIR_QUALITY_ALERT']

def generate_alert():
    return {
        'id': str(random.getrandbits(64)),
        'countryCode': random.choice(COUNTRIES),
        'type': random.choice(ALERT_TYPES),
        'message': f"Simulated {random.choice(ALERT_TYPES)} in {random.choice(COUNTRIES)}",
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    }

if __name__ == "__main__":
    print("Starting Health Alert Simulator...")
    while True:
        alert = generate_alert()
        PRODUCER.send('health-alerts', alert)
        print(f"Sent alert: {alert['message']}")
        time.sleep(5)
