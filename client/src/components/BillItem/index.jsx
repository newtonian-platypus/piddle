import React from 'react';
import { FormGroup, FormControl, InputGroup, Button, Row, Col } from 'react-bootstrap';
import './BillItem.css';


/**
 * @class BillItem
 * @param {object} props
 * @param {function} props.changeBillItem
 * @param {function} props.deleteBillItem
 * @param {string} props.description
 * @param {number} props.index
 * @param {symbol} props.interactionType
 * @param {number} props.price
 */
const BillItem = (props) => {
  const isEditable = (
    props.interactionType === Symbol.for('new')
    || props.interactionType === Symbol.for('edit')
  );

  const maxDecimalFix = (number) => {
    // check if item has more than two decimals
    const decimalPlaces = (number.toString().split('.')[1] || []).length;
    if (decimalPlaces > 2) {
      number = Number(number).toFixed(2);
    }
    return Number(number);
  }

  const fieldChange = (event) => {
    const field = {
      name: event.target.getAttribute('name').match(/([a-z]+)$/)[1],
      tagName: event.target.tagName,
      type: event.target.getAttribute('type'),
    };

    if (field.type === 'number') {
      field.value = maxDecimalFix(event.target.value);
    } else {
      field.value = event.target.value;
    }

    props.changeBillItem(props.index, {
      [field.name]: field.value,
    });
  };

  return (
    <div className="BillItem">
      {isEditable &&
        <div>
          <FormControl
            className="description"
            name={`billItem-${props.index}-description`}
            onChange={fieldChange}
            placeholder="Add Item"
            type="text"
            value={props.description}
            disabled={!!props.debtorId}
          />
          <FormGroup>
            <InputGroup>
              <InputGroup.Addon>$</InputGroup.Addon>
              <FormControl
                className="price"
                name={`billItem-${props.index}-price`}
                onChange={fieldChange}
                placeholder="Price"
                type="number"
                value={props.price}
                disabled={!!props.debtorId}
              />
              <InputGroup.Button>
                <Button
                  bsStyle="danger"
                  onClick={event => props.deleteBillItem(event, props.index)}
                  disabled={!!props.debtorId}>
                  Delete
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
        </div>
      }
      {!isEditable &&
        <div>
          <FormGroup validationState={!!props.debtorId ? "success" : "warning"} inline>
            <InputGroup>
              <InputGroup.Addon>
                Claim  <input
                  type="checkbox"
                  value={props.id}
                  checked={!!props.debtorId}
                  onChange={props.claimBillItem}
                  disabled={!!props.paid}
                />
              </InputGroup.Addon>
              <InputGroup.Addon>{props.description}</InputGroup.Addon>
              <InputGroup.Addon>{props.price}</InputGroup.Addon>
            </InputGroup>
          </FormGroup>
        </div>
      }
    </div>
  );
};

// some of the below should not be required if our app stays constructed
// as basically a one page application
BillItem.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  changeBillItem: React.PropTypes.func.isRequired,
  claimBillItem: React.PropTypes.func.isRequired,
  deleteBillItem: React.PropTypes.func.isRequired,
  // debtorId: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  // id: React.PropTypes.string.isRequired,
  index: React.PropTypes.number.isRequired,
  interactionType: React.PropTypes.symbol.isRequired,
  // paid: React.PropTypes.bool.isRequired,
  price: React.PropTypes.number.isRequired,
};

export default BillItem;


