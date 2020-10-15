import {Button, Image, Card, Icon} from "semantic-ui-react";
import Label from "semantic-ui-react/dist/commonjs/elements/Label";
import {addBookToWishlist} from "../util/backend";
import React, { useState } from 'react';

class  RenderBook extends React.Component {
    state = {
        isAdded: false
    }
    render() {
        const { b } = this.props;
    return <Card
        key={(b.industryIdentifiers || [{identifier: '4'}])[0].identifier}
    >
        <Card.Content>
            <Image
                floated='left'
                size='tiny'
                src={b.thumbnail}
            />
            <Card.Header>{b.title}</Card.Header>
            <Card.Meta>{(b.authors || []).join(', ')}</Card.Meta>
            <Label icon='file alternate outline' content={b.pageCount}/>
            <Label icon='clock' content={(b.publishedDate || '????').substring(0, 4)}/>
            <Card.Description>
                {(b.description || '').slice(0, 100)}
            </Card.Description>
        </Card.Content>
        {!this.state.isAdded ? <Card.Content extra>
            <Button onClick={() => {
                this.setState({isAdded: true});
                addBookToWishlist(b, 'queue')
            }
            } icon>Queue</Button>
            <Button onClick={() => {
                    this.setState({isAdded: true});
                addBookToWishlist(b, 'wishlist')
            }} icon>Wishlist</Button>
        </Card.Content> :  <Button icon labelPosition='right' disabled color='green'>Saved <Icon name='checkmark' /></Button>}
    </Card>
}
}

export default RenderBook;
