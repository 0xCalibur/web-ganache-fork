import { createContext, useContext, useState } from 'react';
import './App.css';

export const GanacheContext = createContext({ startGanache: () => { } });

const RPCS = {
  0x1: 'https://eth-rpc.gateway.pokt.network',
  0x38: 'https://bsc-dataseed.binance.org/',
  0xa: 'https://mainnet.optimism.io',
};

function GanacheProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [status, setStatus] = useState(null);
  const [chainId, setChainId] = useState(null);

  const startGanache = async (requestedChainId, blockNumber) => {
    const options = {
      fork: {
        chainId: requestedChainId,
        block: blockNumber,
        url: RPCS[requestedChainId],
      }
    };
    if (provider) {
      console.log('disconnecting');
      setStatus('disconnecting');
      setChainId(null);
      await provider.disconnect();
    }
    console.log(`starting ganache on ${requestedChainId} @${blockNumber}...`);
    setStatus('connecting');
    const newProvider = await window.Ganache.provider(options);
    setChainId(await newProvider.send('eth_chainId', []));
    setStatus('connected');
    setProvider(newProvider);
  };

  const send = async (method, params) => {
    if (!provider) {
      console.log('no provider');
      return;
    }
    console.log('sending', method, params);
    const result = await provider.send(method, params);
    console.log('result', result);
  };

  return (
    <GanacheContext.Provider value={{ status, chainId, startGanache, send }}>
      {children}
    </GanacheContext.Provider>
  );
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <GanacheProvider>
          <GanacheRunner />
        </GanacheProvider>
      </header>
    </div>
  );
}

function GanacheRunner() {
  const { status, chainId, startGanache, send, latestBlock } = useContext(GanacheContext);
  const [blockNumber, setBlockNumber] = useState(null);
  const [requestedChainId, setRequestedChainId] = useState(null);

  return (
    <div>
      <h1>Network to use</h1>
      <p>Status: {status}</p>
      <p>ChainId: {chainId}</p>
      <input type="number" placeholder="blocknumber" onChange={(e) => setBlockNumber(e.target.value)} />
      <select onChange={(e) => setRequestedChainId(e.target.value)} defaultValue="0">
        <option value="0">--Select--</option>
        <option value="0x1">Mainnet</option>
        <option value="0x38">Binance</option>
        <option value="0xa">Optimism</option>
      </select>
      <button onClick={() => { startGanache(requestedChainId, blockNumber) }} disabled={!blockNumber}>Start</button>
    </div>
  );
}
export default App;
