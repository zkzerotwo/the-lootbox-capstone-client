import React from 'react'
import config from '../config'
import TokenService from '../services/token-service'
// import ValidationError from '../ValidationError'

export default class AddToLootbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lootboxes: [],
            series: {
                value: '',
                touched: false
            },
            description: {
                value: '',
                touched: false
            },
            lootboxId: {
                value: '',
                touched: false
            },
            malId: '',
            dropType: '',
            dropName: {
                value: '',
                touched: false
            },
            referenceUrl: '',
            imageUrl: '',
            isAdded: false
        }
    }
    static defaultProps = {
        history: {
            goBack: () => { }
        },
        match: {
            params: {}
        }
    }
    updateLootboxId = (lootboxId) => {
        this.setState({
            lootboxId: {
                value: lootboxId,
                touched: true
            }
        })
        // console.log(lootboxId)
    }
    updateMalId = (select) => {
        this.setState({
            malId: {
                value: select,
                touched: true
            }
        })
        // console.log(select)
    }

    updateDropDescription = (description) => {
        this.setState({
            dropDescription: {
                value: description,
                touched: true
            }
        })
    }
    updateDropName = (name) => {
        this.setState({
            dropName: {
                value: name,
                touched: true
            }
        })
        // console.log(name)
    }
    updateDropType = (type) => {
        this.setState({
            dropType: {
                value: type,
                touched: true
            }
        })
        // console.log(type)
    }
    updateUrl = (url) => {
        this.setState({
            referenceUrl: {
                value: url,
                touched: true
            }
        })
        // console.log(url)
    }
    updateImageUrl = (imageUrl) => {
        this.setState({
            imageUrl: {
                value: imageUrl,
                touched: true
            }
        })
        // console.log(imageUrl)
    }
    componentDidMount() {
        //get user id and load lootboxes
        let currentUser = TokenService.getUserId();
        let getUserLootboxesUrl = `${config.AUTH_ENDPOINT}/users/${currentUser}/lootboxes`
        fetch(getUserLootboxesUrl)
            .then((lootboxes) => {
                if (!lootboxes.ok)
                    return lootboxes.json().then(e => Promise.reject(e));
                return lootboxes.json()
            })
            .then((lootboxes) => {
                // console.log(lootboxes, "lootbox list")

                this.setState({
                    lootboxes: lootboxes.lootboxes
                })
            })
            .catch(
                (error => this.setState({ error }))
            )
    }

    handleSubmit = (e) => {
        //add drops to selected lootbox
        e.preventDefault();
        // console.log(this.props.entryId)
        const entryEndpoint = `${config.API_ENDPOINT_SAVE}`
        const seriesId = this.props.entryId
        const entryType = this.props.entryType
        const entryUrl = `${entryEndpoint}/${entryType}/${seriesId}`
        // console.log(entryUrl)
        const dropName = this.state.dropName.value
        const dropDescription = this.state.dropDescription.value
        const boxId = this.state.lootboxId.value

        fetch(entryUrl)
            .then(entryData => {
                if (!entryData.ok) {
                    throw new Error('Something went wrong, please try again later.');
                }
                return entryData.json()
            })
            .then(entryData => {
                // console.log(entryData, "entry data")
                this.setState({
                    malId: entryData.mal_id,
                    referenceUrl: entryData.url,
                    imageUrl: entryData.image_url
                })
                const selectedId = this.state.malId
                const dropType = entryType
                const referenceUrl = entryData.url
                const imageUrl = entryData.image_url
                let payload = {
                    mal_id: selectedId,
                    drop_type: dropType,
                    drop_name: dropName,
                    lootbox_id: boxId,
                    drop_description: dropDescription,
                    url: referenceUrl,
                    image_url: imageUrl
                }
                // console.log(payload, "payload")
                fetch(`${config.AUTH_ENDPOINT}/drops`, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': `${config.APP_API_TOKEN}`
                    },
                    body: JSON.stringify(payload),
                })
                    .then((dropPost) => {
                        // console.log(dropPost)
                        if (!dropPost.ok) {
                            return dropPost.json().then(e => Promise.reject(e));
                        }
                        return dropPost.json()
                    })
                    .then((newLootbox) => {
                        console.log(newLootbox)
                    })
                    .catch(error => this.setState({ error }))
            })
            .catch(err => {
                console.error(err);
            })


    }
    //TODO: add submission validation
    render() {
        // console.log(this.state.lootboxes, "data check")
        // console.log(this.props.entryId, "id check")
        const lootboxList = this.state.lootboxes.map(lootbox => {
            // console.log(lootbox.title)
            return (
                <option
                    key={lootbox.id}
                    value={lootbox.id}>
                    {lootbox.title}
                </option>
            )
        })
        console.log(lootboxList, "list of lootboxes")
        return (
            <div>
                <form onSubmit={this.handleSubmit}>

                    {/* <h4>{this.props.entryId}</h4> */}
                    <div className="drop_setup">
                        <label htmlFor='dropName'>
                            Drop Nickname
      {' '}
                        </label>
                        <input
                            type='text'
                            title='dropName'
                            id='dropName'
                            placeholder='Name your drop'
                            onChange={e => this.updateDropName(e.target.value)}
                            required
                        />
                    </div>
                    {this.state.dropName.touched 
                    // && (<ValidationError message={this.validateDropName()} />)
                    }
                    <label htmlFor="description">
                        Description
                </label>
                    <textarea
                        id="description"
                        title="description"
                        placeholder="Add a personal description for this drop"
                        onChange={e => this.updateDropDescription(e.target.value)}
                    >
                    </textarea>
                    <label
                        htmlFor="lootboxes"
                    >
                        Save in *
                        
                    <select
                        id="lootboxes"
                        name="lootboxes"
                        onChange={e => this.updateLootboxId(e.target.value)}
                        defaultValue="Select Lootbox"
                    >
                        <option
                            disabled
                        >
                            Select Lootbox
                            </option>
                        {lootboxList}
                    </select>
                    </label>
                    <button
                        type='submit'
                    // disabled={
                        // this.validateTitle() || 
                        // this.validateLootboxSelect()}
                    >
                        Save
    </button>
                </form>
            </div>
        )
    }
}