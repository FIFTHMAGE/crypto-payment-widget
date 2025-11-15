import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Tabs } from '../Tabs'

describe('Tabs', () => {
  const tabs = [
    { id: '1', label: 'Tab 1', content: 'Content 1' },
    { id: '2', label: 'Tab 2', content: 'Content 2' },
    { id: '3', label: 'Tab 3', content: 'Content 3' },
  ]

  it('should render tabs', () => {
    render(<Tabs tabs={tabs} />)
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Tab 3')).toBeInTheDocument()
  })

  it('should show first tab content by default', () => {
    render(<Tabs tabs={tabs} />)
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
  })

  it('should switch tabs on click', async () => {
    const { user } = render(<Tabs tabs={tabs} />)
    
    await user.click(screen.getByText('Tab 2'))
    expect(screen.getByText('Content 2')).toBeInTheDocument()
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
  })

  it('should call onChange when tab changes', async () => {
    const onChange = vi.fn()
    const { user } = render(<Tabs tabs={tabs} onChange={onChange} />)
    
    await user.click(screen.getByText('Tab 2'))
    expect(onChange).toHaveBeenCalledWith('2')
  })

  it('should have active state on selected tab', async () => {
    const { user } = render(<Tabs tabs={tabs} />)
    
    const tab2 = screen.getByText('Tab 2')
    await user.click(tab2)
    expect(tab2.parentElement).toHaveClass('border-b-2')
  })
})

