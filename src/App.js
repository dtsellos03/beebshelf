// Import FirebaseAuth and firebase.
import React from 'react';
import 'semantic-ui-css/semantic.min.css'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { Menu } from 'semantic-ui-react'
import firebase from 'firebase';
import './App.css';
import { searchBooks } from './util/backend'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import MyLibrary from './components/MyLibrary';
import Search from './components/Search';

// // Configure Firebase.
const firebaseConfig = {
    apiKey: process.env.REACT_APP_firebaseApiKey,
    authDomain: process.env.REACT_APP_firebaseAuthDomain,
    databaseURL: process.env.REACT_APP_firebaseDatabaseURL,
    projectId: process.env.REACT_APP_firebaseProjectId,
    storageBucket: process.env.REACT_APP_firebaseStorageBucket,
    messagingSenderId: process.env.REACT_APP_firebaseMessagingSenderId,
    appId: process.env.REACT_APP_firebaseAppId
};

firebase.initializeApp(firebaseConfig);

class App extends React.Component {

    // The component's Local state.
    state = {
        isSignedIn: false,
        activeItem: 'home'
    };

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    // Configure FirebaseUI.
    uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // We will display Google and Facebook as auth providers.
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.FacebookAuthProvider.PROVIDER_ID
        ],
        callbacks: {
            // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: () => false
        }
    };

    // Listen to the Firebase Auth state and set the local state.
    async componentDidMount() {
        this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
            (user) => {
                this.setState({isSignedIn: !!user})
                searchBooks('magus');

            }
        );

    }

    // Make sure we un-register Firebase observers when the component unmounts.
    componentWillUnmount() {
        this.unregisterAuthObserver();
    }

    render() {
        const { activeItem } = this.state
        if (!this.state.isSignedIn) {
            return (
                <div>
                    <h1>My App</h1>
                    <p>Please sign-in:</p>
                    <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>
                </div>
            );
        }
        return (
            <Router>
                <Menu secondary>
                    <Menu.Item
                        name='Library'
                        as={Link} to='/'
                        active={activeItem === 'home'}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name='Search'
                        as={Link} to='/search'
                        active={activeItem === 'search'}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Menu position='right'>
                        <Menu.Item
                            name='logout'
                            active={false}
                            onClick={() => firebase.auth().signOut()}
                        />
                    </Menu.Menu>
                </Menu>
                <Switch>
                    <Route path="/search">
                        <Search />
                    </Route>
                    <Route path="/">
                        <MyLibrary />
                    </Route>
                </Switch>
            </Router>
        );
    }
}

export default App
