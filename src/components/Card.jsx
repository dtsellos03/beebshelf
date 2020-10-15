import {Button, Image, Card} from "semantic-ui-react";
import Label from "semantic-ui-react/dist/commonjs/elements/Label";
import {addBookToWishlist} from "../util/backend";
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import React from "react";

export function renderBook(b, showActions=true) {
    return  <Card
        key={(b.industryIdentifiers || [{identifier: '4'}])[0].identifier}
    >
        <Card.Content >
            <Image
                floated='left'
                size='tiny'
                src={b.thumbnail}
            />
            <Card.Header>{b.title}</Card.Header>
            <Card.Meta>{(b.authors || []).join(', ')}</Card.Meta>
            <Label icon='file alternate outline' content={b.pageCount} />
            <Label icon='clock' content={(b.publishedDate || '????').substring(0,4)} />
            <Card.Description>
                {(b.description || '').slice(0,100)}
            </Card.Description>
        </Card.Content>
        {showActions && <Card.Content extra>
                <Button onClick={() => addBookToWishlist(b)}icon><Icon name='plus' /></Button>
        </Card.Content>}
    </Card>
}

export default renderBook
