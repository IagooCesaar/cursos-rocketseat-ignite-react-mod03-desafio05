import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post(): JSX.Element {
  // TODO
  return <h1>Post</h1>;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  // TODO
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    first_publication_date: new Date(
      response.first_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    data: {
      title: response.data.title,
      author: response.data.author,
      banner: {
        url: '',
      },
      content: response.data.content.map(item => {
        return {
          heading: item.heading,
          body: item.body,
        };
      }),
    },
  };

  // TODO
  return {
    post,
  };
};
