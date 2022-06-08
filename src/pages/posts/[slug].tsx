import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import Head from "next/head";
import { RichText } from "prismic-dom";

import { getPrismicClient } from "../../services/prismic";

import style from './post.module.scss';

interface PostProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

type Info = {
    title: string;
    content: any | string;
}

export default function Post({ post }: PostProps) {
    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>

            <main className={style.container}>
                <article className={style.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div
                        className={style.postContent}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </main>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    const session = await getSession({ req })
    const { slug } = params;

    if (!session?.activeSubscription) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const prismic = getPrismicClient(req)

    const response = await prismic.getByUID('post', String(slug), {})

    const { title, content } = response.data as Info

    const post = {
        slug,
        title: RichText.asText(title),
        content: RichText.asHtml(content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };

    return {
        props: {
            post,
        }
    }
}