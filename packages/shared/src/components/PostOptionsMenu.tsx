import React, { ReactElement, useContext, useState } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import useFeedSettings from '../hooks/useFeedSettings';
import useReportPost from '../hooks/useReportPost';
import { Post } from '../graphql/posts';
import EyeIcon from '../../icons/eye.svg';
import ShareIcon from '../../icons/share.svg';
import BlockIcon from '../../icons/block.svg';
import FlagIcon from '../../icons/flag.svg';
import RepostPostModal from './modals/ReportPostModal';
import useTagAndSource from '../hooks/useTagAndSource';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

export type PostOptionsMenuProps = {
  postIndex?: number;
  post: Post;
  onHidden?: () => unknown;
  onMessage?: (
    message: string,
    postIndex: number,
    timeout?: number,
  ) => Promise<unknown>;
  onRemovePost?: (postIndex: number) => Promise<unknown>;
};

const MenuIcon = ({ Icon }) => {
  return <Icon className="mr-2 text-2xl" />;
};

export default function PostOptionsMenu({
  postIndex,
  post,
  onHidden,
  onMessage,
  onRemovePost,
}: PostOptionsMenuProps): ReactElement {
  useFeedSettings();
  const { trackEvent } = useContext(AnalyticsContext);
  const { reportPost, hidePost } = useReportPost();
  const { onUnfollowSource, onBlockTags } = useTagAndSource({
    origin: 'post context menu',
    postId: post?.id,
  });
  const [reportModal, setReportModal] =
    useState<{ index?: number; post?: Post }>();

  const showMessageAndRemovePost = async (
    message: string,
    _postIndex: number,
  ) => {
    await onMessage(message, _postIndex);
    onRemovePost?.(_postIndex);
  };

  const onReportPost = async (
    reportPostIndex,
    reportedPost,
    reason,
    comment,
    blockSource,
  ): Promise<void> => {
    reportPost({
      id: reportedPost?.id,
      reason,
      comment,
    });
    trackEvent(
      postAnalyticsEvent('report post', reportedPost, {
        extra: { origin: 'post context menu' },
      }),
    );

    if (blockSource) {
      await onUnfollowSource({ source: reportedPost?.source });
    }

    showMessageAndRemovePost('🚨 Thanks for reporting!', reportPostIndex);
  };

  const onBlockSource = async (): Promise<void> => {
    await onUnfollowSource({ source: post?.source });
    showMessageAndRemovePost(`🚫 ${post?.source?.name} blocked`, postIndex);
  };

  const onBlockTag = async (tag: string): Promise<void> => {
    await onBlockTags({ tags: [tag] });
    showMessageAndRemovePost(`⛔️ #${tag} blocked`, postIndex);
  };

  const onHidePost = async (): Promise<void> => {
    const promise = hidePost(post.id);
    trackEvent(
      postAnalyticsEvent('hide post', post, {
        extra: { origin: 'post context menu' },
      }),
    );
    await Promise.all([promise, onRemovePost?.(postIndex)]);
    if (!postIndex) {
      onMessage(
        '🙈 This article won’t show up on your feed anymore',
        postIndex,
        0,
      );
    }
  };

  const onSharePost = async () => {
    const shareLink = `${post.commentsPermalink}?utm_source=inapp&utm_medium=article&utm_campaign=share_article&utm_id=share`;
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { origin: 'post context menu' },
      }),
    );
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: post?.title,
          url: shareLink,
        });
      } catch (err) {
        // Do nothing
      }
    } else {
      await navigator.clipboard.writeText(shareLink);
      onMessage('✅ Copied link to clipboard', postIndex);
    }
  };

  const postOptions: {
    icon: ReactElement;
    text: string;
    action: () => unknown;
  }[] = [
    {
      icon: <MenuIcon Icon={EyeIcon} />,
      text: 'Hide',
      action: onHidePost,
    },
    {
      icon: <MenuIcon Icon={ShareIcon} />,
      text: 'Share article',
      action: onSharePost,
    },
    {
      icon: <MenuIcon Icon={BlockIcon} />,
      text: `Don't show articles from ${post?.source?.name}`,
      action: onBlockSource,
    },
  ];
  post?.tags?.forEach((tag) =>
    postOptions.push({
      icon: <MenuIcon Icon={BlockIcon} />,
      text: `Not interested in #${tag}`,
      action: () => onBlockTag(tag),
    }),
  );
  postOptions.push({
    icon: <MenuIcon Icon={FlagIcon} />,
    text: 'Report',
    action: async () => setReportModal({ index: postIndex, post }),
  });

  return (
    <>
      <PortalMenu
        disableBoundariesCheck
        id="post-context"
        className="menu-primary"
        animation="fade"
        onHidden={onHidden}
      >
        {postOptions.map(({ icon, text, action }) => (
          <Item key={text} className="typo-callout" onClick={action}>
            <a className="flex w-full typo-callout">
              {icon} {text}
            </a>
          </Item>
        ))}
      </PortalMenu>
      {reportModal && (
        <RepostPostModal
          isOpen={!!reportModal}
          postIndex={reportModal.index}
          post={reportModal.post}
          onReport={onReportPost}
          onRequestClose={() => setReportModal(null)}
        />
      )}
    </>
  );
}
