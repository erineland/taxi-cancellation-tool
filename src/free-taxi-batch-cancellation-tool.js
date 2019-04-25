const fs = require('fs');
const axios = require('axios');

let axiosClient;

const janusCancellationEndpoint = 'https://janus-api.dev.someonedrive.me/v2/bookings/affiliate-ref/affiliateBookingReference/cancel';

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

    axiosClient = axios.create({
        headers: {
            'apikey': apiKey,
        }
    });

    const bookingReferencesToCancel = readAndParseCsvBookingReferences(bookingReferencesCsvFilepath);
    const responses = await batchCancellationRequests(bookingReferencesToCancel, tempTestCallback);
    return responses;
}

const readAndParseCsvBookingReferences = bookingReferencesCsvFilepath => {
    const rawCsvBookingReferences = fs
        .readFileSync(
            bookingReferencesCsvFilepath,
            {
                encoding: 'utf8'
            }
        );
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

// TODO: Add this to your anki deck along with the http request module knowledge.
function delay(interval, tempTestCallback) {
    return new Promise(
        // Realise that Promise INTERNALLY supplied 'resolve' function.
        function (resolve, reject) {
            setTimeout(function () {
                console.log(`Waiting: ${new Date().getTime()}`);
                tempTestCallback();
                resolve();
            },
                interval
            );
        }
    );
}

const makeCancellationRequest = async bookingReference => {
    let cancellationEndpoint = janusCancellationEndpoint
        .replace('affiliateBookingReference', bookingReference.toString());

    try {
        const response = await axiosClient.put(cancellationEndpoint);

        const message =
            `Successful cancellations for: ${JSON.stringify(response.data)}`;

        console.log(message);

        return message;
    } catch (error) {
        const message =
            `An error occurred when attempting to cancel reference ${bookingReference}: ${error.message} `

        console.error(message);

        return new Error(message);
    };
}
