import React, {useState, useEffect} from 'react'
import {CopyToClipboard} from 'react-copy-to-clipboard'

import {
    Menu,
    Button,
    Dropdown,
    Container,
    Label, Segment, Popup,
} from 'semantic-ui-react'
import Transfer from './Transfer'

import {useNylon, useNylonState} from './nylon-lib'

const CHROME_EXT_URL =
    'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd'
const FIREFOX_ADDON_URL =
    'https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/'

const acctAddr = acct => (acct ? acct.address : '')

function Main(props) {

    const {api} = useNylonState()
    const [nodeInfo, setNodeInfo] = useState({})

    const {
        setCurrentAccount,
        state: {keyring, currentAccount},
    } = useNylon()

    // Get the list of accounts we possess the private key for
    const keyringOptions = keyring.getPairs().map(account => ({
        key: account.address,
        value: account.address,
        text: account.meta.name,
        icon: 'user',
    }))

    const initialAddress =
        keyringOptions.length > 0 ? keyringOptions[0].value : ''

    // Set the initial address
    useEffect(() => {
        // `setCurrentAccount()` is called only when currentAccount is null (uninitialized)
        !currentAccount &&
        initialAddress.length > 0 &&
        setCurrentAccount(keyring.getPair(initialAddress))
    }, [currentAccount, setCurrentAccount, keyring, initialAddress])

    useEffect(() => {
        const getInfo = async () => {
            try {
                const [chain, nodeName, nodeVersion] = await Promise.all([
                    api.rpc.system.chain(),
                    api.rpc.system.name(),
                    api.rpc.system.version(),
                ])
                setNodeInfo({chain, nodeName, nodeVersion})
            } catch (e) {
                console.error(e)
            }
        }
        getInfo()
    }, [api.rpc.system])

    const onChange = addr => {
        setCurrentAccount(keyring.getPair(addr))
    }

    return (
        <Menu
            attached="top"
            tabular
            style={{
                backgroundColor: '#fff',
                borderColor: '#fff',
                paddingTop: '1em',
                paddingBottom: '1em',
            }}>
            <Container>
                <Menu.Menu>
                    <Segment>
                        <Label as="a" color="blue" ribbon>{nodeInfo.chain}</Label>
                        <CopyToClipboard text={acctAddr(currentAccount)}>
                            <Button
                                basic
                                circular
                                icon="user"
                                color="blue"/>
                        </CopyToClipboard>
                        <Dropdown
                            search
                            selection
                            placeholder="Select an account"
                            options={keyringOptions}
                            onChange={(_, dropdown) => {
                                onChange(dropdown.value)
                            }}
                            value={acctAddr(currentAccount)}/>
                        <BalanceAnnotation/>
                    </Segment>
                </Menu.Menu>
                {!currentAccount ? (
                    <div className="ui positive message" style={{marginLeft: '1em'}}>
                        Create an account with Polkadot-JS Extension (
                        <a target="_blank" rel="noreferrer" href={CHROME_EXT_URL}>
                            Chrome
                        </a>
                        ,&nbsp;
                        <a target="_blank" rel="noreferrer" href={FIREFOX_ADDON_URL}>
                            Firefox
                        </a>
                        )&nbsp;
                    </div>
                ) : null}
            </Container>
        </Menu>
    )
}

function BalanceAnnotation(props) {
    const {api, currentAccount} = useNylonState()
    const [accountBalance, setAccountBalance] = useState(0)

    // When account address changes, update subscriptions
    useEffect(() => {
        let unsubscribe

        // If the user has selected an address, create a new subscription
        currentAccount &&
        api.query.system
            .account(acctAddr(currentAccount), balance =>
                setAccountBalance(balance.data.free.toHuman())
            )
            .then(unsub => (unsubscribe = unsub))
            .catch(console.error)

        return () => unsubscribe && unsubscribe()
    }, [api, currentAccount])

    return currentAccount ? (
        <Popup trigger={<Label tag as='a'>{accountBalance}</Label>} flowing hoverable>
            <Transfer/>
        </Popup>
    ) : null
}

export default function AccountSelector(props) {
    const {api, keyring} = useNylonState()
    return keyring.getPairs && api.query ? <Main {...props} /> : null
}
