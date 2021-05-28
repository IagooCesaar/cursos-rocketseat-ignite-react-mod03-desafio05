import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiClock, FiUser, FiCalendar } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../utils/formatDate';
import { UtterancesComments } from '../../components/UtterancesComments';
import { LeavePreviewModeButton } from '../../components/LeavePreviewModeButton';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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
  preview: boolean;
}

function calculateEstimatedReadingTime(post: Post): number {
  const wordsPerMinute = 200;
  const wordsCount =
    RichText.asText(
      post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
    ).split(' ').length +
    RichText.asText(
      post.data.content.reduce((acc, data) => {
        if (data.heading) {
          return [...acc, ...data.heading.split(' ')];
        }
        return [...acc];
      }, [])
    ).split(' ').length;

  const readingEstimatedTime = Math.ceil(wordsCount / wordsPerMinute);
  return readingEstimatedTime;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return (
      <>
        <Head>
          <title> Aguarde... | spacetraveling</title>
        </Head>
        <main className={commonStyles.pageContainer}>
          <span className={styles.loadingWarning}>Carregando...</span>
        </main>
      </>
    );
  }

  const readingTime = calculateEstimatedReadingTime(post);
  const { author, banner, content, title } = post.data;
  const { first_publication_date } = post;

  console.log({ preview });

  return (
    <>
      <Head>
        <title>{title} | spacetraveling</title>
      </Head>
      <div className={styles.bannerContainer}>
        <img src={banner.url} alt={title} />
      </div>
      <main className={commonStyles.pageContainer}>
        <article className={styles.post}>
          <h2>{title}</h2>
          <div className={styles.postInfos}>
            <div>
              <FiCalendar />
              <span>{formatDate(first_publication_date)}</span>
            </div>
            <div>
              <FiUser />
              <span>{author}</span>
            </div>
            <div>
              <FiClock />
              <span>{`${readingTime} min`}</span>
            </div>
          </div>
          <div className={styles.contentContainer}>
            {content.map((contentGroup, index) => (
              <div className={styles.content} key={index}>
                <h3>{contentGroup.heading}</h3>
                {contentGroup.body.map((bodyItem, index) => (
                  <p
                    key={index}
                    dangerouslySetInnerHTML={{ __html: bodyItem.text }}
                  />
                ))}
              </div>
            ))}
          </div>
        </article>
        <div>
          <button type="button">anterior</button>
          <button type="button">próximo</button>
        </div>
        <div>
          <UtterancesComments
            async
            crossOrigin="anonymous"
            issueTerm="pathname"
            label="Utterances Comments"
            repositoryURL="IagooCesaar/cursos-rocketseat-ignite-react-mod03-desafio05"
            theme="github-dark"
          />
        </div>
        {preview && <LeavePreviewModeButton />}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.uid'],
      pageSize: 3,
    }
  );
  const paths = postsResponse.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });
  console.log({ preview });

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(item => {
        return {
          heading: item.heading,
          body: item.body,
        };
      }),
    },
  };

  return {
    props: {
      post,
      preview,
    },
    revalidate: 2 * 60 * 60, // 2 hours
  };
};
