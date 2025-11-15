import { useState } from 'react'
import { Card, Button, Input, Textarea } from '../../../components/ui'
import { useAccount } from 'wagmi'
import { useUIStore } from '../../../store'
import { useLocalStorage } from '../../../lib/hooks/useLocalStorage'

interface WalletProfile {
  address: string
  displayName: string
  avatar: string
  bio: string
  email: string
  twitter: string
  telegram: string
  defaultCurrency: string
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    email: boolean
    push: boolean
    transactions: boolean
    news: boolean
  }
}

export const WalletProfileManager = () => {
  const { address } = useAccount()
  const { addToast } = useUIStore()

  const [profile, setProfile] = useLocalStorage<WalletProfile | null>('wallet-profile', null)

  const [formData, setFormData] = useState<Partial<WalletProfile>>({
    displayName: profile?.displayName || '',
    avatar: profile?.avatar || '',
    bio: profile?.bio || '',
    email: profile?.email || '',
    twitter: profile?.twitter || '',
    telegram: profile?.telegram || '',
    defaultCurrency: profile?.defaultCurrency || 'USD',
    theme: profile?.theme || 'auto',
    notifications: profile?.notifications || {
      email: true,
      push: true,
      transactions: true,
      news: false,
    },
  })

  const handleSave = () => {
    if (!address) {
      addToast('Please connect your wallet first', 'error')
      return
    }

    const updatedProfile: WalletProfile = {
      address,
      displayName: formData.displayName || '',
      avatar: formData.avatar || '',
      bio: formData.bio || '',
      email: formData.email || '',
      twitter: formData.twitter || '',
      telegram: formData.telegram || '',
      defaultCurrency: formData.defaultCurrency || 'USD',
      theme: formData.theme || 'auto',
      notifications: formData.notifications || {
        email: true,
        push: true,
        transactions: true,
        news: false,
      },
    }

    setProfile(updatedProfile)
    addToast('Profile saved successfully!', 'success')
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Wallet Profile</h2>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                formData.displayName?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button variant="outline" size="sm">
                  Upload Avatar
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF (max. 2MB)</p>
            </div>
          </div>

          <Input
            label="Display Name"
            placeholder="Your Name"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          />

          <Textarea
            label="Bio"
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
          />

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Twitter"
              placeholder="@username"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
            />

            <Input
              label="Telegram"
              placeholder="@username"
              value={formData.telegram}
              onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Currency
            </label>
            <select
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2"
              value={formData.defaultCurrency}
              onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value as any })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.notifications?.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notifications: { ...formData.notifications!, email: e.target.checked },
                })
              }
              className="w-4 h-4"
            />
            <span>Email notifications</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.notifications?.push}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notifications: { ...formData.notifications!, push: e.target.checked },
                })
              }
              className="w-4 h-4"
            />
            <span>Push notifications</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.notifications?.transactions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notifications: { ...formData.notifications!, transactions: e.target.checked },
                })
              }
              className="w-4 h-4"
            />
            <span>Transaction updates</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.notifications?.news}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notifications: { ...formData.notifications!, news: e.target.checked },
                })
              }
              className="w-4 h-4"
            />
            <span>News and updates</span>
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => setFormData(profile || {})}>
          Reset
        </Button>
        <Button onClick={handleSave}>
          Save Profile
        </Button>
      </div>
    </div>
  )
}

