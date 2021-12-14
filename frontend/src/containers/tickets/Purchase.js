import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Accordion from 'react-bootstrap/Accordion';
import moment from "moment";
import { set } from 'lodash';
import { useHistory } from "react-router-dom";
import { useFormFields } from "../../lib/hooksLib";
import LoaderButton from "../../components/LoaderButton";
import "./Purchase.css";

export default function Purchase() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketTypes, setTicketTypes] = useState({});
  const [ticketType, selectTicketType] = useState({});
  const [ticketTypeOptions, setTicketTypeOptions] = useState([]);
  const [cards, setCards] = useState([]);
  const [cardOptions, setCardOptions] = useState([]);
  const [fields, handleFieldChange] = useFormFields({
    ticketType: "",
    startDate: moment(),
    endDate: undefined,
    cost: 0,
    card: {
      isrn: undefined,
      request: undefined,
      new: false,
      existing: false,
    },
  });
  const history = useHistory();

  useEffect(() => {
    onLoad();
  }, []);

  function getTicketTypes() {
    return API.get("tickets", "/ticket-types");
  }

  function getCards() {
    return API.get("cards", "/cards");
  }

  async function onLoad() {
    const types = await getTicketTypes();
    console.log({ types });
    setTicketTypes(types);
    setTicketTypeOptions(
      Object.values(types).map((item) => {
        return (
          <option key={item.code} value={item.code}>
            {item.name}
          </option>
        );
      })
    );
    const cards = await getCards();
    console.log(cards);
    setCards(cards);
    setCardOptions(Object.values(cards).map((item) => {
      return (
        <option key={item.cardId} value={item.cardId}>
          {item.status === 'ACTIVE' ? `${item.status} | ${item.cardId}` : `${ item.status }`}
        </option>
      );
    }));
    setIsLoading(false);
  }

  function validateForm() {
    return true;
    // return (
    //   fields.ticketType.length > 0 //&& fields.startDate.length > 0
    // );
  }

  const handleSubmit = async (event) => {
    setIsSubmitting(true);
    event.preventDefault();
    alert(JSON.stringify(fields));
    await API.post("tickets", "/tickets", { body: fields });
    setIsSubmitting(false);
    history.push("/tickets");
  };

  const handleChange = (event) => {
    // This should be able to be generic and use the controlId as a path to set... but it doesn't work
    // set(fields, event.target.id, event.target.value);
    fields.card.isrn = event.target.value;
    console.log(`Setting ${event.target.id} to ${event.target.value}`, fields);
    fields.card.existing = true;
    handleFieldChange(event);
  };

  const resetCard = (e) => {
    delete fields['card.isrn'];
    delete fields['toggle-check'];
    delete fields[''];
    fields.card = {
      isrn: undefined,
      request: undefined,
      new: false,
      existing: false,
    };
  };

  const handleSelect = (e) => {
    const selectedType = ticketTypes[e.target.value];
    fields.ticketType = selectedType.code;
    selectTicketType(selectedType);
    fields.cost = selectedType.cost;
    handleFieldChange(e);
  };

  const handleCardSelect = (e) => {
    console.log(e.target.value);
    const selectedCard = cards.find((c) => c.cardId === e.target.value);
    if (selectedCard){
      if (selectedCard.status === 'ACTIVE')
        fields.card = {
          isrn: selectedCard.cardId,
          existing: true,
        };
    else
      fields.card = {
        request: selectedCard.cardId
      };
    }
    // handleFieldChange(e);
  };

  const handleNewCard = (e) => {
    fields.card.new = e.currentTarget.checked;
    handleFieldChange(e);
  };

  const handleDateChange = (e) => {
    fields.endDate = moment(e.target.value).add({ days: ticketType.expires });
    handleFieldChange(e);
  };

  if (isLoading)
    return (
      <div className="Purchase">
        <div className="lander">
          <h1>Purchase Tickets</h1>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      </div>
    );

  return (
    <div className="Purchase">
      <div className="lander">
        <h1>Purchase Tickets</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Ticket Type</Form.Label>
            <Form.Control as="select" onChange={handleSelect}>
              <option>Select ticket type</option>
              {ticketTypeOptions}
            </Form.Control>
          </Form.Group>
          <Form.Group className="mb-3" controlId="startDate">
            <Form.Label>Start Date</Form.Label>
            <Form.Control type="date" onChange={handleDateChange} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="endDate">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              plaintext
              readOnly
              defaultValue={fields.endDate?.format("DD/MM/YYYY")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cost</Form.Label>
            <Form.Control
              plaintext
              readOnly
              defaultValue={
                fields.cost > 0
                  ? fields.cost.toLocaleString("en-GB", {
                      style: "currency",
                      currency: "GBP",
                    })
                  : ""
              }
            />
          </Form.Group>
          <Accordion defaultActiveKey="2">
            <Accordion.Item eventKey="0">
              <Accordion.Header onClick={resetCard}>Select my card</Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Select card</Form.Label>
                  <Form.Control as="select" onChange={handleCardSelect}>
                    <option>---- My Cards ----</option>
                    {cardOptions}
                  </Form.Control>
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header onClick={resetCard}>Request new card</Accordion.Header>
              <Accordion.Body>
                <ToggleButton
                  className="mb-2"
                  id="toggle-check"
                  type="checkbox"
                  variant="outline-primary"
                  checked={fields.card.new}
                  value="1"
                  onChange={(e) => handleNewCard(e)}
                >
                  Click to request a new card
                </ToggleButton>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header onClick={resetCard}>Use existing card</Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-3" controlId="card.isrn">
                  <Form.Label>Smart Card ISRN</Form.Label>
                  <Form.Control size="lg" type="text" placeholder="Card ISRN" onChange={handleChange} />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          <LoaderButton
            block
            size="lg"
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!validateForm()}
          >
            Purchase
          </LoaderButton>
        </Form>
      </div>
    </div>
  );
}
