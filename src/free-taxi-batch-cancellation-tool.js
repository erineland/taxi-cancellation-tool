const fs = require('fs');
const axios = require('axios');

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

    // Split this string into an array
    const bookingReferencesToCancel = readAndParseCsvBookingReferences(bookingReferencesCsvFilepath);

    // iterate over each booking.com reference and make a Janus cancellation request.
    batchCancellationRequests(bookingReferencesToCancel, apiKey);
}

function readAndParseCsvBookingReferences(bookingReferencesCsvFilepath) {
    const rawCsvBookingReferences = fs
        .readFileSync(
            bookingReferencesCsvFilepath,
            {
                encoding: 'utf8'
            }
        )

    return rawCsvBookingReferences.split(',');
}

function batchCancellationRequests(bookingReferencesToCancel, apiKey) {

    const axiosClient = axios.create({
        headers: {
            'apikey': apiKey,
        }
    });

    for (let i = 0; i < bookingReferencesToCancel.length; i++) {
        const bookingReference = bookingReferencesToCancel[i];
        let cancellationEndpoint = janusCancellationEndpoint
            .replace('affiliateBookingReference', bookingReference.toString());
        console.log(`\n The endpoint being called is: ${cancellationEndpoint}`);
        axiosClient.put(cancellationEndpoint)
            .then(response => {
                console.log(`The response from the cancellation endpoint is: ${response}`);
            })
            .catch((error) => {
                console
                    .error(`An error occurred when attempting to cancel reference ${bookingReference}: ${error.message}`);
            });
    }
    ;
}
