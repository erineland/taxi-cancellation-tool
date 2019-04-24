const fs = require('fs');
const axios = require('axios');

let axiosClient;

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
    console.log(`\n The bookingReferenceToCancel are: ${bookingReferencesToCancel}`);

    const responses = await batchCancellationRequests(bookingReferencesToCancel, apiKey);
    console.log(`responses are: ${responses}`);
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

const batchCancellationRequests = async (bookingReferencesToCancel, apiKey) => {
    const responses = [];
    for (let i = 0; i < bookingReferencesToCancel.length; i++) {
        await delay(500);
        const bookingReference = bookingReferencesToCancel[i];
        console.log(`\n Attempting to cancel booking reference: ${bookingReference}`);
        const response = await makeCancellationRequest(bookingReference, axiosClient);
        console.log(`\n response is: ${JSON.stringify(response)} `);
        responses.push(response);
    };
    return responses;
}

// TODO: Add this to your anki deck along with the http request module knowledge.
const delay = interval => new Promise(resolve => setTimeout(resolve, interval));

const makeCancellationRequest = async bookingReference => {
    let cancellationEndpoint = janusCancellationEndpoint
        .replace('affiliateBookingReference', bookingReference.toString());

    try {
        const response = await axiosClient.put(cancellationEndpoint);

        // TODO: Parse the resopnse properly here! What the hell format is it in!?

        const message =
            `The response from the cancellation endpoint for the booking reference ${bookingReference} is: ${response}`;
        // console.log(message);

        return message;
    } catch (error) {
        const message =
            `An error occurred when attempting to cancel reference ${bookingReference}: ${error.message}`
        // console.error(message);
        return new Error(message);
    };
}
