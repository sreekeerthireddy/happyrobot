Steps to install

1. with npm

npm install

#create a .env file using .env.sample as reference

npx prisma generate

node prisma/seed.js

(npx prisma studio -> to view db)

npm run start

2. with docker

docker build -t inbound-api .

docker run -p 3000:3000 \
 -e API_KEY="dev-abc123" \
 -e FMCSA_WEBKEY="" \
 -e DATABASE_URL="file:./dev.db" \
 inbound-api

3. commands to test apis

healthz check
curl http://localhost:3000/healthz

mc verification
curl -X POST http://localhost:3000/verify-mc \
 -H "Content-Type: application/json" \
 -H "X-API-Key: dev-abc123" \
 -d '{"mc": "123456"}'

get matching load-details
curl -X POST http://localhost:3000/get-load-details \
 -H "X-API-Key: dev-abc123" \
 -H 'Content-Type: application/json' \
 -d '{
"origin": "Los Angeles, CA",
"destination": "San Diego, CA",
"pickupDatetime": "26 November, 2025 at 9 am",
"equipmentType": "Flatbed"
}'

negotiate
curl -X POST http://localhost:3000/negotiate \
 -H "X-API-Key: dev-abc123" \
 -H "Content-Type: application/json" \
 -d '{
"loadId": "7dbf74c2-d65a-44e5-9171-921df93fc70d",
"mcNumber": "123456",
"proposedRate": 3950
}'

make counter offer using negotiationId generated above
curl -X POST http://localhost:3000/negotiate/counter \
 -H "Content-Type: application/json" \
 -H "X-API-Key: dev-abc123" \
 -d '{
"negotiateId": "negotiation-id",
"proposedRate": 1400,
"accepted": false
}'
