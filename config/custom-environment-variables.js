module.exports = {
    "Mongo":
    {
        "ip":"SYS_MONGO_HOST",
        "port":"SYS_MONGO_PORT",
        "dbname":"SYS_MONGO_DB",
        "password":"SYS_MONGO_PASSWORD",
        "user":"SYS_MONGO_USER",
        "replicaset" :"SYS_MONGO_REPLICASETNAME"
    },

    "Services":
    {

        "fileServiceHost": "SYS_FILESERVICE_HOST",
        "fileServicePort": "SYS_FILESERVICE_PORT",
        "fileServiceVersion":"SYS_FILESERVICE_VERSION"

    },


    "Redis":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD"

    },

    "Security":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD"

    },

    "Host":
    {
        "vdomain": "LB_FRONTEND",
        "domain": "HOST_NAME",
        "port": "HOST_CSATSERVICE_PORT",
        "version": "HOST_VERSION"
    },

    "LBServer" : {

        "ip": "LB_FRONTEND",
        "port": "LB_PORT"

    },
    "Token": "HOST_TOKEN"
};

//NODE_CONFIG_DIR
