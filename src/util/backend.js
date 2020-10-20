import firebase from 'firebase';
import _ from 'lodash';

const COMPLETE = 'complete';
const QUEUE = 'queue';
const ATTEMPTED = 'attempted';
const READING = 'reading';
const WISHLIST = 'wishlist';

export const AUTHOR_LAST_NAME = 'author_last_name';
export const DATE = 'date';
export const RATING_SORT = 'rating';

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


async function deleteBook(book) {
    const db = firebase.firestore();
    let user = firebase.auth().currentUser.uid;
    const docRef = db.collection('users').doc(user).collection('books').doc(book.key);
    await docRef.delete();
}

async function changeBookStatus(destination, book, reviewData) {
    const db = firebase.firestore();
    let user = firebase.auth().currentUser.uid;
    const docRef = db.collection('users').doc(user).collection('books').doc(book.key);
    let statusUpdate = {};
    const now = new Date();
    if (destination ===COMPLETE) {
            statusUpdate['rating'] = reviewData.rating;
            statusUpdate['reviewText'] = reviewData.reviewText;
            statusUpdate['completedDate'] = reviewData.completedDate;
            statusUpdate['startedReadingDate'] = reviewData.startedReadingDate;
    }
    const dateToUpdate = getCategoryDate(destination);
    statusUpdate[dateToUpdate] = now;
    statusUpdate['status'] = destination;
    await docRef.update(statusUpdate);
    let doc = await docRef.get();
    let retrieved = doc.data();
    retrieved.key = doc.id;
    return retrieved;
}

function sortBooks(order, cat, books) {
    switch (order) {
        case RATING_SORT:
            return _.orderBy(books, ['rating'], ['desc']);
        case AUTHOR_LAST_NAME:
            return books.sort((a, b) => {
                const sFunc = (book) => {
                    let authorSplit = book.author.split(' ');
                    return authorSplit[authorSplit.length - 1].toUpperCase()
                };
                if (sFunc(a) < sFunc(b)) {
                    return -1;
                }
                if (sFunc(a) > sFunc(b)) {
                    return 1;
                }
                return 0;
            })
        case DATE:
            const sortKey = getCategoryDate(cat);
            return _.orderBy(books, [sortKey], ['asc']);
        default:
            throw new Error('Cant sort without key');
    }
}

function getCategoryDate(cat) {
    switch(cat) {
        case COMPLETE:
           return 'completedDate';
        case ATTEMPTED:
            return 'attemptedDate';
        case WISHLIST:
            return 'wishlistDate';
        case QUEUE:
            return 'queuedDate';
        case READING:
            return  'startedReadingDate';
    }
}


function transformBook(b) {
     const newObj = _.pick(b, ['title', 'categories', 'pageCount', 'thumbnail'])
     newObj.author = (b.authors || []).join(', ');
     newObj.publishedDate = (b.publishedDate || '????').substring(0,4);
     newObj.isbnInfo = b.industryIdentifiers[0];
     newObj.key = newObj.title + '-' + newObj.author;
     return newObj;
}

export { searchBooks, fetchBooksForUser, addBookToWishlist, changeBookStatus, deleteBook, sortBooks, COMPLETE, QUEUE, ATTEMPTED, READING, WISHLIST}
