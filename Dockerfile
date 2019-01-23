FROM node:11-alpine
COPY ./ /browser
ENTRYPOINT /browser/bin/stealth.sh
EXPOSE 65432
