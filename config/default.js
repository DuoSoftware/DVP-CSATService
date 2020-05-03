module.exports = {


    "Mongo":
    {
        "ip":"",
        "port":"27017",
        "dbname":"",
        "password":"",
        "user":"",
        "type": "mongodb+srv"
    },

    "Services":
    {

        "fileServiceHost": "",
        "fileServicePort": 5645,
        "fileServiceVersion":"1.0.0.0"

    },

  "Redis":
  {
    "mode":"instance",//instance, cluster, sentinel
    "ip": "",
    "port": 6389,
    "user": "",
    "password": "",
    "sentinels":{
      "hosts": "",
      "port":16389,
      "name":"redis-cluster"
    }

  },

  "Security":
  {

    "ip" : "",
    "port": 6389,
    "user": "",
    "password": "",
    "mode":"instance",//instance, cluster, sentinel
    "sentinels":{
      "hosts": "",
      "port":16389,
      "name":"redis-cluster"
    }
  },

    "Host":
    {
        "vdomain": "localhost",
        "domain": "localhost",
        "port": "4445",
        "version": "1.0.0.0"
    },

    "LBServer" : {

        "ip": "localhost",
        "port": "4445"

    },
    "Token":""
};
