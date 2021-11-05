import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/Card";
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import moment from 'moment';

import { useAppContext } from "../../lib/contextLib";
import { onError } from "../../lib/errorLib";

export default function TicketHistory() {
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const tickets = await getTickets();
        setTickets(tickets);
      } catch (e) {
        onError(e);
      }

      setIsLoading(false);
    }

    onLoad();
  }, [isAuthenticated]);

  function getTickets() {
    return API.get("tickets", "/tickets");
  }
  function isExpired(endDate) {
    //This would be on the graphQL response
    return moment().isSameOrBefore(moment(endDate), 'day');
  }

  function renderTicketList(notes) {
    if (tickets.length > 0)
    return (
      <>
        <CardGroup>
          {tickets.map(({ ticketId, ticketType, startDate, endDate, cost, createdAt }) => (
            <LinkContainer key={ticketId} to={`/tickets/${ticketId}`}>
              <Card bg={isExpired(endDate) ? 'light' : 'warning' }>
                <Card.Img variant="top" src="/TFGM.jpeg" />
                <Card.Body>
                  <Card.Title>{ticketType.name}</Card.Title>
                  <Card.Text>
                    <p>Expires: {endDate}<br />
                    Starts: {startDate} </p>
                  </Card.Text>
                </Card.Body>
                <Card.Footer>
                  <small className="text-muted">{cost.toLocaleString('en-GB', {
                    style: 'currency',
                    currency: 'GBP',
                  })}</small>
                </Card.Footer>
              </Card>
            </LinkContainer>
          ))}
        </CardGroup>
      </>
    );

    return (
      <Jumbotron fluid>
        <Container>
          <h1>No tickets</h1>
          <p>
            You have no previously purchased tickets.
          </p>
        </Container>
      </Jumbotron>
    );
  }

  function renderLander() {
    return (
        <div className="lander">
        <h1>Scratch</h1>
        <p className="text-muted">A simple note taking app</p>
        </div>
    );
  }

  function renderTickets() {
    return (
        <div className="tickets">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Ticket History</h2>
          <ListGroup>
            <LinkContainer to="/tickets/purchase">
              <ListGroup.Item action className="py-3 text-nowrap text-truncate">
                <BsPencilSquare size={17} />
                <span className="ml-2 font-weight-bold">Buy Tickets</span>
              </ListGroup.Item>
            </LinkContainer>
            {!isLoading && renderTicketList(tickets)}
          </ListGroup>
        </div>
    );
  }


  return (
      <div className="Home">
      {isAuthenticated ? renderTickets() : renderLander()}
    </div>
  );

}

/*
  <ListGroup.Item action>
  <span className="font-weight-bold">
  {ticketType.name}
  </span>
  <br />
  <span className="text-muted">
  Purchased: {new Date(createdAt).toLocaleString()}
  </span>
  </ListGroup.Item>
*/
