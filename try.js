var countryTelData = require('country-telephone-data')
//countryTelData.allCountries // has data as array of objects 
//countryTelData.iso2Lookup

console.log(countryTelData.allCountries[countryTelData.iso2Lookup['au']]);

