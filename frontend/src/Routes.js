import React from "react";
import { Route, Switch } from "react-router-dom";

import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import { Home, NotFound, Login, Signup, TicketHistory, TicketDetails, Purchase } from "./containers";

export default function Routes() {
  return (
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <UnauthenticatedRoute exact path="/login">
          <Login />
        </UnauthenticatedRoute>
        <UnauthenticatedRoute exact path="/signup">
          <Signup />
        </UnauthenticatedRoute>
        <AuthenticatedRoute exact path="/tickets">
          <TicketHistory />
        </AuthenticatedRoute>
        <AuthenticatedRoute exact path="/tickets/purchase">
          <Purchase />
        </AuthenticatedRoute>
        <AuthenticatedRoute exact path="/tickets/:id">
          <TicketDetails />
        </AuthenticatedRoute>
        <Route>
          <NotFound />
        </Route>
      </Switch>
  );
}
