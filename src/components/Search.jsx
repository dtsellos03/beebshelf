import React from 'react'
import { Card } from 'semantic-ui-react'
import renderBook from './Card';
import {searchBooks} from "../util/backend";
import Input from "semantic-ui-react/dist/commonjs/elements/Input";
import Form from "semantic-ui-react/dist/commonjs/collections/Form";




class BookSearch extends React.Component {

    state = {
        searchTerm: 'imajica',
        books: []
    };

    updateBooks = async () => {
        this.setState({books: []})
        let apiResp = await searchBooks(this.state.searchTerm);
        console.log(this.state.searchTerm, apiResp)
        this.setState({books: apiResp.data})
    };

    render() {
        return <>
            <Form onSubmit={this.updateBooks} style={{padding: 20}}>
            <Input
                onChange = {(event) => {
                    console.log(event.target.value)
                    this.setState({searchTerm: event.target.value})
                }}
                action={{ icon: 'search', onClick: this.updateBooks  }} placeholder='Search...' />
            </Form>
        <Card.Group>
            {this.state.books.map(e => renderBook(e))}
        </Card.Group>
</>
    }
}



export default BookSearch;
