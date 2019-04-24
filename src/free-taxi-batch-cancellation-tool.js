const fs = require('fs');
const axios = require('axios');

let axiosClient;
// TODO: Write option for making the calls one at a time...
// const makeCancellationRequests = bookingReference => {
//     axios.put
// }

const janusCancellationEndpoint = 'https://janus-api.dev.someonedrive.me/v2/bookings/affiliate-ref/affiliateBookingReference/cancel';

module.exports = async (bookingReferencesCsvFilepath, apiKey) => {

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

    await batchCancellationRequests(bookingReferencesToCancel, apiKey);
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
        await makeCancellationRequest(bookingReference, axiosClient);
    };
}

// TODO: Add this to your anki deck along with the http request module knowledge.
const delay = interval => new Promise(
    resolve => { setTimeout(resolve, interval); }
);

const makeCancellationRequest = async bookingReference => {
    let cancellationEndpoint = janusCancellationEndpoint
        .replace('affiliateBookingReference', bookingReference.toString());

    try {
        const response = await axiosClient.put(cancellationEndpoint)
        console.log(`The response from the cancellation endpoint is: ${JSON.parse(response)}`);
        return response;
    } catch (error) {
        console.error(`An error occurred when attempting to cancel reference ${bookingReference}: ${error.message}`);
    };
}
