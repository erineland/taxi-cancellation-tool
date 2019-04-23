const parser = require('csv-parser');
const fs = require('fs');

module.exports = (bookingReferencesCsvFilepath) => {
    return bookingReferencesToCancel = fs
        .readFileSync(
            bookingReferencesCsvFilepath,
            {
                encoding: 'utf8'
            }
        )
}
