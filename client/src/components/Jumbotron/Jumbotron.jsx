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
        <h1 className="tendr">Tendr</h1>
        <p className="lead">The fastest way to split a bill.</p>
        <p className="subtitle">Take a photo of the receipt.</p>
        <p className="subtitle">Let Tendr fill it in.</p>
        <br />
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
