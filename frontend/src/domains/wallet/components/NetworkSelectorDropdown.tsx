import { Select } from '../../../components/ui'
import { useSwitchChain, useChainId } from 'wagmi'
import { CHAIN_IDS, NATIVE_TOKENS } from '../../../core/constants'

export function NetworkSelectorDropdown() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const chains = [
    { id: CHAIN_IDS.ETHEREUM_MAINNET, name: 'Ethereum' },
    { id: CHAIN_IDS.ETHEREUM_SEPOLIA, name: 'Sepolia Testnet' },
    { id: CHAIN_IDS.POLYGON_MAINNET, name: 'Polygon' },
    { id: CHAIN_IDS.BSC_MAINNET, name: 'BNB Chain' },
  ]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Network
      </label>
      <Select
        value={chainId}
        onChange={(e) => switchChain({ chainId: parseInt(e.target.value) })}
      >
        {chains.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name}
          </option>
        ))}
      </Select>
    </div>
  )
}

