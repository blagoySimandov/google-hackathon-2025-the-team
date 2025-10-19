#!/bin/bash

API_KEY="AIzaSyCBVdFowSTfEf6sBwevISH6aUdnl7MrtyQ"

LATITUDE="${1:-53.3498}"
LONGITUDE="${2:--6.2603}"

echo "Fetching air quality data for coordinates: $LATITUDE, $LONGITUDE (Dublin, Ireland)"

curl -X POST "https://airquality.googleapis.com/v1/currentConditions:lookup?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"location\": {
      \"latitude\": $LATITUDE,
      \"longitude\": $LONGITUDE
    }
  }" | jq '.'
