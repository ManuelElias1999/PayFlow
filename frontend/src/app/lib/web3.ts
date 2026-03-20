import { BrowserProvider, Contract } from 'ethers';
import { CONTRACTS } from './contracts';
import { usdcAbi } from './abis/usdc';
import { payrollAbi } from './abis/payroll';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function getProvider() {
  if (!window.ethereum) throw new Error('MetaMask not found');

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (Number(network.chainId) !== 1439) {
    throw new Error('Wrong network. Please switch to Injective EVM Testnet.');
  }

  return provider;
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function getAccount() {
  const signer = await getSigner();
  return signer.getAddress();
}

export async function getUsdcContract(withSigner = true) {
  const provider = await getProvider();
  const signer = await getSigner();
  return new Contract(
    CONTRACTS.usdc,
    usdcAbi,
    withSigner ? signer : provider
  );
}

export async function getPayrollContract(withSigner = true) {
  const provider = await getProvider();
  const signer = await getSigner();
  return new Contract(
    CONTRACTS.payroll,
    payrollAbi,
    withSigner ? signer : provider
  );
}