import React from 'react';
import PropTypes from 'prop-types';

import { getAvatarThumbnailUrl } from '../../models/user';

import { TrackClick } from '../analytics';
import { NestedPopover } from './popover-nested';
import { UserLink } from '../includes/link';
import { Thanks } from '../includes/thanks';

import TeamUserRemovePop from './team-user-remove-pop';

const MEMBER_ACCESS_LEVEL = 20;
const ADMIN_ACCESS_LEVEL = 30;

// Remove from Team 👋

const RemoveFromTeam = props => (
  <section className="pop-over-actions danger-zone">
    <TrackClick name="Remove from Team clicked">
      <button
        className="button-small has-emoji button-tertiary button-on-secondary-background"
        {...props}
      >
        Remove from Team
        {' '}
        <span className="emoji wave" role="img" aria-label="" />
      </button>
    </TrackClick>
  </section>
);

// Admin Actions Section ⏫⏬

const AdminActions = ({
  user,
  userIsTeamAdmin,
  updateUserPermissions,
  canChangeUserAdminStatus,
}) => {
  if (!canChangeUserAdminStatus) return null;
  return (
    <section className="pop-over-actions admin-actions">
      <p className="action-description">
        Admins can update team info, billing, and remove users
      </p>
      {userIsTeamAdmin ? (
        <TrackClick name="Remove Admin Status clicked">
          <button
            className="button-small button-tertiary has-emoji"
            onClick={() => updateUserPermissions(user.id, MEMBER_ACCESS_LEVEL)}
          >
            Remove Admin Status
            {' '}
            <span className="emoji fast-down" />
          </button>
        </TrackClick>
      ) : (
        <TrackClick name="Make an Admin clicked">
          <button
            className="button-small button-tertiary has-emoji"
            onClick={() => updateUserPermissions(user.id, ADMIN_ACCESS_LEVEL)}
          >
            Make an Admin
            {' '}
            <span className="emoji fast-up" />
          </button>
        </TrackClick>
      )}
    </section>
  );
};

AdminActions.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  userIsTeamAdmin: PropTypes.bool.isRequired,
  updateUserPermissions: PropTypes.func.isRequired,
  canChangeUserAdminStatus: PropTypes.bool.isRequired,
};

// Thanks 💖

const ThanksCount = ({ count }) => (
  <section className="pop-over-info">
    <Thanks count={count} />
  </section>
);

// Team User Info 😍

const TeamUserInfo = ({
  currentUser,
  currentUserIsTeamAdmin,
  showRemove,
  ...props
}) => {
  const userAvatarStyle = { backgroundColor: props.user.color };

  const currentUserHasRemovePriveleges = currentUserIsTeamAdmin || (currentUser && currentUser.id === props.user.id);
  const canRemoveUser = !(
    props.userIsTheOnlyMember || props.userIsTheOnlyAdmin
  );
  const canCurrentUserRemoveUser = canRemoveUser && currentUserHasRemovePriveleges;

  return (
    <dialog className="pop-over team-user-info-pop">
      <section className="pop-over-info user-info">
        <UserLink user={props.user}>
          <img
            className="avatar"
            src={getAvatarThumbnailUrl(props.user)}
            alt={props.user.login}
            style={userAvatarStyle}
          />
        </UserLink>
        <div className="info-container">
          <p className="name" title={props.user.name}>
            {props.user.name || 'Anonymous'}
          </p>
          {props.user.login && (
            <p className="user-login" title={props.user.login}>
              @
              {props.user.login}
            </p>
          )}
          {props.userIsTeamAdmin && (
            <div className="status-badge">
              <span
                className="status admin"
                data-tooltip="Can edit team info and billing"
              >
                Team Admin
              </span>
            </div>
          )}
        </div>
      </section>
      {props.user.thanksCount > 0 && (
        <ThanksCount count={props.user.thanksCount} />
      )}
      {currentUserIsTeamAdmin && (
        <AdminActions
          user={props.user}
          userIsTeamAdmin={props.userIsTeamAdmin}
          updateUserPermissions={props.updateUserPermissions}
          canChangeUserAdminStatus={!props.userIsTheOnlyAdmin}
        />
      )}
      {canCurrentUserRemoveUser && <RemoveFromTeam onClick={showRemove} />}
    </dialog>
  );
};

// Team User Remove 💣

// Team User Info or Remove
// uses removeTeamUserVisible state to toggle between showing user info and remove views

const TeamUserInfoAndRemovePop = props => (
  <NestedPopover alternateContent={() => <TeamUserRemovePop {...props} />}>
    {showRemove => <TeamUserInfo {...props} showRemove={showRemove} />}
  </NestedPopover>
);

TeamUserInfoAndRemovePop.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    login: PropTypes.string,
    thanksCount: PropTypes.number.isRequired,
    color: PropTypes.string,
  }).isRequired,
  currentUserIsOnTeam: PropTypes.bool.isRequired,
  currentUserIsTeamAdmin: PropTypes.bool.isRequired,
  removeUserFromTeam: PropTypes.func.isRequired,
  userIsTeamAdmin: PropTypes.bool.isRequired,
  userIsTheOnlyMember: PropTypes.bool.isRequired,
  api: PropTypes.func.isRequired,
  teamId: PropTypes.number.isRequired,
  updateUserPermissions: PropTypes.func.isRequired,
  team: PropTypes.shape({
    projects: PropTypes.array.isRequired,
  }).isRequired,
};

export default TeamUserInfoAndRemovePop;
