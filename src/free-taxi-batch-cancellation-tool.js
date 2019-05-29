const fs = require('fs');
const axios = require('axios');

let axiosClient;
const failedCancellationsBookingReferences = [];
const successfullyCancelledRequests = [];

let defaultCancellationEndpoint = 'https://janus-api.ENV.someonedrive.me/v2/bookings/affiliate-ref/affiliateBookingReference/cancel';
let janusCancellationEndpoint;

module.exports = async (bookingReferencesCsvFilepath, apiKey, env, tempTestCallback) => {
    if (!bookingReferencesCsvFilepath) {
        console.error('Error: Please supply a valid CSV filepath.');
        return;
    }

    if (!apiKey) {
        console.error('Error: Please supply a valid API key.');
        return;
    }

    if (!(env === 'dev' || env === 'qa' || env === 'prod')) {
        console.error('Error: Please supply an environment to call');
        return;
    }

    if (env === 'prod') {
        janusCancellationEndpoint =
            defaultCancellationEndpoint.replace('janus-api.ENV.someonedrive.me', 'janus-api.rideways.com');
    } else {
        janusCancellationEndpoint = defaultCancellationEndpoint.replace('ENV', env);
    }

    axiosClient = axios.create({
        headers: {
            'apikey': apiKey,
        }
    });

    const bookingReferencesToCancel = readAndParseCsvBookingReferences(bookingReferencesCsvFilepath);
    const responses = await batchCancellationRequests(bookingReferencesToCancel, tempTestCallback);

    fs.writeFileSync(
        './output/failed-cancellation-booking-references.csv',
        failedCancellationsBookingReferences,
        'utf8',
    )

    './output/successfully-cancelled-booking-references.csv'

    fs.writeFileSync(
        './output/successfully-cancelled-booking-references.csv',
        successfullyCancelledRequests,
        'utf8',
    )

    console.info(`\nFailed booking request references were written to path:\n ./output/failed-cancellation-booking-references.csv`)
    console.info(`\nThe failed cancellations were: ${failedCancellationsBookingReferences}`);
    console.info(`The successful cancellations were: ${successfullyCancelledRequests}`);

    const formattedCancellationResults = {
        failedCancellationReferencesFilepath: './output/failed-cancellation-booking-references.csv',
        failedCancellations: failedCancellationsBookingReferences,
        cancelledBookings: successfullyCancelledRequests,
        responses
    };

    return formattedCancellationResults;
}

const readAndParseCsvBookingReferences = bookingReferencesCsvFilepath => {
    let rawCsvBookingReferences = fs
        .readFileSync(
            bookingReferencesCsvFilepath,
            {
                encoding: 'utf8'
            }
        );

    rawCsvBookingReferences = rawCsvBookingReferences.replace(/(\r\n|\n|\r)/gm, "");

    console.log(`The rawCsvBookingReferences is: ${rawCsvBookingReferences}`);

    return rawCsvBookingReferences.split(',');
}

const batchCancellationRequests = async (bookingReferencesToCancel, tempTestCallback) => {
    const responses = [];
    for (let i = 0; i < bookingReferencesToCancel.length; i++) {
        await delay(500, tempTestCallback);
        const bookingReference = bookingReferencesToCancel[i];
        const response = await makeCancellationRequest(bookingReference);
        responses.push(response);
    };
    return responses;
}

const delay = (interval) => new Promise(resolve => setTimeout(resolve, interval));

const makeCancellationRequest = async bookingReference => {
    let cancellationEndpoint = janusCancellationEndpoint
        .replace('affiliateBookingReference', bookingReference.toString());

    try {
        const response = await axiosClient.put(cancellationEndpoint);

        const message =
            `Successful cancellation for: ${JSON.stringify(response.data)}`;

        successfullyCancelledRequests.push(bookingReference);

        console.log(message);

        return message;
    } catch (error) {
        const message =
            `An error occurred when attempting to cancel reference ${bookingReference}: ${error.message} `

        failedCancellationsBookingReferences.push(bookingReference);

        console.error(message);

        return message;
    };
}
