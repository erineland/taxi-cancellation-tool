const freeTaxiBatchCancellationTool = require('../src/free-taxi-batch-cancellation-tool');
const csvParse = require('csv-parse');
const fs = require('fs');

jest.mock('fs');
jest.mock('csv-parse');

// Just have a path that points to an actual CSV file here...
const exampleCsvPath = 'tests/mocks/example-references.csv';
const devFreeTaxiAffiliateApiKey = 'ac57e6ad6861490ba9b407dbb7847488';

describe('Free Taxi Batch Cancellation Tool', () => {
    describe('When the program is passed in the filepath of a CSV file', () => {
        it('reads in the CSV file', () => {
            freeTaxiBatchCancellationTool(exampleCsvPath);
            expect(fs.readFileSync).toHaveBeenCalledWith(exampleCsvPath, {
                encoding: 'utf8'
            });
        });

        // it('Attempts to parse that CSV file into an array of Booking.com booking references', () => {
        //     freeTaxiBatchCancellationTool(exampleCsvPath);
        //     expect(csvParse).toHaveBeenCalled();
        // });
    });
});
