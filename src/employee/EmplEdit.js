import React, {Component} from 'react';
import {Text, View, TextInput, ActivityIndicator} from 'react-native';
import {saveEmployee, cancelSaveEmployee} from './service';
import {registerRightAction, issueToText, getLogger} from '../core/utils';
import styles from '../core/styles';

const log = getLogger('employee/EmplEdit');
const EMPLOYEE_EDIT_ROUTE = 'employee/edit';

export class EmplEdit extends Component{
  static get routeName() {
    return EMPLOYEE_EDIT_ROUTE;
  }

  static get route() {
    return {name: EMPLOYEE_EDIT_ROUTE, title: 'Employee Edit', rightText: 'Save'};
  }

  constructor(props){
    log('constructor');
    super(props);
    this.store = this.props.store;
    const nav = this.props.navigator;
    this.navigator = nav;
    const currentRoutes = nav.getCurrentRoutes();
    const currentRoute = currentRoutes[currentRoutes.length - 1];
    if (currentRoute.data) {
      this.state = {note: {...currentRoute.data}, isSaving: false};
    } else {
      this.state = {note: {text: ''}, isSaving: false};
    }
    registerRightAction(nav, this.onSave.bind(this));
  }

  render(){
    log('render');
    const state = this.state;
    let message = issueToText(state.issue);
    return(
      <View style={styles.content}>
        {state.isSaving &&
          <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
        }
        <Text>Name</Text>
        <TextInput value={state.employee.name} onChangeText={(name) => this.updateEmployeeName(name)}/>
        {message && <Text>{message}</Text>}
        <Text>Position</Text>
        <TextInput value={state.employee.position} onChangeText={(position) => this.updateEmployeePosition(position)}/>
        {message && <Text>{message}</Text>}
        <Text>Salary</Text>
        <TextInput value={state.employee.salary} onChangeText={(salary) => this.updateEmployeeSalary(salary)}/>
        {message && <Text>{message}</Text>}
      </View>
    );
  }

  componentDidMount(){
    log('componentDidMount');
    this._isMounted = true;
    const store = this.props.store;
    this.unsubscribe = store.subscribe(() => {
      log('setState');
      const state = this.state;
      const employeeState = store.getState().employee;
      this.setState({...state, issue: employeeState.issue});
    });
  }

  componentWillUnmount() {
    log('componentWillUnmount');
    this._isMounted = false;
    this.unsubscribe();
    if (this.state.isLoading) {
      this.store.dispatch(cancelSaveEmployee());
    }
  }

  updateEmployeeName(name){
    let newState = {...this.state};
    newState.employee.name = name;
    this.setState(newState)
  }

  updateEmployeePosition(position){
    let newState = {...this.state};
    newState.employee.position = position;
    this.setState(newState)
  }

  updateEmployeeSalary(salary){
    let newState = {...this.state};
    newState.employee.salary = salary;
    this.setState(newState)
  }

  onSave() {
    log('onSave');
    this.store.dispatch(saveEmployee(this.state.employee)).then(() => {
      log('onEmployeeSaved');
      if (!this.state.issue) {
        this.navigator.pop();
      }
    });
  }
}
