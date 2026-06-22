const geohash = require("ngeohash");

const hashLocation = async ({ lat, lng, precision = 7 }) => {
    return geohash.encode(lat, lng, precision);
};

module.exports = {
    hashLocation
};