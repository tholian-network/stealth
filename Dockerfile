FROM node:11-alpine
COPY ./ /browser
RUN mkdir /profile
EXPOSE 65432
ENTRYPOINT ["/browser/bin/stealth.sh"]
CMD ["--profile=/profile"]
