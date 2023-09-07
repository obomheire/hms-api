ARG IMAGE=node:16.13-alpine

#COMMON
FROM $IMAGE as builder
WORKDIR /app
COPY . .
RUN npm i

#DEVELOPMENT
FROM builder as dev 
CMD ["node", "dist/main.js" ]

#PROD MIDDLE STEP
FROM builder as prod-build
RUN npm run build
RUN npm prune --production

#PROD
FROM $IMAGE as prod
COPY --chown=node:node --from=prod-build /app/dist /app/dist
COPY --chown=node:node --from=prod-build /app/node_modules /app/node_modules
COPY --chown=node:node --from=prod-build /app/.env /app/dist/.env

ENV NODE_ENV=production
ENTRYPOINT ["node", "./main.js"]
WORKDIR /app/dist
CMD ["node", "dist/main.js" ]

USER node

# Use this command to build the app for production
# - docker build --target prod -t hms-backend:latest .

# Use this command to run the app in production
# - docker run --name=hms_api_prod -p 5000:5000 -it hms-backend
