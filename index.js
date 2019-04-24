const freeTaxiBatchCancellationTool = require('./src/free-taxi-batch-cancellation-tool');

const bookingsToCancelFilePath = process.argv[2];
console.log(`bookingsToCancelFilePath is: ${bookingsToCancelFilePath}`);

const apiKey = process.argv[3];
console.log(`The API key being used is: ${apiKey}`);

const env = process.argv[4];
console.log(`The environment being queried is: ${env}`);

freeTaxiBatchCancellationTool(bookingsToCancelFilePath, apiKey, env);
