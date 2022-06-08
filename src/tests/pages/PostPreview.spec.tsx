import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/client'
import { mocked } from 'jest-mock';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';
import { useRouter } from 'next/router';

jest.mock('../../services/stripe')

const post = {
  slug: 'fake-slug',
  title: 'Fake title 1',
  content: '<p>Fake excerpt 1</p>',
  updatedAt: '01-01-2021',
};

jest.mock("next-auth/client");
jest.mock('next/router')
jest.mock('../../services/prismic')

describe('Post preview page', () => {

  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(<Post post={post} />);

    expect(screen.getByText('Fake title 1')).toBeInTheDocument();
    expect(screen.getByText('Fake excerpt 1')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
  });

  it("redirects user to full post when user is subscribed", async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([{
      activeSubscription: 'fake-active-subscription',

    },
      false
    ] as any)

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any)

    render(<Post post={post} />)

    expect(pushMock).toHaveBeenCalledWith('/posts/fake-slug')
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'Fake title 1' }
          ],
          content: [
            { type: 'paragraph', text: 'Fake excerpt 1' }
          ],
        },
        last_publication_date: '01-01-2021'
      })
    } as any);

    const response = await getStaticProps({ params: { slug: 'fake-slug' } })

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'fake-slug',
            title: 'Fake title 1',
            content: '<p>Fake excerpt 1</p>',
            updatedAt: '01 de janeiro de 2021',
          }
        }
      })
    )
  });
});