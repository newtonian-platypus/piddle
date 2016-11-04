import React from 'react';
import { FormGroup, FormControl, InputGroup } from 'react-bootstrap';
import './TaxField.css';

/**
 * @class TaxField
 * @param {object} props
 * @param {function} props.changeTaxValue
 * @param {symbol} props.interactionType
 * @param {number} props.taxValue
 */
const TaxField = (props) => {
  const isEditable = (
    props.interactionType === Symbol.for('new')
    || props.interactionType === Symbol.for('edit')
  );

  return (
    <div className="taxField">
      {isEditable &&
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>Tax</InputGroup.Addon>
            <FormControl
              type="number"
              name="tax"
              placeholder="Tax"
              value={props.taxValue}
              onChange={event => (
                props.changeTaxValue(Number.parseFloat(event.target.value))
              )}
            />
          </InputGroup>
        </FormGroup>
      }
      {!isEditable &&
        <h4>Tax: {props.taxValue}</h4>
      }
    </div>
  );
};

TaxField.propTypes = {
  changeTaxValue: React.PropTypes.func.isRequired,
  interactionType: React.PropTypes.symbol.isRequired,
  taxValue: React.PropTypes.number.isRequired,
};

export default TaxField;

