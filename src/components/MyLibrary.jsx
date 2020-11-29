import React from 'react';
import LibraryCard from './LibraryCard';
import {
    fetchBooksForUser,
    deleteBook,
    sortBooks,
    RATING_SORT,
    AUTHOR_LAST_NAME,
    COMPLETE,
    QUEUE, WISHLIST
} from "../util/backend";
import {
    getTags
} from "../util/collections";
import {Card, Segment, Header, Select, Dropdown, Progress} from "semantic-ui-react";
import _ from 'lodash';

const wishlistSort = [
    {
        key: AUTHOR_LAST_NAME,
        text: 'Author Last Name',
        value: AUTHOR_LAST_NAME,
    },
];

const goal = 50;

const ratingSort = [{
    key: RATING_SORT,
        text: 'Rating',
    value: RATING_SORT,
}];

class MyLibrary extends React.Component {
    state = {
        queue: [],
        complete: [],
        reading: [],
        attempted:[],
        wishlist: [],
        collections: [],
        yearlyRead: 0,
        showReading: true,
        showQueue: true,
        showWishlist: true,
        showComplete: true
   };

    async componentDidMount() {
        let books = await fetchBooksForUser();
        let colls = await getTags();
        this.setState({
            queue: books.queue || [],
            complete: books.complete || [],
            reading: books.reading || [],
            attempted: books.attempted || [],
            wishlist: books.wishlist || [],
            collections: colls
        });
        this.getYearlyGoal(books.complete);

    }

    getYearlyGoal = (complete) => {
        let read = 0;
        complete.forEach((b) => {
            if (b.completedDate.toDate().getFullYear() === new Date().getFullYear()) {
                read ++;
            }
        });
        this.setState({
            yearlyRead: read
        })
    }

    sortBookCategory = (category, order) => {
        const updateObj = {}
        updateObj[category] = sortBooks(order, category, this.state[category]);
        this.setState(updateObj);
}

    yearlyProgress = () => <div style={{}}><Progress size={'small'} color={'yellow'} value={this.state.yearlyRead} total={goal} progress='ratio' /></div>

    updateBookCategory = (origin, index, destination, book) => {
       let existing = this.state[origin];
        _.remove(existing, {
            key: book.key
        });
        let destinationColl = this.state[destination];
        book.status=destination;
        destinationColl.unshift(book);
        const stateShift = {};
        stateShift[origin] = existing;
        stateShift[destination] = destinationColl;
        this.setState(stateShift)

    };

    deleteBook = async (book, category) => {
        await deleteBook(book)
        let existing = this.state[category];
        _.remove(existing, {
            key: book.key
        });
        const stateShift = {};
        stateShift[category] = existing;
        this.setState(stateShift)
}

sortDropdown = (cat, options) =>
    <Dropdown
        style={{marginLeft: 20}}
        icon='filter'
        button
        className='icon'
        onChange={(v, e) =>
            this.sortBookCategory(cat, e.value)
        }
        options={options}
    />;


    render() {
        const commonFunctions = {
            updateBookCategory: this.updateBookCategory,
            deleteBook: this.deleteBook,
        }
        return <>
            <Segment vertical>
                <Header
                    onClick={() => this.setState({showReading: !this.state.showReading})}
                    as='h3' block>Reading ({this.state.reading.length})</Header>
                {this.state.showReading && <Card.Group>
            {this.state.reading.map((b, i) =>
                    <LibraryCard
                        key={b.key}
                b={b} i={i} origin={'reading'}
                        {...commonFunctions} />
                )}
            </Card.Group>}
            </Segment>
            <Segment  vertical>
                <Header
                    onClick={() => this.setState({showQueue: !this.state.showQueue})}
                    as='h3' block>Queue ({this.state.queue.length})</Header>

                {this.state.showQueue && <Card.Group>
                    {this.state.queue.map((b, i) =>     <LibraryCard
                        key={b.key}
                        b={b} i={i} origin={'queue'}  {...commonFunctions} />)}
                </Card.Group>}
            </Segment>
            <Segment vertical>
                <Header
                    onClick={() => this.setState({showWishlist: !this.state.showWishlist})}
                    as='h3' block>
                            <span style={{display: 'flex'}}>
                         <>Wishlist ({this.state.wishlist.length})</>
                             <>   {this.sortDropdown(WISHLIST, wishlistSort)}</>
                            </span>
                </Header>
                {this.state.showWishlist && <Card.Group>
                    {this.state.wishlist.map((b, i) =>     <LibraryCard
                        key={b.key}
                        b={b} i={i} origin={'wishlist'}  {...commonFunctions}/>)}
                </Card.Group>}
            </Segment>
            <Segment vertical>
                <Header  as='h3'
                         onClick={() => this.setState({showComplete: !this.state.showComplete})}
                         block>
                            <span style={{display: 'flex'}}>
                         <>Complete ({this.state.complete.length})</>
                             <>   {this.sortDropdown(COMPLETE, ratingSort)}</>
                            </span>
                </Header>
                <> {this.yearlyProgress()} </>
                {this.state.showComplete && <Card.Group>
                    {this.state.complete.map((b, i) => (
                        <LibraryCard
                            key={b.key}
                            b={b} i={i} origin={'complete'}  {...commonFunctions} />
                    ))}
                </Card.Group>}
            </Segment>
            <Segment vertical>
                <Header  as='h3' block>Attempted ({this.state.attempted.length})</Header>
                <Card.Group>
                    {this.state.attempted.map((b, i) =>     <LibraryCard
                        key={b.key}
                        b={b} i={i} origin={'attempted'}  {...commonFunctions} />)}
                </Card.Group>
            </Segment>

            </>
    }
}

export default MyLibrary;
