import React from 'react'
import Drops from '../Drops/Drops'
import TokenService from '../services/token-service'
import config from '../config'
import { lootboxesByOwner } from '../lootbox-handlers';

export default class LootBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drops: [],
            // lootboxes: []
        }
    }
    static defautProps = {
        match: {
            params: {}
        }
    }
    componentDidMount() {
        let currentUser = TokenService.getUserId();
        // console.log(currentUser, "user id")
        // console.log(this.props.lootbox, "lootbox id")
        //if the user is not logged in, send him to landing page
        if (!TokenService.hasAuthToken()) {
            window.location = '/'
        }

        let getDropsInLootboxes = `${config.AUTH_ENDPOINT}/lootboxes/${this.props.lootbox.id}/saved`
        let getUserLootboxesUrl = `${config.AUTH_ENDPOINT}/users/${currentUser}/lootboxes`
        // console.log(getDropsInLootboxes, "drop list url")
        Promise.all([
            fetch(getDropsInLootboxes),
            fetch(getUserLootboxesUrl)
        ])
            .then(([drops, lootboxes]) => {
                if (!drops.ok)
                    return drops.json().then(e => Promise.reject(e));
                if (!lootboxes.ok)
                    return lootboxes.json().then(e => Promise.reject(e));
                return Promise.all([drops.json(), lootboxes.json()])
            })

            .then(([drops, lootboxes]) => {
                // console.log(drops, "fetch check 1")
                this.setState({
                    drops: drops.drops,
                    lootboxes: lootboxes
                })
            })
            .catch(error => this.setState({
                error
            }))
            // console.log(this.state, "fetch check")
    }
    render() {
        // console.log(this.state.drops, "drop check")
        // console.log(this.props, "prop check")
        const lootboxDrops = this.state.drops
        // console.log(lootboxDrops, "Second check")
        const dropRender = lootboxDrops.map(drop => {
            return <li><Drops key={drop.id} drop={drop} /></li>
        })

        return (
            <section>
                <p>Feelin' Looty?</p>
                <ul>
                    {dropRender}
                </ul>
            </section>
        )
    }
}