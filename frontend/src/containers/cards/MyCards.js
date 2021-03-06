import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import moment from 'moment';

import { useAppContext } from "../../lib/contextLib";
import { onError } from "../../lib/errorLib";


/*
export default class MyCards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {cards: [{
      name: 'test card',
      id: 'fdbeb959-1fc9-410d-b034-55c8b6389638',
      status: 'active',
      dates: {
        issued: '2021-11-24T14:23:23Z',
        expires: '2024-10-30T00:00:00Z'
      },
      numbers: {
        serial: '1454652474WAL0002230',
        isrn: '633597024000118411'
      }
    }]};

    // this.handleChange = this.handleChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    if (this.state.cards.length > 0)
      return (
          <CardGroup>
          {this.state.cards.map((card) => (
              <LinkContainer key={card.id} to={`/cards/${card.id}`}>
              <Card>
                <Card.Body>
                  <Card.Title>{ card.name }</Card.Title>
              <Card.Text>
              Body text
              </Card.Text>
              <Card.Footer>
              Footer
              </Card.Footer>
                </Card.Body>
              </Card>
              </LinkContainer>
          ))}
          </CardGroup>
      );

    return (
      <Jumbotron fluid>
      <Container>
      <h1>No Cards</h1>
      <p>
      You have no registered cards.
        </p>
      </Container>
      </Jumbotron>
    );
  }
}
*/

export default function MyCards() {
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState([]);

  function getCards() {
    return API.get("cards", "/cards");
  }
  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const tickets = await getCards();
        setCards(tickets);
      } catch (e) {
        onError(e);
      }

      setIsLoading(false);
    }

    onLoad();
  }, [isAuthenticated]);

  function activeCard(card) {
    return (
      <>
      <Card bg='light'>
      <Card.Img variant="top" src="/TFGM.jpeg" />
      <Card.Body>
      <Card.Title>{card.status}</Card.Title>
      <Card.Text>
      <p>Expires: {card.expiry}<br />
      Issued: {card.issued}<br />
      ISRN: {card.cardId}</p>
      </Card.Text>
      </Card.Body>
      </Card>
        </>
    );
  }

  function isCardActive(card) {
    return card.status === 'ACTIVE';
  }
  function renderCardList() {
    if (cards.length > 0) {
      return (
        <>
          <CardGroup>
            {cards.map((card) =>
                       <Card bg={isCardActive(card) ? 'light' : 'warning'}>
                       <Card.Img variant="top" src="/TFGM.jpeg" />
                       <Card.Body>
                       <Card.Title>{card.status}</Card.Title>
                       <Card.Text>
                       <p>
                       {isCardActive(card)
                        ? `Expires: ${card.expiry}<br />
                        Issued: ${card.issued}<br />
                        ISRN: ${card.cardId}`
                        : ''}
                       </p>
                       </Card.Text>
                       </Card.Body>
                       </Card>
            )}
          </CardGroup>
        </>
      );
    }

    return (
        <Container>
          <h1>No Cards</h1>
          <p>
            You have no Cards associated with your account.
          </p>
        </Container>
    );
  }

  function renderLander() {
    // history.push('/login');
  }

  function renderCards() {
    return (
        <div className="cards">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Cards</h2>
          <ListGroup>
            <RequestNewCard />
            {!isLoading && renderCardList()}
          </ListGroup>
        </div>
    );
  }

  function RequestNewCard() {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleContinue = async () => {
      await API.post('cards', '/cards');
      const cards = await getCards();
      setCards(cards);
      setShow(false);
    };

    return (
      <>
        <Button variant="primary" onClick={handleShow}>
          <BsPencilSquare size={17} />
          Request New Card
        </Button>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>New Card Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to request a new card?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleContinue}>
              Continue
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  return (
      <div className="Home">
      {isAuthenticated ? renderCards() : renderLander()}
    </div>
  );
}
