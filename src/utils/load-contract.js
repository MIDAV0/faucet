import contract from '@truffle/contract' 

export const loadContract = async (name, provider) => {
    const responce = await fetch(`./contracts/${name}.json`)
    const Artifact = await responce.json()
    
    const _contract = contract(Artifact)
    _contract.setProvider(provider)

    let deployedContract = null

    try {
        deployedContract = await _contract.deployed()
    } catch {
        console.error("You are connented to wrong network. Please connect to Rinkeby network.")
    }

    return deployedContract
}