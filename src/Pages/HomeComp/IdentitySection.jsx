import React from "react";
import { overviewData } from "../../Data/overviewData";

const IdentitySection = () => {
  return (
    <div className='identity-section'>
      <h1 className='name'>{overviewData.identity.name}</h1>
      <h4 className='title'>{overviewData.identity.title}</h4>
    </div>
  );
};

export default IdentitySection; 