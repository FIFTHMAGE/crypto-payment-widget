import { useState } from 'react'
import { Card, Button, Input, Select } from '../../../components/ui'
import { AddressDisplay } from '../../../components/common'
import { useUIStore } from '../../../store'

interface User {
  address: string
  role: 'user' | 'admin' | 'moderator' | 'viewer'
  permissions: string[]
  createdAt: number
  lastActive: number
  status: 'active' | 'suspended' | 'banned'
}

const ROLES = {
  admin: {
    label: 'Admin',
    permissions: ['all'],
    color: 'red',
  },
  moderator: {
    label: 'Moderator',
    permissions: ['view', 'manage_users', 'manage_transactions'],
    color: 'purple',
  },
  user: {
    label: 'User',
    permissions: ['view', 'transact'],
    color: 'blue',
  },
  viewer: {
    label: 'Viewer',
    permissions: ['view'],
    color: 'gray',
  },
}

export const UserRoles = () => {
  const [users, setUsers] = useState<User[]>([
    {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
      role: 'admin',
      permissions: ['all'],
      createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
      lastActive: Date.now() - 5 * 60 * 1000,
      status: 'active',
    },
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showAddUser, setShowAddUser] = useState(false)

  const [newUser, setNewUser] = useState({
    address: '',
    role: 'user' as const,
  })

  const { addToast } = useUIStore()

  const handleAddUser = () => {
    if (!newUser.address) {
      addToast('Please enter a wallet address', 'error')
      return
    }

    if (users.some(u => u.address.toLowerCase() === newUser.address.toLowerCase())) {
      addToast('User already exists', 'error')
      return
    }

    const user: User = {
      address: newUser.address,
      role: newUser.role,
      permissions: ROLES[newUser.role].permissions,
      createdAt: Date.now(),
      lastActive: Date.now(),
      status: 'active',
    }

    setUsers([...users, user])
    setNewUser({ address: '', role: 'user' })
    setShowAddUser(false)
    addToast('User added successfully', 'success')
  }

  const handleRoleChange = (address: string, newRole: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.address === address
          ? { ...u, role: newRole as any, permissions: ROLES[newRole as keyof typeof ROLES].permissions }
          : u
      )
    )
    addToast('Role updated', 'success')
  }

  const handleStatusChange = (address: string, newStatus: string) => {
    setUsers(prev =>
      prev.map(u => (u.address === address ? { ...u, status: newStatus as any } : u))
    )
    addToast(`User ${newStatus}`, 'info')
  }

  const handleRemoveUser = (address: string) => {
    setUsers(prev => prev.filter(u => u.address !== address))
    addToast('User removed', 'info')
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    return ROLES[role as keyof typeof ROLES]?.color || 'gray'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Roles & Permissions</h2>
        <Button onClick={() => setShowAddUser(!showAddUser)}>
          {showAddUser ? 'Cancel' : '+ Add User'}
        </Button>
      </div>

      {showAddUser && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Add New User</h3>
          <div className="space-y-4">
            <Input
              label="Wallet Address"
              placeholder="0x..."
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
              >
                {Object.entries(ROLES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </Select>
            </div>

            <Button onClick={handleAddUser} fullWidth>
              Add User
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="space-y-4">
          <Input
            placeholder="Search by address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            {Object.entries(ROLES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.address}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AddressDisplay address={user.address} />
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium bg-${getRoleColor(
                      user.role
                    )}-100 text-${getRoleColor(user.role)}-700`}
                  >
                    {ROLES[user.role].label}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : user.status === 'suspended'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="text-xs text-gray-600">Permissions</p>
                <p className="font-medium">{user.permissions.join(', ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Last Active</p>
                <p className="font-medium">
                  {new Date(user.lastActive).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Joined</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <select
                className="border-2 border-gray-200 rounded-lg px-3 py-1 text-sm"
                value={user.role}
                onChange={(e) => handleRoleChange(user.address, e.target.value)}
              >
                {Object.entries(ROLES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>

              <select
                className="border-2 border-gray-200 rounded-lg px-3 py-1 text-sm"
                value={user.status}
                onChange={(e) => handleStatusChange(user.address, e.target.value)}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRemoveUser(user.address)}
              >
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <div className="text-center py-12 text-gray-500">No users found</div>
        </Card>
      )}
    </div>
  )
}

