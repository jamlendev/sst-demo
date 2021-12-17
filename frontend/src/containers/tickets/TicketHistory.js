import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";
import Modal from "react-bootstrap/Modal";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CardGroup from "react-bootstrap/Card";
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
  const [show, setShow] = useState(false);
  const [ticketState, setTicketState] = useState({});

  const handleClose = () => setShow(false);
  const handleShow = async (externalRef) => {
    const status = await getTicketState(externalRef);
    setTicketState(status);
    return setShow(true);
  };

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
  async function getTicketState(props) {
    try {
      const externalRef = props.target.attributes?.externalRef?.value;
      const state = await API.get('tickets', `/tickets/${externalRef}/state`);
      console.log(state);
      return state;
    } catch (e) {
     return onError(e);
    }
  }
  function isExpired(endDate) {
    //This would be on the graphQL response
    return moment().isSameOrBefore(moment(endDate), 'day');
  }
  function statusToBadgeColour(status) {
    switch (status) {
      case 'Requested': return 'bg-primary';
      default: return 'bg-warning';
    }
  }

  function renderTicketList(notes) {
    if (tickets.length > 0)
    return (
      <>
        <CardGroup>
          {tickets.map(({ ticketId, ticketType, startDate, endDate, cost, createdAt, status, externalRef }) => (
              <Card bg={isExpired(endDate) ? 'light' : 'warning' }>
                <Card.Img variant="top" src="/TFGM.jpeg"/>
                <Card.Body>
                  <Card.Title>
                    {ticketType.name}&nbsp;
                    <Badge onClick={handleShow} externalRef={externalRef} className={`mb-3 ${statusToBadgeColour(status)}`}>
                      {status}
                    </Badge>
                    <Modal show={show} size="lg" onHide={handleClose}>
                      <Modal.Header>
                        <Modal.Title>Request details</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Row>
                          <pre><code>
                   {JSON.stringify(ticketState.fulfilmentRequest, null, 2)}
                 </code></pre>
                        </Row>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                          Close
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </Card.Title>
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
          ))}
        </CardGroup>
      </>
    );

    return (
        <Container>
          <h1>No tickets</h1>
          <p>
            You have no previously purchased tickets.
          </p>
        </Container>
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
