import React from "react"
import { render } from '@testing-library/react'
import { ActiveLink } from "../ActiveLink"
import { Header } from "."

jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/'
      }
    }
  }
})

describe('Header component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Header />
    )
    expect(getByText('Home')).toBeInTheDocument()
  })


})

