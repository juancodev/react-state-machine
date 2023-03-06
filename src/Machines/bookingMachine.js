import { createMachine, assign } from "xstate";
import { fetchCountries } from "../Utils/api";

const fillCountries = {
  initial: "loading",
  states: {
    loading: {
      //invoke services
      invoke: {
        id: 'getCountries',
        src: () => fetchCountries,
        onDone: {
          target: 'success',
          actions: assign({
            countries: (context, event) => event.data,
          })
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: 'Fail request',
          })
        }
      }
    },
    success: {},
    failure: {
      on: {
        RETRY: { target: "loading" },
      },
    },
  },
};

const bookingMachine = createMachine(
  {
    id: "buy plane tickets",
    initial: "initial",
    context: {
      passengers: [],
      selectedCountry: "",
      countries: [],
      error: '',
    },
    states: {
      initial: {
        on: {
          START: {
            target: "search",
            actions: 'printInitial'
          },
        },
      },
      search: {
        //Actions
        // entry: 'printEnter',
        // exit: 'printExit',
        on: {
          CONTINUE: {
            target: "passengers",
            actions: assign({
              selectedCountry: (context, event) => event.selectedCountry,
            }),
          },
          CANCEL: "initial",
        },
        //xstate know that is a child state machine
        ...fillCountries,
      },
      tickets: {
        after: {
          5000: {
            target: 'initial',
            actions: 'cleanContext',
          }
        },
        on: {
          FINISH: {
            target: 'initial',
            actions: 'cleanContext',
          },
        },
      },
      passengers: {
        on: {
          DONE: {
            target: "tickets",
            cond: "moreThanOnePassenger"
          },
          CANCEL: {
            target: "initial",
            actions: "cleanContext",
          },
          ADD: {
            target: "passengers",
            actions: assign((context, event) =>
              context.passengers.push(event.newPassenger)
            ),
          },
        },
      },
    },
  },
  {
    actions: {
      printInitial: () => console.log('print initial'),
      // printEnter: () => console.log('print enter to search'),
      // printExit: () => console.log('print exit to search'),
      cleanContext: assign((context) => {
        context.selectedCountry = "";
        context.passengers = [];
        return context;
      }),
    },
    guards: {
      moreThanOnePassenger: (context) => {
        return context.passengers.length > 0;
      }
    },
  }
);

export default bookingMachine;
