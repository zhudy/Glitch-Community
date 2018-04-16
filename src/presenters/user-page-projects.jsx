import React from 'react';
import PropTypes from 'prop-types';
import ProjectsList from "./projects-list.jsx";
import Observable from "o_0";
import {debounce} from "lodash";


/* globals Set */

const projectStateFromModels = (projectsModel, pinnedProjectsModel) => {
  const pinnedIds = pinnedProjectsModel.map(({projectId}) => projectId);
  const pinnedSet = new Set(pinnedIds);
  const projects = projectsModel.filter(project => project.fetched()).map(project => project.asProps());
  const pinnedProjects = projects.filter( (project) => pinnedSet.has(project.id));
  const recentProjects = projects.filter( (project) => !pinnedSet.has(project.id));
  console.log("getting deets for the render", {pinnedProjects, recentProjects});
  return {pinnedProjects, recentProjects};
}

export class UserPageProjectsContainer extends React.Component {
  constructor(props) {
    super(props)
     
    this.state = {
      projectsModel: [],
      pinsModel: [],
    };
    
    this.aggregateObservable = null;
    this.setStateDebounced = debounce(this.setState, 10);
  }

  //        const newState = projectStateFromModels(projectsModel, pinsModel);

  componentDidMount() {
    this.aggregateObservable = Observable(() => {
      const projectsModel = this.props.projectsObservable();
      const pinsModel = this.props.pinsObservable();
      
      // Subscribe just to the 'fetched' subcomponent of the projects.
      for(let {fetched} of projectsModel) {
        fetched && fetched();
      }
      
      this.setStateDebounced({pinsModel, projectsModel});
      console.log("updating state", {pinsModel, projectsModel});
    });
  }
  
  componentWillUnmount(){
    this.aggregateObservable && this.aggregateObservable.releaseDependencies();
    this.aggregateObservable = null;
  }


  render() {
    const projectProps = projectStateFromModels(this.state.projectsModel, this.state.pinsModel);
    
    return <UserPageProjects {...this.props} {...projectProps}/>
  }
}
UserPageProjectsContainer.propTypes = {
  projectsObservable: PropTypes.func.isRequired,
  pinsObservable: PropTypes.func.isRequired,
};

export const UserPageProjects = ({closeAllPopOvers, isCurrentUser, recentProjects, pinnedProjects, projectOptions}) => {

  const commonProps = {
    closeAllPopOvers,
    projectOptions,
  };
  
  const showPinnedProjects = isCurrentUser || pinnedProjects.length !== 0;
  return (
    <React.Fragment>
      { showPinnedProjects && (
        <ProjectsList title="Pinned Projects" isPinned={true} projects={pinnedProjects} {...commonProps}/>
      )}
      <ProjectsList title="Recent Projects" projects={recentProjects} {...commonProps}/>
    </React.Fragment>
  );
};

UserPageProjects.propTypes = {
  recentProjects: PropTypes.array.isRequired,
  pinnedProjects: PropTypes.array.isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
};

export default UserPageProjectsContainer;