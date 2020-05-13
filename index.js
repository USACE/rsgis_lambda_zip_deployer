var AWS = require('aws-sdk');
var lambda = new AWS.Lambda();

const zipMap = {
    "corpsmap-instrumentation-api.zip": "corpsmap-instrumentation-api",
    "corpsmap-cumulus-api.zip": "corpsmap-cumulus-api",
}

// Return lambda function name for a given zipfile name
const functionName = (zipName) => zipMap[zipName]

exports.handler = function(event, context) {
    const key = event.Records[0].s3.object.key
    const bucket = event.Records[0].s3.bucket.name
    console.log(`Create Event Detected in Bucket: ${bucket}; Key ${key}`)

    if (bucket == "corpsmap-lambda-zips" && zipMap.hasOwnProperty(key)) {
        const fn = functionName(key);
        console.log(`Update Code for Lambda Function: ${fn}`);
        
        const params = {
            FunctionName: fn,
            S3Key: key,
            S3Bucket: bucket,
        };
        
        // Update function code
        lambda.updateFunctionCode(params, function(err, data) {
            if (err) {
                console.log(`FAIL; Update Code for Lambda Function: ${fn}`);
                console.log(err)
            } else {
                console.log(`SUCCESS; Update Code for Lambda Function: ${fn}`);
            }
        });
    } else {
        context.succeed(`skipping zip ${key} in bucket ${bucket}`);
    }
};
