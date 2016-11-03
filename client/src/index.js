import './hostConfig';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import './index.css';
import App from './components/App';
import Bill from './components/Bill';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import BillList from './components/BillList'
// import Bootstrap from 'react-bootstrap';

ReactDOM.render((
  <div>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Route path="bill" component={Bill}>
          <Route path=":id" component={Bill} />
        </Route>
        <Route path="MyBills" component={BillList} />
        <Route path="login" component={Login} />
        <Route path="signup" component={Signup} />
        <Route path="profile" component={Profile} />
      </Route>
    </Router>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css" />
  </div>
  ),
  // eslint-disable-next-line no-undef
  document.getElementById('root')
);
