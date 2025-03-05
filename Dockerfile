FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm","start"]

# To build an image, use the following command:

#    docker build -t [image name]:[version number / label] .
#    e.g. docker build -t shelf-life:v1.0 .

#To run an image (spin up a container), use the following command:

#    docker run -p local_port:container_port [image name]:[version number / label]
#    e.g. docker run -p 3000:3000 shelf-life:v1.0