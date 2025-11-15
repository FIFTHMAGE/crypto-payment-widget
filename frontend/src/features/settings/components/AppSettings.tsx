import { useState } from 'react'
import { Card, Button, Input, Select, Checkbox } from '../../../components/ui'
import { useUIStore } from '../../../store'

interface Settings {
  defaultCurrency: string
  defaultGasPrice: 'low' | 'medium' | 'high'
  notifications: {
    email: boolean
    browser: boolean
    sms: boolean
  }
  security: {
    requireConfirmation: boolean
    maxTransactionLimit: string
  }
  display: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    compactMode: boolean
  }
}

export const AppSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    defaultCurrency: 'ETH',
    defaultGasPrice: 'medium',
    notifications: {
      email: true,
      browser: true,
      sms: false,
    },
    security: {
      requireConfirmation: true,
      maxTransactionLimit: '10',
    },
    display: {
      theme: 'light',
      language: 'en',
      compactMode: false,
    },
  })

  const { addToast } = useUIStore()

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('app-settings', JSON.stringify(settings))
    addToast('Settings saved successfully!', 'success')
  }

  const handleReset = () => {
    // Reset to defaults
    localStorage.removeItem('app-settings')
    addToast('Settings reset to defaults', 'info')
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Default Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Currency
            </label>
            <Select
              value={settings.defaultCurrency}
              onChange={(e) =>
                setSettings({ ...settings, defaultCurrency: e.target.value })
              }
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="DAI">DAI</option>
              <option value="USDT">USDT</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Gas Price
            </label>
            <Select
              value={settings.defaultGasPrice}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultGasPrice: e.target.value as 'low' | 'medium' | 'high',
                })
              }
            >
              <option value="low">Low (Slower)</option>
              <option value="medium">Medium (Standard)</option>
              <option value="high">High (Faster)</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>

        <div className="space-y-3">
          <Checkbox
            label="Email notifications"
            checked={settings.notifications.email}
            onChange={(e) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  email: e.target.checked,
                },
              })
            }
          />
          <Checkbox
            label="Browser notifications"
            checked={settings.notifications.browser}
            onChange={(e) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  browser: e.target.checked,
                },
              })
            }
          />
          <Checkbox
            label="SMS notifications"
            checked={settings.notifications.sms}
            onChange={(e) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  sms: e.target.checked,
                },
              })
            }
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Security</h3>

        <div className="space-y-4">
          <Checkbox
            label="Require confirmation for all transactions"
            checked={settings.security.requireConfirmation}
            onChange={(e) =>
              setSettings({
                ...settings,
                security: {
                  ...settings.security,
                  requireConfirmation: e.target.checked,
                },
              })
            }
          />

          <Input
            label="Maximum transaction limit (ETH)"
            type="number"
            value={settings.security.maxTransactionLimit}
            onChange={(e) =>
              setSettings({
                ...settings,
                security: {
                  ...settings.security,
                  maxTransactionLimit: e.target.value,
                },
              })
            }
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Display</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <Select
              value={settings.display.theme}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  display: {
                    ...settings.display,
                    theme: e.target.value as 'light' | 'dark' | 'auto',
                  },
                })
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <Select
              value={settings.display.language}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  display: {
                    ...settings.display,
                    language: e.target.value,
                  },
                })
              }
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </Select>
          </div>

          <Checkbox
            label="Compact mode"
            checked={settings.display.compactMode}
            onChange={(e) =>
              setSettings({
                ...settings,
                display: {
                  ...settings.display,
                  compactMode: e.target.checked,
                },
              })
            }
          />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} fullWidth>
          Save Settings
        </Button>
        <Button onClick={handleReset} variant="outline" fullWidth>
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}

