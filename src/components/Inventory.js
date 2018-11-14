import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import firebase from "firebase";
import AddFishForm from "./AddFishForm";
import EditFishForm from "./EditFishForm";
import Login from "./Login";
import base, { firebaseApp } from "../base";

function Inventory(props) {
  const [uid, setUid] = useState(null);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        authHandler({ user });
      }
    });
  }, []);

  const authHandler = async authData => {
    // 1 .Look up the current store in the firebase database
    const store = await base.fetch(props.storeId, { context: this });
    // 2. Claim it if there is no owner
    if (!store.owner) {
      // save it as our own
      await base.post(`${props.storeId}/owner`, {
        data: authData.user.uid
      });
    }
    // 3. Set the state of the inventory component to reflect the current user
    setUid(authData.user.uid);
    setOwner(store.owner || authData.user.uid);
  };

  const authenticate = provider => {
    const authProvider = new firebase.auth[`${provider}AuthProvider`]();
    firebaseApp
      .auth()
      .signInWithPopup(authProvider)
      .then(this.authHandler);
  };

  const logout = async () => {
    await firebase.auth().signOut();
    setUid(null);
  };

  // 1. Check if they are logged in
  if (!uid) {
    return <Login authenticate={authenticate} />;
  }

  // 2. check if they are not the owner of the store
  if (uid !== owner) {
    return (
      <div>
        <p>Sorry you are not the owner!</p>
        <button onClick={logout}>Log Out!</button>
      </div>
    );
  }

  // 3. They must be the owner, just render the inventory
  return (
    <div className="inventory">
      <h2>Inventory</h2>
      <button onClick={logout}>Log Out!</button>
      {Object.keys(props.fishes).map(key => (
        <EditFishForm
          key={key}
          index={key}
          fish={props.fishes[key]}
          updateFish={props.updateFish}
          deleteFish={props.deleteFish}
        />
      ))}
      <AddFishForm addFish={props.addFish} />
      <button onClick={props.loadSampleFishes}>Load Sample Fishes</button>
    </div>
  );
}

Inventory.propTypes = {
  fishes: PropTypes.object,
  updateFish: PropTypes.func,
  deleteFish: PropTypes.func,
  loadSampleFishes: PropTypes.func
};

export default Inventory;
