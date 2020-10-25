import {Button, Image, Icon, Label, List, Form, Input} from "semantic-ui-react";
import {getTags, addTag, deleteTag} from "../util/collections";
import React, { useState } from 'react';

class Collections extends React.Component {
    state = {
        newCollectionText: null,
        collections: []
    }

    async fetchColls() {
        let collections = await getTags();
        this.setState({
            collections
        });
    }

    async addNew() {
        if (this.state.newCollectionText.length < 1) {
            return;
        }
        await addTag(this.state.newCollectionText);
        this.setState({
            newCollectionText: ''
        });
        await this.fetchColls();
    }

    async deleteTag(t) {
        await deleteTag(t);
        await this.fetchColls();
    }

    async componentDidMount() {
       await this.fetchColls();
    }

    render() {
        return <>
            <Form>
                <Input style={{paddingBottom: 20}}
                    action={{
                        onClick: () => {this.addNew()},
                        icon: 'plus',
                    }}
                    onChange={(t, val) => {
                        this.setState({newCollectionText: val.value})
                    }}
                    placeholder='Search...'
                />
            </Form>
        <List divided verticalAlign='middle' style={{ minWidth: 80, width: '30%'}}>
            {this.state.collections.map(t =>
                <List.Item >
                    <List.Content floated={'right'}>
                        <Button onClick={() => {
                            this.deleteTag(t.name);
                        }}>Delete</Button>
                    </List.Content>
                         <List.Content verticalAlign='middle'>{t.name}</List.Content>
                </List.Item>)
            }
        </List></>
    }
}

export default Collections;
