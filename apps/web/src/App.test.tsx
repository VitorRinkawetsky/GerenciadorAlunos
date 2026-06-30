import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the get started heading', () => {
    render(<App />)
    expect(screen.getByText('Get started')).toBeInTheDocument()
  })

  it('increments the counter on click', async () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is 0/i })
    button.click()
    expect(await screen.findByText(/count is 1/i)).toBeInTheDocument()
  })
})
