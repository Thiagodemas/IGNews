import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { session } from "next-auth/client";
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

jest.mock('../../services/stripe')

const post = {
  slug: 'fake-slug',
  title: 'Fake title 1',
  content: '<p>Fake excerpt 1</p>',
  updatedAt: '2022-05-05',
};

jest.mock("next-auth/client");

jest.mock('../../services/prismic')

describe('Post page', () => {

  it('renders correctly', () => {
    render(<Post post={post} />);

    expect(screen.getByText('Fake title 1')).toBeInTheDocument();
    expect(screen.getByText('Fake excerpt 1')).toBeInTheDocument();
  });

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = mocked(session);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
    } as any);

    const response = await getServerSideProps({
      params: {
        slug: 'my-new-post',
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        })
      })
    )
  });

  it('loads initial data', async () => {
    const getSessionMocked = mocked(session);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'My new post' }
          ],
          content: [
            { type: 'paragraph', text: 'Post content' }
          ],
        },
        last_publication_date: '05-05-2022'
      })
    } as any);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription'
    } as any)

    const response = await getServerSideProps({
      params: {
        slug: 'my-new-post',
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My new post',
            content: '<p>Post content</p>',
            updatedAt: '05 de maio de 2022'
          }
        }
      })
    )
  });
});