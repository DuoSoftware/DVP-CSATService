var httpReq = require('request');
var config = require('config');
var util = require('util');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var validator = require('validator');
var fs = require('fs');

var RemoteGetFileMetadata = function(filename, companyId, tenantId, callback)
{
    try
    {
        var securityToken = config.Token;

        securityToken = 'bearer ' + securityToken;

        logger.debug('[DVP-CSATService.RemoteGetFileMetadata] -  Trying to get file meta data from api - Params - filename : %s', filename);

        var fileServiceHost = config.Services.fileServiceHost;
        var fileServicePort = config.Services.fileServicePort;
        var fileServiceVersion = config.Services.fileServiceVersion;
        var compInfo = tenantId + ':' + companyId;

        if(fileServiceHost && fileServicePort && fileServiceVersion)
        {
            var httpUrl = util.format('http://%s/DVP/API/%s/FileService/File/%s/MetaData', fileServiceHost, fileServiceVersion, filename);

            if(validator.isIP(fileServiceHost))
            {
                httpUrl = util.format('http://%s:%s/DVP/API/%s/FileService/File/%s/MetaData', fileServiceHost, fileServicePort, fileServiceVersion, filename);
            }

            var options = {
                url: httpUrl,
                headers: {
                    'authorization': securityToken,
                    'companyinfo': compInfo
                }
            };

            logger.debug('[DVP-CSATService.RemoteGetFileMetadata] - Creating Api Url : %s', httpUrl);


            httpReq(options, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    var apiResp = JSON.parse(body);

                    logger.debug('[DVP-CSATService.RemoteGetFileMetadata] - file service returned : %s', body);

                    callback(apiResp.Exception, apiResp.Result);
                }
                else
                {
                    logger.error('[DVP-CSATService.RemoteGetFileMetadata] - file service call failed', error);
                    callback(error, undefined);
                }
            })
        }
        else
        {
            logger.error('[DVP-CSATService.RemoteGetFileMetadata] - File host, port or version not found');
            callback(new Error('File host, port or version not found'), null)
        }
    }
    catch(ex)
    {
        logger.error('[DVP-CSATService.RemoteGetFileMetadata] - Exception occurred', ex);
        callback(ex, null);
    }
};

var FileUploadReserve = function(filename, companyId, tenantId, callback)
{
    try
    {
        var securityToken = config.Token;

        securityToken = 'bearer ' + securityToken;

        logger.debug('[DVP-CSATService.FileUploadReserve] - Trying to get file meta data from api - Params - filename : %s', filename);

        var fileServiceHost = config.Services.fileServiceHost;
        var fileServicePort = config.Services.fileServicePort;
        var fileServiceVersion = config.Services.fileServiceVersion;
        var compInfo = tenantId + ':' + companyId;

        if(fileServiceHost && fileServicePort && fileServiceVersion)
        {
            var httpUrl = util.format('http://%s/DVP/API/%s/FileService/File/Reserve', fileServiceHost, fileServiceVersion);

            if(validator.isIP(fileServiceHost))
            {
                httpUrl = util.format('http://%s:%s/DVP/API/%s/FileService/File/Reserve', fileServiceHost, fileServicePort, fileServiceVersion);
            }

            var reqBody = {class: 'CDR', fileCategory:'REPORTS', display: filename, filename: filename};

            var bodyJson = JSON.stringify(reqBody);

            httpReq({url:httpUrl, method: 'POST', headers: {'authorization': securityToken, 'companyinfo': compInfo, 'content-type': 'application/json'}, body: bodyJson}, function(error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    var apiResp = JSON.parse(body);

                    logger.debug('[DVP-CSATService.FileUploadReserve] - file service returned : %s', body);

                    callback(apiResp.Exception, apiResp.Result);
                }
                else
                {
                    logger.error('[DVP-CSATService.FileUploadReserve] - file service call failed', error);
                    callback(error, undefined);
                }
            });
        }
        else
        {
            logger.error('[DVP-CSATService.FileUploadReserve] - File host, port or version not found');
            callback(new Error('File host, port or version not found'), undefined)
        }
    }
    catch(ex)
    {
        logger.error('[DVP-CSATService.FileUploadReserve] - Exception occurred', ex);
        callback(ex, undefined);
    }
};

var UploadFile = function(uniqueId, filename, companyId, tenantId, callback)
{
    try
    {
        var securityToken = config.Token;

        securityToken = 'bearer ' + securityToken;

        logger.debug('[DVP-CSATService.UploadFile] - Trying to get file meta data from api - Params - filename : %s', filename);

        var fileServiceHost = config.Services.fileServiceHost;
        var fileServicePort = config.Services.fileServicePort;
        var fileServiceVersion = config.Services.fileServiceVersion;
        var compInfo = tenantId + ':' + companyId;

        if(fileServiceHost && fileServicePort && fileServiceVersion)
        {
            var httpUrl = util.format('http://%s/DVP/API/%s/FileService/File/Upload', fileServiceHost, fileServiceVersion);

            if(validator.isIP(fileServiceHost))
            {
                httpUrl = util.format('http://%s:%s/DVP/API/%s/FileService/File/Upload', fileServiceHost, fileServicePort, fileServiceVersion);
            }


            var formData = {
                class: 'CDR',
                fileCategory:'REPORTS',
                display: filename,
                filename: filename,
                attachments: [
                    fs.createReadStream(filename)
                ]

            };

            if(uniqueId)
            {
                formData.reservedId = uniqueId
            }

            httpReq.post({url:httpUrl, headers: {'authorization': securityToken, 'companyinfo': compInfo}, formData: formData}, function(error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    var apiResp = JSON.parse(body);

                    logger.debug('[DVP-CSATService.UploadFile] - file service returned : %s', body);

                    callback(apiResp.Exception, apiResp.Result);
                }
                else
                {
                    logger.error('[DVP-CSATService.UploadFile] - file service call failed', error);
                    callback(error, undefined);
                }
            });
        }
        else
        {
            logger.error('[DVP-CSATService.UploadFile] - File host, port or version not found');
            callback(new Error('File host, port or version not found'), undefined)
        }
    }
    catch(ex)
    {
        logger.error('[DVP-CSATService.UploadFile] - Exception occurred', ex);
        callback(ex, undefined);
    }
};

var DeleteFile = function(uniqueId, companyId, tenantId, callback)
{
    try
    {
        var securityToken = config.Token;

        securityToken = 'bearer ' + securityToken;

        logger.debug('[DVP-CSATService.DeleteFile] - Trying to get file meta data from api');

        var fileServiceHost = config.Services.fileServiceHost;
        var fileServicePort = config.Services.fileServicePort;
        var fileServiceVersion = config.Services.fileServiceVersion;
        var compInfo = tenantId + ':' + companyId;

        if(fileServiceHost && fileServicePort && fileServiceVersion)
        {
            var httpUrl = util.format('http://%s/DVP/API/%s/FileService/File/%s', fileServiceHost, fileServiceVersion, uniqueId);

            if(validator.isIP(fileServiceHost))
            {
                httpUrl = util.format('http://%s:%s/DVP/API/%s/FileService/File/%s', fileServiceHost, fileServicePort, fileServiceVersion, uniqueId);
            }


            httpReq.del({url:httpUrl, headers: {'authorization': securityToken, 'companyinfo': compInfo}}, function(error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    var apiResp = JSON.parse(body);

                    logger.debug('[DVP-CSATService.DeleteFile] - file service returned : %s', body);

                    callback(apiResp.Exception, apiResp.Result);
                }
                else
                {
                    logger.error('[DVP-CSATService.DeleteFile] - file service call failed', error);
                    callback(error, undefined);
                }
            });
        }
        else
        {
            logger.error('[DVP-CSATService.DeleteFile] - File host, port or version not found');
            callback(new Error('File host, port or version not found'), undefined)
        }
    }
    catch(ex)
    {
        logger.error('[DVP-CSATService.DeleteFile] - Exception occurred', ex);
        callback(ex, undefined);
    }
};

module.exports.RemoteGetFileMetadata = RemoteGetFileMetadata;
module.exports.UploadFile = UploadFile;
module.exports.FileUploadReserve = FileUploadReserve;
module.exports.DeleteFile = DeleteFile;