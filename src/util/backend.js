import firebase from 'firebase';
import _ from 'lodash';

const COMPLETE = 'complete';
const QUEUE = 'queue';
const ATTEMPTED = 'attempted';
const READING = 'reading';
const WISHLIST = 'wishlist';

async function searchBooks(q) {
    var searchBooks = firebase.functions().httpsCallable('searchBooks');
    try {
        let results = await searchBooks({q});
        return results
    } catch (e) {
        console.log(e)
    }
}

async function fetchBooksForUser() {
    return new Promise((resolve, reject) => {
        const db = firebase.firestore();
        let collected = [];
        let user = firebase.auth().currentUser.uid;
        db.collection('users').doc(user).collection('books').get()
            .then(response => {
                response.forEach(document => {
                    collected.push({...document.data(), key: document.id})
                });
                let grouped = _.groupBy(collected, 'status');
                resolve(grouped);
            })
            .catch(error => {
                console.log(error);
                reject(error)
            });
    });
}



async function addBookToWishlist(book, status) {
 const trimmedBook = transformBook(book);
 trimmedBook.status = status;
 trimmedBook.queuedDate = new Date();
 trimmedBook.wishlistDate = new Date();
    const db = firebase.firestore();
    let user = firebase.auth().currentUser.uid;
    const docRef = db.collection('users').doc(user).collection('books').doc(trimmedBook.key);
    await docRef.set(_.omit(trimmedBook, ['key']));

}

async function addBookToCompleted(book) {
}

// completed book
// completed date, rating, review, status

// add to reading
// started reading date, status

// set to queue
//

async function changeBookStatus2(status, bookID) {
    const db = firebase.firestore();
    let user = firebase.auth().currentUser.uid;
    const docRef = db.collection('users').doc(user).collection('books').doc(bookID);
    await docRef.update({status: status});
}

// queuedDate
// abandonedDate
// startedReadingDate
// completedDate
async function changeBookStatus(destination, book, reviewData) {
    const db = firebase.firestore();
    let user = firebase.auth().currentUser.uid;
    const docRef = db.collection('users').doc(user).collection('books').doc(book.key);
    let statusUpdate = {};
    const now = new Date();
    switch (destination) {
        case QUEUE:
            statusUpdate['queuedDate'] = now;
            break;
        case READING:
            statusUpdate['startedReadingDate'] = now;
            break;
        case COMPLETE:
            statusUpdate['rating'] = reviewData.rating;
            statusUpdate['reviewText'] = reviewData.reviewText;
            statusUpdate['completedDate'] = now;
            break;
        case ATTEMPTED:
            statusUpdate['attemptedDate'] = now;
            break;
        case WISHLIST:
            statusUpdate['wishlistDate'] = now;
            break;
        default :
            throw new Error();
    }
    statusUpdate['status'] = destination;
    await docRef.update(statusUpdate);
    let doc = await docRef.get();
    let retrieved = doc.data();
    retrieved.key = doc.id;
    return retrieved;
}


function transformBook(b) {
     const newObj = _.pick(b, ['title', 'categories', 'pageCount', 'thumbnail'])
     newObj.author = (b.authors || []).join(', ');
     newObj.publishedDate = (b.publishedDate || '????').substring(0,4);
     newObj.isbnInfo = b.industryIdentifiers[0];
     newObj.key = newObj.title + '-' + newObj.author;
     return newObj;
}

export { searchBooks, fetchBooksForUser, addBookToWishlist, changeBookStatus, COMPLETE, QUEUE, ATTEMPTED, READING}
