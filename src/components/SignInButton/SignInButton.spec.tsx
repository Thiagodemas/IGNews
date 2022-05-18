import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/client'
import React from 'react'
import { SignInButton } from '.'
import { mocked } from 'jest-mock'

jest.mock('next-auth/client')

describe('SignInButton component', () => {
  it('renders correctly when user is not authenticated', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValue([null, false])

    render(<SignInButton />)

    expect(screen.getByText('Sign in with Github')).toBeInTheDocument()
  })

  it('renders correctly when user is authenticated', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([{
      user: { name: 'John Doe', email: 'jdoe@example.com' }, expires: 'fake-expires'
    }, false])

    render(
      <SignInButton />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})