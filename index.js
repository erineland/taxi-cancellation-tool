const freeTaxiBatchCancellationTool = require('./src/free-taxi-batch-cancellation-tool');

const bookingsToCancelFilePath = process.argv[2];
console.log(`bookingsToCancelFilePath is: ${bookingsToCancelFilePath}`);

// TODO: Read API key in as parameter.

freeTaxiBatchCancellationTool(bookingsToCancelFilePath);
