const fs = require('fs');
const axios = require('axios');

let axiosClient;
// TODO: Write option for making the calls one at a time...
// const makeCancellationRequests = bookingReference => {
//     axios.put
// }

const janusCancellationEndpoint = 'https://janus-api.dev.someonedrive.me/v2/bookings/affiliate-ref/affiliateBookingReference/cancel';

module.exports = (bookingReferencesCsvFilepath, apiKey) => {

    if (!bookingReferencesCsvFilepath) {
        console.error('Error: Please supply a valid CSV filepath.');
        return;
    }

    if (!apiKey) {
        console.error('Error: Please supply a valid API key.');
        return;
    }

    axiosClient = axios.create({
        headers: {
            'apikey': apiKey,
        }
    });

    const bookingReferencesToCancel = readAndParseCsvBookingReferences(bookingReferencesCsvFilepath);

    batchCancellationRequests(bookingReferencesToCancel, apiKey);
}

const readAndParseCsvBookingReferences = bookingReferencesCsvFilepath => {
    const rawCsvBookingReferences = fs
        .readFileSync(
            bookingReferencesCsvFilepath,
            {
                encoding: 'utf8'
            }
        )

    return rawCsvBookingReferences.split(',');
}

const batchCancellationRequests = async (bookingReferencesToCancel, apiKey)  => {
    for (let i = 0; i < bookingReferencesToCancel.length; i++) {
        await delay(500);
        const bookingReference = bookingReferencesToCancel[i];
        makeCancellationRequest(bookingReference, axiosClient);
    };
}

// TODO: Add this to your anki deck along with the http request module knowledge.
const delay = interval => new Promise(
    resolve => { setTimeout(resolve, interval); }
);

const makeCancellationRequest = async bookingReference => {
    let cancellationEndpoint = janusCancellationEndpoint
        .replace('affiliateBookingReference', bookingReference.toString());

    console.log(`the time after the delay is: ${new Date().getTime()}`);

    return axiosClient.put(cancellationEndpoint)
        .then(response => {
            console.log(`The response from the cancellation endpoint is: ${response}`);
        })
        .catch((error) => {
            console
                .error(`An error occurred when attempting to cancel reference ${bookingReference}: ${error.message}`);
        });
}
