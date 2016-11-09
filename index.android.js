/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import createLogger from 'redux-logger'
import thunk from 'redux-thunk';
import {employeeReducer} from './src/employee';
import {authReducer} from './src/auth';
import {Router} from './src/Router'

const rootReducer = combineReducers({});
const store = createStore(rootReducer, applyMiddleware(thunk, createLogger({colors: {}})));

export default class basicProject extends Component {
  render() {
    return (
      <Router store={store}/>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('basicProject', () => basicProject);
