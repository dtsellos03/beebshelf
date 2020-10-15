import React from 'react';
import LibraryCard from './LibraryCard';
import {fetchBooksForUser} from "../util/backend";
import {Card, Segment, Header} from "semantic-ui-react";
import _ from 'lodash';

class MyLibrary extends React.Component {

    state = {
    queue: [],
    complete: [],
        reading: [],
        attempted:[],
        wishlist: []
   };

    async componentDidMount() {
        let books = await fetchBooksForUser();
        this.setState({
            queue: books.queue || [],
            complete: books.complete || [],
            reading: books.reading || [],
            attempted: books.attempted || [],
            wishlist: books.wishlist || []
        });
    }

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

    render() {

        return <>
            <Segment vertical>
                <Header>Reading ({this.state.reading.length})</Header>
            <Card.Group>
            {this.state.reading.map((b, i) =>
                    <LibraryCard
                        key={b.key}
                b={b} i={i} origin={'reading'} updateBookCategory={this.updateBookCategory} />
                )}
            </Card.Group>
            </Segment>
            <Segment vertical>
                <Header>Queue ({this.state.queue.length})</Header>
                <Card.Group>
                    {this.state.queue.map((b, i) =>     <LibraryCard
                        key={b.key}
                        b={b} i={i} origin={'queue'} updateBookCategory={this.updateBookCategory} />)}
                </Card.Group>
            </Segment>
            <Segment vertical>
                <Header>Wishlist ({this.state.wishlist.length})</Header>
                <Card.Group>
                    {this.state.wishlist.map((b, i) =>     <LibraryCard
                        key={b.key}
                        b={b} i={i} origin={'wishlist'} updateBookCategory={this.updateBookCategory} />)}
                </Card.Group>
            </Segment>
            <Segment vertical>
                <Header>Completed ({this.state.complete.length})</Header>
                <Card.Group>
                    {this.state.complete.map((b, i) => (
                        <LibraryCard
                            key={b.key}
                            b={b} i={i} origin={'complete'} updateBookCategory={this.updateBookCategory} />
                    ))}
                </Card.Group>
            </Segment>
            <Segment vertical>
                <Header>Attempted ({this.state.attempted.length})</Header>
                <Card.Group>
                    {this.state.attempted.map((b, i) =>     <LibraryCard
                        key={b.key}
                        b={b} i={i} origin={'attempted'} updateBookCategory={this.updateBookCategory} />)}
                </Card.Group>
            </Segment>

            </>
    }
}

export default MyLibrary;
