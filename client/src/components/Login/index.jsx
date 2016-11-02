import React, { Component } from 'react';
import { Link, withRouter } from 'react-router';
import Request from '../../utils/requestHandler';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputs: {
        emailAddress: '',
        password: '',
      },
      error: '',
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.submitLoginForm = this.submitLoginForm.bind(this);
  }

  componentDidMount() {
    // Send the user away if they're already logged in
    // eslint-disable-next-line no-undef
    if (localStorage.getItem('piddleToken')) {
      this.props.router.push('/');
    }
  }

  handleInputChange(event) {
    const stateObj = this.state.inputs;
    stateObj[event.target.name] = event.target.value;
    this.setState({ inputs: stateObj });
  }

  submitLoginForm(event) {
    event.preventDefault();
    Request.postLogin({emailAddress: this.state.inputs.emailAddress.toLowerCase(), password: this.state.inputs.password}, (res) => {
      if (res.status === 201) {
        // eslint-disable-next-line no-undef
        localStorage.setItem('piddleToken', res.body.data.token);
        this.props.router.push('/');
      } else {
        this.setState({ error: res.body.error.message });
      }
    });
  }

  render() {
    return (
      <div className="loginPage">
        <p className="Login-intro">
          Welcome to the login page
        </p>
        <form id="loginForm">
          <label htmlFor="emailAddress">email</label>
          <input
            type="text"
            className="loginForm"
            id="emailAddress"
            name="emailAddress"
            onChange={event => this.handleInputChange(event)}
          />
          <label htmlFor="password">password</label>
          <input
            type="password"
            className="loginForm"
            id="password"
            name="password"
            onChange={event => this.handleInputChange(event)}
          />
          <input
            type="submit"
            className="submitLogin"
            id="submitLogin"
            value="Login"
            onClick={event => this.submitLoginForm(event)}
          />
        </form>
        <div className="loginError">{this.state.error}</div>
        <span>Need an account? </span>
        <Link to="/signup">Sign up</Link>
      </div>
    );
  }
}

Login.propTypes = {
  router: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }),
};

export default withRouter(Login);
