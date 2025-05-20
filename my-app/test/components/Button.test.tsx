import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// This is a sample test file to demonstrate the testing structure
// You can delete this file once you start adding your own tests

describe('Sample Button Test', () => {
  it('renders button with correct text', () => {
    render(<button>Click me</button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<button onClick={handleClick}>Click me</button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
}) 