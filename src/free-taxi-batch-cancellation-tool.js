const fs = require('fs');
const axios = require('axios');

// TODO: Write option for making the calls one at a time...
// const makeCancellationRequests = bookingReference => {
//     axios.put
// }

const janusCancellationEndpoint = 'https://janus-api.dev.someonedrive.me/v2/bookings/affiliate-ref/affiliateBookingReference/cancel';

module.exports = (bookingReferencesCsvFilepath) => {

    // Validate the first parameter, the CSV filepath
    if (!bookingReferencesCsvFilepath) {
        console.error('Please supply a valid CSV filepath');
        console.log('Please supply a valid CSV filepath');
        return;
    }

    // Read CSV file into an array.
    const bookingReferencesToCancel = fs
        .readFileSync(
            bookingReferencesCsvFilepath,
            {
                encoding: 'utf8'
            }
        )

    console.log(`\n\n\n bookingReferencesToCancel is: ${bookingReferencesToCancel}`);

    // Create an instance of Axios

    // TODO: Pass in API key
    // TODO: Configure base URL here based on passed in env. DEFAULT TO DEV

    const axiosClient = axios.create({
        headers: {
            'apikey': 'ac57e6ad6861490ba9b407dbb7847488', // TODO: Parameterize and pass in
        }
    });

    // iterate over each booking.com reference and make a Janus cancellation request.
    for (let i = 0; i < bookingReferencesToCancel.length; i++) {
        const bookingReference = bookingReferencesToCancel[i];
        let cancellationEndpoint =
            janusCancellationEndpoint
                .replace(
                    'affiliateBookingReference',
                    bookingReference
                );

        axiosClient.put(
            cancellationEndpoint,
        )
            .then(response => {
                console.log(`The response from the cancellation endpoint is: ${response}`);
            })
            .catch((error) => {
                console.log(`Failure occured`);
                console
                    .log(
                        `An error occurred when attempting to cancel reference ${bookingReference}: ${error.message}`
                    );
            })
    };
}
