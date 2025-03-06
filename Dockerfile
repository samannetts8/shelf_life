FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

ENV NEXT_PUBLIC_SUPABASE_URL=https://gycieoggwwxamvofvext.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5Y2llb2dnd3d4YW12b2Z2ZXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjg2NzQsImV4cCI6MjA1Njc0NDY3NH0.1mpooCXxA2SHhoCUW1ycMzzWGGFbnei5pJFokAON6zY

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