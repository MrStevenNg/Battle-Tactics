import React, { Component } from 'react';
import { Text, StyleSheet, View, Button } from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { Container, Content } from 'native-base';
// screens
import HomeScreenButton from '../components/HomeScreenButton';
// context
import { AppConsumer } from '../storage/AppContext';
import { ScrollView } from 'react-native-gesture-handler';

export default class HomeScreen extends Component {
  static navigationOptions = {
    title: 'Battle-Tactics',
  };

  render() {
    // const { navigate } = this.props.navigation;
    return (
      <AppConsumer>
        { (context) => (
          <Container>
          
            <Grid>

              <Col style={styles.col}>

                  <Row style={styles.row}>
                    <HomeScreenButton title='Create' />
                  </Row>
                  <Row style={styles.row}>
                    <HomeScreenButton title='Load' />
                  </Row>
                  <Row style={styles.row}>
                    <HomeScreenButton title='Settings' />
                  </Row>

              </Col>

            </Grid>
          
          </Container>
        )}
      </AppConsumer>
    );
  }
}

const styles = StyleSheet.create({
  col: {
    // flex: 1,
    // justifyContent: "center",
    // margin: 20,
    padding: 80,
    // display: "flex",
    // borderWidth: 1,
    // borderColor: "black",
    // justifyContent: "center",
    // alignItems: "center",
  },
  row: {
    margin: 20,
    display: "flex",
    // flex: 1,
    // borderWidth: 1,
    // borderColor: "red",
    // padding: 50,
    alignItems: "center",
    justifyContent: "center"
  }
})
