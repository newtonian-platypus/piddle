import React, { Component } from 'react';
import { Jumbotron, Button, Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router';
import './Jumbotron.css';

class JumbotronInstance extends Component {
  constructor(props) {
    super(props);
    this.handleCallToAction = this.handleCallToAction.bind(this);
  }

  handleCallToAction() {
    this.props.router.push('/bill');
  }

  render() {
    return (
      <Jumbotron>
        <h1>Tendr</h1>
        <p className="lead">Split the bill like a pro.</p>
        <Row>
          <Col xs={12} sm={6}>
            <p><Button bsStyle="primary" bsSize="large" onClick={this.handleCallToAction}>
              Split a Bill
            </Button></p>
          </Col>
          <Col xsHidden sm={6}>
          </Col>
        </Row>
      </Jumbotron>

    );
  }
}

export default withRouter(JumbotronInstance);
