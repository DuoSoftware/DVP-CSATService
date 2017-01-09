/**
 * Created by Sukitha on 1/5/2017.
 */


var restify = require('restify');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var config = require('config');
var jwt = require('restify-jwt');
var secret = require('dvp-common/Authentication/Secret.js');
var authorization = require('dvp-common/Authentication/Authorization.js');
var util = require('util');
var port = config.Host.port || 3000;
var host = config.Host.vdomain || 'localhost';
var Ticket = require('dvp-mongomodels/model/Ticket').Ticket;
var mongoose = require('mongoose');
var csat = require('dvp-mongomodels/model/CustomerSatisfaction').CustomerSatisfaction;
var User = require('dvp-mongomodels/model/User');
var externalUser = require('dvp-mongomodels/model/ExternalUser').ExternalUser;


var server = restify.createServer({
    name: "DVP Customer satisfaction Service"
});

server.pre(restify.pre.userAgentConnection());
server.use(restify.bodyParser({ mapParams: false }));

restify.CORS.ALLOW_HEADERS.push('authorization');
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());

server.use(jwt({secret: secret.Secret}));



var mongoip=config.Mongo.ip;
var mongoport=config.Mongo.port;
var mongodb=config.Mongo.dbname;
var mongouser=config.Mongo.user;
var mongopass = config.Mongo.password;



var mongoose = require('mongoose');
var connectionstring = util.format('mongodb://%s:%s@%s:%d/%s',mongouser,mongopass,mongoip,mongoport,mongodb)


mongoose.connection.on('error', function (err) {
    console.error( new Error(err));
});

mongoose.connection.on('disconnected', function() {
    console.error( new Error('Could not connect to database'));
});

mongoose.connection.once('open', function() {
    console.log("Connected to db");
});


mongoose.connect(connectionstring);

server.listen(port, function () {

    logger.info("DVP-CSATService.main Server %s listening at %s", server.name, server.url);
})


server.post('/DVP/API/:version/CustomerSatisfaction/Request',authorization({resource:"csat", action:"write"}), function(req, res, next) {


    logger.info("DVP-CSATService.CreateSatisfactionRequest Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;




    if(req.body && req.body.ticket){


        var requester = req.body.requester;

        Ticket.findOne({
            company: company,
            tenant: tenant,
            active: true,
            _id: req.body.ticket
        }, function (err, ticket) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Fail to Find Ticket", false, undefined);
                res.end(jsonString);
            }
            else {
                if (ticket) {
                    jsonString = messageFormatter.FormatMessage(undefined, "Found Ticket", true, ticket);


                    if(!requester) {
                        if (ticket.assignee) {

                            requester = ticket.assignee;

                        }else if (ticket.submitter) {

                            requester = ticket.submitter;
                        }
                    }


                    var csatx = csat({
                        created_at: Date.now(),
                        updated_at: Date.now(),
                        company: company,
                        tenant: tenant,
                        ticket: ticket._id,
                        method: req.body.method,
                        requester: requester,
                        submitter: ticket.requester,

                    });


                    csatx.save(function (err, csat) {
                        if (err) {
                            jsonString = messageFormatter.FormatMessage(err, "CSAT create failed", false, undefined);
                        }
                        else {
                            jsonString = messageFormatter.FormatMessage(undefined, "CSAT saved successfully", true, csat);


                        }
                        res.end(jsonString);
                    });



                }
                else {
                    jsonString = messageFormatter.FormatMessage(undefined, "Fail To Find Ticket with enough data", false, undefined);
                    res.end(jsonString);
                }
            }


        });

    }else{
        jsonString = messageFormatter.FormatMessage(undefined, "CSAT create failed due to no enough data found", false, undefined);
        res.end(jsonString);
    }





    return next();
});

server.post('/DVP/API/:version/CustomerSatisfaction/Submission',authorization({resource:"csat", action:"write"}), function(req, res, next) {


    logger.info("DVP-CSATService.CreateSatisfactionRequestWithData Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;


    if(req.body && req.body.ticket){


        var requester = req.body.requester;

        Ticket.findOne({
            company: company,
            tenant: tenant,
            active: true,
            _id: req.body.ticket
        }, function (err, ticket) {
            if (err) {

                logger.error("Failed to Find a Ticket", err)

                jsonString = messageFormatter.FormatMessage(err, "Fail to Find Ticket", false, undefined);
                res.end(jsonString);
            }
            else {
                if (ticket) {
                    jsonString = messageFormatter.FormatMessage(undefined, "Found Ticket", true, ticket);


                    if(!requester) {
                        if (ticket.assignee) {

                            requester = ticket.assignee;

                        }else if (ticket.submitter) {

                            requester = ticket.submitter;
                        }
                    }


                    var csatx = csat({
                        created_at: Date.now(),
                        updated_at: Date.now(),
                        company: company,
                        tenant: tenant,
                        ticket: ticket._id,
                        method: req.body.method,
                        requester: requester,
                        submitter: ticket.requester,
                        satisfaction: req.body.satisfaction,
                        comment: req.body.comment

                    });


                    csatx.save(function (err, csat) {
                        if (err) {
                            jsonString = messageFormatter.FormatMessage(err, "CSAT create failed", false, undefined);
                            logger.error("CSAT creation failed", err);
                        }
                        else {
                            jsonString = messageFormatter.FormatMessage(undefined, "CSAT saved successfully", true, csat);
                            logger.info("CSAT submission created successfully");

                        }
                        res.end(jsonString);
                    });



                }
                else {

                    logger.error("No ticket id found in body of the request");
                    jsonString = messageFormatter.FormatMessage(undefined, "Fail To Find Ticket with enough data", false, undefined);
                    res.end(jsonString);
                }
            }


        });

    }else{
        jsonString = messageFormatter.FormatMessage(undefined, "CSAT create failed due to no enough data found", false, undefined);
        res.end(jsonString);
    }

    return next();
});

server.post('/DVP/API/:version/CustomerSatisfaction/Submission/ByEngagement',authorization({resource:"csat", action:"write"}), function(req, res, next) {


    logger.info("DVP-CSATService.CreateSatisfactionRequestWithData Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;


    if(req.body && req.body.engagement){


        var requester = req.body.requester;
        var submitter = req.body.submitter;

        logger.info("Engagement:"+req.body.engagement+" Requester:"+requester + " Submitter:"+submitter);


        Ticket.findOne({
            company: company,
            tenant: tenant,
            active: true,
            engagement_session: req.body.engagement
        }, function (err, ticket) {
            if (err) {

                logger.error("Failed to find ticket", err)
                User.findOne({username: submitter, company: company, tenant: tenant}, function (err, user) {
                    if (err) {

                        var csatx = csat({
                            created_at: Date.now(),
                            updated_at: Date.now(),
                            company: company,
                            tenant: tenant,
                            method: req.body.method,
                            requester: requester,
                            submitter: submitter,
                            satisfaction: req.body.satisfaction,
                            comment: req.body.comment

                        });


                        csatx.save(function (err, csat) {
                            if (err) {
                                jsonString = messageFormatter.FormatMessage(err, "CSAT create failed", false, undefined);
                                logger.error("CSAT submission failed", err);
                            }
                            else {
                                jsonString = messageFormatter.FormatMessage(undefined, "CSAT saved successfully", true, csat);
                                logger.info("CSAT submission created successfully");


                            }
                            res.end(jsonString);
                        });

                    }
                    else {
                        if (user) {

                            var csatx = csat({
                                created_at: Date.now(),
                                updated_at: Date.now(),
                                company: company,
                                tenant: tenant,
                                method: req.body.method,
                                requester: requester,
                                submitter: user._id,
                                satisfaction: req.body.satisfaction,
                                comment: req.body.comment

                            });


                            csatx.save(function (err, csat) {
                                if (err) {

                                    logger.error("CSAT submission failed", err);
                                    jsonString = messageFormatter.FormatMessage(err, "CSAT create failed", false, undefined);
                                }
                                else {
                                    jsonString = messageFormatter.FormatMessage(undefined, "CSAT saved successfully", true, csat);
                                    logger.info("CSAT submission created successfully");


                                }
                                res.end(jsonString);
                            });


                        }
                        else {
                            var csatx = csat({
                                created_at: Date.now(),
                                updated_at: Date.now(),
                                company: company,
                                tenant: tenant,
                                method: req.body.method,
                                requester: requester,
                                submitter: submitter,
                                satisfaction: req.body.satisfaction,
                                comment: req.body.comment

                            });


                            csatx.save(function (err, csat) {
                                if (err) {
                                    logger.error("CSAT submission failed", err);
                                    jsonString = messageFormatter.FormatMessage(err, "CSAT create failed", false, undefined);
                                }
                                else {
                                    jsonString = messageFormatter.FormatMessage(undefined, "CSAT saved successfully", true, csat);
                                    logger.info("CSAT submission created successfully");


                                }
                                res.end(jsonString);
                            });
                        }
                    }
                });
            }
            else {
                if (ticket) {
                    jsonString = messageFormatter.FormatMessage(undefined, "Found Ticket", true, ticket);

                    if(!requester) {
                        if (ticket.assignee) {

                            requester = ticket.assignee;

                        }else if (ticket.submitter) {

                            requester = ticket.submitter;
                        }
                    }

                    var csatx = csat({
                        created_at: Date.now(),
                        updated_at: Date.now(),
                        company: company,
                        tenant: tenant,
                        ticket: ticket._id,
                        method: req.body.method,
                        requester: requester,
                        submitter: ticket.requester,
                        satisfaction: req.body.satisfaction,
                        comment: req.body.comment

                    });

                    csatx.save(function (err, csat) {
                        if (err) {
                            logger.error("CSAT submission failed", err);
                            jsonString = messageFormatter.FormatMessage(err, "CSAT create failed", false, undefined);
                        }
                        else {
                            jsonString = messageFormatter.FormatMessage(undefined, "CSAT saved successfully", true, csat);
                            logger.info("CSAT submission created successfully");


                        }
                        res.end(jsonString);
                    });

                }
                else {

                    User.findOne({username: submitter, company: company, tenant: tenant}, function (err, user) {
                        if (err) {

                            var csatx = csat({
                                created_at: Date.now(),
                                updated_at: Date.now(),
                                company: company,
                                tenant: tenant,
                                method: req.body.method,
                                requester: requester,
                                submitter: submitter,
                                satisfaction: req.body.satisfaction,
                                comment: req.body.comment

                            });


                            csatx.save(function (err, csat) {
                                if (err) {
                                    jsonString = messageFormatter.FormatMessage(err, "CSAT create failed", false, undefined);
                                    logger.error("CSAT submission failed", err);
                                }
                                else {
                                    jsonString = messageFormatter.FormatMessage(undefined, "CSAT saved successfully", true, csat);
                                    logger.info("CSAT submission created successfully");


                                }
                                res.end(jsonString);
                            });

                        }
                        else {
                            if (user) {

                                var csatx = csat({
                                    created_at: Date.now(),
                                    updated_at: Date.now(),
                                    company: company,
                                    tenant: tenant,
                                    method: req.body.method,
                                    requester: requester,
                                    submitter: user._id,
                                    satisfaction: req.body.satisfaction,
                                    comment: req.body.comment

                                });


                                csatx.save(function (err, csat) {
                                    if (err) {

                                        logger.error("CSAT submission failed", err);
                                        jsonString = messageFormatter.FormatMessage(err, "CSAT create failed", false, undefined);
                                    }
                                    else {
                                        jsonString = messageFormatter.FormatMessage(undefined, "CSAT saved successfully", true, csat);
                                        logger.info("CSAT submission created successfully");


                                    }
                                    res.end(jsonString);
                                });


                            }
                            else {
                                var csatx = csat({
                                    created_at: Date.now(),
                                    updated_at: Date.now(),
                                    company: company,
                                    tenant: tenant,
                                    method: req.body.method,
                                    requester: requester,
                                    submitter: submitter,
                                    satisfaction: req.body.satisfaction,
                                    comment: req.body.comment

                                });


                                csatx.save(function (err, csat) {
                                    if (err) {
                                        logger.error("CSAT submission failed", err);
                                        jsonString = messageFormatter.FormatMessage(err, "CSAT create failed", false, undefined);
                                    }
                                    else {
                                        jsonString = messageFormatter.FormatMessage(undefined, "CSAT saved successfully", true, csat);
                                        logger.info("CSAT submission created successfully");


                                    }
                                    res.end(jsonString);
                                });
                            }
                        }
                    });
                }
            }
        });

    }else{
        jsonString = messageFormatter.FormatMessage(undefined, "CSAT create failed due to no enough data found", false, undefined);
        res.end(jsonString);
    }

    return next();
});

server.get('/DVP/API/:version/CustomerSatisfaction/Request/:id',authorization({resource:"csat", action:"read"}), function(req, res, next) {


    logger.info("DVP-CSATService.GetSatisfactionRequest Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;


    csat.findOne({
        company: company,
        tenant: tenant,
        _id: req.params.id
    }).populate('requester', 'username').populate('submitter', 'name').populate('ticket', 'reference').exec(function (err, csat) {
        if (err) {
            jsonString = messageFormatter.FormatMessage(err, "Fail to Find CSAT", false, undefined);
        }
        else {
            if (csat) {
                jsonString = messageFormatter.FormatMessage(undefined, "CSAT Found", true, csat);
            }
            else {
                jsonString = messageFormatter.FormatMessage(undefined, "Fail To Find CSAT", false, undefined);
            }
        }
        res.end(jsonString);
    });

    return next();
});

server.get('/DVP/API/:version/CustomerSatisfactions/Request/:Page/:Size',authorization({resource:"csat", action:"read"}), function(req, res, next) {


    logger.info("DVP-CSATService.GetSatisfactionRequest Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;

    var page = parseInt(req.params.Page),
        size = parseInt(req.params.Size),
        skip = page > 0 ? ((page - 1) * size) : 0;


    var queryObject = {
        company: company,
        tenant: tenant
    };

    if(req.query['start'] && req.params['end']) {


        queryObject.created_at =
        {
            "$gte": req.query['start'], "$lt": req.params['end']
        }

    }

    if(req.query['requester']) {

        queryObject.requester = mongoose.Types.ObjectId(req.query['requester']);
    }

    if(req.query['submitter']) {

        queryObject.submitter = mongoose.Types.ObjectId(req.query['submitter']);
    }


    if(req.query['satisfaction']) {

        queryObject.satisfaction = req.query['satisfaction'];
    }



    csat.find(queryObject).populate('requester', 'username').populate('submitter', 'name').populate('ticket', 'reference').skip(skip)
        .limit(size).sort({created_at: -1}).exec(function (err, csat) {
        if (err) {
            jsonString = messageFormatter.FormatMessage(err, "Fail to Find CSAT", false, undefined);
        }
        else {
            if (csat) {
                jsonString = messageFormatter.FormatMessage(undefined, "CSAT Found", true, csat);
            }
            else {
                jsonString = messageFormatter.FormatMessage(undefined, "Fail To Find CSAT", false, undefined);
            }
        }
        res.end(jsonString);
    });

    return next();
});

server.put('/DVP/API/:version/CustomerSatisfaction/Request/:id/Satisfaction',authorization({resource:"csat", action:"read"}), function(req, res, next) {


    logger.info("DVP-CSATService.UpdateSatisfactionRequest Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;


    csat.findOneAndUpdate({
        company: company,
        tenant: tenant,
        satisfaction: 'offered',
        _id: req.params.id
    }, {
        satisfaction: req.body.satisfaction,
        comment: req.body.comment,
        updated_at: Date.now()
    }, function (err, csat) {
        if (err) {
            jsonString = messageFormatter.FormatMessage(err, "Fail to Find CSAT", false, undefined);
        }
        else {
            if (csat) {
                jsonString = messageFormatter.FormatMessage(undefined, "CSAT Found", true, csat);
            }
            else {
                jsonString = messageFormatter.FormatMessage(undefined, "Fail To Find CSAT", false, undefined);
            }
        }
        res.end(jsonString);
    });

    return next();
});

server.get('/DVP/API/:version/CustomerSatisfactions/Report',authorization({resource:"csat", action:"read"}), function(req, res, next) {


    logger.info("DVP-CSATService.GetSatisfactionRequest Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;

    var page = parseInt(req.params.Page),
        size = parseInt(req.params.Size),
        skip = page > 0 ? ((page - 1) * size) : 0;


    var queryObject = {
        company: company,
        tenant: tenant
    };

    if (req.query['start'] && req.params['end']) {


        queryObject.created_at =
        {
            "$gte": req.query['start'], "$lt": req.params['end']
        }

    }

    if (req.query['requester']) {

        queryObject.requester = mongoose.Types.ObjectId(req.query['requester']);
    }

    if (req.query['submitter']) {

        queryObject.submitter = mongoose.Types.ObjectId(req.query['submitter']);
    }

    /*
     if(req.query['satisfaction']) {

     queryObject.satisfaction = req.query['satisfaction'];
     }
     */

    var aggregator = [{
            $match: queryObject
        },{
            $group: {
                _id: "$satisfaction",
                satisfactions: {$sum: 1}
            }
        }
    ];


    csat.aggregate(aggregator, function (err, csat) {
        if (err) {
            jsonString = messageFormatter.FormatMessage(err, "Fail to Find CSAT", false, undefined);
        }
        else {
            if (csat) {
                jsonString = messageFormatter.FormatMessage(undefined, "CSAT Found", true, csat);
            }
            else {
                jsonString = messageFormatter.FormatMessage(undefined, "Fail To Find CSAT", false, undefined);
            }
        }
        res.end(jsonString);
    });

    return next();
});

server.get('/DVP/API/:version/CustomerSatisfactions/Count',authorization({resource:"csat", action:"read"}), function(req, res, next) {


    logger.info("DVP-CSATService.GetSatisfactionRequest Internal method ");

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;

    var page = parseInt(req.params.Page),
        size = parseInt(req.params.Size),
        skip = page > 0 ? ((page - 1) * size) : 0;


    var queryObject = {
        company: company,
        tenant: tenant
    };

    if(req.query['start'] && req.params['end']) {

        queryObject.created_at =
        {
            "$gte": req.query['start'], "$lt": req.params['end']
        }
    }

    if(req.query['requester']) {

        queryObject.requester = mongoose.Types.ObjectId(req.query['requester']);
    }

    if(req.query['submitter']) {

        queryObject.submitter = mongoose.Types.ObjectId(req.query['submitter']);
    }


    if(req.query['satisfaction']) {

        queryObject.satisfaction = req.query['satisfaction'];
    }


    csat.count(queryObject,function (err, csat) {
        if (err) {

            jsonString = messageFormatter.FormatMessage(err, "Fail to Find CSAT", false, undefined);
        }
        else {

            jsonString = messageFormatter.FormatMessage(undefined, "CSAT Count found", true, csat);
        }
        res.end(jsonString);
    });

    return next();
});










