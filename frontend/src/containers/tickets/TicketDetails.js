import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { useParams, useHistory } from "react-router-dom";
import Card from "react-bootstrap/Card";

import { useAppContext } from "../../lib/contextLib";
import { onError } from "../../lib/errorLib";
import LoaderButton from "../../components/LoaderButton";

export default function TicketHistory() {
  const { id } = useParams();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [ticket, setTicket] = useState();

  useEffect(() => {
    async function onLoad() {
      const getTicket = async () => API.get("tickets", `/tickets/${id}`);

      try {
        const ticket = await getTicket();
        setTicket(ticket);
      } catch (e) {
        onError(e);
      }

      setIsLoading(false);
    }

    onLoad();
  }, [id]);

  const deleteTicket = async () => API.del("tickets", `/tickets/${id}`);

  async function handleDelete(event) {
    event.preventDefault();

    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTicket();
      history.push("/tickets");
    } catch (e) {
      onError(e);
      setIsDeleting(false);
    }
  }

  return (
    <div className="Ticket">
      {ticket && (
        <>
        <Card>
          <Card.Img variant="top" src="/TFGM.jpeg" />
          <Card.Body>
            <Card.Title>{ticket.ticketType.name}</Card.Title>
            <Card.Text>
              <p>Expires: {ticket.endDate}</p>
              <p> Starts: {ticket.startDate} </p>
            </Card.Text>
          </Card.Body>
          <Card.Footer>
            <small className="text-muted">{ticket.cost.toLocaleString('en-GB', {
              style: 'currency',
              currency: 'GBP',
            })}</small>
          </Card.Footer>
        </Card>
        <LoaderButton
          block
          size="lg"
          variant="danger"
          onClick={handleDelete}
          isLoading={isDeleting}
            >
          Delete
        </LoaderButton>
        </>
      )}
    </div>
  );
}
