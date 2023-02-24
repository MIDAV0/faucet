import { useEffect } from 'react';
import './App.css';
import Web3 from 'web3';
import { useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { loadContract } from './utils/load-contract';
import { useCallback } from 'react';

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
    isProviderLoaded: false
  });

  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [shouldReload, setShouldReload] = useState(false);

  const canConnectToContract = account && web3Api.contract;
  const reloadEffect = useCallback(() => setShouldReload(!shouldReload), [shouldReload]);

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();

      const setAccountListener = (provider) => {
        provider.on('accountsChanged', _ => window.location.reload());
        provider.on("chainChanged", _ => window.location.reload());
      }

      //debugger
      if (provider) {
        const contract = await loadContract("Faucet", provider);
        setAccountListener(provider);
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
          isProviderLoaded: true
        })
      } else {
        setWeb3Api(api => ({ ...api, isProviderLoaded: true }))
        console.error('Please install MetaMask!');
      }
    }

    loadProvider();
  }, [])

  useEffect(() => {
    const loadBalance = async() => {
      const { contract, web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);
      setBalance(web3.utils.fromWei(balance, "ether"));
    }
    web3Api.contract && loadBalance();
  }, [web3Api, shouldReload]) 

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    }

    web3Api.web3 && getAccount();
  }, [web3Api.web3])

  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3Api;
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether")
    })
    reloadEffect();

  }, [web3Api, account, reloadEffect])

  const withdraw = useCallback(async () => {
    const { contract, web3 } = web3Api;
    const withdrawAmount = web3.utils.toWei("0.1", "ether");
    await contract.withdraw(withdrawAmount, {
      from: account
    })
    reloadEffect();
  }, [web3Api, account, reloadEffect])


  return (
    <>
      <div className='faucet-wrapper'>
        <div className='faucet'>
          { web3Api.isProviderLoaded ? 
            <div className='is-flex is-align-items-center'>
              <span>
                <strong className='mr-2'>Account: </strong>
              </span>
                {
                  account ? 
                  <div>{account}</div> : 
                  !web3Api.provider ?
                    <>
                      <div className='notification is-warning is-size-6 is-rounded'>
                        Wallet is not detected!
                        <a target="_blank" rel="noreferrer" href="https://docs.metamask.io">
                          <strong>Install MetaMask</strong>
                        </a>
                      </div>
                    </> :
                  <button
                    className='button is-small'
                    onClick={() => 
                      web3Api.provider.request({ method: 'eth_requestAccounts' })
                    }
                  >
                    Connect
                  </button>
                }
              </div> :
              <span>Looking for web3...</span>
          } 
          <div className='balance-view is-size-2'>
            Current Balance: <strong>{balance ? balance : ""}</strong> ETH
          </div>
          {
            !canConnectToContract &&
            <i className='is-block'>
              Connect to Gana
            </i>
          }
          <button 
            disabled={!canConnectToContract}
            className='button mr-2 is-primary'
            onClick={addFunds}
          >
            Donate 1 ETH
          </button>
          <button 
            disabled={!canConnectToContract}
            className='button is-link'
            onClick={withdraw}
          >
            Withdraw 0.1 ETH
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
