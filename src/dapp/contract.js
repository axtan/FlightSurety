import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
var BigNumber = require('bignumber.js');

export default class Contract {
    constructor(network, callback) {

        this.config = Config[network];
        this.web3 = new Web3();
        const eventProvider = new Web3.providers.WebsocketProvider(this.config.url.replace('http', 'ws'));
        this.web3.setProvider(eventProvider);
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, this.config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, this.config.dataAddress);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.weiMultiple= (new BigNumber(10)).pow(18)
        this.initialize(callback);
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];
            let counter = 1;
            
            while(this.airlines.length < 4) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
        });
    }

    authorizeCaller() {
        console.log(this.owner);
        return new Promise((resolve, reject) => {
            this.flightSuretyData.methods
                .authorizeCaller(this.config.appAddress)
                .send({ from: this.owner}, (err, res) => {
                    if (err) reject(err);
                    resolve(res);
                });
        });
    }

    isAirlineFunded() {
        return new Promise((resolve, reject) => {
            this.flightSuretyApp.methods
                .isAirlineFunded(this.airlines[0])
                .call({ from: this.airlines[0]}, (err, res) => {
                    if (err) reject(err);
                    resolve(res);
                });
        });
    }

    fundFirstAirline() {
        

        return new Promise((resolve, reject) => {
            this.flightSuretyApp.methods
                .fundAirline()
                .send({ from: this.airlines[0],value: 10*Math.pow(10, 18)}, (err, res) => {
                    if (err) reject(err);
                    resolve(res);
                });
        });
    }

    isOperational() {
        return new Promise((resolve, reject) => {
            this.flightSuretyApp.methods
                .isOperational()
                .call({ from: this.owner}, (err, res) => {
                    if (err) reject(err);
                    resolve(res);
                });
        });
    }

    fetchFlightStatus(airline,flight,iTimestamp) {
        return new Promise((resolve, reject) => {
            this.flightSuretyApp.methods
                .fetchFlightStatus(airline, flight, iTimestamp)
                .send(
                    { from: this.owner },
                    (err, res) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        }
                        resolve(res);
                    }
                );
        });
    }

    buyInsurance(airline,flight,iTimestamp,notional){
        return new Promise((resolve, reject) => {
            this.flightSuretyApp.methods
            .buyInsurance(airline,flight,iTimestamp)
            .send(
                {from:this.passengers[0],value:notional*this.weiMultiple,gas: 9999999},
                (err, res) => {
                    if (err) reject(err);
                    resolve(res);
                }
            );

        });
    }

    fetchPassengerBalance() {
        return new Promise((resolve, reject) => {
            this.flightSuretyData.methods
            .getPassengerBalance(this.passengers[0])
            .call(
                { from: this.owner },
                (err, res) => {
                    if (err) reject(err);
                    resolve(res/this.weiMultiple);
                }
            );
        });
    }

    withdrawBalance() {
        return new Promise((resolve, reject) => {
            this.flightSuretyApp.methods
            .pay(this.passengers[0])
            .send(
                { from: this.owner,gas: 9999999 },
                (err, res) => {
                    if (err) reject(err);
                    resolve(res);
                }
            );
        });
    }
}