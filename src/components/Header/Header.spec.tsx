import React from "react"
import { render, screen } from '@testing-library/react'
import { ActiveLink } from "../ActiveLink"
import { Header } from "."
import { useSession } from "next-auth/client"

jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/'
      }
    }
  }
})

jest.mock('next-auth/client', () => {
  return {
    useSession() {
      return [null, false]
    }
  }
})

describe('Header component', () => {
  it('renders correctly', () => {
    render(
      <Header />
    )
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Posts')).toBeInTheDocument()
  })


})

