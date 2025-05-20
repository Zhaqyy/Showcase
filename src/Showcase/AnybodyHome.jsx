import React from "react";
import "../Style/Showcase.scss";

const AnybodyHome = () => {
  return (
    <div className='AnybodyHome body'>
      <div className='window'>
        <div className='human'>
          <div className='head'></div>
          <div className='neck'></div>
          <div className='body'></div>
        </div>
      </div>
      <div className='window reflection'>
        <div className='human'>
          <div className='head'></div>
          <div className='neck'></div>
          <div className='body'></div>
        </div>
      </div>
    </div>
  );
};
export default AnybodyHome;