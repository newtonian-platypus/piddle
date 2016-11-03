import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Nav, Navbar, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import './NavBar.css';

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      links: {
        1: '/bill',
        2: '/bill',
        3: '/login',
        4: '/signup',
        5: '/profile',
        6: '/myBills',
        7: '/login',
      },
    };
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handleBrandClick = this.handleBrandClick.bind(this);
  }

  handleBrandClick() {
    browserHistory.push('/');
  }

  handleLinkClick(eventKey) {
    browserHistory.push(this.state.links[eventKey]);
  }

  handleLogoutClick() {
    // eslint-disable-next-line no-undef
    localStorage.removeItem('piddleToken');
    window.location = ('/login');
  }

  render() {
    return (
      <Navbar inverse collapseOnSelect fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a onClick={this.handleBrandClick}>Piddle</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavItem eventKey={1} onSelect={this.handleLinkClick}>Make Bill</NavItem>
            <NavItem eventKey={2} onSelect={this.handleLinkClick}>Pay Bill</NavItem>
          </Nav>
          <Nav pullRight>
            <NavDropdown title="Account" id="basic-nav-dropdown">
              <MenuItem eventKey={3} onSelect={this.handleLinkClick}>Log In</MenuItem>
              <MenuItem eventKey={4} onSelect={this.handleLinkClick}>Sign Up</MenuItem>
              <MenuItem eventKey={5} onSelect={this.handleLinkClick}>Profile</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey={6} onSelect={this.handleLinkClick}>My Bills</MenuItem>
              <MenuItem eventKey={7} onSelect={this.handleLogoutClick}>Log Out</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
export default NavBar;
