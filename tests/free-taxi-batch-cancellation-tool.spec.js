const freeTaxiBatchCancellationTool = require('../src/free-taxi-batch-cancellation-tool');
const fs = require('fs');
const axios = require('axios');

jest.mock('fs');
jest.mock('axios');

global.setTimeout = jest.fn(cb => {
    cb();
}, 0);

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
    put: jest.fn(urlToCall => Promise.resolve(urlToCall)),
};

describe('Free Taxi Batch Cancellation Tool', () => {
    beforeEach(() => {

        fs.readFileSync = jest.fn((filepath, options) => {
            return exampleBookingReferencesRawFileContents;
        });

        axios.create = jest.fn(() => axiosPutMock);

        console.log = jest.fn();
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('When the program is passed in the filepath of a CSV file', () => {
        it('reads in the CSV file', () => {
            freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey, 'dev');
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

    describe('When the program is not passed in a valid environment variable', () => {
        it('logs a relevant error and exits the program', () => {
            freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey, '');
            expect(console.error.mock.calls[0][0]).toContain('Error: Please supply an environment to call');
        });
    });

    describe('When the program is passed a valid API key', () => {
        it('uses this API key', () => {
            freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey, 'dev');
            expect(axios.create).toHaveBeenCalledWith({
                headers: {
                    'apikey': exampleApiKey,
                }
            });
        });
    });

    describe('When the CSV file is successfully read in and valid, and API key is valid', () => {
        it('makes a request to the cancellation endpoint for each reference', async done => {
            const responses = await freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey, 'dev');
            expect(responses[0]).toContain(exampleBookingReferencesArray[0]);
            expect(responses[1]).toContain(exampleBookingReferencesArray[1]);
            expect(responses[2]).toContain(exampleBookingReferencesArray[2]);
            expect(responses[3]).toContain(exampleBookingReferencesArray[3]);
            expect(responses[4]).toContain(exampleBookingReferencesArray[4]);
            expect(responses[5]).toContain(exampleBookingReferencesArray[5]);
            expect(responses[6]).toContain(exampleBookingReferencesArray[6]);
            expect(responses[7]).toContain(exampleBookingReferencesArray[7]);
            expect(responses[8]).toContain(exampleBookingReferencesArray[8]);
            expect(responses[9]).toContain(exampleBookingReferencesArray[9]);
            done();
        });

        // it('waits for a given delay between each request', () => {
        //     freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey);
        //     expect(global.setTimeout).toHaveBeenCalled();
        // });
    });

    describe('When the requests to the cancellation endpoint fail', () => {
        beforeEach(() => {

            const failingAxiosPut = {
                put: jest.fn(() => Promise.reject(new Error('some error')))
            };

            axios.create = jest.fn(() => failingAxiosPut);
        });

        it('Logs the errors to the console', async done => {
            const responses = await freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey, 'dev');
            expect(responses[0].message).toContain(exampleBookingReferencesArray[0]);
            expect(responses[1].message).toContain(exampleBookingReferencesArray[1]);
            expect(responses[2].message).toContain(exampleBookingReferencesArray[2]);
            expect(responses[3].message).toContain(exampleBookingReferencesArray[3]);
            expect(responses[4].message).toContain(exampleBookingReferencesArray[4]);
            expect(responses[5].message).toContain(exampleBookingReferencesArray[5]);
            expect(responses[6].message).toContain(exampleBookingReferencesArray[6]);
            expect(responses[7].message).toContain(exampleBookingReferencesArray[7]);
            expect(responses[8].message).toContain(exampleBookingReferencesArray[8]);
            expect(responses[9].message).toContain(exampleBookingReferencesArray[9]);
            done();
        });
    });
});
