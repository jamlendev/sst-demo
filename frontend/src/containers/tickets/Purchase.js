import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import moment from 'moment';
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
  const [fields, handleFieldChange] = useFormFields({
    ticketType: "",
    startDate: moment(),
    endDate: undefined,
    cost: 0
  });
  const history = useHistory();

  useEffect(() => {
    onLoad();
  }, []);

  function getTicketTypes() {
    return API.get("tickets", "/ticket-types");
  }

  async function onLoad () {
    const types = await getTicketTypes();
    console.log({types});
    setTicketTypes(types);
    setTicketTypeOptions(Object.values(types).map(item => {
      return (
        <option key={item.code} value={item.code}>{item.name}</option>
      );
    }));
    setIsLoading(false);
  }

  function validateForm() {
    return true;
    return (
      fields.ticketType.length > 0 //&& fields.startDate.length > 0
    );
  }

  const handleSubmit = async (event) => {
    setIsSubmitting(true);
    event.preventDefault();
    // alert(`type: ${fields.ticketType}, startDate: ${fields.startDate}, endDate: ${fields.endDate}, cost: ${ticketType.cost}`);
    await API.post("tickets", "/tickets", { body: fields });
    setIsSubmitting(false);
    history.push("/tickets");
  };

  const handleSelect=(e)=>{
    const selectedType = ticketTypes[e.target.value];
    fields.ticketType = selectedType.code;
    selectTicketType(selectedType);
    fields.cost = selectedType.cost;
  };
  const handleDateChange = (e) => {
    fields.endDate = moment(e.target.value).add({days: ticketType.expires});
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
          <Form.Control type="date" onChange={handleDateChange}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="endDate">
          <Form.Label>End Date</Form.Label>
          <Form.Control plaintext readOnly defaultValue={fields.endDate?.format("DD/MM/YYYY")} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Cost</Form.Label>
          <Form.Control plaintext readOnly defaultValue={fields.cost > 0 ? fields.cost.toLocaleString('en-GB', {
            style: 'currency',
            currency: 'GBP',
          }) : ""} />
        </Form.Group>
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
