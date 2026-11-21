FROM node:22.23.4-bookworm-slim@sha256:5ec23b7c622b00547753bc6ffd78085dd868a68aeb41c8e0a1418f033e13d96d AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts
COPY . .
ARG YONOSE_VERSION=0.1.0
ARG YONOSE_COMMIT=dev
RUN sed -i "s/version: '.*'/version: '${YONOSE_VERSION}'/" src/environments/environment.prod.ts \
 && sed -i "s/commitHash: '.*'/commitHash: '${YONOSE_COMMIT}'/" src/environments/environment.prod.ts \
 && npm run build -- --configuration=production

FROM nginx:1.27.4-alpine@sha256:4ff102c5d78d254a6f0da062b3cf39eaf07f01eec0927fd21e219d0af8bc0591
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/front/browser /usr/share/nginx/html
EXPOSE 80
