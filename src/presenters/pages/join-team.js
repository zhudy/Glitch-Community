import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { captureException } from '../../utils/sentry';

import { getLink } from '../../models/team';
import { CurrentUserConsumer } from '../current-user';
import { NotificationConsumer } from '../notifications';

class JoinTeamPageBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: null,
    };
  }

  async componentDidMount() {
    let team;
    try {
      const response = await this.props.api.get(
        `/teams/byUrl/${this.props.teamUrl}`,
      );
      team = response.data;
    } catch (error) {
      if (error && !(error.response && error.response.status === 404)) {
        captureException(error);
      }
    }
    if (!team) {
      // Either the api is down or the team doesn't exist
      // Regardless we can't really do anything with this
      this.props.createErrorNotification(
        'Invite failed, try asking your teammate to resend the invite',
      );
      this.setState({ redirect: getLink({ url: this.props.teamUrl }) });
      return;
    }
    try {
      // Suppress the authorization header to prevent user merging
      await this.props.api.post(
        `/teams/${team.id}/join/${this.props.joinToken}`,
        {},
        { headers: { Authorization: '' } },
      );
      this.props.createNotification('Invitation accepted');
    } catch (error) {
      // The team is real but the token didn't work
      // Maybe it's been used already or expired?
      console.log(
        'Team invite error',
        error && error.response && error.response.data,
      );
      if (error && error.response.status !== 401) {
        captureException(error);
      }
      this.props.createErrorNotification(
        'Invite failed, try asking your teammate to resend the invite',
      );
    }
    await this.props.reloadCurrentUser();
    this.setState({ redirect: getLink(team) });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }
    return null;
  }
}
JoinTeamPageBase.propTypes = {
  api: PropTypes.any,
  teamUrl: PropTypes.string.isRequired,
  joinToken: PropTypes.string.isRequired,
  createErrorNotification: PropTypes.func.isRequired,
  createNotification: PropTypes.func.isRequired,
  reloadCurrentUser: PropTypes.func.isRequired,
};

JoinTeamPageBase.defaultProps = {
  api: null,
};

const JoinTeamPage = props => (
  <CurrentUserConsumer>
    {(currentUser, fetched, { reload }) => (
      <NotificationConsumer>
        {notify => (
          <JoinTeamPageBase {...notify} {...props} reloadCurrentUser={reload} />
        )}
      </NotificationConsumer>
    )}
  </CurrentUserConsumer>
);

export default JoinTeamPage;
