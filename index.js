var AWS = require("aws-sdk");
var lambda = new AWS.Lambda();

// A map of zip files to their associated Lambda Functions
// Used to update Lambda Function Code
const fnCodeMap = {
  "corpsmap-instrumentation-api.zip": "corpsmap-instrumentation-api",
  "corpsmap-cumulus-api.zip": "corpsmap-cumulus-api",
};

// A map of zip files to their associated Lambda Layers
// Used to Create Lamda Layer Versions
const layerMap = {
  "corpsmap-cumulus-geolambda-base.zip": {
    LayerName: "corpsmap-cumulus-geolambda-base",
    CompatibleRuntimes: ["python3.7"],
  },
  "corpsmap-cumulus-geolambda-python.zip": {
    LayerName: "corpsmap-cumulus-geolambda-python",
    CompatibleRuntimes: ["python3.7"],
  },
};

// Publish Lambda Layer
const publishLayer = ({ S3Key, S3Bucket, LayerName, CompatibleRuntimes }) => {
  const params = {
    Content: {
      S3Bucket: S3Bucket,
      S3Key: S3Key,
    },
    CompatibleRuntimes: CompatibleRuntimes,
    LayerName: LayerName,
  };

  lambda.publishLayerVersion(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log(data);
  });
};

// Update Lambda Function Code
const updateFunctionCode = ({ FunctionName, S3Key, S3Bucket }) => {
  const params = {
    FunctionName: FunctionName,
    S3Key: S3Key,
    S3Bucket: S3Bucket,
  };

  lambda.updateFunctionCode(params, function (err, data) {
    if (err) {
      console.log(`FAIL; Update Code for Lambda Function: ${fn}`);
      console.log(err);
    } else {
      console.log(`SUCCESS; Update Code for Lambda Function: ${fn}`);
    }
  });
};

exports.handler = function (event, context) {
  const key = event.Records[0].s3.object.key;
  const bucket = event.Records[0].s3.bucket.name;
  console.log(`Create Event Detected in Bucket: ${bucket}; Key ${key}`);

  if (fnCodeMap.hasOwnProperty(key)) {
    const fn = fnCodeMap[key];
    console.log(`Update Lambda Function Code: ${fn}`);
    updateFunctionCode({ FunctionName: fn, S3Key: key, S3Bucket: bucket });
  } else if (layerMap.hasOwnProperty(key)) {
    const cfg = layerMap[key];
    console.log(`Update Lambda Layer: ${cfg.LayerName}`);
    publishLayer({ ...cfg, S3Key: key, S3Bucket: bucket });
  } else {
    context.succeed(`skipping zip ${key} in bucket ${bucket}`);
  }
};
