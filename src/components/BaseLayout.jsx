import React from "react";
import { useMachine } from "@xstate/react";
import bookingMachine from "../Machines/bookingMachine";

export const BaseLayout = () => {
  const [state, send] = useMachine(bookingMachine);
  console.log(state);
  return (
    <>
      <div>
        <h1>This is a State Machine</h1>
      </div>
    </>
  );
};