mkdir microblog

https://www.petanikode.com/express-rest-api-ts/

cd microblog

npm init -y

npm install express @prisma/client @types/http-errors

npm install --save-dev typescript ts-node @types/node @types/express prisma nodemon

npm run dev

docker compose up -d

docker ps

npx prisma init

npx prisma migrate dev --name init

