var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/
  let airline1  = accounts[1];
  let airline2  = accounts[2];
  let airline3  = accounts[3];
  let airline4  = accounts[4];
  let airline5  = accounts[5];
  let airline6  = accounts[7];
  let passenger = accounts[6];

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false;
    try 
    {
        await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
    }
    catch(e) {
        accessDenied = true;
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
          
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

    // Ensure that access is allowed for Contract Owner account
    let accessDenied = false;
    try 
    {
        await config.flightSuretyData.setOperatingStatus(false);
    }
    catch(e) {
        accessDenied = true;
    }
    assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
    
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

    let reverted = false;
    try 
    {
        await config.flightSuretyData.test();
    }
    catch(e) {
        reverted = true;
    }
    assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

    // Set it back for other tests to work
    await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) First airline is registered when contract is deployed', async function () { 
    assert.equal(await config.flightSuretyData.getNumRegisteredAirlines.call(),1,"We need to have one only airline at start");
    
    var result = false;
    
    result = await config.flightSuretyApp.isAirlineRegistered.call(airline1);
    assert.equal(result,true,"Error, first airline account is not registered");

    result = await config.flightSuretyApp.isAirlineFunded.call(airline1);
    assert.equal(result,false,"First airline account have to be not funded yet");
  });


  it('(airline) Airline can be registered, but does not participate in contract until it submits funding of 10 ether', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
  
    let result = await config.flightSuretyApp.isAirlineRegistered.call(newAirline,{from:config.firstAirline}); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });


  
  it('(airline) check only registered airline can be funded', async function () { 
    let reverted = false;
    try{
        await config.flightSuretyApp.fundAirline({from: airline2, value:10*config.weiMultiple});
    }
    catch(e){
        assert.equal(e['reason'],'You are not registered yet','wrong error detected');
        reverted = true;
    }


    assert.equal(reverted, true, "Airline account should not be able be to funded if it hasn't registered");
    
    tx=await config.flightSuretyApp.fundAirline({from: airline1, value:10*config.weiMultiple});
    
    var result = await config.flightSuretyApp.isAirlineFunded.call(airline1);
    assert.equal(result,true,"first airline account should have been funded");
    bal = await web3.eth.getBalance(config.flightSuretyData.address);
    assert.equal(bal,10*config.weiMultiple,"wrong funded value");
    truffleAssert.eventEmitted(tx, 'airlineFunded', (ev) => {
        return ev.airline === airline1;
    });
  });

  
  it('(airline) check only funded airline can add new airlines', async function () { 
    let reverted = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(airline2, {from: airline2});
    }
    catch(e) {
        assert.equal(e['reason'],'Caller is not registered','wrong error detected');
        reverted = true;
    }
    assert.equal(reverted, true, "Airline should not be able to register another airline if it hasn't registered");

    tx = await config.flightSuretyApp.registerAirline(airline2, {from: airline1});
    var result = false;
    
    result = await config.flightSuretyApp.isAirlineRegistered.call(airline2);
    assert.equal(result,true,"new airline account should have been registered");

    result = await config.flightSuretyApp.isAirlineFunded.call(airline2);
    assert.equal(result,false,"new airline account has not been funded yet");

    truffleAssert.eventEmitted(tx, 'airlineRegistered', (ev) => {
        return ev.newAirline === airline2;
    });
    reverted = false;
    // ACT
    try {
        await config.flightSuretyApp.registerAirline(airline3, {from: airline2});
    }
    catch(e) {
        assert.equal(e['reason'],'Caller is not funded','wrong error detected');
        reverted = true;
    }
    assert.equal(reverted, true, "Airline should not be able to register another airline if it hasn't been funded");
  });

  it('(airline) only funded airline can vote for new airlines and no repeat voting is allowed', async function () { 
    let numVotes = await config.flightSuretyData.getNumVotes.call(airline5);
    assert.equal(numVotes,0,"should have no vote yet");
    let reverted = false;
    try{
        await config.flightSuretyApp.vote(airline5,{from:airline2});
    }
    catch(e){
        assert.equal(e['reason'],'Caller is not funded','wrong error detected');
        reverted = true;
    }
    assert.equal(reverted, true, "Airline should not be able to vote if it hasn't funded");


    
    let tx = await config.flightSuretyApp.vote(airline5,{from:airline1});
    truffleAssert.eventEmitted(tx, 'airlineVoted', (ev) => {
        return ev.newAirline === airline5 && ev.fundedAirline === airline1;
    });
    numVotes = await config.flightSuretyData.getNumVotes.call(airline5);
    assert.equal(numVotes,1,"should have only 1 vote");
    reverted = false;
    try{
        await config.flightSuretyApp.vote(airline5,{from:airline1});
    }catch(e){
        assert.equal(e['reason'],'Thsi airline already voted','wrong error detected');
        reverted = true;
    }
    assert.equal(reverted, true, "repeat voting is not allowed");
    
  });

  it('(airline) check Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines', async function () {
    // after this test, Airline2 is funded, Airline3 and airline4 are registered and funed, airline5 is registered
    await config.flightSuretyApp.fundAirline({from: airline2, value:10*config.weiMultiple});
    await config.flightSuretyApp.registerAirline(airline3, {from: airline2});  // register 3rd airline
    await config.flightSuretyApp.fundAirline({from: airline3, value:10*config.weiMultiple});
    await config.flightSuretyApp.registerAirline(airline4,{from:airline3}); // register 4th airline
    await config.flightSuretyApp.fundAirline({from: airline4, value:10*config.weiMultiple});
    let reverted = false;
    try{
        await config.flightSuretyApp.registerAirline(airline5,{from:airline4}); // try register 5th airline without 50% consensus
    }catch(e){
        assert.equal(e['reason'],'multi-party consensus of 50% is required');
        reverted = true;
    }
    assert.equal(reverted, true, "multi-party consensus of 50% is required");
    await config.flightSuretyApp.vote(airline5,{from:airline2});
    numVotes = await config.flightSuretyData.getNumVotes.call(airline5);
    assert.equal(numVotes,2,"should have 2 votes");
    assert.equal(await config.flightSuretyData.getNumRegisteredAirlines.call(),4,"there should be 4 registered airlines");
    await config.flightSuretyApp.registerAirline(airline5,{from:airline4}); // try register 5th airline with 50% consensus
    var result = false;
    
    result = await config.flightSuretyApp.isAirlineRegistered.call(airline5);
    assert.equal(result,true,"new airline account should have been registered");

    result = await config.flightSuretyApp.isAirlineFunded.call(airline5);
    assert.equal(result,false,"new airline account has not been funded yet");
  }); 


  

  it('(airline) check if not funded airline can register flights', async function () {
    var iTimestamp = 0;
    var reverted = false;
    try 
    {
      await config.flightSuretyApp.registerFlight('ND1309',iTimestamp,{from:airline6});
    }
    catch(e)
    {
      assert.equal(e['reason'],'airline not funded cant register flights','wrong error detected');
      reverted = true;
    }

    assert.equal(reverted, true, "Passenger can buy not registered flight");
  });

  it('(airline) check if funded airline can register flights with less than 24 hours to depart', async function () {
    var iTimestamp = Math.floor(Date.now() / 1000) + (3600*2);;
    var reverted = false;
    try 
    {
      await config.flightSuretyApp.registerFlight('ND1309',iTimestamp,{from:airline2});
    }
    catch(e)
    {
      assert.equal(e['reason'],'Cant register flights that depart in less than 24 hours','wrong error detected');
      reverted = true;
    }

    assert.equal(reverted, true, "Airline can register flights with less than 24 hour to depart");
  });


  it('(passenger) check if passenger cant buy insurance from a not registered flight', async function () {
    var iTimestamp = Math.floor(Date.now() / 1000) + (3600*48);
    var reverted = false;
    try 
    {
      await config.flightSuretyApp.buyInsurance(airline2,'ND1309',iTimestamp,{from:passenger,value:0.5*config.weiMultiple});
    }
    catch(e)
    {
      assert.equal(e['reason'],'Flight is not registered','wrong error detected');
      reverted = true;
    }

    assert.equal(reverted, true, "Passenger can buy not registered flight");
  });

  it('(passenger) check if passenger can buy insurance', async function () {
    let init_bal = await web3.eth.getBalance(config.flightSuretyData.address);

    var iTimestamp = Math.floor(Date.now() / 1000) + (3600*48);

    await config.flightSuretyApp.registerFlight('ND1309',iTimestamp,{from:airline2});

    await config.flightSuretyApp.buyInsurance(airline2,'ND1309',iTimestamp,{from:passenger,value:0.5*config.weiMultiple});
    let after_bal = await web3.eth.getBalance(config.flightSuretyData.address);
    let bal_diff = after_bal - init_bal;
    assert.equal(bal_diff,0.5*config.weiMultiple,"wrong balance for contract");
    let insuredAmount = await  config.flightSuretyApp.getInsuranceAmount.call(airline2,'ND1309',iTimestamp,{from:passenger});
    assert.equal(insuredAmount,0.5*config.weiMultiple,"wrong balance for insurance");
  });
});