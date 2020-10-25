import firebase from "firebase";


export async function addTag(tagName) {
    const db = firebase.firestore();
    let user = firebase.auth().currentUser.uid;
    const tag = {
        name: tagName
    };
    const docRef = db.collection('users').doc(user).collection('collections').doc(tagName);
    await docRef.set(tag);
}

export async function deleteTag(tagName) {
    const db = firebase.firestore();
    let user = firebase.auth().currentUser.uid;
    const docRef = db.collection('users').doc(user).collection('collections').doc(tagName);
    await docRef.delete();
}

export async function getTags() {
    return new Promise((resolve, reject) => {
    const db = firebase.firestore();
    let collected = [];
    let user = firebase.auth().currentUser.uid;
    db.collection('users').doc(user).collection('collections').get()
        .then(response => {
            response.forEach(document => {
                collected.push({...document.data()})
            });
            resolve(collected);
        })
        .catch(error => {
            console.log(error);
            reject(error);
        })
    });
}

