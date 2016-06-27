import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableHighlight,
  Text,
  TextInput,
  AsyncStorage,
} from 'react-native';
  import axios from 'axios'
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import config from './config';

class HotelSignin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      client_Email : "",
      password : "",
      error : "",
      user : "",
    }

    this._handlePress = this._handlePress.bind(this);
    // this._signIn = this._signIn.bind(this);

  }

  componentDidMount() {
    this._setupGoogleSignin();
    console.log('state client_Email : ',this.state.client_Email);
  }

  async _setupGoogleSignin() {
    try {
      await GoogleSignin.hasPlayServices({ autoResolve: true });
      await GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        webClientId: '370846469277-p2lvjnb4u0jcjt1br44h9pmpct82849c.apps.googleusercontent.com',
        offlineAccess: true
      });

      const user = await GoogleSignin.currentUserAsync();
      //if you need user information, use the user object.
      console.log('first user: ', user)
    }
    catch(err) {
      console.log("Play services error", err.code, err.message);
    }
  }

  async _signIn() {
    try {
      let user = await GoogleSignin.signIn()
      console.log(user)
      await AsyncStorage.setItem('id_token', user.id);
      await AsyncStorage.setItem('client_Email', user.email);
      this.props.navigator.push({id : 'bidInfo'});
    }
    catch(err) {
      console.log('WRONG SIGNIN', err);
    }
  }

  _signOut() {
    GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
      this.setState({client_Email: null});
    })
    .done();
  }

  async _handlePress(where) {
    let email = this.state.client_Email;
    let password = this.state.password;
    switch(where) {
    case 'login' :
      try {
        let id_token = await axios({
          url: config.serverUrl + '/client/signin/',
          method : 'post',
          data : {
            client_Email : email,
            client_PW : password
          }
        });
        await AsyncStorage.setItem('id_token', id_token.data.id_token);
        await AsyncStorage.setItem('client_Email', email);
      } catch(error) {
        console.log(error);
      }
      var id_token = await AsyncStorage.getItem('id_token');
      if(id_token) {
        this.props.navigator.push({id : 'bidInfo'})
      }
      break;
    case 'register' :
      this.props.navigator.push({
        id : where,
      })
      break;
    }
  }

  render() {
    return (
      <View style = {styles.container}>

        <Text style={styles.heading}>
          💃 Enjoy Hotel-Reverse 💃
        </Text>
        <TextInput
        onChangeText={ (text)=> this.setState({client_Email: text}) }
        style={styles.input} placeholder="Email">
        </TextInput>
        <TextInput
          onChangeText={ (text)=> this.setState({password: text}) }
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}>
        </TextInput>
        <TouchableHighlight onPress={()=>this._handlePress('login')} style={styles.button}>
          <Text style={styles.buttonText}>
            Log In
          </Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.button}
          onPress = {()=>this._handlePress('register')}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableHighlight>

        <GoogleSigninButton
          style={styles.button}
          size = {GoogleSigninButton.Size.Icon}
          color = {GoogleSigninButton.Color.Dark}
          onPress = {()=>this._signIn()}/>

        <Text style={styles.error}>
          {this.state.error}
        </Text>
      </View>
    )
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 10,
    paddingTop: 80
  },
  input: {
    height: 50,
    marginTop: 10,
    padding: 4,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#48bbec'
  },
  button: {
    height: 50,
    backgroundColor: '#48BBEC',
    alignSelf: 'stretch',
    marginTop: 10,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 22,
    color: '#FFF',
    alignSelf: 'center'
  },
  heading: {
    fontSize: 30,
  },
  error: {
    color: 'red',
    paddingTop: 10
  },
});


export default HotelSignin;
