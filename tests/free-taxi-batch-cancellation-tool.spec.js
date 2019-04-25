const freeTaxiBatchCancellationTool = require('../src/free-taxi-batch-cancellation-tool');
const fs = require('fs');
const axios = require('axios');

jest.mock('fs');
jest.mock('axios');

global.setTimeout = jest.fn(cb => {
    cb();
});

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
    put: jest.fn(urlToCall => Promise.resolve({
        data: {
            affiliateReference: urlToCall,
            bookingReferences: [
                "SOMETAXIBOOKINGREFERENCE"
            ]
        }
    })),
};

describe('Free Taxi Batch Cancellation Tool', () => {
    beforeEach(() => {

        fs.readFileSync = jest.fn((filepath, options) => {
            return exampleBookingReferencesRawFileContents;
        });

        fs.writeFileSync = jest.fn();

        axios.create = jest.fn(() => axiosPutMock);

        console.error = jest.fn();
        console.info = jest.fn();
        console.log = jest.fn();
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
        describe('When no environment variable is passed at all', () => {
            it('logs a relevant error and exits the program', () => {
                freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey, '');
                expect(console.error.mock.calls[0][0]).toContain('Error: Please supply an environment to call');
            });
        });

        describe('When an environment variable that is not "dev", "qa" or "prod"', () => {
            it('logs a relevant error and exits the program', () => {
                freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey, 'someinvalidenv');
                expect(console.error.mock.calls[0][0]).toContain('Error: Please supply an environment to call');
            });
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

    describe('When the CSV file is successfully read in and valid, API key is valid and an env is passed', () => {
        let responses;
        beforeEach(async () => {
            responses = await freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey, 'dev');
        });

        it('makes a request to the cancellation endpoint for each reference', async () => {
            expect(responses.cancelledBookings[0]).toContain(exampleBookingReferencesArray[0]);
            expect(responses.cancelledBookings[1]).toContain(exampleBookingReferencesArray[1]);
            expect(responses.cancelledBookings[2]).toContain(exampleBookingReferencesArray[2]);
            expect(responses.cancelledBookings[3]).toContain(exampleBookingReferencesArray[3]);
            expect(responses.cancelledBookings[4]).toContain(exampleBookingReferencesArray[4]);
            expect(responses.cancelledBookings[5]).toContain(exampleBookingReferencesArray[5]);
            expect(responses.cancelledBookings[6]).toContain(exampleBookingReferencesArray[6]);
            expect(responses.cancelledBookings[7]).toContain(exampleBookingReferencesArray[7]);
            expect(responses.cancelledBookings[8]).toContain(exampleBookingReferencesArray[8]);
            expect(responses.cancelledBookings[9]).toContain(exampleBookingReferencesArray[9]);
        });

        it('recieves an array of responses from the endpoint', async () => {
            expect(responses.responses[0]).toContain(exampleBookingReferencesArray[0]);
            expect(responses.responses[1]).toContain(exampleBookingReferencesArray[1]);
            expect(responses.responses[2]).toContain(exampleBookingReferencesArray[2]);
            expect(responses.responses[3]).toContain(exampleBookingReferencesArray[3]);
            expect(responses.responses[4]).toContain(exampleBookingReferencesArray[4]);
            expect(responses.responses[5]).toContain(exampleBookingReferencesArray[5]);
            expect(responses.responses[6]).toContain(exampleBookingReferencesArray[6]);
            expect(responses.responses[7]).toContain(exampleBookingReferencesArray[7]);
            expect(responses.responses[8]).toContain(exampleBookingReferencesArray[8]);
            expect(responses.responses[9]).toContain(exampleBookingReferencesArray[9]);
        });
    });

    describe('When the requests to the cancellation endpoint fail', () => {
        let responses;

        beforeEach(async () => {

            const failingAxiosPut = {
                put: jest.fn(() => Promise.reject(new Error('some error')))
            };

            axios.create = jest.fn(() => failingAxiosPut);

            responses = await freeTaxiBatchCancellationTool(exampleCsvPath, exampleApiKey, 'dev');
        });

        it('Returns an array of error messages', () => {
            expect(responses.failedCancellations[0]).toContain(exampleBookingReferencesArray[0]);
            expect(responses.failedCancellations[1]).toContain(exampleBookingReferencesArray[1]);
            expect(responses.failedCancellations[2]).toContain(exampleBookingReferencesArray[2]);
            expect(responses.failedCancellations[3]).toContain(exampleBookingReferencesArray[3]);
            expect(responses.failedCancellations[4]).toContain(exampleBookingReferencesArray[4]);
            expect(responses.failedCancellations[5]).toContain(exampleBookingReferencesArray[5]);
            expect(responses.failedCancellations[6]).toContain(exampleBookingReferencesArray[6]);
            expect(responses.failedCancellations[7]).toContain(exampleBookingReferencesArray[7]);
            expect(responses.failedCancellations[8]).toContain(exampleBookingReferencesArray[8]);
            expect(responses.failedCancellations[9]).toContain(exampleBookingReferencesArray[9]);
        });

        it('Writes a CSV file of failed cancellation requests', () => {
            expect(fs.writeFileSync.mock.calls[0][0]).toBe('./output/failed-cancellation-booking-references.csv');
        });

        it('Outputs the CSV filename where failed booking requests are written to', () => {
            expect(console.info).toHaveBeenCalledWith('\nFailed booking request references were written to path:\n ./output/failed-cancellation-booking-references.csv');
        });

        it('Returns the filepath where the failed cancellation references have been written to', () => {
            expect(responses.failedCancellationReferencesFilepath).toBe('./output/failed-cancellation-booking-references.csv');
        });
    });
});
