import React from 'react';
import PropTypes from 'prop-types';
import {debounce} from 'lodash';
import {colors} from '../../models/collection.js';

const validHex = (hex) =>{
  var re = /[0-9A-Fa-f]{6}/g;
  if(re.test(hex)){
    return true;
  }
  return false;
  
};

class EditCollectionColorPop extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      query: '', //The hex value entered into search
      color: null,
      maybeRequest: null,
      maybeResults: null
    };
    
    this.onClick = this.onClick.bind(this);
    this.handleChange = this.handleChange.bind(this); // for when user enters in custom hex
    this.keyPress = this.keyPress.bind(this); // handles enter key for custom hex
    this.update = this.props.updateColor;
  }
    
  handleChange(e) {
    const query = e.currentTarget.value.trim();
    document.getElementsByClassName("editable-field-error-message")[0].style.display = "none";
    this.setState({ query });
    if (query && query.length <=7) {
      if(validHex(query)){
        this.setState({color: query});
        this.update(query);
      }else{
        document.getElementsByClassName("editable-field-error-message")[0].style.display = "inherit";
      }
    }else{
      document.getElementsByClassName("editable-field-error-message")[0].style.display = "inherit";
    }
  }
  
  keyPress(e){
    if(e.which == 13 || e.keyCode == 13){
      // enter key pressed - dismiss pop-over
      this.props.togglePopover();
    }else{
      document.getElementsByClassName("editable-field-error-message")[0].style.display = "none";
    }
  }
    
  onClick() {
    this.props.togglePopover();
  }
  
  render() {
    const isLoading = (!!this.state.maybeRequest || !this.state.maybeResults);
    
    return (
      <dialog className="pop-over edit-collection-color-pop">
        <section className="pop-over-info">
          
          {Object.keys(colors).map((key => 
            <button className={"button-tertiary " + ( (colors[key] == this.props.initialColor) ? "active" : "")} key={key}
              style={{backgroundColor: colors[key]}} 
              onClick={evt => {
                console.log(`set color to ${colors[key]}`);
                this.setState({ color: colors[key] });
                this.update(colors[key]);
              }}
            />
          ))}
          
          <hr/>
          
          <input id="color-picker" 
            value={(this.state.query 
                    ? this.state.query 
                    : (Object.values(colors).includes(this.props.initialColor) 
                            ? ""
                            : this.props.initialColor))} 
            onChange={this.handleChange} 
            onKeyPress={this.keyPress}
            className="pop-over-input pop-over-search"
            placeholder="Custom color hex"
          />
          
          <div className="editable-field-error-message">
            Invalid Hex!
          </div>
          
        </section>
      </dialog>
    );
  }
}

EditCollectionColorPop.propTypes = {
  updateColor: PropTypes.func.isRequired,
  initialColor: PropTypes.string.isRequired,
};

export default EditCollectionColorPop;