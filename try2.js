const getIP = require('external-ip')();
const ipCountry = require('ip-country')

var countryTelData = require('country-telephone-data')

 
getIP((err, ip) => {
    if (err) {
        // every service in the list has failed
        throw err;
    }
    console.log(ip);

    ipCountry.init({fllbackCountry: 'AU'});
    var country = ipCountry.lookup(ip);
    console.log(country);
    var code = country.country.iso_code;
    console.log(code);

    console.log(countryTelData.allCountries[countryTelData.iso2Lookup[code.toLowerCase()]]);
});

