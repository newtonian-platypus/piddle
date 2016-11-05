import React from 'react';
import { FormGroup, FormControl, InputGroup, Button } from 'react-bootstrap';
import './TipField.css';

/**
 * @class TipField
 * @param {object} props
 * @param {function} props.changeTipValue
 * @param {function} props.changeTipPercent
 * @param {symbol} props.interactionType
 * @param {number} props.tipValue
 */
const TipField = (props) => {
  const isEditable = (
    props.interactionType === Symbol.for('new')
    || props.interactionType === Symbol.for('edit')
  );

  const changeTipPercent = (event) => {
    event.preventDefault();
    props.changeTipPercent(event.target.getAttribute('data-percent'));
  };

  const changeTipValue = (event) => {
    props.changeTipValue(event.target.value);
  };

  return (
    <div className="tipField">
      {isEditable &&
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>Tip</InputGroup.Addon>
            <FormControl
              type="number"
              name="tip"
              placeholder="Tip"
              value={props.tipValue}
              onChange={changeTipValue}
            />
            <InputGroup.Button>
              <Button
                bsStyle="danger"
                onClick={changeTipPercent}
                data-percent="0"
              >
                No Tip
              </Button>
              <Button
                bsStyle="warning"
                onClick={changeTipPercent}
                data-percent="10"
              >
                10%
              </Button>
              <Button
                bsStyle="warning"
                onClick={changeTipPercent}
                data-percent="15"
              >
                15%
              </Button>
              <Button
                bsStyle="success"
                onClick={changeTipPercent}
                data-percent="20"
              >
                20%
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      }
      {!isEditable &&
        <h4 className="tip-total">Tip: ${props.tipValue}</h4>
      }
    </div>
  );
};

TipField.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  changeTipPercent: React.PropTypes.func.isRequired,
  changeTipValue: React.PropTypes.func.isRequired,
  interactionType: React.PropTypes.symbol.isRequired,
  // tipValue: React.PropTypes.number.isRequired,
};

export default TipField;

