FROM node:lts-alpine
RUN mkdir "/profile"
RUN node "./make.mjs"
EXPOSE 65432
CMD [ "node", "./stealth/stealth.mjs", "serve", "--profile=/profile" ]
