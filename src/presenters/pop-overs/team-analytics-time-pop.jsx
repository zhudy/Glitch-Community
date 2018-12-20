import React from 'react';
import PropTypes from 'prop-types';
import PopoverWithButton from './popover-with-button';

const TimeFrameItem = ({selectTimeFrame, isActive, timeFrame}) => {
  let resultClass = "result button-unstyled";
  if(isActive) {
    resultClass += " active";
  }
  return (
    <button className={resultClass} onClick={selectTimeFrame}>
      <div className="result-container">
        <div className="result-name">{timeFrame}</div>
      </div>
    </button>
  );
};

TimeFrameItem.propTypes = {
  selectTimeFrame: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  timeFrame: PropTypes.string.isRequired,  
};

const timeFrames = [
  "Last 4 Weeks",
  "Last 2 Weeks",
  "Last 24 Hours",
];

const TeamAnalyticsTimePop = (({updateTimeFrame, currentTimeFrame}) => {
  const selectTimeFrame = (timeFrame, togglePopover) => {
    return () => {
      updateTimeFrame(timeFrame);
      togglePopover();
    };
  };

  return (
    <PopoverContainer>
      {({visible, togglePopover}) => (
        <div className="button-wrap">
          <button className="button-small button-tertiary button-select" onClick={togglePopover}>
            <span>{currentTimeFrame}</span>
          </button>
          { visible && (
            <dialog className="pop-over analytics-time-pop">
              <section className="pop-over-actions last-section results-list">
                <div className="results">
                  { timeFrames.map(timeFrame => (
                    <TimeFrameItem 
                      key={timeFrame}
                      selectTimeFrame={selectTimeFrame(timeFrame, togglePopover)}
                      isActive={currentTimeFrame === timeFrame} 
                      timeFrame={timeFrame}
                    />
                  ))}
                </div>
              </section>
            </dialog>
          )}
        </div>
      )}
    </PopoverContainer>
  );
});

TeamAnalyticsTimePop.propTypes = {
  updateTimeFrame: PropTypes.func.isRequired,
  currentTimeFrame: PropTypes.string.isRequired,
};

const TeamAnalyticsTimePopButton = ({ updateTimeFrame, currentTimeFrame }) => {
  return (
    <PopoverWithButton
      buttonClass="button-small button-tertiary button-select"
      buttonText={<span>{currentTimeFrame}</span>}
      passToggleToPop
    >
      <TeamAnalyticsTimePop updateTimeFrame={updateTimeFrame} currentTimeFrame={currentTimeFrame} />
    </PopoverWithButton>
  );
};

TeamAnalyticsTimePopButton.propTypes = {
  updateTimeFrame: PropTypes.func.isRequired,
  currentTimeFrame: PropTypes.string.isRequired
};

export default TeamAnalyticsTimePop;
