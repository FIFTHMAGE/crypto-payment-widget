import { useState } from 'react'
import { Card, Button, Input } from '../../../components/ui'
import { AddressDisplay } from '../../../components/common'
import { useUIStore } from '../../../store'
import { isValidAddress } from '../../../lib/utils/validation'

interface Contact {
  id: string
  name: string
  address: string
  notes?: string
  category: string
  isFavorite: boolean
  createdAt: number
  lastUsed?: number
}

const CATEGORIES = ['Personal', 'Business', 'Exchange', 'DeFi', 'Other']

export const AddressBook = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Alice',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
      notes: 'Monthly rent',
      category: 'Personal',
      isFavorite: true,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      lastUsed: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    notes: '',
    category: 'Personal',
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const { addToast } = useUIStore()

  const handleSubmit = () => {
    if (!formData.name || !formData.address) {
      addToast('Please fill in required fields', 'error')
      return
    }

    if (!isValidAddress(formData.address)) {
      addToast('Invalid Ethereum address', 'error')
      return
    }

    if (editingId) {
      setContacts(prev =>
        prev.map(c => (c.id === editingId ? { ...c, ...formData } : c))
      )
      addToast('Contact updated', 'success')
    } else {
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        ...formData,
        isFavorite: false,
        createdAt: Date.now(),
      }
      setContacts([newContact, ...contacts])
      addToast('Contact added', 'success')
    }

    setFormData({ name: '', address: '', notes: '', category: 'Personal' })
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name,
      address: contact.address,
      notes: contact.notes || '',
      category: contact.category,
    })
    setEditingId(contact.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id))
    addToast('Contact deleted', 'info')
  }

  const toggleFavorite = (id: string) => {
    setContacts(prev =>
      prev.map(c => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    )
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = filterCategory === 'all' || contact.category === filterCategory

    const matchesFavorite = !showFavoritesOnly || contact.isFavorite

    return matchesSearch && matchesCategory && matchesFavorite
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Address Book</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Contact'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Contact' : 'New Contact'}
          </h3>

          <div className="space-y-4">
            <Input
              label="Name *"
              placeholder="e.g., Alice"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Address *"
              placeholder="0x..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Input
              label="Notes"
              placeholder="Optional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />

            <Button onClick={handleSubmit} fullWidth>
              {editingId ? 'Update Contact' : 'Add Contact'}
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="space-y-4">
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex items-center gap-4">
            <select
              className="border-2 border-gray-200 rounded-lg px-4 py-2"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              />
              <span className="text-sm">Favorites only</span>
            </label>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} padding="sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{contact.name}</h3>
                  <button
                    onClick={() => toggleFavorite(contact.id)}
                    className="text-xl"
                  >
                    {contact.isFavorite ? '⭐' : '☆'}
                  </button>
                </div>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {contact.category}
                </span>
              </div>
            </div>

            <div className="mb-3">
              <AddressDisplay address={contact.address} copyable linkToExplorer chainId={1} />
            </div>

            {contact.notes && (
              <p className="text-sm text-gray-600 mb-3">{contact.notes}</p>
            )}

            <div className="text-xs text-gray-500 mb-3">
              {contact.lastUsed && (
                <span>Last used: {new Date(contact.lastUsed).toLocaleDateString()}</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button size="sm" fullWidth>
                Send
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleEdit(contact)}>
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(contact.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            No contacts found
          </div>
        </Card>
      )}
    </div>
  )
}

