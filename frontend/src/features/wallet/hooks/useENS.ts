import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface ENSData {
  name: string | null
  avatar: string | null
  loading: boolean
  error: Error | null
}

export const useENS = (address?: string) => {
  const { address: connectedAddress } = useAccount()
  const targetAddress = address || connectedAddress

  const [ensData, setENSData] = useState<ENSData>({
    name: null,
    avatar: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!targetAddress) {
      setENSData({ name: null, avatar: null, loading: false, error: null })
      return
    }

    const fetchENS = async () => {
      setENSData(prev => ({ ...prev, loading: true, error: null }))

      try {
        // TODO: Implement actual ENS resolution
        // For now, return mock data
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock: check if address ends in certain patterns
        if (targetAddress.toLowerCase().endsWith('1234')) {
          setENSData({
            name: 'demo.eth',
            avatar: null,
            loading: false,
            error: null,
          })
        } else {
          setENSData({
            name: null,
            avatar: null,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        setENSData({
          name: null,
          avatar: null,
          loading: false,
          error: error as Error,
        })
      }
    }

    fetchENS()
  }, [targetAddress])

  return ensData
}

export const useReverseENS = (address?: string) => {
  const { address: connectedAddress } = useAccount()
  const targetAddress = address || connectedAddress

  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!targetAddress) {
      setName(null)
      return
    }

    const fetchName = async () => {
      setLoading(true)
      try {
        // TODO: Implement actual reverse ENS lookup
        await new Promise(resolve => setTimeout(resolve, 300))
        setName(null)
      } catch (error) {
        setName(null)
      } finally {
        setLoading(false)
      }
    }

    fetchName()
  }, [targetAddress])

  return { name, loading }
}

