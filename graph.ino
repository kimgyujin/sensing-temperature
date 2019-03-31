// thingspeak
#include <ESP8266WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define myPeriodic 60 //in sec | Thingspeak pub is 15sec
#define ONE_WIRE_BUS 2  // DS18B20 on arduino pin2 corresponds to D4 on physical board

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature DS18B20(&oneWire);
float prevTemp = 0;
const char* server = "ec2-18-188-64-159.us-east-2.compute.amazonaws.com";
String apiKey ="POOSJO4YDDZZYCMT";
const char* MY_SSID = "HelloWirelessED57"; 
const char* MY_PWD = "1312000664";
int sent = 0;
void setup() {
  Serial.begin(115200);
  connectWifi();
}

void loop() {
  float temp;
  //char buffer[10];
  DS18B20.requestTemperatures(); 
  temp = DS18B20.getTempCByIndex(0);
  //String tempC = dtostrf(temp, 4, 1, buffer);//handled in sendTemp()
  Serial.print(String(sent)+" Temperature: ");
  Serial.println(temp);
  
  //if (temp != prevTemp)
  //{
  //sendTeperatureTS(temp);
  //prevTemp = temp;
  //}


  sendmyserver(temp);
  int count = myPeriodic;
  while(count--)
  {
    delay(1000);
  }
}

void connectWifi()
{
  Serial.print("Connecting to "+*MY_SSID);
  WiFi.begin(MY_SSID, MY_PWD);
  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("Connected");
  Serial.println("");  
}//end connect

void sendmyserver(float temp)
{
   WiFiClient client;
  
   if (client.connect(server, 80)) {
   Serial.println("webserver connected ");

   String url = "/log?";
   url += "value=";
   url += String(temp);
   
   Serial.print("Requesting URL: ");
   Serial.println(url);
  
  // This will send the request to the server
  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + server + "\r\n" + 
               "Connection: close\r\n\r\n");
  unsigned long timeout = millis();
  while (client.available() == 0) {
    if (millis() - timeout > 5000) {
      Serial.println(">>> Client Timeout !");
      client.stop();
      return;
    }
  }
  }
  client.stop();
}
