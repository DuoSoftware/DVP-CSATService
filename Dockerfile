#FROM ubuntu
#RUN apt-get update
#RUN apt-get install -y git nodejs npm
#RUN git clone git://github.com/DuoSoftware/DVP-CSATService.git /usr/local/src/csatservice
#RUN cd /usr/local/src/csatservice; npm install
#CMD ["nodejs", "/usr/local/src/csatservice/app.js"]

#EXPOSE 8807

FROM node:5.10.0
ARG VERSION_TAG
RUN git clone -b $VERSION_TAG https://github.com/DuoSoftware/DVP-CSATService.git /usr/local/src/csatservice
RUN cd /usr/local/src/csatservice;
WORKDIR /usr/local/src/csatservice
RUN npm install
EXPOSE 8885
CMD [ "node", "/usr/local/src/csatservice/app.js" ]
