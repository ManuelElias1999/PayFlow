declare global {
    interface Window {
      ethereum?: any;
    }
  }
  
  const INJECTIVE_TESTNET = {
    chainId: '0x59f',
    chainName: 'Injective EVM Testnet',
    nativeCurrency: {
      name: 'INJ',
      symbol: 'INJ',
      decimals: 18,
    },
    rpcUrls: ['https://k8s.testnet.json-rpc.injective.network/'],
    blockExplorerUrls: ['https://testnet.blockscout.injective.network/'],
  };
  
  export async function switchToInjectiveTestnet() {
    if (!window.ethereum) throw new Error('MetaMask not found');
  
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId === INJECTIVE_TESTNET.chainId) return;
  
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: INJECTIVE_TESTNET.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [INJECTIVE_TESTNET],
        });
      } else {
        throw switchError;
      }
    }
  }