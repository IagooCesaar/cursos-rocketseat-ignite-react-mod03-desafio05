import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import { FiUser, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

interface PrismicDocument {
  uid: string;
  first_publication_date: string;
  data: {
    author: string;
    title: string;
    subtitle: string;
  };
}

function formatDate(date: string): string {
  return format(new Date(date), 'dd MMM yyyy', { locale: ptBR });
}

function PrimiscDocumentToPost(document: PrismicDocument[]): Post[] {
  const posts = document.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        author: post.data.author,
        subtitle: post.data.subtitle,
        title: post.data.title,
      },
    };
  });
  return posts;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [prismicNextPage, setPrismicNextPage] = useState('');

  useEffect(() => {
    setPosts(postsPagination.results);
    setPrismicNextPage(postsPagination.next_page);
  }, [postsPagination]);

  function handleGetMorePost(): void {
    fetch(prismicNextPage)
      .then(response => response.json())
      .then(data => {
        setPrismicNextPage(data.next_page);
        const newPosts = PrimiscDocumentToPost(
          data.results as PrismicDocument[]
        );
        setPosts([...posts, ...newPosts]);
      });
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={commonStyles.pageContainer}>
        {posts.map(post => (
          <div className={styles.postItem} key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong className={styles.postTitle}>{post.data.title}</strong>
              </a>
            </Link>
            <span className={styles.postSubtitle}>{post.data.subtitle}</span>
            <div className={styles.postInfos}>
              <div>
                <FiCalendar />
                <span>{formatDate(post.first_publication_date)}</span>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </div>
          </div>
        ))}
        {prismicNextPage && (
          <div className={styles.actionsContainer}>
            <button type="button" onClick={handleGetMorePost}>
              Carregar mais posts
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 3,
      page: 1,
    }
  );

  const posts: Post[] = PrimiscDocumentToPost(
    postsResponse.results as PrismicDocument[]
  );

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
    revalidate: 2 * 60 * 60, // 2 hours
  };
};
