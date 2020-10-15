import {Button, Image, Card, Dropdown, Modal, Icon, Header, Rating, Form, TextArea} from "semantic-ui-react";
import {changeBookStatus, COMPLETE, READING, QUEUE, ATTEMPTED, WISHLIST} from "../util/backend";

import React from "react";
const ago = require('s-ago');

const friendOptions = [
    {
        key: 'queue',
        text: 'Queue',
        value: 'queue',
    },
    {
        key: 'complete',
        text: 'Complete',
        value: 'complete',
    },
    {
        key: 'reading',
        text: 'Reading',
        value: 'reading',
    },
    {
        key: 'attempted',
        text: 'Attempted',
        value: 'attempted',
    },
    {
        key: 'wishlist',
        text: 'Wishlist',
        value: 'wishlist'
    }
];

class LibraryBook extends React.Component {

    state = {
        reviewModal: false,
        rating: this.props.b.rating || 5,
        reviewText: null,
    };

    updateBookStatus = (destination, reviewData) => {
        const {b,origin, i}  = this.props;
        changeBookStatus(destination, b, reviewData).then((newData) => {
            this.props.updateBookCategory(origin, i, destination, newData);
        })
    };

    openModal = () => {
        this.setState({reviewModal: true})
    };

    closeModal = () => {
        this.setState({reviewModal: false})
    }

    finishReview = () => {
        const reviewData = {
            rating: this.state.rating,
            reviewText: this.state.reviewText,
        };
        this.updateBookStatus(COMPLETE, reviewData)

        this.setState({
            reviewModal: false
        });
    };

    reviewSection = () => {
        return this.props.origin === COMPLETE && <>
            <Card.Meta>{this.props.b.rating} / 10</Card.Meta>
            </>;
    };

    dateSection = () => {
        const {b, origin} = this.props;
        const dateMap = {
            'complete': 'completedDate',
            'queue': 'queuedDate',
            'reading': 'startedReadingDate',
            'attempted': 'attemptedDate',
            'wishlist': 'wishlistDate'
        };
        let date = ago(b[dateMap[origin]].toDate() || new Date());
        return       <Card.Meta>
            <span>{date}</span>
        </Card.Meta>
    }

    modalComp = () =>  <Modal
        size='tiny'
        onClose={this.closeModal}
        onOpen={this.openModal}
        open={this.state.reviewModal}
    >
        <Modal.Content image>
            <Image size='medium' src={this.props.b.thumbnail}  />
            <Modal.Description>
                <Header>{this.props.b.title}</Header>
                <Form>
                    <TextArea
                        style={{ minHeight: 100 }}
                        onChange={(ev, data) => {
                            this.setState({
                                reviewText: data.value});
                        }
                        }
                        label='My review'
                        defaultValue={this.props.b.reviewText || ''}
                    />
                </Form>
                <br/>
                <Rating
                    onRate={(e, data) => {
                    this.setState({
                    rating: data.rating});
                    }}
                    icon='heart' defaultRating={this.props.b.rating || 5} maxRating={10} />
                <p>{this.state.rating || 5} / 10</p>
            </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
            <Button color='black' onClick={this.closeModal}>
                Cancel
            </Button>
            <Button
                content="Complete"
                labelPosition='right'
                icon='checkmark'
                onClick={this.finishReview}
                positive
            />
        </Modal.Actions>
    </Modal>;

    render() {
        const b = this.props.b;
        return  <>
            {this.modalComp()}
            <Card
                key={(b.industryIdentifiers || [{identifier: '4'}])[0].identifier}
            >
                <Card.Content >
                    <Image
                        floated='left'
                        size='tiny'
                        src={b.thumbnail}
                    />
                    <Card.Header>{b.title}</Card.Header>
                    <Card.Meta>{b.author}
                    <br/>
                        <Dropdown
                            text='Edit'
                            icon='filter'
                            className='icon'
                            labeled
                            button
                            onChange={(v, e) => {
                                if (e.value === COMPLETE) {
                                    this.setState({
                                        reviewModal: true
                                    })
                                } else {
                                    this.updateBookStatus(e.value, {});
                                }
                            }}
                            options={friendOptions}
                        />
                    </Card.Meta>
                    {this.dateSection()}
                    {this.reviewSection()}
                </Card.Content>
                <Card.Content extra>
                    <span  style={{paddingRight: 10}} ><Icon name='file alternate outline'/>{b.pageCount}</span>
                    <Icon name='clock' />{(b.publishedDate || '????').substring(0,4)}
                </Card.Content>
            </Card>
            </>
    }
}

export default LibraryBook;
