
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

let map = new Map();
map.set(0, 'No flight event information yet.');
map.set(10, 'The flight is on time.');
map.set(20, 'The flight is late because of airline.');
map.set(30, 'The flight is late because of weather.');
map.set(40, 'The flight is late because of techinal reasons.');
map.set(50, 'The flight is late because of other reasons.');

class App {
    constructor() {
        this.contract = new Contract('localhost', () => {

            
            
        });

        this.listenForFlightStatusUpdate();  
    }

    async checkIsOperational() {
        this.contract.isOperational()
                .then((result) => {
                    display(
                        true,
                        'display-wrapper',
                        'oper',
                        'Operational Status',
                        'Checks if smart contract is operational',
                        [ { label: 'Status', value: result} ]
                    );
                })
                .catch((err) => {
                    console.log("hola");
                    display(
                        true,
                        'display-wrapper',
                        'Operational Status',
                        'Checks if smart contract is operational',
                        [ { label: 'Status', error: err} ]
                    );
                });

    }


    async fetchFlightStatus(airline,flight,iTimestamp) {
        this.contract.fetchFlightStatus(airline,flight,iTimestamp)
            .then(() => {
                display(
                    true,
                    'result-wrapper',
                    'status',
                    'Oracles Report',
                    'Fetching flight status from oracles',
                    [
                        { label: String(flight), value: 'waiting for oracales response...if there is no reponse for a while, please click the button again!'}
                     ]
                );
            })
            .catch((error) => console.log(error));
    }

    async buyInsurance(airline,flight,iTimestamp,notional){

        this.contract.buyInsurance(airline,flight,iTimestamp,notional)
        .then(() => {
            display(
                false,
                'price-wrapper',
                'price',
                'Transaction summary',
                Date.now().toString(),
                [
                    { label: String(flight), value: 'Amount insured:' +String(notional)+ " ETH"}
                 ]
            );
        })
        .catch((error) => {
            console.log(error,airline,flight,iTimestamp,notional,error);
            display(
                false,
                'price-wrapper',
                'price',
                'Transaction summary',
                'No transaction',
                [
                    { label: "Reason", value: error}
                 ]
            );
        });
    }

    async fetchPassengerBalance(){
        this.contract.fetchPassengerBalance()
        .then((result) => {
            display(
                true,
                'balance-wrapper',
                'bal',
                'Current payout balance',
                Date.now().toString(),
                [
                    { label: "ETH", value:String(result)}
                 ]
            );
        });
    }

    async withdrawBalance(){
        this.contract.withdrawBalance()
        .then((result) => {
            display(
                true,
                'balance-wrapper',
                'bal',
                'Current payout balance',
                Date.now().toString(),
                [
                    { label: "ETH", value:String(0)}
                 ]
            );

            display(
                true,
                'withdraw-wrapper',
                'balw',
                'Withdraw status',
                Date.now().toString(),
                [
                    { label: "Balance wthdraw", value:'success'}
                 ]
            );
        })
        .catch((error) => {
            console.log(error)
            display(
                true,
                'withdraw-wrapper',
                'balw',
                'Withdraw status',
                'No transaction',
                [
                    { label: "Balance wthdraw", value: "Failed"}
                 ]
            );
        });
    }

    async listenForFlightStatusUpdate() {
        this.contract.flightSuretyApp.events.FlightStatusInfo({fromBlock: 0},
            (error, event) => {
                if (error) return console.log(error);
                if (!event.returnValues) return console.error("No returnValues");
                console.log( event.returnValues.status);
                display(
                    true,
                    'result-wrapper',
                    'status',
                    'Oracles Report',
                    'Fetching flight status from oracles',
                    [
                        { label: String(event.returnValues.flight), value: String(map.get( parseInt(event.returnValues.status)))+" " + String(event.returnValues.timestamp)}
                     ]
                );
            });
        
    }
}

const Application = new App();


document.addEventListener('click', (ev) => {
    if (!ev.target.dataset.action) return;

    const action = parseFloat(ev.target.dataset.action);
    var selectedAirline = '';
    var iTimeStamp = '';

    switch(action) {
        case 0:
            let flight = DOM.elid('flight-number').value;
            
            selectedAirline = DOM.elid('flight-number').options[DOM.elid('flight-number').selectedIndex].getAttribute("airline");
            iTimeStamp      = DOM.elid('flight-number').options[DOM.elid('flight-number').selectedIndex].getAttribute("timestamp");

            Application.fetchFlightStatus(selectedAirline,flight,iTimeStamp);
            break;
        case 1:
            let flight2 = DOM.elid('flight-number').value;
            selectedAirline = DOM.elid('flight-number').options[DOM.elid('flight-number').selectedIndex].getAttribute("airline");
            iTimeStamp      = DOM.elid('flight-number').options[DOM.elid('flight-number').selectedIndex].getAttribute("timestamp");

            let notional = DOM.elid('ether').value;
            Application.buyInsurance(selectedAirline,flight2,iTimeStamp,notional);
            break;
        case 2:
            Application.fetchPassengerBalance();
            break;
        case 3:
            Application.withdrawBalance();
            break;

            case 10:
            Application.checkIsOperational();
            break;
    }
});

var i_rows = 0;

function display(is_clear,display_id,result_id,title, description, results) {
    let displayDiv = DOM.elid(display_id);
    if (is_clear)
    {
        displayDiv.innerHTML="";
    }
    let section = DOM.section();

    //section.appendChild(DOM.h3(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {

        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-2 field value'}, title));        
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-6 field-value',id:result_id}, result.error ? String(result.error) : String(result.value)));

        section.appendChild(row);
    })
    displayDiv.append(section);
}


