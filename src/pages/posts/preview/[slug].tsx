import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/client";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";

import { getPrismicClient } from "../../../services/prismic";

import style from '../post.module.scss';

interface PostPreviewProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

type Info = {
    title: any;
    content: any;

}

export default function PostPreview({ post }: PostPreviewProps) {
    const [session] = useSession()
    const router = useRouter()

    useEffect(() => {
        if (session?.activeSubscription) {
            router.push(`/posts/${post.slug}`)
        }
    }, [post.slug, router, session])

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
                        className={`${style.postContent} ${style.previewContent}`}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className={style.continueReading}>
                        Wanna continue reading?
                        <Link href="/">
                            <a href="">Subscribe now 🤗</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { slug } = params;

    const prismic = getPrismicClient()

    const response = await prismic.getByUID('post', String(slug), {})

    const { title, content } = response.data as Info

    const post = {
        slug,
        title: RichText.asText(title),
        content: RichText.asHtml(content.splice(0, 3)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };

    return {
        props: {
            post,
        },
        redirect: 60 * 30, // 30 minutes
    }
}