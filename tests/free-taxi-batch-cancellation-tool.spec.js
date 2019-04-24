const freeTaxiBatchCancellationTool = require('../src/free-taxi-batch-cancellation-tool');
const fs = require('fs');
const axios = require('axios');

jest.mock('fs');
jest.mock('axios');

// Just have a path that points to an actual CSV file here...
const exampleCsvPath = './mocks/example-references.csv';
const exampleApiKey = 'de46f6sd6852468ds3d554sfv2743737';
const exampleBookingReferencesArray = [
    '2961396555',
    '8121302861',
    '3652008139',
    '9693267800',
    '241075238',
    '3572742018',
    '0684968798',
    '0271307570',
    '1243256206',
    '2645257110'
];
const exampleBookingReferencesRawFileContents = exampleBookingReferencesArray.join();

const axiosPutMock = {
    put: jest.fn(() => Promise.resolve())
};

describe('Free Taxi Batch Cancellation Tool', () => {
    beforeEach(() => {
        fs.readFileSync = jest.fn((filepath, options) => {
            return exampleBookingReferencesRawFileContents;
        });
        axios.create = jest.fn(() => axiosPutMock);
        console.log = jest.fn();
        console.error = jest.fn();
        batchCancellationRequests = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('When the program is passed in the filepath of a CSV file', () => {
        it('reads in the CSV file', () => {
            freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey);
            expect(fs.readFileSync).toHaveBeenCalledWith(exampleCsvPath, {
                encoding: 'utf8'
            });
        });
    });

    describe('When the program is not passed in a valid filepath of a CSV file', () => {
        it('logs a relevant error and exits the program', () => {
            freeTaxiBatchCancellationTool('');
            expect(console.error.mock.calls[0][0]).toContain('Error: Please supply a valid CSV filepath');
        });
    });

    describe('When the program is not passed a valid API key', () => {
        it('logs a relevant error and exits the program', () => {
            freeTaxiBatchCancellationTool(exampleCsvPath, '');
            expect(console.error.mock.calls[0][0]).toContain('Error: Please supply a valid API key.');
        });
    });

    describe('When the program is passed a valid API key', () => {
        it('uses this API key', () => {
            freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey);
            expect(axios.create).toHaveBeenCalledWith({
                headers: {
                    'apikey': exampleApiKey,
                }
            });
        });
    });

    describe('When the CSV file is successfully read in and valid, and API key is valid', () => {
        it('makes a request to the cancellation endpoint for each reference', () => {
            freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey);
            expect(axiosPutMock.put.mock.calls[0][0]).toContain(exampleBookingReferencesArray[0]);
            expect(axiosPutMock.put.mock.calls[1][0]).toContain(exampleBookingReferencesArray[1]);
            expect(axiosPutMock.put.mock.calls[2][0]).toContain(exampleBookingReferencesArray[2]);
            expect(axiosPutMock.put.mock.calls[3][0]).toContain(exampleBookingReferencesArray[3]);
            expect(axiosPutMock.put.mock.calls[4][0]).toContain(exampleBookingReferencesArray[4]);
            expect(axiosPutMock.put.mock.calls[5][0]).toContain(exampleBookingReferencesArray[5]);
            expect(axiosPutMock.put.mock.calls[6][0]).toContain(exampleBookingReferencesArray[6]);
            expect(axiosPutMock.put.mock.calls[7][0]).toContain(exampleBookingReferencesArray[7]);
            expect(axiosPutMock.put.mock.calls[8][0]).toContain(exampleBookingReferencesArray[8]);
            expect(axiosPutMock.put.mock.calls[9][0]).toContain(exampleBookingReferencesArray[9]);
        });
    });

    describe('When the requests to the cancellation endpoint fail', () => {
        beforeEach(() => {

            const failingAxiosPut = {
                put: jest.fn(() => Promise.reject(new Error('some error')))
            };

            axios.create = jest.fn(() => failingAxiosPut);
        });

        it('Logs the errors to the console', () => {
            freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey);
            expect(console.log.mock.calls[0][0]).toContain(exampleBookingReferencesArray[0]);
            expect(console.log.mock.calls[1][0]).toContain(exampleBookingReferencesArray[1]);
            expect(console.log.mock.calls[2][0]).toContain(exampleBookingReferencesArray[2]);
            expect(console.log.mock.calls[3][0]).toContain(exampleBookingReferencesArray[3]);
            expect(console.log.mock.calls[4][0]).toContain(exampleBookingReferencesArray[4]);
            expect(console.log.mock.calls[5][0]).toContain(exampleBookingReferencesArray[5]);
            expect(console.log.mock.calls[6][0]).toContain(exampleBookingReferencesArray[6]);
            expect(console.log.mock.calls[7][0]).toContain(exampleBookingReferencesArray[7]);
            expect(console.log.mock.calls[8][0]).toContain(exampleBookingReferencesArray[8]);
            expect(console.log.mock.calls[9][0]).toContain(exampleBookingReferencesArray[9]);
        });
    });
});
