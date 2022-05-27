import React, {createRef} from 'react'
import {
    Container,
    Dimmer,
    Loader,
    Grid,
    Sticky,
    Message,
} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import {NylonContextProvider, useNylonState} from './nylon-lib'
import {DeveloperConsole} from './nylon-lib/components'
import AccountSelector from './AccountSelector'

function Main() {
    const {apiState, apiError, keyringState} = useNylonState()

    const loader = text => (
        <Dimmer active>
            <Loader size="small">{text}</Loader>
        </Dimmer>
    )

    const message = errObj => (
        <Grid centered columns={2} padded>
            <Grid.Column>
                <Message
                    negative
                    compact
                    floating
                    header="Error Connecting to Nylon"
                    content={`Connection to websocket '${errObj.target.url}' failed.`}
                />
            </Grid.Column>
        </Grid>
    )

    if (apiState === 'ERROR') return message(apiError)
    else if (apiState !== 'READY') return loader('Connecting to Nylon')

    if (keyringState !== 'READY') {
        return loader(
            "Loading accounts (please review any extension's authorization)"
        )
    }

    const contextRef = createRef()

    return (
        <div ref={contextRef}>
            <Sticky context={contextRef}>
                <Grid.Row>
                    <AccountSelector/>
                </Grid.Row>
            </Sticky>
            <Container>

            </Container>
            <DeveloperConsole/>
        </div>
    )
}

export default function App() {
    return (
        <NylonContextProvider>
            <Main/>
        </NylonContextProvider>
    )
}
