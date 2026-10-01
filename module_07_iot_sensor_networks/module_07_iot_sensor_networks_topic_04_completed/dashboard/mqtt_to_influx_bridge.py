import os, json
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point, WritePrecision

BROKER=os.getenv('MQTT_BROKER','test.mosquitto.org'); PORT=int(os.getenv('MQTT_PORT','1883'))
INFLUX_URL=os.environ['INFLUX_URL']; INFLUX_TOKEN=os.environ['INFLUX_TOKEN']; INFLUX_ORG=os.environ['INFLUX_ORG']; INFLUX_BUCKET=os.getenv('INFLUX_BUCKET','digihaz_sensors')
client_db=InfluxDBClient(url=INFLUX_URL,token=INFLUX_TOKEN,org=INFLUX_ORG); writer=client_db.write_api()

def on_connect(client,userdata,flags,rc,*args):
    print('MQTT connected rc=',rc); client.subscribe('digihaz/+/all')

def on_message(client,userdata,msg):
    try:
        d=json.loads(msg.payload.decode('utf-8')); site=d.get('site',msg.topic.split('/')[1])
        p=Point('sensors').tag('site',site)
        for k in ('tilt_deg','press_hpa','soil_pct'):
            if k in d: p=p.field(k,float(d[k]))
        if 'alert' in d: p=p.field('alert',str(d['alert']))
        writer.write(bucket=INFLUX_BUCKET,org=INFLUX_ORG,record=p)
        print(site,'→ InfluxDB ✓')
    except Exception as e: print('bridge error:',e)

m=mqtt.Client(); m.on_connect=on_connect; m.on_message=on_message; m.connect(BROKER,PORT,60); m.loop_forever()
