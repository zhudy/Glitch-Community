// add-project-to-collection-pop.jsx -> Add a project to a collection via a project item's menu
import React from 'react';
import PropTypes from 'prop-types';
import {NestedPopover} from './popover-nested';

import {TrackClick} from '../analytics';
import {getAvatarUrl} from '../../models/project';

import Loader from '../includes/loader.jsx';

import CollectionResultItem from '../includes/collection-result-item.jsx';

import CreateCollectionPop from './create-collection-pop.jsx';

import {NestedPopoverTitle} from './popover-nested.jsx';

import {orderBy} from 'lodash';

class AddProjectToCollectionPopContents extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      query: '', // value of filter input field
      working: false,
      filteredCollections: [], // collections filtered from search query
      maybeCollections: null, //null means still loading
      collectionOwners: [],
    };
    this.updateFilter = this.updateFilter.bind(this);
    this.loadCollectionOwners = this.loadCollectionOwners.bind(this);
  }
  
  updateFilter(query){
    console.log('query');
    let collections = this.state.maybeCollections;
    console.log("collections %O", collections);
    query = query.toLowerCase().trim();
    let filteredCollections = collections.filter(collection => collection.name.toLowerCase().includes(query)); 
    console.log("filteredCollections %O", filteredCollections);
  }
  
  async loadCollections() {
    // BEFORE
    // const collections = await this.props.api.get(`collections/?userId=${this.props.currentUser.id}`);
    // let orderedCollections = orderBy(collections.data, collection => collection.updatedAt).reverse();
    // this.setState({maybeCollections: orderedCollections, filteredCollections: orderedCollections });
    
    const userCollections = await this.props.api.get(`collections/?userId=${this.props.currentUser.id}`);
    const userTeams = this.props.currentUser.teams;
    let userTeamCollections = [];
    if(userTeams.length > 0){
      // load potential team collections
      userTeams.forEach(team => {
        const team = await this.props.api.get(`teams/team.id
      }
    }
    // let orderedCollections = orderBy(collections.data, collection => collection.updatedAt).reverse();
    // this.setState({maybeCollections: orderedCollections, filteredCollections: orderedCollections });
  }
  
  async loadCollectionOwners(){
    console.log('load collection owners');
    for(const collection of this.state.filteredCollections){
      console.log(collection);
      if(collection.teamId == -1){
        // store collection user
        this.state.collectionOwners.push(this.props.currentUser);
      }else{
        // store collection team
        const {team} = await this.props.api(`teams/${collection.teamId}`);
        this.state.collectionOwners.push(team);
      }
    }
    
  }
  
  async componentDidMount() {
    this.loadCollections();
  }
  
  render() {
    const {maybeCollections, filteredCollections} = this.state;
    
    return (
      <dialog className="pop-over add-project-to-collection-pop wide-pop">
        {( !this.props.fromProject ?
          <NestedPopoverTitle>
            <img src={getAvatarUrl(this.props.project.id)} alt={`Project avatar for ${this.props.project.domain}`}/> Add {this.props.project.domain} to collection
          </NestedPopoverTitle>
          : null
        )}
        
        {(maybeCollections && maybeCollections.length > 3) && (
          <section className="pop-over-info">
            <input id="collection-filter" 
              className="pop-over-input search-input pop-over-search" 
              onChange={(evt) => {this.updateFilter(evt.target.value);}}
              placeholder="Filter collections" />
          </section>
        )}
        
        {maybeCollections ? (
          filteredCollections.length ? (
            <section className="pop-over-actions results-list">
              <ul className="results">
                {filteredCollections.map((collection, index) =>   
                  // filter out collections that already contain the selected project
                  (collection.projects.every(project => project.id !== this.props.project.id) && 
                    <li key={collection.id}>
                      <TrackClick name="Project Added to Collection" context={{groupId: collection.team ? collection.team.id : 0}}>
                        <CollectionResultItem 
                          api={this.props.api}
                          onClick={this.props.addProjectToCollection}
                          project={this.props.project}
                          collection={collection}                         
                          togglePopover={this.props.togglePopover} 
                          currentUser={this.props.currentUser}
                        />
                      </TrackClick>
                    </li>
                  )
                )
                }
              </ul>
            </section>
          ) : (<section className="pop-over-info">
            <p className="info-description">
              Organize your favorite projects in one place
            </p>
          </section>)
        ) : <Loader/>}
        
        <section className="pop-over-actions">
          {/* TO DO: may want to consider if we force all users to go through Create Collection Pop or only users with teams */}
          <button className="create-new-collection button-small" onClick={this.props.createCollectionPopover} >Add to a new collection</button> 
        </section>
      </dialog>
    );
  }
}

AddProjectToCollectionPopContents.propTypes = {
  addProjectToCollection: PropTypes.func,
  api: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  togglePopover: PropTypes.func, // required but added dynamically
  project: PropTypes.object.isRequired,
  fromProject: PropTypes.bool,
};


const AddProjectToCollectionPop = ({...props}) => {
  return(
    <NestedPopover alternateContent={() => <CreateCollectionPop {...props} api={props.api} togglePopover={props.togglePopover}/>} startAlternateVisible={false}>
      { createCollectionPopover => (
        <AddProjectToCollectionPopContents {...props} createCollectionPopover={createCollectionPopover}/>
      )}
    </NestedPopover>
  );
};

export default AddProjectToCollectionPop;
