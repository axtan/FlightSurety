pragma solidity ^0.5.15;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/
    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    struct Airline {
        bool isRegistered;
        bool isFunded;
        address[] voters;
        uint256 numVotes;
    }

    uint256 private registeredAirlines;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
    }
    mapping(bytes32 => Flight) private flights;

    struct Passenger{
        uint256 balance;
    }

    struct Insurance{
        address[] insuredPassengers;
        mapping(address => uint256) insuredAmount;
        bool isProccessed;
    }
    
    
    mapping (address => Airline) airlines;
    mapping (address => bool) authorizedCallers;
    mapping (address => Passenger) passengers;
    mapping (bytes32 => Insurance) insurance;
    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                    address firstAirLine
                                ) 
                                public 
    {
        contractOwner = msg.sender;

        // register 1st airline when deploy
        airlines[firstAirLine].isRegistered =true;
        airlines[firstAirLine].isFunded =false;
        registeredAirlines=1;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    modifier differentModeRequest(bool status) {
        require(status != operational, "Contract already in the state requested");
        _;
    }
    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier isAuthorizedCaller()
    {   
        require(authorizedCallers[msg.sender],"caller is not authorized");
        _;
    }

    modifier isRegistered(address _address)
    {
        require(airlines[_address].isRegistered, "Caller is not registered");
        _;
    }

    modifier isFunded(address _address)
    {
        require(airlines[_address].isFunded, "Caller is not funded");
        _;
    }

    modifier requireFlightRegistered(address airline, string memory flight, uint256 timestamp)
    {
    require(flights[getFlightKey(airline, flight, timestamp)].isRegistered == true,"Flight is not registered");
        _;
    }

    modifier requireIsNotFlightAlreadyRegistered(address airline, string memory flight, uint256 timestamp)
    {
        require(flights[getFlightKey(airline, flight, timestamp)].isRegistered != true,"Flight already registered");
        _;
    }

    modifier requireDepartMoreThan1Day(uint256 timestamp)
    {
        require(block.timestamp + (3600*24) < timestamp,"Cant register flights that depart in less than 24 hours");
        _;
    }

    
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/
    function authorizeCaller(address _address)
    external
    requireContractOwner
    requireIsOperational
    {
        authorizedCallers[_address] = true;
    }
    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner
                            differentModeRequest(mode) 
    {
        operational = mode;
    }
    
    function test()
    public
    requireIsOperational
    {
    }

    function isAirlineRegistered
                        (
                            address _address
                        )
                        public
                        view
                        requireIsOperational
                        isAuthorizedCaller
                        returns(bool)
    {        
        return airlines[_address].isRegistered;
    }

    function isAirlineFunded
                        (
                            address _address
                        )
                        public
                        view
                        requireIsOperational
                        isAuthorizedCaller
                        returns(bool)
    {        
        return airlines[_address].isFunded;
    }

    function getNumRegisteredAirlines(
        )
    public
    view
    returns (uint256)
    {
        return registeredAirlines;
    }

    function getInsuranceAmount(
        address airline,
        string memory flight,
        uint256 timestamp,
        address passenger
    )
    public
    view
    requireIsOperational
    isAuthorizedCaller
    requireFlightRegistered(airline,flight,timestamp)
    
    returns (uint256)
    {   
        bytes32 flightId = getFlightKey(airline,flight,timestamp);
        return insurance[flightId].insuredAmount[passenger];
    }

    function getPassengerBalance(
        address _passenger
    )
    public
    view
    returns (uint256)
    {
        return passengers[_passenger].balance;
    }

    function getNumVotes(address newAirline)
    public
    view
    returns (uint256)
    {
        return airlines[newAirline].numVotes;
    }
    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    // function to authorize addresses (especially the App contract!) to call functions from flighSuretyData contract
    
   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (   
                                address newAirline,
                                address fundedAirline
                            )
                            external
                            isAuthorizedCaller
                            requireIsOperational
                            isRegistered(fundedAirline)
                            isFunded(fundedAirline)
    {
        airlines[newAirline].isRegistered=true;
        airlines[newAirline].isFunded =false;
        registeredAirlines=registeredAirlines.add(1);  // update number of registered airlines
    }
    
    // registered airlines support new airline to register
    function vote(address newAirline, address fundedAirline)
    external
    requireIsOperational
    isAuthorizedCaller
    isFunded(fundedAirline)
    {
        bool alreadyVoted = false;
        for(uint i=0; i<airlines[newAirline].voters.length; i++) {
            if (airlines[newAirline].voters[i] == fundedAirline) {
                alreadyVoted = true;
                break;
            }
        }
        require(!alreadyVoted, "Thsi airline already voted");
        airlines[newAirline].voters.push(fundedAirline);
        airlines[newAirline].numVotes=airlines[newAirline].numVotes.add(1);   
    }


    function registerFlight
                                (
                                    address airline,
                                    string calldata flight,
                                    uint256 timestamp
                                )
                                external
                                requireIsOperational
                                isAuthorizedCaller
                                requireIsNotFlightAlreadyRegistered(airline,flight,timestamp)
                                requireDepartMoreThan1Day(timestamp)
    {
       bytes32 flightId = getFlightKey(airline,flight,timestamp);

       flights[flightId].isRegistered = true;
       flights[flightId].updatedTimestamp = timestamp;
       flights[flightId].airline = airline;
    }

    function processFlightStatus
                                (
                                    address airline,
                                    string calldata flight,
                                    uint256 timestamp,
                                    uint8 statusCode,
                                    bool haveToCreditInsuree,
                                    uint256 payout
                                )
                                external
    {
        bytes32 flightId = getFlightKey(airline,flight,timestamp);
        flights[flightId].airline = airline;
        flights[flightId].statusCode = statusCode;
        flights[flightId].updatedTimestamp = timestamp;

        if(haveToCreditInsuree)
        {
            creditInsurees(airline,flight, timestamp,payout);
        }
    }

    
    

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (
                                address airline,
                                string memory flight,
                                uint256 timestamp,
                                address passenger,
                                uint256 amount                             
                            )
                            public
                            payable
                            isAuthorizedCaller
                            requireIsOperational
                            requireDepartMoreThan1Day(timestamp)
    {
        bytes32 flightId = getFlightKey(airline, flight, timestamp);

        bool isDuplicate = false;
        for(uint i=0; i<insurance[flightId].insuredPassengers.length; i++) {
            if (insurance[flightId].insuredPassengers[i] == passenger) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate)
        {
            insurance[flightId].insuredPassengers.push(passenger);
        }
        insurance[flightId].insuredAmount[passenger] = insurance[flightId].insuredAmount[passenger].add(amount); 
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    address airline,
                                    string memory flight,
                                    uint256 timestamp,
                                    uint payoutFactor
                                )
                                public
                                isAuthorizedCaller
                                requireIsOperational
    {
        bytes32 flightId = getFlightKey(airline, flight, timestamp);
        address passengerAddress;
        uint256 curPayout;
        if (!insurance[flightId].isProccessed)
        {
            for (uint i=0;i<insurance[flightId].insuredPassengers.length;i++)
            {
                passengerAddress = insurance[flightId].insuredPassengers[i];
                curPayout = insurance[flightId].insuredAmount[passengerAddress].mul(payoutFactor).div(100);
                passengers[passengerAddress].balance = passengers[passengerAddress].balance.add(curPayout);
            }
            insurance[flightId].isProccessed =true;
        }
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                                address payable passengerAddress
                            )
                            public
                            isAuthorizedCaller
                            requireIsOperational
    {
        require (passengers[passengerAddress].balance>0, "invalid withdraw amount");
        uint256 payAmount = passengers[passengerAddress].balance;
        passengers[passengerAddress].balance = 0;
        passengerAddress.transfer(payAmount);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (
                                address airline
                            )
    public
    payable
    isAuthorizedCaller
    requireIsOperational
    isRegistered(airline)
    {   
        airlines[airline].isFunded = true;
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function () 
    external 
    payable 
    isAuthorizedCaller 
    {
        require(msg.data.length == 0);
        fund (msg.sender);
    }
}

