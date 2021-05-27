import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client';
import { FiClock, FiUser, FiCalendar } from 'react-icons/fi';
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
  posts: Post[];
}

export default function Home({
  postsPagination,
  posts,
}: HomeProps): JSX.Element {
  // TODO
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={commonStyles.pageContainer}>
        {posts.map(post => (
          <div className={styles.postItem}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong className={styles.postTitle}>{post.data.title}</strong>
              </a>
            </Link>
            <span className={styles.postSubtitle}>{post.data.subtitle}</span>
            <div className={styles.postInfos}>
              <div>
                <FiCalendar />
                <span>{post.first_publication_date}</span>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </div>
          </div>
        ))}
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
  const posts: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      data: {
        author: post.data.author,
        subtitle: post.data.subtitle,
        title: post.data.title,
      },
    };
  });

  return {
    props: {
      posts,
    },
  };
};
