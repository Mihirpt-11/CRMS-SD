FROM node:18-alpine AS build

WORKDIR /app


ENV NPM_CONFIG_FETCH_TIMEOUT=300000
ENV NPM_CONFIG_FETCH_RETRIES=5


COPY package.json ./


RUN npm install --legacy-peer-deps --no-audit --progress=false


COPY . .


RUN npm run build


FROM nginx:alpine


COPY --from=build /app/dist /usr/share/nginx/html


COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

