import React,{Component} from 'react';
import {ListView, Text, View, StatusBar, ActivityIndicator} from 'react-native';
import {EmplEdit} from './EmplEdit';
import {EmplView} from './EmplView';
import {loadEmployees,cancelLoadEmployee} from './service';
import {registerRightAction, getLogger, issueToText} from '../core/utils';
import styles from '../core/styles';

const log = getLogger('EmplList');
const EMPLOYEE_LIST_ROUTE = 'employee/list';

export class EmplList extends Component{
  static get routeName() {
    return EMPLOYEE_LIST_ROUTE;
  }

  static get route() {
    return {name: EMPLOYEE_LIST_ROUTE, title: 'Employee List', rightText: 'New'};
  }

  constructor(props){
    super(props);
    log('constructor');
    this.ds = new ListView.DataSource({rowHasChanged: (r1,r2) => r1.id !== r2.id});
    this.store = this.props.store;
    const EmployeeState = this.store.getState().employee;
    this.state = {isLoading: EmployeeState.isLoading, dataSource: this.ds.cloneWithRows(EmployeeState.items)};
    registerRightAction(this.props.navigator, this.onNewEmployee.bind(this));
  }

  render() {
    log('render');
    let message = issueToText(this.state.issue);
    return (
      <View style={styles.content}>
      { this.state.isLoading &&
        <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
        }
        {message && <Text>{message}</Text>}
        <ListView
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={employee => (<EmployeeView employee={employee} onPress={(employee) => this.onEmployeePress(employee)}/>)}/>
      </View>
    );
  }

  onNewEmployee(){
    log('onNewEmployee');
    this.props.navigator.push({...EmplEdit.route});
  }

  onEmployeePress(employee){
    log('onEmployeePress');
    this.props.navigator.push({...EmplEdit.route, data: employee});
  }

  componentDidMount(){
    log('componentDidMount');
    this._isMounted = true;
    const store = this.store;
    this.unsubscribe = store.subscribe(()=> {
      log('setState');
      const employeeState = store.getState().employee;
      this.setState({dataSource: this.ds.cloneWithRows(employeeState.items), isLoading: employeeState.isLoading});
    });
    store.dispatch(loadEmployees());
  }

  componentWillUnmount(){
    log('componentWillUnmount');
    this._isMounted = false;
    this.unsubscribe();
    if(this.state.isLoading){
      this.store.dispatch(cancelLoadEmployee());
    }
  }
}
