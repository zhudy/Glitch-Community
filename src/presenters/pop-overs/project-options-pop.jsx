import React from 'react';
import PropTypes from 'prop-types';

import {TrackClick} from '../analytics';
import PopoverWithButton from './popover-with-button';
import {NestedPopover} from './popover-nested';
import {CurrentUserConsumer} from '../current-user';

import AddProjectToCollectionPop from '../pop-overs/add-project-to-collection-pop';

const PopoverButton = ({onClick, text, emoji}) => (
  <button className="button-small has-emoji button-tertiary" onClick={onClick}>
    <span>{text} </span>
    <span className={`emoji ${emoji}`}></span>
  </button>
);

// Project Options Content
const ProjectOptionsContent = ({addToCollectionPopover, ...props}) => {
  function animate(event, className, func) {
    const projectContainer = event.target.closest('li');
    projectContainer.addEventListener('animationend', func, {once: true});
    projectContainer.classList.add(className);
    props.togglePopover();
  }
  
  function leaveProject(event) {
    const prompt = `Once you leave this project, you'll lose access to it unless someone else invites you back. \n\n Are sure you want to leave ${props.project.domain}?`;
    if (window.confirm(prompt)) {
      props.leaveProject(props.project.id, event);
    }
  }
    
  function leaveTeamProject() {
    props.leaveTeamProject(props.project.id, props.currentUser.id);
  }
  
  function joinTeamProject() {
    props.joinTeamProject(props.project.id, props.currentUser);
  }
    
  function animateThenAddPin(event) {
    animate(event, 'slide-up', () => props.addPin(props.project.id));
  }
  
  function animateThenRemovePin(event) {
    animate(event, 'slide-down', () => props.removePin(props.project.id));
  }
  
  function animateThenDeleteProject(event) {
    animate(event, 'slide-down', () => props.deleteProject(props.project.id));
  }
  
  return(
    <dialog className="pop-over project-options-pop">
      {!!props.addPin &&
        <section className="pop-over-actions">
          <TrackClick name="Project Pinned">
            <PopoverButton onClick={animateThenAddPin} text="Pin " emoji="pushpin"/>
          </TrackClick>
        </section>
      }
      {!!props.removePin &&
        <section className="pop-over-actions">
          <TrackClick name="Project Un-Pinned">
            <PopoverButton onClick={animateThenRemovePin} text="Un-Pin " emoji="pushpin"/>
          </TrackClick>
        </section>
      }
      
      {!!props.addProjectToCollection &&
        <section className="pop-over-actions">
          <PopoverButton onClick={addToCollectionPopover} {...props} text="Add to Collection " emoji="framed_picture"/>
        </section>
      }

      {(props.joinTeamProject && props.leaveTeamProject) &&
        <section className="pop-over-actions collaborator-actions">
          {!props.currentUserIsOnProject &&
            <PopoverButton onClick={joinTeamProject} text="Join Project " emoji="rainbow"/>
          }
          {props.currentUserIsOnProject &&
            <TrackClick name="Leave Project clicked">
              <PopoverButton onClick={leaveTeamProject} text="Leave Project " emoji="wave"/>
            </TrackClick>
          }
        </section>
      }
      
      {(props.leaveProject && props.project.users.length > 1 && props.currentUserIsOnProject) &&
        <section className="pop-over-actions collaborator-actions">
          <TrackClick name="Leave Project clicked">
            <PopoverButton onClick={leaveProject} text="Leave Project " emoji="wave"/>
          </TrackClick>
        </section>
      }

      {(props.currentUserIsOnProject && !props.removeProjectFromCollection) && 
        <section className="pop-over-actions danger-zone last-section">
          {!!props.removeProjectFromTeam && <PopoverButton onClick={() => props.removeProjectFromTeam(props.project.id)} text="Remove Project " emoji="thumbs_down"/>}
          {!!props.removeProject && props.removeProjectFromTeam && <PopoverButton onClick={() => props.removeProject(props.project)} text="Remove Project " emoji="thumbs_down"/>}

          {props.currentUserIsOnProject && !props.removeProjectFromCollection && (
            <TrackClick name="Delete Project clicked">
              <PopoverButton onClick={animateThenDeleteProject} text="Delete Project " emoji="bomb"/>
            </TrackClick>
          )}
        </section>
      }
      {props.removeProjectFromCollection &&
      <section className="pop-over-actions danger-zone last-section">
        {props.removeProjectFromCollection && <PopoverButton onClick={() => props.removeProjectFromCollection(props.project)} text="Remove from Collection" emoji="thumbs_down"/>}
      </section>
      }
      
    </dialog>
  ); 
};


// Project Options Pop
const ProjectOptionsPop = ({...props}) => {
  return(
    <NestedPopover alternateContent={() => <AddProjectToCollectionPop {...props} api={props.api} togglePopover={props.togglePopover}/>} startAlternateVisible={false}>
      { addToCollectionPopover => (
        <ProjectOptionsContent {...props} addToCollectionPopover={addToCollectionPopover}/>
      )}
    </NestedPopover>
  );
};

ProjectOptionsPop.propTypes = {
  api: PropTypes.any,
  currentUser: PropTypes.object,
  project: PropTypes.shape({
    users: PropTypes.array.isRequired,
  }),
  togglePopover: PropTypes.func.isRequired,
  addPin: PropTypes.func,
  removePin: PropTypes.func,
  deleteProject: PropTypes.func,
  leaveProject: PropTypes.func,
  removeProjectFromTeam: PropTypes.func,
  joinTeamProject: PropTypes.func,
  leaveTeamProject: PropTypes.func,
  currentUserIsOnProject: PropTypes.bool.isRequired,
};
ProjectOptionsPop.defaultProps = {
  currentUserIsOnProject: false
};

// Project Options Container
// create as stateful react component
export default function ProjectOptions({projectOptions={}, project, api, currentCollectionId}, {...props}) {
  if(Object.keys(projectOptions).length === 0) {
    return null;
  }

  function currentUserIsOnProject(user) {
    let projectUsers = project.users.map(projectUser => {
      return projectUser.id;
    });
    if (projectUsers.includes(user.id)) {
      return true;
    }
  }

  return (
    <PopoverWithButton
      buttonClass="project-options button-borderless opens-pop-over button-small"
      buttonText={<div className="down-arrow" aria-label="options" />}
      containerClass="project-options-pop-btn"
      passToggleToPop
    >
      <CurrentUserConsumer>
        {(user, fetched, funcs, consumerProps) => {
          return (
            <ProjectOptionsPop
              {...consumerProps}
              {...props}
              {...projectOptions}
              project={project}
              currentCollectionId={currentCollectionId}
              api={api}
              currentUser={user}
              currentUserIsOnProject={currentUserIsOnProject(user)}
            />
          );
        }}
      </CurrentUserConsumer>
    </PopoverWithButton>
  );
}

ProjectOptions.propTypes = {
  api: PropTypes.func,
  currentCollectionId: PropTypes.number,
  project: PropTypes.object.isRequired
};