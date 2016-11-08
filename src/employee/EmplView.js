import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableHighlight} from 'react-native';

export class EmplView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableHighlight onPress={() => this.props.onPress(this.props.employee)}>
        <View>
          <Text style={styles.listItem}>{this.props.employee.name}</Text>
          <Text style={styles.listItem}>{this.props.employee.position}</Text>
          <Text style={styles.listItem}>{this.props.employee.salary}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  listItem: {
    margin: 10,
  }
});
