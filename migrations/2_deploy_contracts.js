const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer) {

    let firstAirline  = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    let secondAirline = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef';
    let iTimeStamp    = 1632484830;

    deployer.deploy(FlightSuretyData,firstAirline)
    .then(() => {
        return deployer.deploy(FlightSuretyApp,FlightSuretyData.address)
                .then(() => {
                    let config = {
                        localhost: {
                            url: 'http://localhost:8545',
                            dataAddress: FlightSuretyData.address,
                            appAddress: FlightSuretyApp.address
                        }
                    }
                    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                }).then( async () => {
                  var flightSuretyData = await FlightSuretyData.deployed();
                  await flightSuretyData.authorizeCaller(FlightSuretyApp.address);

                  var flightSuretyApp = await FlightSuretyApp.deployed();

                  await flightSuretyApp.fundAirline({from:firstAirline,value:10*Math.pow(10, 18)});
                  await flightSuretyApp.registerAirline(secondAirline,{from:firstAirline});
                  await flightSuretyApp.fundAirline({from:secondAirline,value:10*Math.pow(10, 18)});

                  await flightSuretyApp.registerFlight('ND1310',iTimeStamp,{from:firstAirline});
                  await flightSuretyApp.registerFlight('ND1311',iTimeStamp,{from:firstAirline});
                  await flightSuretyApp.registerFlight('ND1312',iTimeStamp,{from:firstAirline});
                  await flightSuretyApp.registerFlight('ND1313',iTimeStamp,{from:firstAirline});
                  await flightSuretyApp.registerFlight('ND1314',iTimeStamp,{from:firstAirline});

                  await flightSuretyApp.registerFlight('SD0601',iTimeStamp,{from:secondAirline});
                  await flightSuretyApp.registerFlight('SD0602',iTimeStamp,{from:secondAirline});
                  await flightSuretyApp.registerFlight('SD0603',iTimeStamp,{from:secondAirline});
                  await flightSuretyApp.registerFlight('SD0604',iTimeStamp,{from:secondAirline});
                  await flightSuretyApp.registerFlight('SD0605',iTimeStamp,{from:secondAirline});
                });         
    });
}