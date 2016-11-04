import jwtDecode from 'jwt-decode';
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Request from '../../utils/requestHandler';

class Profile extends Component {
  constructor(props) {
    super(props);

    // Send the user away if they're not already logged in
    // eslint-disable-next-line no-undef
    const token = localStorage.getItem('piddleToken');
    if (!token) {
      this.props.router.push('/login');
      this.state = {
        emailAddress: '',
        name: '',
        squareId: '',
        paypalId: '',
      };
    } else {
      const userData = jwtDecode(token);
      this.state = {
        oldEmailAddress: userData.emailAddress,
        emailAddress: userData.emailAddress,
        name: userData.name,
        squareId: userData.squareId,
        paypalId: userData.paypalId,
      };
    }

    this.submitUpdateForm = this.submitUpdateForm.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const stateObj = {};
    stateObj[event.target.name] = event.target.value;
    this.setState(stateObj);
  }

  submitUpdateForm(event) {
    event.preventDefault();
    console.log(this.state);
    Request.putUpdate(this.state, (res) => {
      if (res.status === 201) {
      } else {
        this.setState({ error: 'Error updating info.' });
      }
      localStorage.removeItem('piddleToken');
      window.location = ('/login');
    });
    
  }

  render() {
    return (
      <div className="profilePage">
        <h1>Welcome to your profile</h1>
        <h3>Update any info below</h3>
        <form id="signupForm">
          <table>
            <tbody>
              <tr>
                <td><label htmlFor="emailAddress">Email</label></td>
                <td><input
                  type="text"
                  className="updateInput"
                  id="emailAddress"
                  name="emailAddress"
                  onChange={event => this.handleInputChange(event)}
                  value={this.state.emailAddress}
                /></td>
              </tr>
              <tr>
                <td><label htmlFor="name">Name</label></td>
                <td><input
                  type="text"
                  className="updateInput"
                  id="name"
                  name="name"
                  onChange={event => this.handleInputChange(event)}
                  value={this.state.name}
                /></td>
              </tr>
              <tr>
                <td><label htmlFor="squareId">Square ID</label></td>
                <td><input
                  type="text"
                  className="updateInput"
                  id="squareId"
                  name="squareId"
                  onChange={event => this.handleInputChange(event)}
                  value={this.state.squareId}
                /></td>
              </tr>
              <tr>
                <td><label htmlFor="paypalId">PayPal ID</label></td>
                <td><input
                  type="text"
                  className="updateInput"
                  id="paypalId"
                  name="paypalId"
                  onChange={event => this.handleInputChange(event)}
                  value={this.state.paypalId}
                /></td>
              </tr>
            </tbody>
          </table>
          <input
            type="submit"
            className="submitUpdate"
            id="submitUpdate"
            value="Update"
            onClick={event => this.submitUpdateForm(event)}
          />
        </form>
      </div>
    );
  }
}

Profile.propTypes = {
  router: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }),
};

export default withRouter(Profile);
