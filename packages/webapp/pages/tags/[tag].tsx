import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement, useContext, useMemo } from 'react';
import HashtagIcon from '@dailydotdev/shared/icons/hashtag.svg';
import PlusIcon from '@dailydotdev/shared/icons/plus.svg';
import BlockIcon from '@dailydotdev/shared/icons/block.svg';
import XIcon from '@dailydotdev/shared/icons/x.svg';
import { useRouter } from 'next/router';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { TAG_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import {
  FeedSettingsData,
  TAGS_SETTINGS_QUERY,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import {
  Button,
  ButtonProps,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CustomFeedHeader,
  customFeedIcon,
  FeedPage,
} from '@dailydotdev/shared/src/components/utilities';
import useMutateFilters, {
  getTagsSettingsQueryKey,
} from '@dailydotdev/shared/src/hooks/useMutateFilters';
import classNames from 'classnames';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { getLayout } from '../../components/layouts/FeedLayout';

type TagPageProps = { tag: string };

const TagPage = ({ tag }: TagPageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(() => ({ tag, ranking: 'TIME' }), [tag]);

  const queryKey = getTagsSettingsQueryKey(user);
  const { data: feedSettings } = useQuery<FeedSettingsData>(
    queryKey,
    () => request(`${apiUrl}/graphql`, TAGS_SETTINGS_QUERY),
    {
      enabled: !!user && tokenRefreshed,
    },
  );

  const { followTag, unfollowTag, blockTag, unblockTag } =
    useMutateFilters(user);

  const tagStatus = useMemo(() => {
    if (!feedSettings?.feedSettings) {
      return 'unfollowed';
    }
    if (
      feedSettings.feedSettings.blockedTags?.findIndex(
        (blockedTag) => tag === blockedTag,
      ) > -1
    ) {
      return 'blocked';
    }
    if (
      feedSettings.feedSettings?.includeTags?.findIndex(
        (includedTag) => tag === includedTag,
      ) > -1
    ) {
      return 'followed';
    }
    return 'unfollowed';
  }, [feedSettings, tag]);

  if (isFallback) {
    return <></>;
  }

  const seo: NextSeoProps = {
    title: `${tag} posts on daily.dev`,
    titleTemplate: '%s',
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };

  const followButtonProps: ButtonProps<'button'> = {
    buttonSize: 'small',
    icon: tagStatus === 'followed' ? <XIcon /> : <PlusIcon />,
    onClick: async (): Promise<void> => {
      if (user) {
        if (tagStatus === 'followed') {
          await unfollowTag({ tag });
        } else {
          await followTag({ tag });
        }
      } else {
        showLogin('filter');
      }
    },
  };

  const blockButtonProps: ButtonProps<'button'> = {
    buttonSize: 'small',
    icon: tagStatus === 'blocked' ? <XIcon /> : <BlockIcon />,
    onClick: async (): Promise<void> => {
      if (user) {
        if (tagStatus === 'blocked') {
          await unblockTag({ tag });
        } else {
          await blockTag({ tag });
        }
      } else {
        showLogin('filter');
      }
    },
  };

  return (
    <FeedPage>
      <NextSeo {...seo} />
      <CustomFeedHeader>
        <HashtagIcon className={customFeedIcon} />
        <span className="mr-auto">{tag}</span>
        {tagStatus !== 'followed' && (
          <>
            <Button
              className="laptop:hidden btn-secondary"
              {...blockButtonProps}
              aria-label={tagStatus === 'blocked' ? 'Unblock' : 'Block'}
            />
            <Button
              className="hidden laptop:flex btn-secondary"
              {...blockButtonProps}
            >
              {tagStatus === 'blocked' ? 'Unblock' : 'Block'}
            </Button>
          </>
        )}
        {tagStatus !== 'blocked' && (
          <>
            <Button
              className={classNames(
                'btn-secondary laptop:hidden',
                tagStatus !== 'followed' && 'ml-4',
              )}
              {...followButtonProps}
              aria-label={tagStatus === 'followed' ? 'Unfollow' : 'Follow'}
            />
            <Button
              className={classNames(
                'btn-secondary hidden laptop:flex',
                tagStatus !== 'followed' && 'ml-4',
              )}
              {...followButtonProps}
            >
              {tagStatus === 'followed' ? 'Unfollow' : 'Follow'}
            </Button>
          </>
        )}
      </CustomFeedHeader>
      <Feed
        feedQueryKey={[
          'tagFeed',
          user?.id ?? 'anonymous',
          Object.values(queryVariables),
        ]}
        query={TAG_FEED_QUERY}
        variables={queryVariables}
      />
    </FeedPage>
  );
};

TagPage.getLayout = getLayout;
TagPage.layoutProps = mainFeedLayoutProps;

export default TagPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

interface TagPageParams extends ParsedUrlQuery {
  tag: string;
}

export function getStaticProps({
  params,
}: GetStaticPropsContext<TagPageParams>): GetStaticPropsResult<TagPageProps> {
  return {
    props: {
      tag: params.tag,
    },
  };
}
