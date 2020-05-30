FROM node:14-alpine
RUN mkdir "/profile"
RUN node "./make.mjs"
EXPOSE 65432
CMD [ "node", "./stealth/stealth.mjs", "--profile=/profile" ]
