import {Button, Image, Card, Dropdown, Modal, Icon, Header, Rating, Form, TextArea, Label} from "semantic-ui-react";
import {changeBookStatus, COMPLETE, READING, QUEUE, ATTEMPTED, WISHLIST} from "../util/backend";
import placehold from '../assets/placehold.png';

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
    ,
    {
        key: 'delete',
        text: 'Delete',
        value: 'delete'
    }
];

class LibraryBook extends React.Component {

    state = {
        reviewModal: false,
        deleteModal: false,
        completedDate: this.props.b.completedDate?  this.props.b.completedDate.toDate() : new Date(),
        startedReadingDate: this.props.b.startedReadingDate?  this.props.b.startedReadingDate.toDate() : new Date(),
        rating: this.props.b.rating || 5,
        reviewText: null,
    };

    updateBookStatus = (destination, reviewData) => {
        const {b,origin, i}  = this.props;
        changeBookStatus(destination, b, reviewData).then((newData) => {
            this.props.updateBookCategory(origin, i, destination, newData);
        })
    };

    openModal = (key) => {
        const update = {};
        update[key] = true;
        this.setState(update)
    };

    closeModal = (key) => {
        const update = {};
        update[key] = false;
        this.setState(update)
    }

    finishReview = () => {
        const reviewData = {
            rating: this.state.rating,
            reviewText: this.state.reviewText,
            startedReadingDate: this.state.startedReadingDate,
            completedDate: this.state.completedDate
        };
        this.updateBookStatus(COMPLETE, reviewData)
        this.setState({
            reviewModal: false
        });
    };

    confirmDelete = () => {
        this.props.deleteBook(this.props.b, this.props.origin)
        this.setState({
            deleteModal: false
        });
    };

    reviewSection = () => {
        const ratingMap = {
            '0': 'brown',
            '1': 'brown',
            '2': 'brown',
            '3': 'grey',
            '4': 'orange',
            '5': 'yellow',
            '6': 'teal',
            '7': 'olive',
            '8': 'green',
            '9': 'green',
            '10': 'green'
        };
        const difference =  this.state.completedDate.getTime() - this.state.startedReadingDate.getTime();
        const days = Math.ceil(difference / (1000 * 3600 * 24));
        return this.props.origin === COMPLETE && <>
            <Card.Meta>
                <Label color={ratingMap[this.props.b.rating.toString()]}>
                    <Icon name='star' style={{paddingRight: 5}} />
                    {this.props.b.rating} / 10
                </Label>
                <Label>
                    <Icon name='clock' style={{paddingRight: 5}} />
                    {days} days
                </Label>
               </Card.Meta>
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
        onClose={() => this.closeModal('reviewModal')}
        onOpen={() => this.openModal('reviewModal')}
        open={this.state.reviewModal}
    >
        <Modal.Content image>
            <Image size='medium' src={this.props.b.thumbnail || placehold}  />
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
                <h5>Started Reading</h5>
                <DatePicker selected={this.state.startedReadingDate} onChange={date => this.setState({
                    startedReadingDate: date
                })} />
                <h5>Completed Date</h5>
                <DatePicker selected={this.state.completedDate} onChange={date => this.setState({
                 completedDate: date
                })} />
            </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
            <Button color='black' onClick={() => this.closeModal('reviewModal')}>
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

    deleteModal = () =>  <Modal
        basic
        onClose={() => this.closeModal('deleteModal')}
        onOpen={() => this.openModal('deleteModal')}
        open={this.state.deleteModal}
        size='small'
    >
        <Header icon>
            <Icon name='delete' />
            Delete {this.props.b.title}
        </Header>
        <Modal.Content>
            <p>
                Are you sure you want to delete {this.props.b.title} from your library?
            </p>
        </Modal.Content>
        <Modal.Actions>
            <Button  color='red' inverted  onClick={this.confirmDelete}>
                <Icon name='remove' /> Remove
            </Button>
            <Button color='green' inverted onClick={() => this.closeModal('deleteModal')}>
                <Icon name='checkmark' /> Cancel
            </Button>
        </Modal.Actions>
    </Modal>

    render() {
        const cardColorMap = {
            'queue': 'blue',
            'reading': 'teal',
            'attempted': 'brown',
            'wishlist': 'grey',
            'complete': 'green'
        }
        const b = this.props.b;

        return  <>
            {this.modalComp()}
            {this.deleteModal()}
            <Card  color={cardColorMap[this.props.origin]}
                key={(b.industryIdentifiers || [{identifier: '4'}])[0].identifier}
            >
                <Card.Content >
                    <Image
                        floated='left'
                        size='tiny'
                        src={b.thumbnail || placehold}
                    />
                    <Card.Header>{b.title}</Card.Header>
                    <Card.Meta>{b.author}
                    <br/>

                    </Card.Meta>
                    {this.dateSection()}
                    {this.reviewSection()}
                </Card.Content>
                <Card.Content extra>
                    <span style={{display: 'flex', alignContent: 'spaceBetween', alignItems: 'center'}}>
                    <><span  style={{paddingRight: 10}} ><Icon name='file alternate outline'/>{b.pageCount}</span>
                    <Icon name='clock' />{(b.publishedDate || '????').substring(0,4)}
                    </>
                         <Dropdown
                             text='Edit'
                             style={{marginLeft: 'auto'}}
                             icon='filter'
                             className='icon'
                             labeled
                             button
                             onChange={(v, e) => {
                                 if (e.value === 'delete') {
                                     this.setState({
                                         deleteModal: true
                                     })
                                 }
                                 else if (e.value === COMPLETE) {
                                     this.setState({
                                         reviewModal: true
                                     })
                                 } else {
                                     this.updateBookStatus(e.value, {});
                                 }
                             }}
                             options={friendOptions}
                         />
                   </span>
                </Card.Content>
            </Card>
            </>
    }
}

export default LibraryBook;
