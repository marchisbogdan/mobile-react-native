import React,{Component} from 'react';
import {Text, View, TextInput, StyleSheet, ActivityIndicator} from 'react-native';
import {login} from './service';
import {getLogger, registerRightAction, issueToText} from '../core/utils';
import styles from '../core/styles';

const log = getLogger('auth/Login');

const LOGIN_ROUTE = 'auth/login';

export class Login extends Component {
  static get routeName(){
    return LOGIN_ROUTE;
  }

  static get route(){
    return {name: LOGIN_ROUTE, title: 'Authentication', rightText: 'Login'};
  }

  constructor(props){
    super(props)
    this.state = {username:'',password:''};
    this.store = this.props.store;
    this.navigator = this.props.navigator;
    log('constructor');
  }

  componentWillMount(){
    log('componentWillMount');
    this.updateState();
    registerRightAction(this.navigator, this.onLogin.bind(this));
  }

  render(){
    log('render');
    const auth = this.state.auth;
    let message = issueToText(auth.issue);
    return (
      <View style={styles.content}>
        <ActivityIndicator animating={auth.isLoading} style={styles.activityIndicator} size="large"/>
        <Text>Username</Text>
        <TextInput onChangeText={(text) => this.setState({...this.state, username: text})}/>
        <Text>Password</Text>
        <TextInput onChangeText={(text) => this.setState({...this.state, password: text})}/>
        {message && <Text>{message}</Text>}
      </View>
    );
  }

  componentDidMount(){
    log(`componentDidMount`);
    this.unsubscribe = this.store.subscribe(() => this.updateState());
  }

  componentWillUnmount(){
    log(`componentWillUnmount`);
    this.unsubscribe();
  }

  updateState() {
    log(`updateState`);
    this.setState({...this.state, auth: this.store.getState().auth});
  }

  onLogin() {
    log(`onLogin`);
    this.store.dispatch(login(this.state)).then(() => {
      if(this.state.auth.token){
        this.props.onAuthSucceeded();
      }
    });
  }
}
